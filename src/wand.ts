// Local connected-colour selection, not a semantic AI model. Work is capped at
// 224x126 pixels; horizontal runs make compact stage-coordinate SVG masks.
export function connectedMask(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  x: number,
  y: number,
  tolerance: number,
  edgeAware = false,
) {
  const seed = Math.floor(y) * width + Math.floor(x);
  if (seed < 0 || seed >= width * height) throw Error("Click inside the image");
  const seen = new Uint8Array(width * height),
    selected = new Uint8Array(width * height),
    queue = [seed];
  const start = seed * 4;
  seen[seed] = 1;
  for (let index = 0; index < queue.length; index++) {
    const at = queue[index],
      p = at * 4;
    const distance = Math.sqrt(
      (data[p] - data[start]) ** 2 +
        (data[p + 1] - data[start + 1]) ** 2 +
        (data[p + 2] - data[start + 2]) ** 2,
    );
    if ((!edgeAware && distance > tolerance) || data[p + 3] < 20) continue;
    selected[at] = 1;
    const col = at % width;
    for (const n of [
      col > 0 ? at - 1 : -1,
      col < width - 1 ? at + 1 : -1,
      at - width,
      at + width,
    ])
      if (n >= 0 && n < seen.length && !seen[n]) {
        if (
          edgeAware &&
          Math.hypot(
            data[n * 4] - data[p],
            data[n * 4 + 1] - data[p + 1],
            data[n * 4 + 2] - data[p + 2],
          ) > tolerance
        )
          continue;
        seen[n] = 1;
        queue.push(n);
      }
  }
  let path = "";
  for (let row = 0; row < height; row++)
    for (let col = 0; col < width; col++) {
      if (!selected[row * width + col]) continue;
      const first = col;
      while (col + 1 < width && selected[row * width + col + 1]) col++;
      const x = (first * 1000) / width,
        y = (row * 563) / height,
        w = ((col - first + 1) * 1000) / width,
        h = 563 / height;
      path += `M${x.toFixed(2)} ${y.toFixed(2)}h${w.toFixed(2)}v${h.toFixed(2)}h-${w.toFixed(2)}Z`;
    }
  if (path.length > 190000)
    throw Error(
      "Selection is too detailed. Reduce tolerance or draw a polygon.",
    );
  if (!path)
    throw Error(
      "No connected area selected. Try a different point or tolerance.",
    );
  return path;
}
export async function imageMask(
  data: string,
  fit: string,
  x: number,
  y: number,
  tolerance: number,
  edgeAware = false,
) {
  const img = new Image();
  img.src = data;
  await img.decode();
  const canvas = document.createElement("canvas");
  canvas.width = 224;
  canvas.height = 126;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  const ratio =
    fit === "contain"
      ? Math.min(224 / img.width, 126 / img.height)
      : Math.max(224 / img.width, 126 / img.height);
  const w = fit === "stretch" ? 224 : img.width * ratio,
    h = fit === "stretch" ? 126 : img.height * ratio;
  ctx.drawImage(img, (224 - w) / 2, (126 - h) / 2, w, h);
  return connectedMask(
    ctx.getImageData(0, 0, 224, 126).data,
    224,
    126,
    Math.max(0, Math.min(223, Math.floor((x * 224) / 1000))),
    Math.max(0, Math.min(125, Math.floor((y * 126) / 563))),
    tolerance,
    edgeAware,
  );
}
