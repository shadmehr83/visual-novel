import { it, expect } from "vitest";
import { demo } from "./demo";
import { removeDialogue, applyEffectPreset } from "./authoring";
import { validateProject, start, respond } from "./model";
it("repairs next links, choices and poses when deleting a dialogue and retains notes in JSON", () => {
  const p = demo(),
    s = p.scenes[0];
  s.nodes = [
    { id: "a", speaker: "Narrator", text: "a", choices: [], next: "b" },
    { id: "b", speaker: "Narrator", text: "b", choices: [], next: "c" },
    {
      id: "c",
      speaker: "Narrator",
      text: "c",
      notes: "Private planning note",
      choices: [],
    },
  ];
  removeDialogue(s, "b");
  expect(s.nodes[0].next).toBe("c");
  expect(
    validateProject(JSON.parse(JSON.stringify(p))).scenes[0].nodes[1].notes,
  ).toBe("Private planning note");
  removeDialogue(s, "c");
  expect(s.nodes[0].next).toBeUndefined();
  expect(() => removeDialogue(s, "a")).toThrow();
});
it("custom replies require a valid authored branch and apply its actions", () => {
  const p = demo(),
    s = p.scenes[0];
  s.nodes = [
    {
      id: "a",
      speaker: "Mara",
      text: "Question?",
      choices: [
        {
          id: "yes",
          text: "Yes",
          target: "b",
          actions: [{ key: "trust", op: "add", value: 1 }],
          note: "",
        },
      ],
    },
    { id: "b", speaker: "Mara", text: "Thanks", choices: [] },
  ];
  expect(() => respond(p, start(p), "My reply")).toThrow();
  const r = respond(p, start(p), "My own answer", "yes");
  expect(r.node).toBe("b");
  expect(r.values.trust).toBe((p.variables.trust as number) + 1);
  expect(r.responses?.[0].text).toBe("My own answer");
});
it("effect presets clone settings and do not mutate their source", () => {
  const p = demo(),
    s = p.scenes[0];
  const e = structuredClone(s.effects);
  e.light = 0.15;
  const preset = {
    id: "candle",
    name: "Candle",
    kind: "lighting" as const,
    effects: e,
  };
  applyEffectPreset(s, preset);
  s.effects.light = 0.3;
  expect(preset.effects.light).toBe(0.15);
});
