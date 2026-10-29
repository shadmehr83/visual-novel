import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  cloneElement,
  type ReactElement,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";
import { createPortal } from "react-dom";
import {
  Maximize2,
  Minimize2,
  GripHorizontal,
  PanelTop,
  Move,
} from "lucide-react";
import { ResizeHandle } from "./ResizeHandle";
import { PanelEdges } from "./PanelEdges";
import {
  boundPanel,
  panelLayout,
  restoreDock,
  snapDock,
  type DockLayouts,
  type DockMode,
  type PanelLayout,
} from "./docking";
export const DOCK_TITLES: Record<string, string> = {
  library: "Story library",
  controls: "Controls",
  effects: "Effects",
  properties: "Scene properties",
  dialogue: "Dialogue editor",
  preview: "Scene preview",
  "workspace-main": "Main workspace",
  "workspace-second": "Second workspace",
};
type Controller = {
  layouts: DockLayouts;
  active: boolean;
  hosts: Partial<Record<DockMode, HTMLElement>>;
  register: (id: string, on: boolean) => void;
  move: (id: string, mode: DockMode) => void;
  toggle: (id: string) => void;
  drag: (id: string, e: React.PointerEvent<HTMLElement>) => void;
  saveSize: (id: string, e: React.PointerEvent<HTMLElement>) => void;
  raise: (id: string) => void;
  front: string;
  resize: (
    id: string,
    width: number,
    height: number,
    x?: number,
    y?: number,
  ) => void;
};
const Context = createContext<Controller | null>(null);
export const useDockPanels = () => useContext(Context);
export function DockSurface({
  layouts,
  onChange,
  active,
  children,
}: {
  layouts: DockLayouts;
  onChange: Dispatch<SetStateAction<DockLayouts>>;
  active: boolean;
  children: ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null),
    latest = useRef(layouts);
  latest.current = layouts;
  const [mounted, setMounted] = useState<string[]>([]),
    [hosts, setHosts] = useState<Partial<Record<DockMode, HTMLElement>>>({}),
    [hint, setHint] = useState<DockMode | null>(null),
    [dragging, setDragging] = useState(false),
    [front, setFront] = useState("");
  const drag = useRef<{
    id: string;
    dx: number;
    dy: number;
    saved: PanelLayout;
    hint: DockMode | null;
    startX: number;
    startY: number;
    started: boolean;
  } | null>(null);
  const register = (id: string, on: boolean) =>
    setMounted((old) =>
      on
        ? old.includes(id)
          ? old
          : [...old, id]
        : old.filter((v) => v !== id),
    );
  const change = (id: string, fn: (p: PanelLayout) => PanelLayout) =>
    onChange((old) => ({ ...old, [id]: fn(panelLayout(old, id)) }));
  const move = (id: string, mode: DockMode) =>
    change(id, (p) =>
      mode === "float"
        ? boundPanel(
            { ...p, mode, returnTo: p.mode === "float" ? p.returnTo : p.mode },
            innerWidth,
            innerHeight,
          )
        : { ...p, mode },
    );
  const toggle = (id: string) =>
    onChange((old) => {
      const p = panelLayout(old, id);
      return {
        ...old,
        [id]:
          p.mode === "float"
            ? { ...p, mode: restoreDock(old, id) }
            : boundPanel(
                { ...p, mode: "float", returnTo: p.mode },
                innerWidth,
                innerHeight,
              ),
      };
    });
  useEffect(() => {
    const resize = () =>
      onChange((old) =>
        Object.fromEntries(
          Object.entries(old).map(([id, p]) => [
            id,
            p.mode === "float" ? boundPanel(p, innerWidth, innerHeight) : p,
          ]),
        ),
      );
    const reveal = (event: Event) =>
      setFront((event as CustomEvent<string>).detail);
    window.addEventListener("stillframe-reveal-panel", reveal);
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("stillframe-reveal-panel", reveal);
    };
  }, [onChange]);
  useEffect(() => {
    const pointerMove = (e: PointerEvent) => {
      const d = drag.current;
      if (!d || !root.current) return;
      if (!d.started) {
        if (Math.hypot(e.clientX - d.startX, e.clientY - d.startY) < 6) return;
        d.started = true;
        setDragging(true);
        change(d.id, (p) => ({
          ...p,
          mode: "float",
          returnTo: d.saved.mode === "float" ? d.saved.returnTo : d.saved.mode,
          width: d.saved.width,
          height: d.saved.height,
        }));
      }
      const r = root.current.getBoundingClientRect();
      const target = document
        .elementFromPoint(e.clientX, e.clientY)
        ?.closest<HTMLElement>("[data-snap-dock]")?.dataset.snapDock as
        DockMode | undefined;
      d.hint = target || snapDock(e.clientX, e.clientY, r);
      setHint(d.hint);
      change(d.id, (p) =>
        boundPanel(
          { ...p, x: e.clientX - d.dx, y: e.clientY - d.dy },
          innerWidth,
          innerHeight,
        ),
      );
    };
    const stop = () => {
      const d = drag.current;
      if (!d) return;
      if (d.started && d.hint) move(d.id, d.hint);
      drag.current = null;
      setHint(null);
      setDragging(false);
    };
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && drag.current) {
        const d = drag.current;
        change(d.id, () => d.saved);
        drag.current = null;
        setHint(null);
        setDragging(false);
      }
    };
    document.addEventListener("pointermove", pointerMove);
    document.addEventListener("pointerup", stop);
    document.addEventListener("pointercancel", stop);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointermove", pointerMove);
      document.removeEventListener("pointerup", stop);
      document.removeEventListener("pointercancel", stop);
      document.removeEventListener("keydown", escape);
    };
  }, [onChange]);
  const startDrag = (id: string, e: React.PointerEvent<HTMLElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    setFront(id);
    const p = panelLayout(latest.current, id),
      container =
        e.currentTarget.closest<HTMLElement>("[data-floating-panel]") ||
        e.currentTarget.closest<HTMLElement>("[data-dock-panel]");
    const r = container?.getBoundingClientRect();
    const width = r?.width || p.width,
      height = r?.height || p.height;
    const dx = Math.min(
        e.clientX - (r?.left || e.clientX),
        Math.max(30, width - 30),
      ),
      dy = 18;
    drag.current = {
      id,
      dx: Math.max(15, dx),
      dy,
      saved: { ...p, width, height },
      hint: null,
      startX: e.clientX,
      startY: e.clientY,
      started: false,
    };
  };
  const modes = active
    ? new Set(mounted.map((id) => panelLayout(layouts, id).mode))
    : new Set<DockMode>();
  const hostRef = (mode: DockMode) => (node: HTMLDivElement | null) => {
    if (node && hosts[mode] !== node)
      setHosts((old) => ({ ...old, [mode]: node }));
  };
  const controller: Controller = {
    layouts,
    active,
    hosts,
    register,
    move,
    toggle,
    drag: startDrag,
    raise: setFront,
    front,
    resize: (id, width, height, x, y) =>
      change(id, (p) => ({
        ...p,
        ...(x === undefined ? {} : { x }),
        ...(y === undefined ? {} : { y }),
        width: Math.max(220, Math.min(2200, Math.round(width))),
        height: Math.max(140, Math.min(1600, Math.round(height))),
      })),
    saveSize: (id, e) => {
      const r = e.currentTarget.getBoundingClientRect();
      change(id, (p) => ({
        ...p,
        width: Math.max(220, Math.round(r.width)),
        height: Math.max(140, Math.round(r.height)),
      }));
    },
  };
  return (
    <Context.Provider value={controller}>
      <div
        ref={root}
        className={"dock-surface" + (dragging ? " panels-dragging" : "")}
        data-snap-preview={hint || undefined}
      >
        {(["top", "left", "split", "right", "bottom"] as const).map((mode) => (
          <div
            ref={hostRef(mode)}
            className={"dock-slot slot-" + mode}
            data-dock-slot={mode}
            key={mode}
            style={{
              display: modes.has(mode) ? undefined : "none",
              ...(["left", "right", "split"].includes(mode)
                ? {
                    width: Math.min(
                      innerWidth * 0.65,
                      Math.max(
                        ...mounted
                          .filter(
                            (id) => panelLayout(layouts, id).mode === mode,
                          )
                          .map((id) => panelLayout(layouts, id).width),
                        220,
                      ),
                    ),
                  }
                : {
                    height: Math.min(
                      innerHeight * 0.65,
                      Math.max(
                        ...mounted
                          .filter(
                            (id) => panelLayout(layouts, id).mode === mode,
                          )
                          .map((id) => panelLayout(layouts, id).height),
                        140,
                      ),
                    ),
                  }),
            }}
          />
        ))}
        <div className="dock-center">{children}</div>
        {dragging && (
          <div className="dock-snap-guides" aria-label="Window snap targets">
            {(["top", "left", "split", "right", "bottom"] as const).map(
              (mode) => (
                <div
                  key={mode}
                  data-snap-dock={mode}
                  className={
                    "snap-target snap-" +
                    mode +
                    (hint === mode ? " snap-selected" : "")
                  }
                >
                  {mode === "split" ? "Split view" : mode}
                </div>
              ),
            )}
            <p>
              Drag to an edge or a target, then release to dock · Escape cancels
            </p>
          </div>
        )}
      </div>
    </Context.Provider>
  );
}
export function DockPanel({
  id,
  title = DOCK_TITLES[id] || id,
  children,
  tools = true,
}: {
  id: string;
  title?: string;
  children: ReactElement<any>;
  tools?: boolean;
}) {
  const ctx = useDockPanels(),
    frame = useRef<HTMLElement>(null);
  useEffect(() => {
    ctx?.register(id, true);
    return () => ctx?.register(id, false);
  }, [id, !!ctx]);
  const savedMode = ctx?.active ? panelLayout(ctx.layouts, id).mode : "home";
  useEffect(() => {
    if (savedMode !== "float" || !frame.current || !ctx) return;
    let timer: ReturnType<typeof setTimeout>;
    const observer = new ResizeObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const r = frame.current?.getBoundingClientRect();
        if (r) ctx.resize(id, r.width, r.height);
      }, 150);
    });
    observer.observe(frame.current);
    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [savedMode, id]);
  if (!ctx) return children;
  const p = panelLayout(ctx.layouts, id),
    mode = ctx.active ? p.mode : "home";
  const chrome =
    ctx.active && tools ? (
      <div
        className="panel-chrome"
        aria-label={title + " window title bar"}
        data-help={
          title +
          " title bar. Resize at the panel edges. Drag only the six-dot grip to detach and move this window."
        }
      >
        <button
          type="button"
          className="panel-grip"
          aria-label={"Drag " + title + " window"}
          data-help={
            "Drag this six-dot grip at least a few pixels to move " +
            title +
            ". A click alone keeps it docked. Drag near an edge to dock it elsewhere."
          }
          onPointerDown={(e) => ctx.drag(id, e)}
        >
          <GripHorizontal size={14} />
        </button>
        <span className="panel-drag-title">{title}</span>
        <button
          type="button"
          aria-label={(mode === "float" ? "Restore " : "Pop out ") + title}
          data-help={
            mode !== "float"
              ? "Float " +
                title +
                " inside the studio. Its contents and edits stay in this project. Press Restore to put it back."
              : "Return " +
                title +
                " to its previous dock. If that dock is occupied, another available dock is chosen."
          }
          onClick={() => {
            ctx.raise(id);
            ctx.toggle(id);
          }}
        >
          {mode !== "float" ? <Maximize2 size={12} /> : <Minimize2 size={12} />}
        </button>
        <details className="panel-placement-menu">
          <summary
            aria-label={"Move " + title}
            data-help={
              "Choose a dock for " +
              title +
              ", float it, send it to a split area, or restore its original position."
            }
          >
            <Move size={12} />
          </summary>
          <div>
            {(
              [
                "home",
                "float",
                "left",
                "right",
                "top",
                "bottom",
                "split",
              ] as const
            ).map((target) => (
              <button
                key={target}
                aria-label={title + " · " + target}
                onClick={(e) => {
                  ctx.move(id, target);
                  e.currentTarget.closest("details")?.removeAttribute("open");
                }}
                data-help={
                  target === "home"
                    ? "Restore this panel to its original place."
                    : target === "float"
                      ? "Create a movable, resizable window inside the studio."
                      : target === "split"
                        ? "Give this panel its own column beside the main workspace."
                        : "Dock this panel along the " +
                          target +
                          " edge of the workspace."
                }
              >
                {target === "home"
                  ? "Original position"
                  : target === "float"
                    ? "Floating window"
                    : target === "split"
                      ? "Split beside workspace"
                      : "Dock " + target}
              </button>
            ))}
          </div>
        </details>
      </div>
    ) : null;
  const content = cloneElement(
    children,
    { "data-dock-panel": id },
    mode === "home" ? (
      <>
        {chrome}
        {children.props.children}
      </>
    ) : (
      children.props.children
    ),
  );
  if (mode === "home") return content;
  if (mode !== "float") {
    const host = ctx.hosts[mode];
    return host
      ? createPortal(
          <section
            className="dock-resident"
            data-resident-panel={id}
            style={{ position: "relative" }}
          >
            {chrome}
            <div className="dock-body">{content}</div>
            <ResizeHandle
              label={"Resize " + title + " dock"}
              className={"resident-resize resident-" + mode}
              axis={["top", "bottom"].includes(mode) ? "y" : "x"}
              reverse={["right", "bottom"].includes(mode)}
              value={["top", "bottom"].includes(mode) ? p.height : p.width}
              min={["top", "bottom"].includes(mode) ? 140 : 220}
              max={
                ["top", "bottom"].includes(mode)
                  ? Math.min(900, innerHeight * 0.65)
                  : Math.min(1200, innerWidth * 0.65)
              }
              onChange={(n) =>
                ctx.resize(
                  id,
                  ["top", "bottom"].includes(mode) ? p.width : n,
                  ["top", "bottom"].includes(mode) ? n : p.height,
                )
              }
            />
          </section>,
          host,
          id,
        )
      : null;
  }
  const bounds = boundPanel(p, innerWidth, innerHeight);
  return createPortal(
    <section
      ref={frame}
      className="floating-dock"
      data-floating-panel={id}
      aria-label={title + " floating window"}
      style={{
        left: bounds.x,
        top: bounds.y,
        width: bounds.width,
        height: bounds.height,
        zIndex: ctx.front === id ? 95 : 80,
      }}
      onPointerDownCapture={() => ctx.raise(id)}
      onPointerUp={(e) => {
        if (e.target === e.currentTarget) ctx.saveSize(id, e);
      }}
    >
      {chrome}
      <div className="dock-body">{content}</div>
      <PanelEdges
        title={title}
        onResize={(width, height, x, y) => ctx.resize(id, width, height, x, y)}
      />
    </section>,
    document.querySelector(".app") || document.body,
    id,
  );
}
