import { useEffect, useRef, useState } from "react";
import { usePaused } from "./PlaySession";
import {
  loadGif,
  gifPainter,
  frameAt,
  initialGif,
  cueGif,
  stepGif,
  defaultGif,
  type GifMovie,
  type GifTransport,
} from "./gif";
import type { GifPlayback, GifCue } from "./model";
export function GifCanvas({
  data,
  config = defaultGif,
  cue,
  cueKey = "",
  frozen = false,
  reduced = false,
  onTime,
  onMovie,
  onError,
  onFrame,
  onPosition,
}: {
  data: string;
  config?: GifPlayback;
  cue?: GifCue;
  cueKey?: string;
  frozen?: boolean;
  reduced?: boolean;
  onFrame?: (canvas: HTMLCanvasElement) => void;
  onPosition?: (time: number) => void;
  onTime?: (time: number, running: boolean) => void;
  onMovie?: (movie: GifMovie) => void;
  onError?: (error: string) => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null),
    state = useRef<GifTransport>(initialGif(config, 3600));
  const [movie, setMovie] = useState<GifMovie | null>(null),
    [error, setError] = useState("");
  const paused = usePaused(),
    flags = useRef({ frozen, reduced, paused });
  flags.current = { frozen, reduced, paused };
  const latest = useRef({
    config,
    cue,
    onTime,
    onMovie,
    onError,
    onFrame,
    onPosition,
  });
  latest.current = {
    config,
    cue,
    onTime,
    onMovie,
    onError,
    onFrame,
    onPosition,
  };
  useEffect(() => {
    let disposed = false;
    setMovie(null);
    setError("");
    loadGif(data)
      .then((m) => {
        if (!disposed) {
          setMovie(m);
          latest.current.onMovie?.(m);
        }
      })
      .catch((e) => {
        if (!disposed) {
          const message = "Could not control GIF: " + String(e);
          setError(message);
          latest.current.onError?.(message);
        }
      });
    return () => {
      disposed = true;
    };
  }, [data]);
  useEffect(() => {
    if (!movie) return;
    state.current = initialGif(config, movie.duration);
    if (latest.current.cue)
      state.current = cueGif(
        state.current,
        latest.current.cue,
        movie.duration,
        config,
      );
  }, [movie, JSON.stringify(config)]);
  useEffect(() => {
    if (movie && cue)
      state.current = cueGif(state.current, cue, movie.duration, config);
  }, [movie, cueKey, JSON.stringify(cue)]);
  useEffect(() => {
    if (!movie || !canvas.current) return;
    const draw = gifPainter(movie, canvas.current);
    let frame = 0,
      last = performance.now(),
      published = -Infinity,
      previousIndex = -1;
    const tick = (now: number) => {
      if(now-last<32){frame=requestAnimationFrame(tick);return;}
      const dt = Math.max(0, (now - last) / 1000);
      last = now;
      if (
        !flags.current.frozen &&
        !flags.current.paused &&
        !flags.current.reduced &&
        document.visibilityState !== "hidden"
      )
        state.current = stepGif(state.current, dt, movie.duration);
      latest.current.onPosition?.(state.current.time);
      const index = frameAt(movie.ends, state.current.time);
      try {
        if (index !== previousIndex) {
          draw(index);
          previousIndex = index;
          latest.current.onFrame?.(canvas.current!);
        }
      } catch (e) {
        const message = "Could not draw GIF: " + String(e);
        setError(message);
        latest.current.onError?.(message);
        return;
      }
      const element = canvas.current;
      if (element) {
        element.dataset.gifFrame = String(index);
        element.dataset.gifTime = state.current.time.toFixed(3);
        element.dataset.gifState =
          state.current.running &&
          !flags.current.frozen &&
          !flags.current.paused &&
          !flags.current.reduced
            ? "playing"
            : "paused";
      }
      if (latest.current.onTime && now - published > 100) {
        latest.current.onTime?.(state.current.time, state.current.running);
        published = now;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [movie]);
  return (
    <>
      <canvas
        ref={canvas}
        className="controlled-gif"
        role="img"
        aria-label="Controlled GIF preview"
        style={{ width: "100%", height: "100%", display: "block" }}
      />
      {error && (
        <span role="alert" className="gif-error">
          {error}
        </span>
      )}
    </>
  );
}
