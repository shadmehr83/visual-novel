import type { Project } from "./model";
import type { Chapter, ChapterCondition } from "./chapterSchema";
export const chapterForScene = (p: Project, scene: string) =>
  p.chapters?.find((c) => c.scenes.includes(scene));
export function matchesChapterCondition(
  c: ChapterCondition,
  values: Project["variables"],
) {
  const actual = values[c.key];
  if (typeof actual !== typeof c.value) return false;
  if (c.op === "eq") return actual === c.value;
  if (c.op === "ne") return actual !== c.value;
  if (typeof actual !== "number" || typeof c.value !== "number") return false;
  return c.op === "gt"
    ? actual > c.value
    : c.op === "gte"
      ? actual >= c.value
      : c.op === "lt"
        ? actual < c.value
        : actual <= c.value;
}
export function resolveChapterStart(
  chapter: Chapter,
  values: Project["variables"],
) {
  const rule = chapter.starts.find(
    (r) =>
      r.conditions.length > 0 &&
      (r.match === "all"
        ? r.conditions.every((c) => matchesChapterCondition(c, values))
        : r.conditions.some((c) => matchesChapterCondition(c, values))),
  );
  return {
    scene: rule?.scene || chapter.startScene,
    rule: rule?.label || "Default opening",
  };
}
