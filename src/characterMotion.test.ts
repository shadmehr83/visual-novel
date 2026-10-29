import { it, expect } from "vitest";
import { animatedCharacterPose } from "./characterMotion";
import { restingPose } from "./cinematics";
import { rippleSample } from "./PuddleRipples";
it("keeps character motion gentle, deterministic and periodic", () => {
  const base = restingPose("dialogue");
  base.angle = 2;
  const loop = { enabled: true, kind: "sway" as const, seconds: 4, amount: 1 };
  expect(animatedCharacterPose(base, loop, 1).angle).toBe(3);
  expect(animatedCharacterPose(base, loop, 4).angle).toBe(2);
  expect(animatedCharacterPose(base, { ...loop, enabled: false }, 1)).toBe(
    base,
  );
  expect(animatedCharacterPose(base, { ...loop, kind: "gaze" }, 1).x).toBe(1);
  expect(base.x).toBe(0);
});
it("blink stays open most of the interval, closes smoothly and returns open", () => {
  const base = restingPose(),
    loop = { enabled: true, kind: "blink" as const, seconds: 4, amount: 1 };
  expect(animatedCharacterPose(base, loop, 2).scaleY).toBe(1);
  expect(animatedCharacterPose(base, loop, 3.76).scaleY).toBeCloseTo(0.03);
  expect(animatedCharacterPose(base, loop, 4).scaleY).toBe(1);
});
it("ripple sample positions stay within scene bounds and fade between impacts", () => {
  for (let i = 0; i < 20; i++)
    for (const t of [0, 0.1, 1, 5]) {
      const p = rippleSample(t, i, 1.5);
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThanOrEqual(1000);
      expect(p.y).toBeLessThanOrEqual(563);
      expect(p.radius).toBeGreaterThan(0);
      expect(p.opacity).toBeGreaterThanOrEqual(0);
    }
  expect(rippleSample(0, 0, 1.5).opacity).toBe(0);
});
