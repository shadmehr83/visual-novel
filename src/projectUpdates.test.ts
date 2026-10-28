import { it, expect } from "vitest";
import { savedProject } from "./savedProject";
import { validateProject, start } from "./model";
import { integrateDeparture, updateDepartureRuntime } from "./projectUpdates";
import { deviceScreen } from "./interactions";
function legacy() {
  const p = savedProject(),
    departure = p.scenes.pop()!,
    cafe = p.scenes.find((s) => s.id === "cafe")!;
  cafe.nodes.push(...departure.nodes.filter((n) => n.id !== "leaving-cafe"));
  for (const id of ["reflect-neutral", "reflect-warm", "reflect-guarded"]) {
    const n = cafe.nodes.find((n) => n.id === id)!;
    n.choices = [];
    n.next = "goodbye";
  }
  p.assets = p.assets.filter((a) => a.id !== departure.background);
  cafe.effects.brightness = 0.73;
  cafe.nodes.find((n) => n.id === "goodbye")!.text = "My own farewell dialogue";
  return validateProject(p);
}
it("integrates the missing departure and edited dialogue without replacing local visuals or other scenes", () => {
  const p = legacy(),
    s = p.scenes.find((s) => s.id === "cafe")!,
    { nodes, entry, ...visuals } = structuredClone(s),
    before = structuredClone(p.scenes.filter((s) => s.id !== "cafe"));
  const update = integrateDeparture(p, savedProject());
  expect(update.changed).toBe(true);
  expect(update.project.scenes.at(-1)!.id).toBe("departure");
  const {
    nodes: after,
    entry: e,
    ...afterVisuals
  } = update.project.scenes.find((s) => s.id === "cafe")!;
  expect(afterVisuals).toEqual(visuals);
  expect(
    update.project.scenes.filter((s) => !["cafe", "departure"].includes(s.id)),
  ).toEqual(before);
  expect(
    update.project.scenes.at(-1)!.nodes.find((n) => n.id === "goodbye")!.text,
  ).toBe("My own farewell dialogue");
  expect(after.some((n) => n.id === "goodbye")).toBe(false);
  expect(after.find((n) => n.id === "reflect-warm")!.choices[0].target).toBe(
    "departure",
  );
  expect(p.scenes).toHaveLength(6);
  expect(integrateDeparture(update.project, savedProject()).changed).toBe(
    false,
  );
});
it("keeps added farewell dialogue reachable and declines to delete custom loops into café topics", () => {
  const p = legacy(),
    c = p.scenes.find((s) => s.id === "cafe")!;
  c.nodes.push({
    id: "custom-farewell",
    speaker: "Narrator",
    text: "My custom beat",
    next: "contact",
    choices: [],
  });
  c.nodes.find((n) => n.id === "good-time-4")!.next = "custom-farewell";
  const u = integrateDeparture(p, savedProject());
  expect(
    u.project.scenes.at(-1)!.nodes.some((n) => n.id === "custom-farewell"),
  ).toBe(true);
  c.nodes.find((n) => n.id === "custom-farewell")!.next = "hello";
  const loops = integrateDeparture(p, savedProject());
  expect(loops.moved).toEqual([]);
  expect(
    loops.project.scenes
      .find((s) => s.id === "cafe")!
      .nodes.find((n) => n.id === "custom-farewell")!.next,
  ).toBe("hello");
  expect(() => validateProject(loops.project)).not.toThrow();
});
it("does not modify an existing departure or an unrelated project automatically", () => {
  const p = savedProject();
  p.scenes.at(-1)!.title = "My edited departure";
  expect(integrateDeparture(p, savedProject()).project).toBe(p);
  const other = legacy();
  other.id = "another-novel";
  other.scenes.find((s) => s.id === "cafe")!.background = null;
  expect(integrateDeparture(other, savedProject()).changed).toBe(false);
  expect(integrateDeparture(other, savedProject(), true).changed).toBe(true);
});
it("resumes an old farewell playthrough in the new phone scene without losing state or history", () => {
  const p = legacy(),
    r = {
      ...start(p),
      scene: "cafe",
      node: "good-time",
      values: { ...p.variables, warmth: 7 },
      visited: ["cafe"],
      history: ["A saved choice"],
      nodeVisits: [
        { scene: "cafe", node: "goodbye" },
        { scene: "cafe", node: "good-time" },
      ],
    };
  const u = integrateDeparture(p, savedProject()),
    next = updateDepartureRuntime(r, u)!;
  expect(next.scene).toBe("departure");
  expect(next.node).toBe("good-time");
  expect(next.values.warmth).toBe(7);
  expect(next.history).toEqual(r.history);
  const s = u.project.scenes.at(-1)!;
  expect(
    deviceScreen(
      s,
      s.nodes.find((n) => n.id === next.node)!,
      next
        .nodeVisits!.filter((v) => v.scene === "departure")
        .map((v) => v.node),
    ),
  ).toBe("chat");
  expect(next.phoneMessages?.at(-1)?.text).toBe(
    s.nodes.find((n) => n.id === "good-time")!.text,
  );
});
