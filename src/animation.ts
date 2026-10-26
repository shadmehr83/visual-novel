import type { Scene } from "./model";
export function animateSprite(
  sprite: NonNullable<Scene["sprites"]>[number],
  frames: NonNullable<Scene["keyframes"]>,
  time: number,
) {
  const list = [
    {
      sprite: sprite.id,
      time: 0,
      x: sprite.x,
      y: sprite.y,
      opacity: sprite.opacity,
    },
    ...frames.filter((f) => f.sprite === sprite.id),
  ].sort((a, b) => a.time - b.time);
  let left = list[0];
  for (const frame of list) if (frame.time <= time) left = frame;
  const right = list.find((f) => f.time > time) || left;
  const t =
    right.time === left.time
      ? 0
      : Math.min(1, Math.max(0, (time - left.time) / (right.time - left.time)));
  return {
    ...sprite,
    x: left.x + (right.x - left.x) * t,
    y: left.y + (right.y - left.y) * t,
    opacity: left.opacity + (right.opacity - left.opacity) * t,
  };
}
