import { it, expect } from "vitest";
import { savedProject } from "./savedProject";
import { integrateVibration } from "./vibrationUpdate";
it("adds only the missing vibration cue once, preserving the rest of the project", () => {
  const source = savedProject(), p = savedProject();
  const node = p.scenes[0].nodes.find(n => n.id === "vibrate")!;
  delete node.sound;
  p.audioAssets = p.audioAssets!.filter(a => a.id !== "studio-phone-vibration");
  p.scenes[0].effects.brightness = .61;
  const next = integrateVibration(p, source)!;
  expect(next.scenes[0].nodes.find(n => n.id === "vibrate")!.sound).toEqual({ asset: "studio-phone-vibration", volume: .65 });
  expect(next.audioAssets!.at(-1)!.id).toBe("studio-phone-vibration");
  expect(next.scenes[0].effects).toEqual(p.scenes[0].effects);
  expect(next.scenes.find(s => s.id === "cafe")).toEqual(p.scenes.find(s => s.id === "cafe"));
  expect(node.sound).toBeUndefined();
  expect(integrateVibration(next, source)).toBeNull();
});
it("keeps a custom cue, edited dialogue or colliding sound asset unchanged", () => {
  const source = savedProject(), p = savedProject();
  const node = p.scenes[0].nodes.find(n => n.id === "vibrate")!;
  node.sound = { asset: "studio-phone-notification", volume: .2 };
  expect(integrateVibration(p, source)).toBeNull();
  delete node.sound;
  node.text = "My edited line";
  expect(integrateVibration(p, source)).toBeNull();
  node.text = source.scenes[0].nodes.find(n => n.id === "vibrate")!.text;
  p.audioAssets!.find(a => a.id === "studio-phone-vibration")!.data = p.audioAssets![0].data;
  expect(integrateVibration(p, source)).toBeNull();
});
