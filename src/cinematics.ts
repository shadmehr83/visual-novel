import type { Joint, Pose } from "./model";
export const restingPose = (node = ""): Pose => ({
  node,
  x: 0,
  y: 0,
  angle: 0,
  scaleX: 1,
  scaleY: 1,
  opacity: 1,
});
export function samplePose(
  from: Pose,
  to: Pose,
  progress: number,
  style: Joint["transition"]["style"],
): Pose {
  const t = Math.max(0, Math.min(1, progress));
  let p =
    style === "cut" || style === "snappy"
      ? 1
      : style === "smooth"
        ? t * t * (3 - 2 * t)
        : 1 - Math.pow(1 - t, 3);
  if (style === "fade") p = t < 0.5 ? 0 : 1;
  const mix = (a: number, b: number) => a + (b - a) * p;
  return {
    ...to,
    x: mix(from.x, to.x),
    y: mix(from.y, to.y),
    angle: mix(from.angle, to.angle),
    scaleX: mix(from.scaleX, to.scaleX),
    scaleY: mix(from.scaleY, to.scaleY),
    asset: style === "fade" && t < 0.5 ? from.asset : to.asset,
    opacity:
      mix(from.opacity, to.opacity) *
      (style === "fade" ? Math.abs(2 * t - 1) : 1),
  };
}
