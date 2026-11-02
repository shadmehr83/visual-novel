import { useRef, useState } from "react";
import type { Project, Scene, GifCue, GifPlayback } from "./model";
import { GifCanvas } from "./GifCanvas";
import { cueGif, defaultGif, frameAt, initialGif } from "./gif";
type Props = {
  asset: Project["assets"][number];
  fit: Scene["fit"];
  gif?: Scene["gif"];
  cue?: GifCue;
  cueKey: string;
  frozen: boolean;
  reduced: boolean;
  onPosition?: (time: number) => void;
  // The GIF's still poster, shown until its first frame is ready.
  poster?: string;
};
// Each GIF frame is encoded once (by Claude) and shared by every copy of that GIF: the
// incoming view, the copy fading out and a scene shown again. Cross-fades therefore start
// on a real frame instead of an empty picture, and later loops cost no encoding at all.
type Frames = {
  urls: Map<number, { url: string; size: number }>;
  bytes: number;
  ends?: number[];
  duration?: number;
  last?: string;
};
const store = new Map<string, Frames>();
let storeBytes = 0;
const STORE_LIMIT = 64 * 1024 * 1024;
function framesOf(key: string) {
  let frames = store.get(key);
  if (frames) store.delete(key);
  else frames = { urls: new Map(), bytes: 0 };
  store.set(key, frames);
  return frames;
}
function keep(key: string, frames: Frames, index: number, blob: Blob) {
  const url = URL.createObjectURL(blob);
  frames.urls.set(index, { url, size: blob.size });
  frames.bytes += blob.size;
  storeBytes += blob.size;
  // Forget the least recently shown GIFs first, then this GIF's oldest frames.
  while (storeBytes > STORE_LIMIT) {
    const [other, old] = store.entries().next().value!;
    if (other !== key) {
      old.urls.forEach((f) => URL.revokeObjectURL(f.url));
      storeBytes -= old.bytes;
      store.delete(other);
      continue;
    }
    const [oldest, frame] = frames.urls.entries().next().value!;
    if (frame.url === url) break;
    URL.revokeObjectURL(frame.url);
    frames.urls.delete(oldest);
    frames.bytes -= frame.size;
    storeBytes -= frame.size;
  }
  return url;
}
function startingFrame(frames: Frames, config: GifPlayback, cue?: GifCue) {
  if (!frames.ends || frames.duration === undefined) return frames.last;
  let state = initialGif(config, frames.duration);
  if (cue) state = cueGif(state, cue, frames.duration, config);
  return frames.urls.get(frameAt(frames.ends, state.time))?.url || frames.last;
}
function ControlledGifImage({
  asset,
  fit,
  gif,
  cue,
  cueKey,
  frozen,
  reduced,
  onPosition,
  poster,
}: Props) {
  const key = asset.id + ":" + asset.data.length;
  const [initial] = useState(() => startingFrame(framesOf(key), gif || defaultGif, cue) || poster || "");
  const [ready, setReady] = useState(!!initial),
    [error, setError] = useState("");
  const image = useRef<SVGImageElement>(null),
    busy = useRef(false),
    pending = useRef<{ canvas: HTMLCanvasElement; index: number } | null>(null),
    ticket = useRef(0);
  // A frame replaces the previous one only once it is decoded, so the picture never blinks.
  const show = (url: string) => {
    const mine = ++ticket.current;
    const next = new Image();
    next.src = url;
    next.decode().catch(() => {}).then(() => {
      if (mine !== ticket.current || !image.current) return;
      image.current.setAttribute("href", url);
      framesOf(key).last = url;
      setReady(true);
    });
  };
  const capture = (canvas: HTMLCanvasElement, index: number): void => {
    const frames = framesOf(key);
    const cached = frames.urls.get(index);
    if (cached) return show(cached.url);
    if (busy.current) {
      pending.current = { canvas, index };
      return;
    }
    busy.current = true;
    canvas.toBlob((blob) => {
      busy.current = false;
      if (blob) show(keep(key, frames, index, blob));
      const later = pending.current;
      pending.current = null;
      if (later) capture(later.canvas, later.index);
    }, "image/webp", 0.92);
  };
  const aspect =
    fit === "stretch"
      ? "none"
      : fit === "cover"
        ? "xMidYMid slice"
        : "xMidYMid meet";
  return (
    <g data-gif-pending={ready ? undefined : ""}>
      <image
        ref={image}
        href={initial || undefined}
        width="1000"
        height="563"
        preserveAspectRatio={aspect}
      />
      <foreignObject
        width={asset.width}
        height={asset.height}
        visibility="hidden"
        pointerEvents="none"
      >
        <GifCanvas
          data={asset.data}
          config={gif}
          cue={cue}
          cueKey={cueKey}
          frozen={frozen}
          reduced={reduced}
          onPosition={onPosition}
          onFrame={capture}
          onMovie={(movie) => {
            const frames = framesOf(key);
            frames.ends = movie.ends;
            frames.duration = movie.duration;
          }}
          onError={(message) => {
            setError(message);
            setReady(true);
          }}
        />
      </foreignObject>
      {error && (
        <text x="20" y="35" fill="#ffd9e7" fontSize="18" role="alert">
          {error}
        </text>
      )}
    </g>
  );
}
export function BackgroundImage(props: Props) {
  const { asset, fit } = props,
    aspect =
      fit === "stretch"
        ? "none"
        : fit === "cover"
          ? "xMidYMid slice"
          : "xMidYMid meet";
  return asset.mime === "image/gif" ? (
    <ControlledGifImage key={asset.id + asset.data.length} {...props} />
  ) : (
    <image
      href={asset.data}
      width="1000"
      height="563"
      preserveAspectRatio={aspect}
    />
  );
}
