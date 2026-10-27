import { useEffect } from "react";
export function PlaybackControls({
  mode,
  onMode,
  advance,
  canAdvance,
  playing = true,
}: {
  mode: "continue" | "enter" | "screen";
  onMode: (mode: "continue" | "enter" | "screen") => void;
  advance: () => void;
  canAdvance: boolean;
  playing?: boolean;
}) {
  useEffect(() => {
    if (!playing) return;
    const handler = (event: KeyboardEvent | MouseEvent) => {
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
      if (canAdvance) {
        event.preventDefault();
        advance();
      }
    };
    document.addEventListener("keydown", handler);
    document.addEventListener("click", handler);
    return () => {
      document.removeEventListener("keydown", handler);
      document.removeEventListener("click", handler);
    };
  }, [mode, advance, canAdvance, playing]);
  return (
    <label className="playback-setting">
      Advance story
      <select
        aria-label="Advance story"
        value={mode}
        onChange={(e) => {
          onMode(e.target.value as typeof mode);
          (document.activeElement as HTMLElement)?.blur?.();
        }}
      >
        <option value="continue">Continue button only</option>
        <option value="enter">Enter key</option>
        <option value="screen">Click the scene</option>
      </select>
    </label>
  );
}
