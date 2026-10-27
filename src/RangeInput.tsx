import type { InputHTMLAttributes } from "react";
export function RangeInput(
  props: InputHTMLAttributes<HTMLInputElement> & { "data-help"?: string },
) {
  return (
    <>
      <input {...props} />
      <input
        className="exact-range"
        data-help={props["data-help"]}
        type="number"
        aria-label={(props["aria-label"] || "Slider") + " exact value"}
        min={props.min}
        max={props.max}
        step={props.step || 1}
        disabled={props.disabled}
        value={props.value}
        onChange={(e) => {
          if (e.target.value === "") return;
          const v = +e.target.value;
          if (
            !Number.isFinite(v) ||
            v < Number(props.min ?? -Infinity) ||
            v > Number(props.max ?? Infinity)
          )
            return;
          props.onChange?.(e);
        }}
      />
    </>
  );
}
