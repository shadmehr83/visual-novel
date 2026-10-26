import { expect, it } from "vitest";
import { sampleMotion } from "./motion";
import { demo } from "./demo";
import { validateProject } from "./model";
const wind = {
  id: "flower",
  name: "Flower sway",
  enabled: true,
  strength: 4,
  seconds: 4,
  direction: 0,
  distortion: 2,
  region: {
    id: "flower-mask",
    name: "Flower",
    enabled: true,
    points: [
      { x: 10, y: 10 },
      { x: 100, y: 10 },
      { x: 100, y: 100 },
    ],
  },
};
it("sways back and forth deterministically, and pauses for reduced effects", () => {
  expect(sampleMotion(wind, 1).dx).toBeCloseTo(4);
  expect(sampleMotion(wind, 3).dx).toBeCloseTo(-4);
  expect(sampleMotion(wind, 1, true)).toEqual({ dx: 0, dy: 0, warp: 0 });
  expect(sampleMotion({ ...wind, enabled: false }, 1).dx).toBe(0);
});
it("persists region-only lights and wind masks in complete project files", () => {
  const p = demo();
  p.scenes[0].effects.motionZones = [wind];
  p.scenes[0].effects.lights = [
    {
      id: "face",
      name: "Face depth",
      enabled: true,
      kind: "local",
      shape: "region",
      color: "#ffcc99",
      intensity: 0.5,
      x: 10,
      y: 10,
      radius: 10,
      spread: 0,
      cycle: { enabled: false, values: [1, 1], stepSeconds: 1 },
      region: wind.region,
    },
  ];
  expect(validateProject(JSON.parse(JSON.stringify(p)))).toEqual(p);
  p.scenes[0].effects.motionZones[0].strength = 999;
  expect(() => validateProject(p)).toThrow();
});
