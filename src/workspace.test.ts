import { expect, it } from "vitest";
import { workspaceSchema, contrast } from "./workspace";
import { sampleCamera } from "./camera";
import { defaultCamera } from "./CameraControls";
import { demo } from "./demo";
import { validateProject } from "./model";
import { applyProposal } from "./ai";
import { effectSummary } from "./EffectSummary";
it("bounds camera movement and holds its endpoint with no bob in reduced mode", () => {
  const c = { ...defaultCamera(), bob: 0, shake: 0 };
  expect(sampleCamera(c, 0).zoom).toBe(1);
  expect(sampleCamera(c, 2).zoom).toBeCloseTo(1.2);
  const end = sampleCamera(c, 40);
  expect(end.zoom).toBeCloseTo(1.4);
  expect(end.x).toBeCloseTo(-200);
  expect(sampleCamera({ ...c, bob: 10, shake: 10 }, 2, true)).toEqual(
    sampleCamera(c, 40),
  );
  expect(sampleCamera({ ...c, x: 0 }, 40).x).toBeLessThanOrEqual(0);
});
it("roundtrips camera and footsteps, rejects missing audio and invalid zoom", () => {
  const p = demo();
  p.scenes[0].camera = defaultCamera();
  expect(validateProject(JSON.parse(JSON.stringify(p)))).toEqual(p);
  p.scenes[0].camera.zoom = 99;
  expect(() => validateProject(p)).toThrow();
  p.scenes[0].camera = defaultCamera();
  p.scenes[0].camera.footstepAsset = "missing";
  expect(() => validateProject(p)).toThrow("Missing footstep");
});
it("validates interface preferences and readable panel text", () => {
  expect(workspaceSchema.parse({}).theme).toBe("dark");
  expect(() => workspaceSchema.parse({ libraryWidth: 5000 })).toThrow();
  expect(contrast("#ffffff")).toBe("#17242e");
  expect(contrast("#000000")).toBe("#e7e9e4");
});
it("counts enabled camera layers and supports approved camera proposals without mutating originals", () => {
  const p = demo();
  const before = effectSummary(p.scenes[0]).length;
  const next = applyProposal(p, {
    explanation: "Approach the closet",
    assumptions: [],
    operations: [{ type: "camera", scene: "bedroom", camera: defaultCamera() }],
  });
  expect(p.scenes[0].camera).toBeUndefined();
  expect(effectSummary(next.scenes[0]).length).toBe(before + 2);
  expect(
    effectSummary(next.scenes[0], true).filter((e) => e.paused).length,
  ).toBeGreaterThan(0);
});
