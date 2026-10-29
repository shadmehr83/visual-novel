import { cloneData as structuredClone } from "./cloneData";
import type { Project } from "./model";
import type { Chapter } from "./chapterSchema";
import { createFlowScene } from "./flow";
export function ensureChapters(p: Project) {
  p.chapters ??= [
    {
      id: "chapter-" + crypto.randomUUID(),
      title: "Chapter one",
      notes: "",
      scenes: p.scenes.map((s) => s.id),
      startScene: p.scenes[0].id,
      starts: [],
      exits: [],
    },
  ];
  return p.chapters;
}
export function assignChapterScene(
  p: Project,
  sceneId: string,
  chapterId: string,
) {
  const chapters = ensureChapters(p),
    target = chapters.find((c) => c.id === chapterId)!;
  if (!target || !p.scenes.some((s) => s.id === sceneId))
    throw Error("Choose an existing chapter and scene.");
  if (target.scenes.includes(sceneId)) return;
  for (const c of chapters)
    if (c.scenes.includes(sceneId)) {
      if (c.scenes.length === 1)
        throw Error(
          "Keep at least one scene in each chapter. Add another scene before moving this one.",
        );
      c.scenes = c.scenes.filter((id) => id !== sceneId);
      c.starts = c.starts.filter((r) => r.scene !== sceneId);
      c.exits = c.exits.filter((e) => e.scene !== sceneId);
      if (c.startScene === sceneId) c.startScene = c.scenes[0];
    }
  target.scenes.push(sceneId);
}
export function pruneChapterExits(p: Project) {
  for (const c of p.chapters || [])
    c.exits = c.exits.filter((e) =>
      p.scenes.some(
        (s) => s.id === e.scene && s.nodes.some((n) => n.id === e.node),
      ),
    );
}
export function addChapter(p: Project): Chapter {
  const chapters = ensureChapters(p);
  if (chapters.length >= 40 || p.scenes.length >= 100)
    throw Error("This project has reached its chapter or scene limit.");
  const scene = createFlowScene(p.scenes[0]);
  delete scene.subscenes;
  scene.title = "New chapter opening";
  const chapter: Chapter = {
    id: "chapter-" + crypto.randomUUID(),
    title: "New chapter",
    notes: "",
    scenes: [scene.id],
    startScene: scene.id,
    starts: [],
    exits: [],
  };
  p.scenes.push(scene);
  chapters.push(chapter);
  return chapter;
}
/** New engine versions add only missing chapter content; never replace a local chapter. */
export function integrateChapterUpdate(
  local: Project,
  source: Project,
): Project | null {
  if (local.chapters || !source.chapters || local.id !== source.id) return null;
  const p = structuredClone(local),
    original = source.chapters[0];
  const first: Chapter = {
    ...structuredClone(original),
    scenes: local.scenes.map((s) => s.id),
    startScene: local.scenes[0].id,
    exits: original.exits.filter((e) =>
      local.scenes.some(
        (s) => s.id === e.scene && s.nodes.some((n) => n.id === e.node),
      ),
    ),
  };
  p.chapters = [first];
  for (const chapter of source.chapters.slice(1)) {
    if (chapter.scenes.some((id) => local.scenes.some((s) => s.id === id))) {
      delete first.next;
      continue;
    }
    if (p.scenes.length + chapter.scenes.length > 100) {
      delete first.next;
      continue;
    }
    for (const id of chapter.scenes) {
      const s = source.scenes.find((s) => s.id === id)!;
      p.scenes.push(structuredClone(s));
      if (s.background && !p.assets.some((a) => a.id === s.background)) {
        const a = source.assets.find((a) => a.id === s.background);
        if (a) p.assets.push(structuredClone(a));
      }
    }
    p.chapters.push(structuredClone(chapter));
  }
  (p.contentUpdates ??= []).push("2.11.0");
  return p;
}

export function addChapterScene(p: Project, chapterId: string) {
  const c = p.chapters?.find((c) => c.id === chapterId);
  if (!c || p.scenes.length >= 100)
    throw Error("Choose a chapter with room for another scene.");
  const s = createFlowScene(p.scenes.find((s) => s.id === c.startScene)!);
  delete s.subscenes;
  s.title = "New chapter scene";
  p.scenes.push(s);
  c.scenes.push(s.id);
  return s.id;
}
