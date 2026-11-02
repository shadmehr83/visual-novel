import { openDB } from "idb";
import { validateProject, type Project, type Runtime } from "./model";
import { portableFeedProject } from "./feedLibrary";
let connectionPromise: ReturnType<typeof openDB> | undefined;
const db = () => connectionPromise ||= openDB("stillframe-studio", 2, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) db.createObjectStore("projects");
      // Stillframe 3 (by Claude): artwork and sound live apart from the story, keyed by asset.
      if (oldVersion < 2) db.createObjectStore("media");
    },
  });
let savedProject: Project | undefined;
let savedToken = "";
// Media already in the "media" store. Edits keep unchanged artwork strings identical,
// so an autosave only writes the story text plus artwork that actually changed.
const storedMedia = new Map<string, string>();
const mediaKeys = (p: Project) => [
  ...p.assets.map((a) => ["image:" + a.id, a.data] as const),
  ...(p.audioAssets || []).map((a) => ["audio:" + a.id, a.data] as const),
];
const withoutMedia = (p: Project) => ({
  ...p,
  assets: p.assets.map((a) => ({ ...a, data: "" })),
  ...(p.audioAssets ? { audioAssets: p.audioAssets.map((a) => ({ ...a, data: "" })) } : {}),
});
export async function save(p: Project, r: Runtime | null) {
  // The editor uses immutable updates. Only a new project reference needs validation.
  if (p !== savedProject) validateProject(p);
  const tx = (await db()).transaction(["projects", "media"], "readwrite");
  const store = tx.objectStore("projects"), media = tx.objectStore("media");
  const token = await store.get("current-project-token");
  let nextToken = savedToken;
  const writes: Promise<unknown>[] = [];
  if (p !== savedProject || token !== savedToken) {
    nextToken = crypto.randomUUID();
    const keep = new Set<string>();
    for (const [key, data] of mediaKeys(p)) {
      keep.add(key);
      if (storedMedia.get(key) !== data) { writes.push(media.put(data, key)); storedMedia.set(key, data); }
    }
    for (const key of [...storedMedia.keys()]) if (!keep.has(key)) { writes.push(media.delete(key)); storedMedia.delete(key); }
    writes.push(store.put({ project: withoutMedia(p), runtime: r, media: true }, "current"), store.put(nextToken, "current-project-token"));
  }
  writes.push(store.put({ token: nextToken, runtime: r }, "current-runtime"));
  try {
    await Promise.all(writes);
    await tx.done;
  } catch (e) {
    // Nothing was written; the next save rewrites every media item it needs.
    storedMedia.clear();
    throw e;
  }
  savedProject = p;
  savedToken = nextToken;
}
export async function load(): Promise<{
  project: Project;
  runtime: Runtime | null;
} | null> {
  const tx = (await db()).transaction(["projects", "media"], "readonly");
  const store = tx.objectStore("projects"), media = tx.objectStore("media");
  const [v, progress, token] = await Promise.all([
    store.get("current"), store.get("current-runtime"), store.get("current-project-token"),
  ]);
  storedMedia.clear();
  if (v?.media) {
    const fill = async (a: { id: string; data: string }, kind: string) => {
      a.data = (await media.get(kind + a.id)) || "";
      if (a.data) storedMedia.set(kind + a.id, a.data);
    };
    await Promise.all([
      ...v.project.assets.map((a: Project["assets"][number]) => fill(a, "image:")),
      ...(v.project.audioAssets || []).map((a: { id: string; data: string }) => fill(a, "audio:")),
    ]);
  }
  await tx.done;
  return v ? { project: validateProject(v.project), runtime: progress && progress.token === token ? progress.runtime : v.runtime } : null;
}
export type Workspace = { project: Project; runtime: Runtime | null };
export async function loadSnapshotRecovery(): Promise<Workspace | null> {
  const connection = await db();
  const copies = await Promise.all([
    connection.get("projects", "before-github-snapshot"),
    connection.get("projects", "before-studio-update"),
  ]);
  const value = copies
    .filter(Boolean)
    .sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0))[0];
  return value
    ? { project: validateProject(value.project), runtime: value.runtime }
    : null;
}
// One transaction preserves the previous workspace before replacing current.
export async function openGithubSnapshot(
  project: Project,
  previous?: Workspace,
) {
  const snapshot = validateProject(project);
  // load() puts the separately stored artwork back into the previous project.
  const old = previous || (await load());
  const connection = await db();
  const tx = connection.transaction("projects", "readwrite");
  try {
    if (old) {
      const workspace = {
        project: validateProject(old.project),
        runtime: old.runtime,
      };
      if (JSON.stringify(workspace.project) !== JSON.stringify(snapshot))
        await tx.store.put(
          { ...workspace, savedAt: Date.now() },
          "before-github-snapshot",
        );
    }
    await tx.store.put({ project: snapshot, runtime: null }, "current");
    await tx.store.delete("current-runtime");
    await tx.store.delete("current-project-token");
    await tx.done;
  } catch (error) {
    try {
      tx.abort();
    } catch {}
    await tx.done.catch(() => {});
    throw error;
  }
}
export async function exportProject(p: Project, filename?: string) {
  const b = new Blob([JSON.stringify(await portableFeedProject(validateProject(p)), null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(b);
  const link = document.createElement("a");
  link.href = url;
  link.download =
    filename || p.title.replace(/[^a-z0-9]/gi, "-") + ".stillframe.json";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export async function readProject(file: File) {
  if (file.size > 100 * 1024 * 1024)
    throw Error("Project exceeds the 100 MB import limit.");
  return validateProject(JSON.parse(await file.text()));
}
export async function readImage(
  file: File,
): Promise<Project["assets"][number]> {
  if (!["image/png", "image/jpeg", "image/webp", "image/gif"].includes(file.type))
    throw Error("Choose a PNG, JPEG, WebP or animated GIF image.");
  if (file.size > 15 * 1024 * 1024)
    throw Error("Image exceeds 15 MB. Resize a copy before importing.");
  const data = await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(Error("Could not read image"));
    r.readAsDataURL(file);
  });
  const img = new Image();
  img.src = data;
  try {
    await img.decode();
  } catch {
    throw Error("The image could not be decoded. It may be corrupt.");
  }
  if (img.width * img.height > 32000000)
    throw Error("Image exceeds 32 megapixels. Please resize a copy.");
  return {
    id: crypto.randomUUID(),
    name: file.name,
    mime: file.type as "image/png",
    width: img.width,
    height: img.height,
    data,
    tags: "",
    notes: "",
    approved: false,
    reference: false,
  };
}

// A content upgrade and its recoverable previous copy commit together.
export async function saveProjectUpdate(
  project: Project,
  runtime: Runtime | null,
  previous: Workspace,
) {
  const next = validateProject(project),
    old = {
      project: validateProject(previous.project),
      runtime: previous.runtime,
      savedAt: Date.now(),
    };
  const connection = await db(),
    tx = connection.transaction("projects", "readwrite");
  await tx.store.put(old, "before-studio-update");
  await tx.store.put({ project: next, runtime }, "current");
  await tx.store.delete("current-runtime");
  await tx.store.delete("current-project-token");
  await tx.done;
}
