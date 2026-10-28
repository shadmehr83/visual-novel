import { describe, it, expect } from "vitest";
import { demo } from "./demo";
import { validateProject, start, advance } from "./model";
import {
  addFlowChoice,
  connectFlow,
  createFlowScene,
  flowGraph,
  autoFlowPositions,
  storeFlowPositions,
  removeFlowLink,
} from "./flow";
function fixture() {
  const p = demo();
  p.scenes = p.scenes.slice(0, 2);
  p.scenes[0].nodes = [
    {
      id: "hello",
      speaker: "Narrator",
      text: "Choose",
      choices: [
        {
          id: "friendly",
          text: "Hello",
          routeLabel: "Friendly route",
          target: "answer",
          actions: [{ key: "trust", op: "add", value: 1 }],
          condition: { key: "trust", equals: p.variables.trust },
          note: "A warm greeting",
        },
      ],
    },
    {
      id: "answer",
      speaker: "Maria",
      text: "Welcome",
      next: "finish",
      choices: [],
    },
    { id: "finish", speaker: "Narrator", text: "End", choices: [] },
  ];
  p.scenes[1].nodes = [
    { id: "arrival", speaker: "Narrator", text: "Arrive", choices: [] },
  ];
  return p;
}
describe("shared story graph", () => {
  it("rewires a labelled reply to another scene while preserving conditions, actions and runtime behavior", () => {
    const p = fixture(),
      s = p.scenes[0],
      c = structuredClone(s.nodes[0].choices[0]);
    connectFlow(
      p,
      { scene: s.id, node: "hello", kind: "choice", choice: "friendly" },
      "scene:" + p.scenes[1].id,
    );
    expect(s.nodes[0].choices[0]).toEqual({ ...c, target: p.scenes[1].id });
    validateProject(p);
    const r = advance(p, start(p), "friendly");
    expect(r.scene).toBe(p.scenes[1].id);
    expect(r.values.trust).toBe((p.variables.trust as number) + 1);
    const edge = flowGraph(p, "scenes", s.id).edges[0];
    expect(edge.label).toBe("Friendly route");
    expect(edge.to).toBe("scene:" + p.scenes[1].id);
  });
  it("adding an alternative preserves the authored Continue path and leaves node order intact", () => {
    const p = fixture(),
      s = p.scenes[0],
      ids = s.nodes.map((n) => n.id);
    addFlowChoice(
      p,
      s.id,
      "answer",
      p.scenes[1].id,
      "Leave politely",
      "Friendly exit",
    );
    expect(s.nodes[1].next).toBeUndefined();
    expect(s.nodes[1].choices.map((c) => c.target)).toEqual([
      "finish",
      p.scenes[1].id,
    ]);
    expect(s.nodes.map((n) => n.id)).toEqual(ids);
    validateProject(p);
  });
  it("saved graph coordinates roundtrip without changing story routes or node ordering", () => {
    const p = fixture(),
      before = structuredClone(p.scenes);
    storeFlowPositions(p, "scenes", p.scenes[0].id, {
      ["scene:" + p.scenes[0].id]: { x: -40, y: 220 },
    });
    storeFlowPositions(p, "dialogues", p.scenes[0].id, {
      "node:hello": { x: 12, y: 34 },
    });
    const read = validateProject(JSON.parse(JSON.stringify(p)));
    expect(read.flowLayout?.scenes["scene:" + p.scenes[0].id]).toEqual({
      x: -40,
      y: 220,
    });
    expect(read.flowLayout?.dialogues[p.scenes[0].id]["node:hello"]).toEqual({
      x: 12,
      y: 34,
    });
    expect(read.scenes).toEqual(before);
    expect(validateProject(demo()).flowLayout).toBeUndefined();
  });
  it("allows loops and Continue rewiring but rejects timed exits outside the scene", () => {
    const p = fixture(),
      s = p.scenes[0];
    connectFlow(
      p,
      { scene: s.id, node: "answer", kind: "next" },
      "node:answer",
    );
    validateProject(p);
    expect(s.nodes[1].next).toBe("answer");
    s.nodes[2].qte = {
      prompt: "Act",
      seconds: 2,
      success: "answer",
      timeout: "hello",
    };
    expect(() =>
      connectFlow(
        p,
        { scene: s.id, node: "finish", kind: "timeout" },
        "scene:" + p.scenes[1].id,
      ),
    ).toThrow("own scene");
    connectFlow(
      p,
      { scene: s.id, node: "finish", kind: "timeout" },
      "node:answer",
    );
    expect(s.nodes[2].qte.timeout).toBe("answer");
    expect(() =>
      removeFlowLink(p, { scene: s.id, node: "finish", kind: "timeout" }),
    ).toThrow("both destinations");
  });
  it("represents and positions cycles and unreachable nodes without losing any boxes", () => {
    const p = fixture(),
      s = p.scenes[0];
    s.nodes[2].next = "hello";
    s.nodes.push({
      id: "unused",
      speaker: "Narrator",
      text: "Not connected",
      choices: [],
    });
    const graph = flowGraph(p, "dialogues", s.id),
      positions = autoFlowPositions(graph);
    expect(Object.keys(positions)).toHaveLength(
      s.nodes.length + p.scenes.length,
    );
    expect(
      Object.values(positions).every(
        (p) => Number.isFinite(p.x) && Number.isFinite(p.y),
      ),
    ).toBe(true);
    expect(
      graph.edges.some(
        (e) => e.from === "node:finish" && e.to === "node:hello",
      ),
    ).toBe(true);
  });
  it("removing a reply cleans its item mapping and making a scene does not retain stale dialogue references", () => {
    const p = fixture(),
      s = p.scenes[0];
    s.items = {
      enabled: true,
      title: "Pick",
      blur: 3,
      options: [
        {
          id: "i",
          label: "Item",
          description: "",
          asset: null,
          choice: "friendly",
        },
      ],
    };
    removeFlowLink(p, {
      scene: s.id,
      node: "hello",
      kind: "choice",
      choice: "friendly",
    });
    expect(s.items.options).toHaveLength(0);
    const fresh = createFlowScene(s);
    expect(fresh.items).toBeUndefined();
    expect(fresh.phone).toBeUndefined();
    expect(fresh.joints).toEqual([]);
    p.scenes.push(fresh);
    expect(() => validateProject(p)).not.toThrow();
  });
});

it("opening an older complete project clears a previous project’s graph metadata", async () => {
  const { replaceProjectContents } = await import("./authoring");
  const previous = fixture(),
    incoming = demo();
  storeFlowPositions(previous, "scenes", previous.scenes[0].id, {
    "scene:bedroom": { x: 800, y: 900 },
  });
  replaceProjectContents(previous, incoming);
  expect(previous.flowLayout).toBeUndefined();
  expect(validateProject(previous)).toEqual(validateProject(incoming));
});
