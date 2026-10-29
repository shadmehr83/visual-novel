import { it, expect } from "vitest";
import { savedProject } from "./savedProject";
import { integrateChapterAtmosphere } from "./chapterAtmosphereUpdate";
import { addChapter, addChapterScene } from "./chapters";
import { validateProject } from "./model";
it("repairs one-chapter saves without replacing authored dialogue, art or café", () => {
  const source = savedProject(),
    p = savedProject();
  p.contentUpdates = p.contentUpdates!.filter((x) => x !== "2.14.0");
  p.chapters = [{ ...p.chapters![0], scenes: p.scenes.map((s) => s.id) }];
  delete p.chapters[0].next;
  const c = p.scenes.find((s) => s.id === "cafe");
  p.scenes.find((s) => s.id === "chapter2-warm")!.nodes[0].text =
    "My edited morning";
  const next = integrateChapterAtmosphere(p, source)!;
  expect(next.chapters).toHaveLength(2);
  expect(next.chapters![0].scenes).toHaveLength(7);
  expect(next.chapters![1].scenes).toHaveLength(6);
  expect(next.scenes.find((s) => s.id === "cafe")).toEqual(c);
  expect(next.scenes.find((s) => s.id === "chapter2-warm")!.nodes[0].text).toBe(
    "My edited morning",
  );
  expect(integrateChapterAtmosphere(next, source)).toBeNull();
  expect(() => validateProject(next)).not.toThrow();
});
it("new chapters and their opening scenes have no dangling node-bound template references", () => {
  const p = savedProject();
  p.scenes[0].subscenes = [
    ...(p.scenes[0].subscenes || []),
    {
      id: "oldview",
      title: "Old",
      background: null,
      transition: { style: "cut", seconds: 0.1 },
    },
  ];
  const c = addChapter(p);
  const opening = p.scenes.find((s) => s.id === c.startScene)!;
  expect(opening.subscenes).toBeUndefined();
  expect(opening.joints).toEqual([]);
  addChapterScene(p, c.id);
  expect(() => validateProject(p)).not.toThrow();
});
