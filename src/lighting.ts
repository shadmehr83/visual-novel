import type { Effects, Scene } from "./model";

export type LightLoop = NonNullable<Effects["lightLoop"]>;
export function sceneLightLoop(scene: Scene): LightLoop {
  return scene.effects.lightLoop ?? {
    enabled: scene.art === "cafe",
    values: [0, 1, 2, 0, 1, 0, 2, 1],
    stepSeconds: 2,
  };
}

// Interpolate every segment, including the last value back to the first.
export function sampleLightLoop(loop: LightLoop, seconds: number): number {
  const position = Math.max(0, seconds) / loop.stepSeconds;
  const index = Math.floor(position) % loop.values.length;
  const fraction = position - Math.floor(position);
  const smooth = fraction * fraction * (3 - 2 * fraction);
  const from = loop.values[index];
  const to = loop.values[(index + 1) % loop.values.length];
  return from + (to - from) * smooth;
}
