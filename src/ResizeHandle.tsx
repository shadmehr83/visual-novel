import { useRef } from "react";
export function ResizeHandle({
  label,
  value,
  min,
  max,
  axis = "x",
  reverse = false,
  onChange,
  className,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  axis?: "x" | "y";
  reverse?: boolean;
  onChange: (n: number) => void;
  className: string;
}) {
  const start = useRef<{ x: number; y: number; value: number } | null>(null);
  const change = (n: number) =>
    onChange(Math.max(min, Math.min(max, Math.round(n))));
  return (
    <div
      role="separator"
      aria-label={label}
      aria-orientation={axis === "x" ? "vertical" : "horizontal"}
      aria-valuenow={value}
      aria-valuemin={min}
      aria-valuemax={max}
      tabIndex={0}
      className={"resize-handle " + className}
      data-help="Drag this divider to give the scene more or less space. You can also focus it and use the arrow keys."
      onPointerDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.setPointerCapture(e.pointerId);
        start.current = { x: e.clientX, y: e.clientY, value };
      }}
      onPointerMove={(e) => {
        if (!start.current) return;
        change(
          start.current.value +
            (axis === "x"
              ? e.clientX - start.current.x
              : e.clientY - start.current.y) *
              (reverse ? -1 : 1),
        );
      }}
      onPointerUp={() => (start.current = null)}
      onPointerCancel={() => (start.current = null)}
      onKeyDown={(e) => {
        if (
          ["ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown"].includes(e.key)
        ) {
          e.preventDefault();
          change(
            value +
              (["ArrowLeft", "ArrowUp"].includes(e.key) ? -10 : 10) *
                (reverse ? -1 : 1),
          );
        }
      }}
    />
  );
}
