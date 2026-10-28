import {RangeInput} from "./RangeInput";
import type { ReactNode } from "react";
import type { Scene, Region, MotionZone } from "./model";
import type { RegionEditor } from "./Zones";
export function WindTools({
  scene,
  update,
  editor,
  setEditor,
  tools,
}: {
  scene: Scene;
  update: (f: (s: Scene) => void) => void;
  editor: RegionEditor | null;
  setEditor: (e: RegionEditor | null) => void;
  tools: (
    kind: "rain" | "light" | "motion",
    id: string,
    r: Region,
    change: (r: Region) => void,
  ) => ReactNode;
}) {
  const zones = scene.effects.motionZones || [];
  const patch = (i: number, fn: (w: MotionZone) => void) =>
    update((s) => fn(s.effects.motionZones![i]));
  return (
    <div data-effect-panel="Motion">
      <h3>Wind & cloth motion</h3>
      <p className="small muted">
        Select a region of imported art for subtle pixel sway or rippling. This
        is a 2D distortion effect; it does not extract an object or generate
        hidden background. Use small strengths around edges. Reduced
        effects/motion pauses it.
      </p>
      <button
        className="wide"
        disabled={zones.length >= 15}
        onClick={() => {
          const id = crypto.randomUUID();
          update((s) =>
            (s.effects.motionZones ??= []).push({
              id,
              name: "Gentle sway",
              enabled: true,
              strength: 4,
              seconds: 3,
              direction: 0,
              distortion: 2,
              region: { id, name: "Motion area", enabled: true, points: [] },
            }),
          );
          setEditor({ kind: "motion", id, mode: "polygon", tolerance: 45 });
        }}
      >
        Add motion zone
      </button>
      {zones.map((w, i) => (
        <div className="clue" data-zone-id={w.id} key={w.id}>
          <label>
            Motion name
            <input
              value={w.name}
              onChange={(e) => patch(i, (w) => (w.name = e.target.value))}
            />
          </label>
          <label className="consent">
            <input
              type="checkbox"
              checked={w.enabled}
              onChange={(e) => patch(i, (w) => (w.enabled = e.target.checked))}
            />
            Motion enabled
          </label>
          {(["strength", "seconds", "direction", "distortion"] as const).map(
            (k) => (
              <label key={k}>
                {k} {w[k]}
                <RangeInput
                  aria-label={w.name + " " + k}
                  type="range"
                  min={k === "seconds" ? 0.5 : k === "direction" ? -180 : 0}
                  max={
                    k === "strength"
                      ? 20
                      : k === "seconds"
                        ? 12
                        : k === "direction"
                          ? 180
                          : 15
                  }
                  step={k === "seconds" ? 0.1 : 1}
                  value={w[k]}
                  onChange={(e) => patch(i, (w) => (w[k] = +e.target.value))}
                />
              </label>
            ),
          )}
          {tools("motion", w.id, w.region, (r) =>
            patch(i, (w) => (w.region = r)),
          )}
          <button
            onClick={() => {
              update((s) => s.effects.motionZones!.splice(i, 1));
              if (editor?.id === w.id) setEditor(null);
            }}
          >
            Delete motion zone
          </button>
        </div>
      ))}
    </div>
  );
}
