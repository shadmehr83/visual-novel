import { useCallback, useEffect, useRef, useState } from "react";
import type { Project, Scene, GifCue } from "./model";
import { GifCanvas } from "./GifCanvas";
type Props = {
  asset: Project["assets"][number];
  fit: Scene["fit"];
  gif?: Scene["gif"];
  cue?: GifCue;
  cueKey: string;
  frozen: boolean;
  reduced: boolean;
  onPosition?: (time: number) => void;
};
function ControlledGifImage({
  asset,
  fit,
  gif,
  cue,
  cueKey,
  frozen,
  reduced,
  onPosition,
}: Props) {
  const [frame, setFrame] = useState(""),
    [error, setError] = useState("");
  const urls = useRef<string[]>([]),
    busy = useRef(false),
    pending = useRef<HTMLCanvasElement | null>(null),
    generation = useRef(0);
  useEffect(() => {
    setFrame("");
    setError("");
    generation.current++;
    return () => {
      generation.current++;
      urls.current.forEach(URL.revokeObjectURL);
      urls.current = [];
    };
  }, [asset.data]);
  const capture = useCallback((canvas: HTMLCanvasElement): void => {
    if (busy.current) {
      pending.current = canvas;
      return;
    }
    busy.current = true;
    const current = generation.current;
    canvas.toBlob((blob) => {
      busy.current = false;
      if (!blob || generation.current !== current) return;
      const url = URL.createObjectURL(blob);
      urls.current.push(url);
      setFrame(url);
      // Keep the preceding frame alive while the new image is decoded by SVG.
      while (urls.current.length > 2)
        URL.revokeObjectURL(urls.current.shift()!);
      if (pending.current) {
        const next = pending.current;
        pending.current = null;
        capture(next);
      }
    }, "image/png");
  }, []);
  const aspect =
    fit === "stretch"
      ? "none"
      : fit === "cover"
        ? "xMidYMid slice"
        : "xMidYMid meet";
  return (
    <g>
      {frame && (
        <image
          href={frame}
          width="1000"
          height="563"
          preserveAspectRatio={aspect}
        />
      )}
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
          onError={setError}
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
