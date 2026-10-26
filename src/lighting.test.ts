import { describe, expect, it } from "vitest";
import { sampleLightLoop, sceneLightLoop } from "./lighting";
import { lightLoopSchema, validateProject } from "./model";
import { demo } from "./demo";

describe("lighting loops", () => {
  const loop = { enabled: true, values: [0, 1, 2, 0, 1, 0, 2, 1], stepSeconds: 2 };
  it("visits every authored value and repeats with a smooth closing segment", () => {
    loop.values.forEach((value, index) => expect(sampleLightLoop(loop, index * 2)).toBe(value));
    expect(sampleLightLoop(loop, 15)).toBe(.5);
    expect(sampleLightLoop(loop, 16)).toBe(0);
    expect(sampleLightLoop(loop, 18)).toBe(1);
    expect(sampleLightLoop(loop, .5)).toBeCloseTo(.15625);
  });
  it("preserves an explicit stopped loop and loads older projects", () => {
    const project = validateProject(demo());
    const cafe = project.scenes.find(scene => scene.art === "cafe")!;
    expect(sceneLightLoop(cafe)).toEqual(loop);
    cafe.effects.lightLoop = { ...loop, enabled: false };
    expect(sceneLightLoop(validateProject(project).scenes.find(scene => scene.art === "cafe")!).enabled).toBe(false);
  });
  it("rejects invalid sequences and timing at the project boundary", () => {
    for (const values of [[], [1], [0, 3], [NaN, 1], Array(33).fill(1)])
      expect(lightLoopSchema.safeParse({ ...loop, values }).success).toBe(false);
    for (const stepSeconds of [0, .1, 21, Infinity])
      expect(lightLoopSchema.safeParse({ ...loop, stepSeconds }).success).toBe(false);
    const project = demo();
    project.scenes[0].effects.lightLoop = { ...loop, values: [0, 9] };
    expect(() => validateProject(project)).toThrow();
  });
});
