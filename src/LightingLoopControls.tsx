import { useEffect, useId, useState } from "react";
import { lightLoopSchema } from "./model";
import type { LightLoop } from "./lighting";

export function LightingLoopControls({ value, onChange }: {
  value: LightLoop;
  onChange: (value: LightLoop) => void;
}) {
  const id = useId();
  const savedSequence = value.values.join(", ");
  const [sequence, setSequence] = useState(savedSequence);
  const [error, setError] = useState("");
  useEffect(() => { setSequence(savedSequence); setError(""); }, [savedSequence]);
  function applySequence() {
    const parts = sequence.split(",").map(part => part.trim());
    const result = lightLoopSchema.safeParse({
      ...value,
      values: parts.map(part => part === "" ? NaN : Number(part)),
    });
    if (!result.success) {
      setError("Enter 2–32 numbers from 0 to 2, separated by commas.");
      return;
    }
    setError("");
    onChange(result.data);
  }
  return <div className="lighting-loop-controls">
    <label className="toggle-row">
      <span>Loop lighting</span>
      <input aria-label="Loop lighting" type="checkbox" checked={value.enabled}
        onChange={event => onChange({ ...value, enabled: event.target.checked })} />
    </label>
    <p className="small muted">Repeat a light pattern with smooth fades. 0 = light off, 1 = base intensity, 2 = twice as strong.</p>
    <label htmlFor={id}>Intensity sequence</label>
    <input id={id} value={sequence} aria-invalid={!!error}
      aria-describedby={error ? id + "-error" : undefined}
      onChange={event => setSequence(event.target.value)}
      onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); applySequence(); } }} />
    {error && <p id={id + "-error"} role="alert">{error}</p>}
    <button className="wide" onClick={applySequence}>Apply light sequence</button>
    <label className="slider">
      <span>Seconds per step <output>{value.stepSeconds}s</output></span>
      <input aria-label="Seconds per step" type="range" min="0.5" max="20" step="0.5"
        value={value.stepSeconds} onChange={event => onChange({ ...value, stepSeconds: +event.target.value })} />
    </label>
    <p className="small muted">The last value fades back to the first. One loop takes {value.values.length * value.stepSeconds} seconds. Reduced effects or reduced motion pauses lighting at its base intensity.</p>
  </div>;
}
