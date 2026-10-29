import { useRef } from "react";
/** Edge resizing is deliberately independent of the window's move grip. */
export function PanelEdges({
  title,
  onResize,
}: {
  title: string;
  onResize: (width: number, height: number, x: number, y: number) => void;
}) {
  const start = useRef<{ x: number; y: number; rect: DOMRect } | null>(null);
  return (
    <>
      {["n", "s", "e", "w", "ne", "nw", "se", "sw"].map((edge) => (
        <div
          key={edge}
          role="separator"
          tabIndex={0}
          aria-label={"Resize " + title + " " + edge + " edge"}
          className={"panel-edge edge-" + edge}
          data-help="Drag this edge to resize the floating window. Use the six-dot grip to move it."
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.currentTarget.setPointerCapture(e.pointerId);
            start.current = {
              x: e.clientX,
              y: e.clientY,
              rect: e.currentTarget.parentElement!.getBoundingClientRect(),
            };
          }}
          onPointerMove={(e) => {
            const a = start.current;
            if (!a) return;
            const dx = e.clientX - a.x,
              dy = e.clientY - a.y,
              r = a.rect;
            const width = Math.max(
              220,
              Math.min(
                edge.includes("w") ? r.right : innerWidth - r.x,
                r.width +
                  (edge.includes("e") ? dx : edge.includes("w") ? -dx : 0),
              ),
            );
            const height = Math.max(
              140,
              Math.min(
                edge.includes("n") ? r.bottom : innerHeight - r.y,
                r.height +
                  (edge.includes("s") ? dy : edge.includes("n") ? -dy : 0),
              ),
            );
            onResize(
              width,
              height,
              edge.includes("w") ? Math.max(0, r.right - width) : r.x,
              edge.includes("n") ? Math.max(0, r.bottom - height) : r.y,
            );
          }}
          onPointerUp={() => {
            start.current = null;
          }}
          onPointerCancel={() => {
            start.current = null;
          }}
          onKeyDown={(e) => {
            if (
              !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(
                e.key,
              )
            )
              return;
            e.preventDefault();
            const r = e.currentTarget.parentElement!.getBoundingClientRect();
            onResize(
              Math.max(
                220,
                r.width +
                  (e.key === "ArrowRight"
                    ? 10
                    : e.key === "ArrowLeft"
                      ? -10
                      : 0),
              ),
              Math.max(
                140,
                r.height +
                  (e.key === "ArrowDown" ? 10 : e.key === "ArrowUp" ? -10 : 0),
              ),
              r.x,
              r.y,
            );
          }}
        />
      ))}
    </>
  );
}
