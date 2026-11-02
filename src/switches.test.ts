import { expect, it } from "vitest";
import { demo } from "./demo";
import { advance, start, validateProject } from "./model";
import { flowGraph } from "./flow";

// Switched-off dialogues and replies (by Claude) stay in the project but are passed over during play.
it("skips a switched-off dialogue and keeps it in the project", () => {
  const p = demo();
  const scene = p.scenes[0];
  const line = { ...scene.nodes[0], choices: [], qte: undefined };
  scene.nodes.unshift({ ...line, id: "s-a", text: "A", next: "s-b" }, { ...line, id: "s-b", text: "B", next: "s-c" }, { ...line, id: "s-c", text: "C", next: undefined });
  const r = { ...start(p), scene: scene.id, node: "s-a" };
  scene.nodes[1].disabled = true;
  expect(advance(p, r).node).toBe("s-c");
  expect(validateProject(JSON.parse(JSON.stringify(p))).scenes[0].nodes[1].disabled).toBe(true);
  delete scene.nodes[1].disabled;
  expect(advance(p, r).node).toBe("s-b");
});

it("starts past a switched-off opening line", () => {
  const p = demo();
  const first = p.scenes[0].nodes[0];
  first.disabled = true;
  if (first.next) expect(start(p).node).not.toBe(first.id);
});

it("marks switched-off dialogues, replies and AI parallels on the Dialogue advanced map", () => {
  const p = demo();
  const scene = p.scenes.find((s) => s.nodes.some((n) => n.choices.length))!;
  const node = scene.nodes.find((n) => n.choices.length)!;
  node.disabled = true;
  node.choices[0].enabled = false;
  const graph = flowGraph(p, "dialogues", scene.id, [{ scene: scene.id, node: node.id, text: "Adapted", choices: [{ id: node.choices[0].id, text: "Adapted reply" }] }]);
  const card = graph.cards.find((c) => c.id === "node:" + node.id)!;
  expect(card.disabled).toBe(true);
  expect(card.parallel).toBe("Adapted");
  expect(card.ports[0]).toMatchObject({ disabled: true, parallel: "Adapted reply" });
});

it("keeps scene-map routes distinct when two lines share a reply id", () => {
  const p = demo();
  const scene = p.scenes[0], other = p.scenes[1];
  const base = { ...scene.nodes[0], choices: [], qte: undefined };
  scene.nodes.push(
    { ...base, id: "d-1", text: "A", next: undefined, choices: [{ id: "same", text: "Go", target: other.id, actions: [] } as never] },
    { ...base, id: "d-2", text: "B", next: undefined, choices: [{ id: "same", text: "Go", target: other.id, actions: [] } as never] },
  );
  const graph = flowGraph(p, "scenes", scene.id);
  const ids = graph.edges.map((e) => e.id);
  expect(new Set(ids).size).toBe(ids.length);
});
