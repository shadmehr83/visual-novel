import type { Joint, Pose } from "./model";
export function animatedCharacterPose(
  base: Pose,
  loop: Joint["loop"],
  seconds: number,
): Pose {
  if (!loop?.enabled) return base;
  const phase = (seconds % loop.seconds) / loop.seconds;
  const wave = Math.sin(phase * 2 * Math.PI);
  if (loop.kind === "blink") {
    // A short smooth closure near the end of each interval; otherwise fully open.
    const t = Math.max(0, Math.min(1, (phase - 0.88) / 0.12));
    const close = phase < 0.88 ? 0 : Math.sin(t * Math.PI) ** 2;
    return { ...base, scaleY: base.scaleY * (1 - close * 0.97) };
  }
  return loop.kind === "gaze"
    ? { ...base, x: base.x + wave * loop.amount }
    : { ...base, angle: base.angle + wave * loop.amount };
}
