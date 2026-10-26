import type { Scene } from "./model";
export function sampleCamera(
  camera: NonNullable<Scene["camera"]>,
  seconds: number,
  reduced = false,
) {
  const t = reduced ? 1 : Math.max(0, Math.min(1, seconds / camera.duration));
  const smooth = t * t * (3 - 2 * t);
  const zoom = 1 + (camera.zoom - 1) * smooth;
  const envelope =
    !reduced && seconds < camera.duration
      ? Math.sin((Math.PI * Math.max(0, seconds)) / camera.duration)
      : 0;
  const bob = camera.enabled
    ? Math.sin((seconds * Math.PI * 2) / camera.stepSeconds) *
      camera.bob *
      envelope
    : 0;
  const sway = camera.enabled
    ? Math.sin((seconds * Math.PI) / camera.stepSeconds) *
      camera.shake *
      envelope
    : 0;
  const fitZoom = Math.max(
    zoom,
    reduced ? 1 : 1 + (Math.max(camera.bob, camera.shake) * 2) / 563,
  );
  return {
    zoom: fitZoom,
    x: Math.max(
      1000 * (1 - fitZoom),
      Math.min(0, smooth * (500 - camera.x * fitZoom) + sway),
    ),
    y: Math.max(
      563 * (1 - fitZoom),
      Math.min(0, smooth * (281.5 - camera.y * fitZoom) + bob),
    ),
  };
}
