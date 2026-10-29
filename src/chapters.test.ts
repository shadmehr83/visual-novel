import { it, expect } from "vitest";
import { savedProject } from "./savedProject";
import { advance, start, validateProject } from "./model";
import { resolveChapterStart, matchesChapterCondition } from "./chapterRuntime";
import {
  addChapter,
  assignChapterScene,
  integrateChapterUpdate,
  pruneChapterExits,
} from "./chapters";
it.each([
  [{ second_meeting_interest: "yes" }, "chapter2-warm"],
  [{ second_meeting_interest: "slow" }, "chapter2-slow"],
  [{ second_meeting_interest: "uncertain" }, "chapter2-slow"],
  [{ second_meeting_interest: "no" }, "chapter2-goodbye"],
  [{ date_declined: true }, "chapter2-declined"],
  [{ date_deferred: true }, "chapter2-deferred"],
  [{}, "chapter2-quiet"],
])(
  "carries actual chapter-one state into the correct opening: %j",
  (values, scene) => {
    const p = savedProject(),
      first = p.chapters![0],
      before = { ...p.variables, ...values };
    const r = { ...start(p), scene: "departure", node: "end", values: before };
    const next = advance(p, r);
    expect(next.scene).toBe(scene);
    expect(next.values).toEqual(before);
    expect(next.completedChapters).toEqual([first.id]);
    expect(next.nodeVisits?.at(-1)).toEqual({ scene, node: "morning" });
    expect(next.ended).toBe(false);
    const s = p.scenes.find((s) => s.id === scene)!;
    const ended = advance(p, { ...next, node: "end" });
    expect(ended.ended).toBe(true);
    expect(ended.completedChapters).toEqual(["chapter-one", "chapter-two"]);
    expect(s.nodes.some((n) => n.text.includes("OPENING DRAFT"))).toBe(true);
  },
);
it("uses first matching rule, exact types, numeric comparisons and the fallback for empty conditions", () => {
  const c = structuredClone(savedProject().chapters![1]);
  expect(
    resolveChapterStart(c, {
      second_meeting_interest: "yes",
      date_declined: true,
    }).scene,
  ).toBe("chapter2-warm");
  c.starts.unshift({
    id: "empty",
    label: "Empty rule",
    scene: "chapter2-declined",
    match: "all",
    conditions: [],
  });
  expect(resolveChapterStart(c, {}).scene).toBe("chapter2-quiet");
  expect(
    matchesChapterCondition(
      { key: "warmth", op: "gte", value: 2 },
      { warmth: 3 },
    ),
  ).toBe(true);
  expect(
    matchesChapterCondition(
      { key: "warmth", op: "eq", value: "3" },
      { warmth: 3 },
    ),
  ).toBe(false);
});
it("rejects dangling chapter starts, duplicate membership and wrongly typed prior-state rules", () => {
  const p = savedProject();
  p.chapters![1].startScene = "missing";
  expect(() => validateProject(p)).toThrow(/opening/);
  p.chapters![1].startScene = "chapter2-quiet";
  p.chapters![1].scenes.push("bedroom");
  expect(() => validateProject(p)).toThrow(/only one chapter/);
  p.chapters![1].scenes.pop();
  p.chapters![1].starts[0].conditions[0].value = true;
  expect(() => validateProject(p)).toThrow(/matching value type/);
});
it("adds/moves scenes safely and removes deleted ending references", () => {
  const p = savedProject(),
    c = addChapter(p);
  expect(() => validateProject(p)).not.toThrow();
  expect(() => assignChapterScene(p, c.startScene, "chapter-one")).toThrow(
    /at least one/,
  );
  assignChapterScene(p, "journey", c.id);
  expect(p.chapters![0].exits.some((e) => e.scene === "journey")).toBe(false);
  expect(c.scenes).toContain("journey");
  expect(() => validateProject(p)).not.toThrow();
  p.scenes.find((s) => s.id === "departure")!.nodes = p.scenes
    .find((s) => s.id === "departure")!
    .nodes.filter((n) => n.id !== "end");
  pruneChapterExits(p);
  expect(
    p.chapters![0].exits.some(
      (e) => e.node === "end" && e.scene === "departure",
    ),
  ).toBe(false);
});
it("upgrades old workspaces once, retaining custom scene visuals and existing chapter choices", () => {
  const source = savedProject(),
    local = savedProject();
  local.scenes = local.scenes.filter((s) => !s.id.startsWith("chapter2-"));
  delete local.chapters;
  local.scenes[0].effects.brightness = 0.61;
  const before = structuredClone(local.scenes);
  const updated = integrateChapterUpdate(local, source)!;
  expect(updated.chapters).toHaveLength(2);
  expect(updated.scenes.slice(0, before.length)).toEqual(before);
  expect(() => validateProject(updated)).not.toThrow();
  expect(integrateChapterUpdate(updated, source)).toBeNull();
  local.id = "my-own-novel";
  expect(integrateChapterUpdate(local, source)).toBeNull();
});
it("old projects without chapters keep their original entry and ending behavior", () => {
  const p = savedProject();
  delete p.chapters;
  const r = start(p);
  expect(r.scene).toBe("bedroom");
  expect(advance(p, { ...r, node: "stay" }).ended).toBe(true);
});
it.each([
  ["canonical", "chapter2-warm"],
  ["slow", "chapter2-slow"],
  ["uncertain", "chapter2-slow"],
  ["goodbye", "chapter2-goodbye"],
  ["defer", "chapter2-deferred"],
  ["decline", "chapter2-declined"],
  ["quiet", "chapter2-quiet"],
])(
  "plays the complete authored %s route into its matching chapter-two draft",
  (route, expected) => {
    const p = savedProject();
    let r = start(p);
    const prefixes: Record<string, string> = {
      slow: "I’d be open to meeting again.",
      uncertain: "I’m glad we met.",
      goodbye: "I don’t think it’s a match",
      defer: "I’m not sure about today",
      decline: "I don’t think I’m up for meeting today",
    };
    for (let i = 0; i < 240 && !r.ended; i++) {
      const s = p.scenes.find((s) => s.id === r.scene)!,
        n = s.nodes.find((n) => n.id === r.node)!;
      const choices = n.choices.filter(
        (c) => !c.condition || r.values[c.condition.key] === c.condition.equals,
      );
      const target =
        route === "quiet"
          ? choices.find(
              (c) =>
                c.text === "Dismiss the notification" ||
                c.text === "Leave the phone alone for today",
            )
          : choices.find(
              (c) => prefixes[route] && c.text.startsWith(prefixes[route]),
            );
      const chosen =
        target ||
        (n.id === "room"
          ? choices.find((c) =>
              ["notification", "browse-feed"].includes(c.target),
            )
          : choices[0]);
      r = advance(p, r, chosen?.id);
    }
    expect(r.ended).toBe(true);
    expect(r.visited.at(-1)).toBe(expected);
    expect(r.completedChapters).toEqual(["chapter-one", "chapter-two"]);
    if (["decline", "defer", "quiet"].includes(route))
      expect(r.visited).not.toContain("cafe");
  },
);
