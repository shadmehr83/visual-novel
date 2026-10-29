import { parseGIF, decompressFrame, type ParsedGif } from "gifuct-js";
import type { GifPlayback, GifCue } from "./model";
type RawFrame = Parameters<typeof decompressFrame>[0];
export const defaultGif: GifPlayback = { mode: "loop", speed: 1, startTime: 0 };
export type GifMovie = {
  width: number;
  height: number;
  duration: number;
  ends: number[];
  frames: RawFrame[];
  parsed: ParsedGif;
  patches: Map<
    number,
    {
      patch: Uint8ClampedArray;
      dims: { width: number; height: number; top: number; left: number };
      disposal: number;
    }
  >;
  bytes: number;
};
const cache = new Map<string, Promise<GifMovie>>();
export function loadGif(data: string): Promise<GifMovie> {
  const old = cache.get(data);
  if (old) {
    cache.delete(data);
    cache.set(data, old);
    return old;
  }
  const result = new Promise<GifMovie>((resolve, reject) =>
    setTimeout(() => {
      try {
        const raw = atob(data.slice(data.indexOf(",") + 1));
        const bytes = Uint8Array.from(raw, (c) => c.charCodeAt(0));
        const parsed = parseGIF(bytes.buffer);
        const frames = parsed.frames.filter((f): f is RawFrame => "image" in f);
        if (
          !frames.length ||
          parsed.lsd.width * parsed.lsd.height > 32000000 ||
          frames.length > 10000
        )
          throw Error(
            "GIF has no frames or exceeds the 32-megapixel / 10,000-frame playback limit.",
          );
        let duration = 0;
        const ends = frames.map(
          (f) => (duration += Math.max(0.02, (f.gce?.delay || 10) / 100)),
        );
        resolve({
          width: parsed.lsd.width,
          height: parsed.lsd.height,
          duration,
          ends,
          frames,
          parsed,
          patches: new Map(),
          bytes: 0,
        });
      } catch (e) {
        cache.delete(data);
        reject(e);
      }
    }, 0),
  );
  cache.set(data, result);
  // Cache only two source movies. Decoded patches are bounded separately.
  while (cache.size > 2) cache.delete(cache.keys().next().value!);
  return result;
}
export function frameAt(ends: number[], time: number) {
  let lo = 0,
    hi = ends.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (time < ends[mid] - 1e-9) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}
export function patchAt(movie: GifMovie, index: number) {
  let patch = movie.patches.get(index);
  if (!patch) {
    const f = decompressFrame(movie.frames[index], movie.parsed.gct, true);
    patch = { patch: f.patch, dims: f.dims, disposal: f.disposalType || 0 };
    while (
      movie.bytes + f.patch.byteLength > 32 * 1024 * 1024 &&
      movie.patches.size
    ) {
      const key = movie.patches.keys().next().value!;
      movie.bytes -= movie.patches.get(key)!.patch.byteLength;
      movie.patches.delete(key);
    }
    movie.patches.set(index, patch);
    movie.bytes += f.patch.byteLength;
  }
  return patch;
}
// Compose disposal-2/3 patches correctly. Seek backwards rebuilds from frame zero;
// forward playback only composites newly entered frames, without PNG/base64 copies.
export function gifPainter(movie: GifMovie, canvas: HTMLCanvasElement) {
  canvas.width = movie.width;
  canvas.height = movie.height;
  const ctx = canvas.getContext("2d")!;
  const part = document.createElement("canvas"),
    saved = document.createElement("canvas");
  saved.width = movie.width;
  saved.height = movie.height;
  const backup = saved.getContext("2d")!;
  let current = -1;
  return (index: number) => {
    if (index === current) return;
    if (index < current) {
      ctx.clearRect(0, 0, movie.width, movie.height);
      current = -1;
    }
    for (let n = current + 1; n <= index; n++) {
      if (n > 0) {
        const previous = patchAt(movie, n - 1),
          d = previous.dims;
        if (previous.disposal === 2)
          ctx.clearRect(d.left, d.top, d.width, d.height);
        else if (previous.disposal === 3) {
          ctx.clearRect(0, 0, movie.width, movie.height);
          ctx.drawImage(saved, 0, 0);
        }
      }
      const f = patchAt(movie, n),
        d = f.dims;
      if (f.disposal === 3) {
        backup.clearRect(0, 0, movie.width, movie.height);
        backup.drawImage(canvas, 0, 0);
      }
      part.width = d.width;
      part.height = d.height;
      part
        .getContext("2d")!
        .putImageData(
          new ImageData(new Uint8ClampedArray(f.patch), d.width, d.height),
          0,
          0,
        );
      ctx.drawImage(part, d.left, d.top);
    }
    current = index;
  };
}
export type GifTransport = {
  time: number;
  running: boolean;
  mode: "loop" | "once";
  speed: number;
  pauseAt?: number;
};
const bound = (time: number, duration: number) =>
  Math.max(0, Math.min(duration, time));
export function initialGif(
  config: GifPlayback,
  duration: number,
): GifTransport {
  return {
    time: bound(
      config.mode === "paused"
        ? (config.pauseAt ?? config.startTime)
        : config.startTime,
      duration,
    ),
    running: config.mode !== "paused",
    mode: config.mode === "once" ? "once" : "loop",
    speed: config.speed,
    pauseAt: config.pauseAt,
  };
}
export function cueGif(
  state: GifTransport,
  cue: GifCue,
  duration: number,
  config: GifPlayback,
): GifTransport {
  return {
    ...state,
    speed: cue.speed ?? state.speed,
    pauseAt:
      cue.pauseAt ??
      (cue.action === "once" || cue.action === "play"
        ? config.pauseAt
        : state.pauseAt),
    time: bound(
      cue.time ??
        (cue.action === "play" || cue.action === "once"
          ? config.startTime
          : state.time),
      duration,
    ),
    running: cue.action !== "pause",
    mode:
      cue.action === "once"
        ? "once"
        : cue.action === "play"
          ? "loop"
          : state.mode,
  };
}
export function stepGif(
  state: GifTransport,
  delta: number,
  duration: number,
): GifTransport {
  if (!state.running) return state;
  const time = state.time + delta * state.speed;
  if (time < duration) return { ...state, time };
  return state.mode === "once"
    ? {
        ...state,
        time: bound(state.pauseAt ?? duration, duration),
        running: false,
      }
    : { ...state, time: time % duration };
}
