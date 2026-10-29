import { usePaused } from "./PlaySession";
import { useEffect } from "react";
export function PlaybackControls({
  mode,
  onMode,
  advance,
  canAdvance,
  playing = true,
  showSetting = true,
}: {
  mode: "continue" | "enter" | "screen";
  onMode: (mode: "continue" | "enter" | "screen") => void;
  advance: () => void;
  canAdvance: boolean;
  playing?: boolean;
  showSetting?: boolean;
}) {
  const paused = usePaused();
  useEffect(() => {
    if (!playing || paused) return;
    let pointerStart: {x: number; y: number; target: EventTarget | null} | null = null;
    let dragged = false;
    const down = (e: PointerEvent) => { pointerStart = {x:e.clientX,y:e.clientY,target:e.target}; dragged = false; };
    const move = (e: PointerEvent) => { if (pointerStart && Math.hypot(e.clientX-pointerStart.x,e.clientY-pointerStart.y)>8) dragged = true; };
    const handler = (event: KeyboardEvent | MouseEvent) => {
      if (event instanceof MouseEvent && dragged) { dragged = false; return; }
      const target = event.target instanceof Element ? event.target : null;
      if (
        target?.closest(
          "input,textarea,select,button,a,summary,[contenteditable=true],[data-no-advance]",
        )
      )
        return;
      if (event instanceof KeyboardEvent) {
        if (
          mode !== "enter" ||
          event.key !== "Enter" ||
          event.repeat ||
          event.altKey ||
          event.ctrlKey ||
          event.metaKey
        )
          return;
      } else if (mode !== "screen" || !target?.closest(".scene-in .stage"))
        return;
      if (document.querySelector(".scene-in .typing-bubble")) return;
      const phone = document.querySelector<HTMLElement>(
        ".scene-in .device-overlay",
      );
      if (
        phone &&
        phone.dataset.deviceScreen !== "chat" &&
        !document.querySelector(".scene-in .device-story-progress")
      )
        return;
      if (canAdvance) {
        event.preventDefault();
        advance();
      }
    };
    document.addEventListener("pointerdown", down);
    document.addEventListener("pointermove", move);
    document.addEventListener("keydown", handler);
    document.addEventListener("click", handler);
    return () => {
      document.removeEventListener("pointerdown", down);
      document.removeEventListener("pointermove", move);
      document.removeEventListener("keydown", handler);
      document.removeEventListener("click", handler);
    };
  }, [mode, advance, canAdvance, playing, paused]);
  return showSetting ? <PlaybackSetting mode={mode} onMode={onMode} /> : null;
}
export function PlaybackSetting({mode,onMode}: {mode: "continue" | "enter" | "screen"; onMode: (mode: "continue" | "enter" | "screen") => void}) {
  return (
    <label className="playback-setting">
      Advance story
      <select
        aria-label="Advance story"
        data-help="Choose whether the story advances with Continue, Enter, or a tap on the scene. Choices always require selecting a reply; scrolling and interactive phone controls never select a branch."
        value={mode}
        onChange={(e) => {
          onMode(e.target.value as typeof mode);
          (document.activeElement as HTMLElement)?.blur?.();
        }}
      >
        <option value="continue">Continue button only</option>
        <option value="enter">Enter key</option>
        <option value="screen">Tap / click the scene</option>
      </select>
    </label>
  );
}
