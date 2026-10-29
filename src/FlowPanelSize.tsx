import { useState, type PointerEvent } from "react";
const limit = (n: number) => Math.max(240, Math.min(1200, n));
export function useFlowPanelSize() {
  const [width, setWidth] = useState(() => {
    try {
      return limit(
        Number(localStorage.getItem("stillframe-flow-panel-width")) || 340,
      );
    } catch {
      return 340;
    }
  });
  const change = (n: number) => {
    const value = limit(n);
    setWidth(value);
    try {
      localStorage.setItem("stillframe-flow-panel-width", String(value));
    } catch {}
  };
  const expand = () => change(Math.max(width, 720));
  return { width, change, expand };
}
export function FlowPanelSize({
  width,
  onChange,
}: {
  width: number;
  onChange: (n: number) => void;
}) {
  const drag = (event: PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    const x = event.clientX,
      start = width;
    const element = event.currentTarget;
    element.setPointerCapture(event.pointerId);
    const move = (e: globalThis.PointerEvent) =>
      onChange(start + x - e.clientX);
    const end = () => {
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerup", end);
      element.removeEventListener("pointercancel", end);
    };
    element.addEventListener("pointermove", move);
    element.addEventListener("pointerup", end);
    element.addEventListener("pointercancel", end);
  };
  return (
    <div
      className="flow-panel-divider"
      role="separator"
      tabIndex={0}
      aria-label="Resize advanced scene panel"
      aria-orientation="vertical"
      aria-valuemin={240}
      aria-valuemax={1200}
      aria-valuenow={width}
      data-help="Drag left to widen the selected-scene and film editor panel. Use Left and Right arrow keys for 40-pixel steps. Your preferred width is remembered on this browser."
      onPointerDown={drag}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
          e.preventDefault();
          onChange(width + (e.key === "ArrowLeft" ? 40 : -40));
        }
      }}
    />
  );
}
