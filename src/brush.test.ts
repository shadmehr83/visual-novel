import { it, expect } from "vitest";
import { connectedMask } from "./wand";
import { demo } from "./demo";
import { validateProject } from "./model";
it("edge snapping can span gradual colours while seed colour matching remains strict", () => {
  const pixels = new Uint8ClampedArray([
    0, 0, 0, 255, 20, 20, 20, 255, 40, 40, 40, 255, 255, 255, 255, 255,
  ]);
  expect(connectedMask(pixels, 4, 1, 0, 0, 40, true)).toContain("h750.00");
  expect(connectedMask(pixels, 4, 1, 0, 0, 40, false)).toContain("h500.00");
});
it("preserves locked brush boundaries in portable projects and rejects injected SVG data", () => {
  const p = demo();
  p.scenes[0].effects.rainZones = [
    {
      id: "brush",
      name: "Brush",
      enabled: true,
      points: [],
      path: "M0 0h20v20h-20Z",
      boundary: {
        points: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 },
        ],
      },
    },
  ];
  expect(validateProject(JSON.parse(JSON.stringify(p)))).toEqual(p);
  p.scenes[0].effects.rainZones[0].boundary!.path = "<script/>";
  expect(() => validateProject(p)).toThrow();
});
