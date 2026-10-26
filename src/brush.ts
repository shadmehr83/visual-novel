import type { Region } from "./model";
export type Geometry = { points: { x: number; y: number }[]; path?: string };
export function drawGeometry(ctx: CanvasRenderingContext2D, g: Geometry) {
  if (g.path) {
    ctx.fill(new Path2D(g.path));
    return;
  }
  if (g.points.length < 3) return;
  ctx.beginPath();
  g.points.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
  ctx.closePath();
  ctx.fill();
}
export function maskPath(canvas: HTMLCanvasElement) {
  const { width: w, height: h } = canvas;
  const bytes = canvas.getContext("2d")!.getImageData(0, 0, w, h).data;
  let path = "";
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      if (bytes[(y * w + x) * 4 + 3] < 128) continue;
      const first = x;
      while (x + 1 < w && bytes[(y * w + x + 1) * 4 + 3] >= 128) x++;
      const left = (first * 1000) / w,
        top = (y * 563) / h,
        width = ((x - first + 1) * 1000) / w,
        height = 563 / h;
      path += `M${left.toFixed(2)} ${top.toFixed(2)}h${width.toFixed(2)}v${height.toFixed(2)}h-${width.toFixed(2)}Z`;
      if (path.length > 190000)
        throw Error(
          "Selection is very detailed. Use a larger brush or simplify a region.",
        );
    }
  return path;
}
export function createBrush(region: Region) {
  const canvas = document.createElement("canvas");
  canvas.width = 384;
  canvas.height = 216;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.scale(384 / 1000, 216 / 563);
  ctx.fillStyle = "white";
  drawGeometry(ctx, region);
  return { canvas, ctx };
}
export function dab(
  ctx: CanvasRenderingContext2D,
  region: Region,
  x: number,
  y: number,
  radius: number,
  erase: boolean,
  previous?: { x: number; y: number },
) {
  ctx.save();
  if (region.boundary) {
    ctx.beginPath();
    if (region.boundary.path) ctx.clip(new Path2D(region.boundary.path));
    else {
      region.boundary.points.forEach((p, i) =>
        i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y),
      );
      ctx.closePath();
      ctx.clip();
    }
  }
  ctx.globalCompositeOperation = erase ? "destination-out" : "source-over";
  ctx.fillStyle = "white";
  const count = previous
    ? Math.ceil(
        Math.hypot(x - previous.x, y - previous.y) / Math.max(1, radius / 3),
      )
    : 1;
  for (let i = 0; i <= count; i++) {
    const t = count ? i / count : 1;
    const px = previous ? previous.x + (x - previous.x) * t : x,
      py = previous ? previous.y + (y - previous.y) * t : y;
    ctx.beginPath();
    ctx.arc(px, py, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
export function clipToBoundary(region: Region): Region {
  if (!region.boundary) return region;
  const { canvas, ctx } = createBrush(region);
  ctx.globalCompositeOperation = "destination-in";
  ctx.fillStyle = "white";
  drawGeometry(ctx, region.boundary);
  return { ...region, points: [], path: maskPath(canvas) };
}
