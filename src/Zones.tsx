import { useState } from "react";
import type { Scene, Region, ZoneLight } from "./model";
import { LightingLoopControls } from "./LightingLoopControls";
export type RegionEditor = {
  kind: "rain" | "light";
  id: string;
  mode: "polygon" | "wand";
  tolerance: number;
};
export function Zones({
  scene,
  update,
  editor,
  setEditor,
}: {
  scene: Scene;
  update: (fn: (s: Scene) => void) => void;
  editor: RegionEditor | null;
  setEditor: (e: RegionEditor | null) => void;
}) {
  const [tolerance, setTolerance] = useState(45);
  const e = scene.effects;
  const patchRain = (i: number, fn: (r: Region) => void) =>
    update((s) => fn(s.effects.rainZones![i]));
  const patchLight = (i: number, fn: (l: ZoneLight) => void) =>
    update((s) => fn(s.effects.lights![i]));
  function tools(
    kind: "rain" | "light",
    id: string,
    region: Region,
    change: (r: Region) => void,
  ) {
    return (
      <div>
        <button
          onClick={() => setEditor({ kind, id, mode: "polygon", tolerance })}
        >
          Draw region
        </button>
        <button
          onClick={() => setEditor({ kind, id, mode: "wand", tolerance })}
        >
          Magic wand
        </button>
        <button
          onClick={() =>
            change({
              ...region,
              path: undefined,
              points: region.points.slice(0, -1),
            })
          }
        >
          Remove point
        </button>
        <button
          onClick={() => change({ ...region, path: undefined, points: [] })}
        >
          Clear region
        </button>
        <small>
          {region.path
            ? "Auto-selected region"
            : `${region.points.length} points`}
        </small>
      </div>
    );
  }
  return (
    <section className="property-section zone-tools">
      <h3>Effect zones</h3>
      <p className="small muted">
        Draw multiple regions or use Magic wand to select connected colours in
        imported artwork. The wand is local automatic selection, not semantic
        AI; adjust tolerance for more or less coverage.
      </p>
      <label>
        Wand tolerance {tolerance}
        <input
          aria-label="Wand tolerance"
          type="range"
          min="5"
          max="180"
          value={tolerance}
          onChange={(ev) => {
            setTolerance(+ev.target.value);
            if (editor) setEditor({ ...editor, tolerance: +ev.target.value });
          }}
        />
      </label>
      {editor && (
        <div className="clue">
          {editor.mode === "wand"
            ? "Click the image to replace this zone with a connected-colour selection."
            : "Click to add polygon vertices."}
          <button className="wide primary" onClick={() => setEditor(null)}>
            Finish zone editing
          </button>
        </div>
      )}
      <button
        className="wide"
        disabled={(e.rainZones?.length || 0) >= 30}
        onClick={() => {
          const id = crypto.randomUUID();
          update((s) => {
            s.effects.rainZones ??=
              s.effects.mask.length >= 3
                ? [
                    {
                      id: "original-window",
                      name: "Original window",
                      enabled: true,
                      points: s.effects.mask,
                    },
                  ]
                : [];
            s.effects.mask = [];
            s.effects.rainZones.push({
              id,
              name: "Rain zone " + (s.effects.rainZones.length + 1),
              enabled: true,
              points: [],
            });
          });
          setEditor({ kind: "rain", id, mode: "polygon", tolerance });
        }}
      >
        Add rain zone
      </button>
      {e.rainZones?.map((r, i) => (
        <div className="clue" key={r.id}>
          <label>
            Rain zone name
            <input
              value={r.name}
              onChange={(ev) => patchRain(i, (r) => (r.name = ev.target.value))}
            />
          </label>
          <label className="consent">
            <input
              type="checkbox"
              checked={r.enabled}
              onChange={(ev) =>
                patchRain(i, (r) => (r.enabled = ev.target.checked))
              }
            />
            Enabled
          </label>
          {tools("rain", r.id, r, (v) =>
            patchRain(i, (r) => Object.assign(r, v)),
          )}
          <button
            onClick={() => {
              update((s) => s.effects.rainZones!.splice(i, 1));
              if (editor?.id === r.id) setEditor(null);
            }}
          >
            Delete rain zone
          </button>
        </div>
      ))}
      <div className="field-row">
        {(["global", "local"] as const).map((kind) => (
          <button
            key={kind}
            disabled={(e.lights?.length || 0) >= 20}
            onClick={() =>
              update((s) =>
                (s.effects.lights ??= []).push({
                  id: crypto.randomUUID(),
                  name:
                    kind === "global"
                      ? "Global illumination"
                      : "Local candle light",
                  enabled: true,
                  kind,
                  intensity: kind === "global" ? 1 : 0.7,
                  color: "#ffd5a1",
                  x: 500,
                  y: 280,
                  radius: 180,
                  spread: 0.4,
                  cycle: {
                    enabled: false,
                    values: [0.3, 1, 0.6, 1.5],
                    stepSeconds: 1,
                  },
                }),
              )
            }
          >
            Add {kind} light
          </button>
        ))}
      </div>
      {e.lights?.map((l, i) => (
        <div className="clue" key={l.id}>
          <label>
            Light name
            <input
              value={l.name}
              onChange={(ev) =>
                patchLight(i, (l) => (l.name = ev.target.value))
              }
            />
          </label>
          <label className="consent">
            <input
              type="checkbox"
              checked={l.enabled}
              onChange={(ev) =>
                patchLight(i, (l) => (l.enabled = ev.target.checked))
              }
            />
            Enabled · {l.kind}
          </label>
          {(
            [
              "intensity",
              ...(l.kind === "local" ? ["x", "y", "radius", "spread"] : []),
            ] as ("intensity" | "x" | "y" | "radius" | "spread")[]
          ).map((k) => (
            <label key={k}>
              {k} {l[k]}
              <input
                aria-label={l.name + " " + k}
                type="range"
                min={k === "radius" ? 10 : 0}
                max={
                  k === "x"
                    ? 1000
                    : k === "y"
                      ? 563
                      : k === "radius"
                        ? 800
                        : k === "intensity"
                          ? 3
                          : 1
                }
                step={k === "intensity" || k === "spread" ? 0.05 : 1}
                value={l[k]}
                onChange={(ev) =>
                  patchLight(i, (l) => (l[k] = +ev.target.value))
                }
              />
            </label>
          ))}
          {l.kind === "local" && (
            <>
              <label>
                Light colour
                <input
                  type="color"
                  value={l.color}
                  onChange={(ev) =>
                    patchLight(i, (l) => (l.color = ev.target.value))
                  }
                />
              </label>
              <button
                onClick={() =>
                  patchLight(i, (l) => {
                    l.region = {
                      id: l.id,
                      name: l.name + " affected area",
                      enabled: true,
                      points: [],
                    };
                  })
                }
              >
                Add dedicated affected area
              </button>
              {l.region && (
                <>
                  {tools("light", l.id, l.region, (r) =>
                    patchLight(i, (l) => (l.region = r)),
                  )}
                  <button onClick={() => patchLight(i, (l) => delete l.region)}>
                    Use radial area only
                  </button>
                </>
              )}
            </>
          )}
          <p className="small muted">
            Local spread changes the light radius with its cycle. A dedicated
            area clips the light to that region.
          </p>
          <LightingLoopControls
            value={l.cycle}
            onChange={(v) => patchLight(i, (l) => (l.cycle = v))}
          />
          <button
            onClick={() => {
              update((s) => s.effects.lights!.splice(i, 1));
              if (editor?.id === l.id) setEditor(null);
            }}
          >
            Delete light
          </button>
        </div>
      ))}
    </section>
  );
}
