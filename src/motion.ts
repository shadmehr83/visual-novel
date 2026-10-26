import type { MotionZone } from "./model";
export function sampleMotion(
  zone: MotionZone,
  seconds: number,
  reduced = false,
) {
  if (!zone.enabled || reduced) return { dx: 0, dy: 0, warp: 0 };
  const phase = Math.sin((seconds * Math.PI * 2) / zone.seconds);
  const angle = (zone.direction * Math.PI) / 180;
  return {
    dx: Math.cos(angle) * phase * zone.strength,
    dy: Math.sin(angle) * phase * zone.strength,
    warp: phase * zone.distortion,
  };
}
