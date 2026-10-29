import { expect, it } from "vitest";
import { demo } from "./demo";
import { start } from "./model";
import { syncActiveDialogue } from "./authorPlay";
it("updates only the latest current authored message while keeping state and replies", () => {
  const p = demo(),
    next = structuredClone(p),
    r = start(p);
  const n = p.scenes[0].nodes[0];
  r.phoneMessages = [
    { scene: r.scene, node: r.node, sender: n.speaker, text: n.text },
    { scene: r.scene, node: r.node, sender: "You", text: "My personal reply" },
    { scene: r.scene, node: r.node, sender: n.speaker, text: n.text },
  ];
  next.scenes[0].nodes[0].text = "Edited during play";
  const result = syncActiveDialogue(p, next, r);
  expect(result.phoneMessages![2].text).toBe("Edited during play");
  expect(result.phoneMessages![0].text).toBe(n.text);
  expect(result.phoneMessages![1].text).toBe("My personal reply");
  expect(result.values).toEqual(r.values);
  expect(result.choices).toEqual(r.choices);
  expect(result.node).toBe(r.node);
  expect(r.phoneMessages[2].text).toBe(n.text);
  expect(syncActiveDialogue(p, p, r)).toBe(r);
  expect(syncActiveDialogue(next, p, result).phoneMessages).toEqual(
    r.phoneMessages,
  );
});
