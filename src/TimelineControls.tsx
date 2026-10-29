import { useEffect, useState } from "react";
import type { Scene } from "./model";
export function ExactNumber({
  label,
  value,
  min = 0,
  max = 3600,
  step = 0.01,
  onChange,
  help,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (v: number) => void;
  help: string;
}) {
  const [draft, setDraft] = useState(String(value)),
    [focused, setFocused] = useState(false);
  useEffect(() => {
    if (!focused) setDraft(String(value));
  }, [value, focused]);
  return (
    <label>
      {label}
      <input
        type="number"
        aria-label={label}
        data-help={help}
        min={min}
        max={max}
        step={step}
        value={draft}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          setDraft(String(value));
        }}
        onChange={(e) => {
          const v = e.target.value;
          setDraft(v);
          if (v !== "" && Number.isFinite(+v) && +v >= min && +v <= max)
            onChange(+v);
        }}
      />
      {draft !== "" && (+draft < min || +draft > max) && (
        <small role="status">
          Use {min}–{max}.
        </small>
      )}
    </label>
  );
}
export function TransitionFields({
  label,
  value,
  onChange,
  optional = false,
}: {
  label: string;
  value: Scene["transition"];
  onChange: (t: Scene["transition"]) => void;
  optional?: boolean;
}) {
  const t = value || { style: "cut" as const, seconds: 0.45 };
  return (
    <div className="timeline-transition">
      <label>
        {label}
        <select
          aria-label={label + " transition"}
          data-help="Choose how this view appears. Smooth crossfades, fade passes through black, slide moves across the screen, and cut changes instantly. Duration is edited directly below."
          value={value?.style || (optional ? "inherit" : "cut")}
          onChange={(e) =>
            onChange(
              e.target.value === "inherit"
                ? undefined
                : { ...t, style: e.target.value as typeof t.style },
            )
          }
        >
          {optional && (
            <option value="inherit">Use view / scene default</option>
          )}
          {["cut", "smooth", "fade", "slide", "snappy"].map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
      </label>
      {(!optional || value) && (
        <ExactNumber
          label={label + " duration (seconds)"}
          value={t.seconds}
          min={0.05}
          max={120}
          step={0.05}
          onChange={(seconds) => onChange({ ...t, seconds })}
          help="Type the transition length in seconds, from 0.05 to 120. This controls the visual change, not GIF speed or how long a dialogue waits. Cut remains instant."
        />
      )}
    </div>
  );
}
