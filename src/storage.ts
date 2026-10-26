import { openDB } from "idb";
import { validateProject, type Project, type Runtime } from "./model";
const db = () =>
  openDB("stillframe-studio", 1, {
    upgrade(db) {
      db.createObjectStore("projects");
    },
  });
export async function save(p: Project, r: Runtime | null) {
  await (
    await db()
  ).put("projects", { project: validateProject(p), runtime: r }, "current");
}
export async function load(): Promise<{
  project: Project;
  runtime: Runtime | null;
} | null> {
  const v = await (await db()).get("projects", "current");
  return v ? { project: validateProject(v.project), runtime: v.runtime } : null;
}
export function exportProject(p: Project) {
  const b = new Blob([JSON.stringify(validateProject(p), null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(b);
  const link = document.createElement("a");
  link.href = url;
  link.download = p.title.replace(/[^a-z0-9]/gi, "-") + ".stillframe.json";
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
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type))
    throw Error("Choose a PNG, JPEG or WebP image.");
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
