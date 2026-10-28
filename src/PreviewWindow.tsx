import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
  type CSSProperties,
} from "react";
import type { WorkspaceSettings } from "./workspace";
export function usePreviewWindow(
  value: WorkspaceSettings,
  set: Dispatch<SetStateAction<WorkspaceSettings>>,
  active: boolean,
  locationKey = "",
) {
  const mainRef = useRef<HTMLElement>(null),
    previewRef = useRef<HTMLElement>(null),
    drag = useRef<{
      x: number;
      y: number;
      width: number;
      height: number;
    } | null>(null);
  const [bounds, setBounds] = useState({ width: 1600, height: 900 });
  useEffect(() => {
    if (!active || !mainRef.current) return;
    const main = mainRef.current;
    const measure = () => {
      const toolbar =
          main.querySelector(".workspace-toolbar")?.getBoundingClientRect()
            .height || 0,
        snapshot =
          main.querySelector(".snapshot-toolbar")?.getBoundingClientRect()
            .height || 0;
      const next = {
        width: main.clientWidth,
        height: Math.max(
          180,
          main.clientHeight -
            toolbar -
            snapshot -
            (value.dialogueMode === "hidden" ? 0 : 46),
        ),
      };
      setBounds((b) =>
        b.width === next.width && b.height === next.height ? b : next,
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(main);
    return () => observer.disconnect();
  }, [active, value.dialogueMode, locationKey]);
  const toggle = () => {
    if (value.previewLocked) {
      const box = previewRef.current?.getBoundingClientRect();
      set((w) => ({
        ...w,
        previewLocked: false,
        previewCustom: true,
        previewWidth: Math.max(
          280,
          Math.min(3200, Math.round(box?.width || bounds.width)),
        ),
        previewHeight: Math.max(
          180,
          Math.min(1800, Math.round(box?.height || bounds.height)),
        ),
      }));
    } else set((w) => ({ ...w, previewLocked: true }));
  };
  const fill = () =>
    set((w) => ({
      ...w,
      previewCustom: true,
      previewWidth: Math.max(280, Math.min(3200, bounds.width)),
      previewHeight: Math.max(180, Math.min(1800, bounds.height)),
    }));
  const reset = () =>
    set((w) => ({ ...w, previewLocked: true, previewCustom: false }));
  const resize = (width: number, height: number) =>
    set((w) => ({
      ...w,
      previewCustom: true,
      previewWidth: Math.max(
        280,
        Math.min(3200, bounds.width, Math.round(width)),
      ),
      previewHeight: Math.max(
        180,
        Math.min(1800, bounds.height, Math.round(height)),
      ),
    }));
  const handle = !value.previewLocked ? (
    <button
      className="preview-window-resize"
      aria-label="Resize game preview window"
      data-help="Drag this corner to resize the entire preview window. Arrow keys adjust width or height. Extra height gives the artwork more room and the dialogue editor uses the remaining space. Lock preview size when finished."
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        const r = previewRef.current!.getBoundingClientRect();
        drag.current = {
          x: e.clientX,
          y: e.clientY,
          width: r.width,
          height: r.height,
        };
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (d) resize(d.width + e.clientX - d.x, d.height + e.clientY - d.y);
      }}
      onPointerUp={() => {
        drag.current = null;
      }}
      onPointerCancel={() => {
        drag.current = null;
      }}
      onKeyDown={(e) => {
        if (
          !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)
        )
          return;
        e.preventDefault();
        const d = e.shiftKey ? 50 : 20;
        resize(
          value.previewWidth +
            (e.key === "ArrowLeft" ? -d : e.key === "ArrowRight" ? d : 0),
          value.previewHeight +
            (e.key === "ArrowUp" ? -d : e.key === "ArrowDown" ? d : 0),
        );
      }}
    >
      ◢
    </button>
  ) : null;
  const tools = (
    <div className="preview-window-actions">
      <button
        aria-label={
          value.previewLocked
            ? "Unlock game preview window"
            : "Lock game preview window"
        }
        onClick={toggle}
      >
        {value.previewLocked ? "Unlock window" : "Lock window"}
      </button>
      {!value.previewLocked && (
        <button onClick={fill}>Fill preview space</button>
      )}
      {value.previewCustom && (
        <button onClick={reset}>Reset preview window</button>
      )}
    </div>
  );
  const style = {
    "--preview-window-width": value.previewWidth + "px",
    "--preview-window-height":
      Math.min(value.previewHeight, bounds.height) + "px",
    "--preview-window-max": bounds.height + "px",
  } as CSSProperties;
  return { mainRef, previewRef, tools, handle, style };
}
