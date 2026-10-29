import type { MotionZone } from "./model";
export function rippleSample(time: number, index: number, period: number) {
  const cycle = Math.floor(time / period + index * 0.173);
  const seed = index * 17.31 + cycle * 7.73;
  const rand = (v: number) => {
    const x = Math.sin(v) * 43758.5453;
    return x - Math.floor(x);
  };
  const phase = (time / period + index * 0.173) % 1;
  return {
    x: rand(seed + 1) * 1000,
    y: rand(seed + 9) * 563,
    radius: 1 + phase * 14,
    opacity: Math.sin(phase * Math.PI) * (1 - phase) * 0.5,
  };
}
export function PuddleRipples({
  zone,
  time,
  prefix,
  reduced,
}: {
  zone: MotionZone;
  time: number;
  prefix: string;
  reduced: boolean;
}) {
  if (reduced || !zone.region.enabled) return null;
  return (
    <g
      data-puddle-zone={zone.id}
      mask={`url(#${prefix}motion-mask-${zone.id})`}
      pointerEvents="none"
    >
      {Array.from(
        { length: Math.min(180, Math.max(20, Math.round(zone.strength * 10))) },
        (_, i) => {
          const p = rippleSample(time, i, zone.seconds);
          return (
            <ellipse
              key={i}
              cx={p.x}
              cy={p.y}
              rx={p.radius}
              ry={p.radius * 0.22}
              fill="none"
              stroke="#e4d5b8"
              strokeWidth=".7"
              opacity={p.opacity}
            />
          );
        },
      )}
    </g>
  );
}
