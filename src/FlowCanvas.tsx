import { useEffect, useRef, useState } from "react";
import {
  CARD_WIDTH,
  autoFlowPositions,
  cardHeight,
  portY,
  type FlowGraph,
  type LinkRef,
  type Point,
} from "./flow";
type View = { x: number; y: number; zoom: number };
export function FlowCanvas({
  graph,
  saved,
  selected,
  onSelect,
  onOpen,
  onMove,
  onConnect,
  onRoute,
  onArrange,
  onAdd,
}: {
  graph: FlowGraph;
  saved: Record<string, Point>;
  selected: string;
  onSelect: (id: string) => void;
  onOpen: (id: string) => void;
  onMove: (id: string, p: Point) => void;
  onConnect: (ref: LinkRef, target: string) => void;
  onRoute: (ref: LinkRef) => void;
  onArrange: (p: Record<string, Point>) => void;
  onAdd?: (node: string, kind: "continue" | "reply") => void;
}) {
  const canvas = useRef<HTMLDivElement>(null),
    [view, setView] = useState<View>({ x: 30, y: 30, zoom: 0.85 });
  const [temporary, setTemporary] = useState<Record<string, Point>>({}),
    [armed, setArmed] = useState<{
      ref: LinkRef;
      from: string;
      index: number;
      point?: Point;
    } | null>(null);
  const drag = useRef<{
      id?: string;
      start: Point;
      origin: Point;
      last?: Point;
      pointer: number;
    } | null>(null),
    moved = useRef(false),
    [query, setQuery] = useState("");
  const auto = autoFlowPositions(graph),
    positions = { ...auto, ...saved, ...temporary };
  const completedLink = useRef(false);
  const positionsRef = useRef(positions);
  positionsRef.current = positions;
  const viewRef = useRef(view);
  viewRef.current = view;
  const world = (x: number, y: number) => {
    const r = canvas.current!.getBoundingClientRect(),
      v = viewRef.current;
    return { x: (x - r.left - v.x) / v.zoom, y: (y - r.top - v.y) / v.zoom };
  };
  const focus = (id: string, zoom = 0.85) => {
    const p = positionsRef.current[id],
      el = canvas.current;
    if (p && el)
      setView({
        zoom,
        x: el.clientWidth / 2 - (p.x + CARD_WIDTH / 2) * zoom,
        y: el.clientHeight / 2 - (p.y + 80) * zoom,
      });
  };
  useEffect(() => {
    requestAnimationFrame(() => focus(selected));
  }, []);
  useEffect(() => {
    const el = canvas.current!;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      setView((v) => {
        if (e.ctrlKey || e.metaKey) {
          const rect = el.getBoundingClientRect(),
            zoom = Math.max(
              0.005,
              Math.min(2, v.zoom * Math.exp(-e.deltaY * 0.004)),
            ),
            x = e.clientX - rect.left,
            y = e.clientY - rect.top;
          return {
            x: x - ((x - v.x) * zoom) / v.zoom,
            y: y - ((y - v.y) * zoom) / v.zoom,
            zoom,
          };
        }
        return {
          ...v,
          x: v.x - (e.shiftKey ? e.deltaY : e.deltaX),
          y: v.y - (e.shiftKey ? 0 : e.deltaY),
        };
      });
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);
  const fit = () => {
    const values = graph.cards.map((c) => ({
      p: positionsRef.current[c.id],
      height: cardHeight(c),
    }));
    if (!values.length || !canvas.current) return;
    const minX = Math.min(...values.map((a) => a.p.x)),
      minY = Math.min(...values.map((a) => a.p.y)),
      maxX = Math.max(...values.map((a) => a.p.x + CARD_WIDTH)),
      maxY = Math.max(...values.map((a) => a.p.y + a.height));
    const zoom = Math.max(
      0.005,
      Math.min(
        1,
        (canvas.current.clientWidth - 80) / (maxX - minX),
        (canvas.current.clientHeight - 80) / (maxY - minY),
      ),
    );
    setView({
      zoom,
      x: (canvas.current.clientWidth - (maxX - minX) * zoom) / 2 - minX * zoom,
      y: (canvas.current.clientHeight - (maxY - minY) * zoom) / 2 - minY * zoom,
    });
  };
  const zoomBy = (factor: number) =>
    setView((v) => {
      const el = canvas.current!,
        zoom = Math.max(0.005, Math.min(2, v.zoom * factor)),
        cx = el.clientWidth / 2,
        cy = el.clientHeight / 2;
      return {
        zoom,
        x: cx - ((cx - v.x) * zoom) / v.zoom,
        y: cy - ((cy - v.y) * zoom) / v.zoom,
      };
    });
  const finishLink = (e: React.PointerEvent) => {
    if (!armed) return;
    const target = document
      .elementsFromPoint(e.clientX, e.clientY)
      .map((el) => el.closest<HTMLElement>("[data-flow-input]"))
      .find(Boolean)?.dataset.flowInput;
    if (target) {
      completedLink.current = true;
      setTimeout(() => {
        completedLink.current = false;
      }, 0);
      onConnect(armed.ref, target);
      setArmed(null);
    }
  };
  const curve = (a: Point, b: Point) => {
    const distance = Math.max(80, Math.min(250, Math.abs(b.x - a.x) * 0.5));
    return `M ${a.x} ${a.y} C ${a.x + distance} ${a.y},${b.x - distance} ${b.y},${b.x} ${b.y}`;
  };
  return (
    <div className="flow-canvas-area">
      <div className="flow-view-tools">
        <button onClick={() => zoomBy(0.8)} aria-label="Zoom out map">
          −
        </button>
        <output>{Math.round(view.zoom * 100)}%</output>
        <button onClick={() => zoomBy(1.25)} aria-label="Zoom in map">
          +
        </button>
        <button onClick={fit}>Fit all</button>
        <button onClick={() => focus(selected)}>Focus selection</button>
        <button
          data-help="Arrange graph boxes automatically. Story links and dialogue order stay unchanged. Undo restores the previous positions."
          onClick={() => {
            onArrange(auto);
            setTemporary({});
            requestAnimationFrame(fit);
          }}
        >
          Auto arrange
        </button>
        <label>
          Find
          <input
            aria-label="Find in flow map"
            placeholder="Speaker, dialogue or scene…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>
      {query && (
        <div className="flow-search-results">
          {graph.cards
            .filter((c) =>
              (c.title + " " + c.text)
                .toLowerCase()
                .includes(query.toLowerCase()),
            )
            .slice(0, 30)
            .map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  onSelect(c.id);
                  focus(c.id);
                  setQuery("");
                }}
              >
                {c.title} · {c.text.slice(0, 50)}
              </button>
            ))}
        </div>
      )}
      <div
        ref={canvas}
        className={"flow-canvas " + (armed ? "is-connecting" : "")}
        aria-label="Story flow canvas"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setArmed(null);
            drag.current = null;
          }
          if (e.target === e.currentTarget) {
            if (e.key === "+" || e.key === "=") zoomBy(1.25);
            if (e.key === "-") zoomBy(0.8);
          }
        }}
        onPointerDown={(e) => {
          if (e.button !== 0 || e.target !== e.currentTarget) return;
          setArmed(null);
          e.currentTarget.setPointerCapture(e.pointerId);
          drag.current = {
            start: { x: e.clientX, y: e.clientY },
            origin: { x: view.x, y: view.y },
            pointer: e.pointerId,
          };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (d && !d.id)
            setView((v) => ({
              ...v,
              x: d.origin.x + e.clientX - d.start.x,
              y: d.origin.y + e.clientY - d.start.y,
            }));
          if (armed)
            setArmed((a) =>
              a ? { ...a, point: world(e.clientX, e.clientY) } : null,
            );
        }}
        onPointerUp={() => {
          if (drag.current && !drag.current.id) drag.current = null;
        }}
      >
        <div
          className="flow-world"
          style={{
            transform: `translate(${view.x}px,${view.y}px) scale(${view.zoom})`,
          }}
        >
          <svg className="flow-wires" aria-label="Story connections">
            <defs>
              <marker
                id="flow-arrow"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto"
              >
                <path d="M0 0 L10 5 L0 10Z" fill="currentColor" />
              </marker>
            </defs>
            {graph.edges.map((edge) => {
              const from = positions[edge.from],
                to = positions[edge.to];
              if (!from || !to) return null;
              const a = {
                  x: from.x + CARD_WIDTH,
                  y: from.y + portY(edge.port),
                },
                b = { x: to.x, y: to.y + 32 };
              return (
                <g
                  key={edge.id}
                  className={
                    "flow-edge " +
                    (edge.ref.kind === "choice" ? "choice-edge" : "")
                  }
                >
                  <title>
                    {edge.label}
                    {edge.detail ? " · " + edge.detail : ""}
                  </title>
                  <path
                    className="flow-edge-line"
                    d={curve(a, b)}
                    markerEnd="url(#flow-arrow)"
                  />
                  <path
                    className="flow-edge-hit"
                    d={curve(a, b)}
                    role="button"
                    tabIndex={0}
                    aria-label={"Edit route " + edge.label}
                    onClick={() => onRoute(edge.ref)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") onRoute(edge.ref);
                    }}
                  />
                </g>
              );
            })}
            {armed && positions[armed.from] && (
              <path
                className="flow-connecting-line"
                d={curve(
                  {
                    x: positions[armed.from].x + CARD_WIDTH,
                    y: positions[armed.from].y + portY(armed.index),
                  },
                  armed.point || {
                    x: positions[armed.from].x + CARD_WIDTH + 100,
                    y: positions[armed.from].y + portY(armed.index),
                  },
                )}
              />
            )}
          </svg>
          {graph.cards.map((c) => (
            <article
              key={c.id}
              data-flow-card={c.id}
              className={
                "flow-card " + c.kind + (selected === c.id ? " selected" : "")
              }
              style={{
                left: positions[c.id].x,
                top: positions[c.id].y,
                width: CARD_WIDTH,
                height: cardHeight(c),
              }}
              onClick={() => onSelect(c.id)}
              onDoubleClick={() => onOpen(c.id)}
            >
              <button
                className="flow-input"
                data-flow-input={c.id}
                aria-label={"Connect to " + c.title}
                data-help="Drop a line here, or click after choosing an output. Dialogue Continue links stay in their own scene; a reply can lead to another scene."
                onClick={(e) => {
                  e.stopPropagation();
                  if (armed) {
                    onConnect(armed.ref, c.id);
                    setArmed(null);
                  } else onSelect(c.id);
                }}
              >
                ●
              </button>
              <button
                className="flow-card-heading"
                aria-label={"Move " + c.title}
                data-help="Drag this heading to move the box. Arrow keys move it in small steps; Shift plus an arrow moves it farther. Double-click opens this scene’s dialogues or the original dialogue editor."
                onPointerDown={(e) => {
                  if (e.button !== 0) return;
                  e.stopPropagation();
                  e.currentTarget.setPointerCapture(e.pointerId);
                  moved.current = false;
                  drag.current = {
                    id: c.id,
                    start: { x: e.clientX, y: e.clientY },
                    origin: positions[c.id],
                    pointer: e.pointerId,
                  };
                  onSelect(c.id);
                }}
                onPointerMove={(e) => {
                  const d = drag.current;
                  if (d?.id !== c.id) return;
                  e.stopPropagation();
                  const dx = (e.clientX - d.start.x) / viewRef.current.zoom,
                    dy = (e.clientY - d.start.y) / viewRef.current.zoom;
                  if (Math.abs(dx) + Math.abs(dy) > 3) moved.current = true;
                  d.last = { x: d.origin.x + dx, y: d.origin.y + dy };
                  setTemporary((p) => ({ ...p, [c.id]: d.last! }));
                }}
                onPointerUp={(e) => {
                  const d = drag.current;
                  if (d?.id !== c.id) return;
                  e.stopPropagation();
                  if (moved.current && d.last) onMove(c.id, d.last);
                  setTemporary((p) => {
                    const next = { ...p };
                    delete next[c.id];
                    return next;
                  });
                  drag.current = null;
                }}
                onPointerCancel={() => {
                  drag.current = null;
                  setTemporary({});
                }}
                onKeyDown={(e) => {
                  const step = e.shiftKey ? 100 : 20,
                    delta: Record<string, Point> = {
                      ArrowLeft: { x: -step, y: 0 },
                      ArrowRight: { x: step, y: 0 },
                      ArrowUp: { x: 0, y: -step },
                      ArrowDown: { x: 0, y: step },
                    };
                  if (delta[e.key]) {
                    e.preventDefault();
                    e.stopPropagation();
                    const p = positions[c.id];
                    onMove(c.id, {
                      x: p.x + delta[e.key].x,
                      y: p.y + delta[e.key].y,
                    });
                  }
                }}
              >
                {c.entry && <span className="flow-entry">START</span>}
                {c.title}
              </button>
              <p className="flow-card-text" title={c.text}>
                {c.text}
              </p>
              {c.kind === "dialogue" && onAdd && <div className="flow-quick-add">
                <button aria-label={"Add connected dialogue after " + c.title} onClick={e => { e.stopPropagation(); onAdd(c.node!, "continue"); }}>+ Dialogue</button>
                <button aria-label={"Add reply route from " + c.title} onClick={e => { e.stopPropagation(); onAdd(c.node!, "reply"); }}>+ Reply</button>
              </div>}
              {c.ports.map((port, i) => (
                <div
                  key={port.id}
                  className="flow-port-row"
                  style={{ top: portY(i) - 15 }}
                >
                  <button
                    className="flow-route-label"
                    title={port.detail || port.label}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (port.ref.kind !== "new-route") onRoute(port.ref);
                      else onSelect(c.id);
                    }}
                  >
                    {port.label}
                  </button>
                  <button
                    className="flow-output"
                    aria-label={"Connect " + port.label + " from " + c.title}
                    data-help="Drag this output to another box’s input dot, or click it then click the destination dot. This changes the authored story link; Undo restores it."
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      e.currentTarget.setPointerCapture(e.pointerId);
                      setArmed({ ref: port.ref, from: c.id, index: i });
                    }}
                    onPointerMove={(e) => {
                      if (armed)
                        setArmed((a) =>
                          a
                            ? { ...a, point: world(e.clientX, e.clientY) }
                            : null,
                        );
                    }}
                    onPointerUp={(e) => {
                      e.stopPropagation();
                      finishLink(e);
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (completedLink.current) {
                        completedLink.current = false;
                        return;
                      }
                      setArmed((a) =>
                        a?.from === c.id && a.index === i
                          ? a
                          : { ref: port.ref, from: c.id, index: i },
                      );
                    }}
                  >
                    ●
                  </button>
                </div>
              ))}
            </article>
          ))}
        </div>
      </div>
      <div className="flow-status" role="status">
        {armed
          ? "Choose a destination dot · Escape cancels"
          : `${graph.cards.length} boxes · ${graph.edges.length} connections · Drag headings to arrange; drag empty space to pan; Ctrl + wheel to zoom.`}
      </div>
    </div>
  );
}
