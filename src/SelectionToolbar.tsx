import {RangeInput} from "./RangeInput";
import type { RegionEditor } from "./Zones";
import type { Region } from "./model";
export function SelectionToolbar({
  editor,
  region,
  setEditor,
  change,
  targets,
}: {
  editor: RegionEditor;
  region: Region;
  setEditor: (e: RegionEditor | null) => void;
  change: (r: Region) => void;
  targets: { kind: RegionEditor["kind"]; id: string; name: string }[];
}) {
  return (
    <div
      className="selection-toolbar"
      role="group"
      aria-label="Selection tools"
    >
      <label>
        Effect region
        <select
          aria-label="Selection target"
          value={targets.findIndex(
            (t) => t.kind === editor.kind && t.id === editor.id,
          )}
          onChange={(e) => {
            const target = targets[+e.target.value];
            setEditor({ ...editor, kind: target.kind, id: target.id });
          }}
        >
          {targets.map((t, i) => (
            <option key={t.kind + t.id} value={i}>
              {t.kind}: {t.name}
            </option>
          ))}
        </select>
      </label>
      <div>
        {(
          [
            ["polygon", "Polygon"],
            ["wand", "Colour wand"],
            ["edge", "Snap to edges"],
            ["brush", "Paint brush"],
            ["erase", "Eraser"],
            ...(editor.kind === "joint"
              ? [["pivot", "Place pivot"] as const]
              : []),
          ] as const
        ).map(([mode, label]) => (
          <button
            key={mode}
            className={editor.mode === mode ? "primary" : ""}
            onClick={() => setEditor({ ...editor, mode })}
          >
            {label}
          </button>
        ))}
      </div>
      {editor.mode === "brush" || editor.mode === "erase" ? (
        <label>
          Brush radius {editor.radius || 25} px
          <RangeInput
            aria-label="Brush radius"
            type="range"
            min="4"
            max="120"
            value={editor.radius || 25}
            onChange={(e) => setEditor({ ...editor, radius: +e.target.value })}
          />
        </label>
      ) : (
        <label>
          Automatic selection reach
          <select
            aria-label="Selection reach"
            value={editor.tolerance}
            onChange={(e) =>
              setEditor({ ...editor, tolerance: +e.target.value })
            }
          >
            <option value="25">
              Strict — stays close to the clicked colour / edge
            </option>
            <option value="45">Balanced</option>
            <option value="90">Broad — crosses more colour differences</option>
          </select>
        </label>
      )}
      <button
        disabled={!region.path && region.points.length < 3}
        onClick={() =>
          change({
            ...region,
            boundary: {
              points: structuredClone(region.points),
              path: region.path,
            },
          })
        }
      >
        Lock selection as outer boundary
      </button>
      {region.boundary && (
        <>
          <span>Brush is confined to the locked boundary.</span>
          <button onClick={() => change({ ...region, points: [], path: "" })}>
            Start empty inside boundary
          </button>
          <button
            onClick={() => {
              const r = { ...region };
              delete r.boundary;
              change(r);
            }}
          >
            Unlock outer boundary
          </button>
        </>
      )}
      <button onClick={() => change({ ...region, points: [], path: "" })}>
        Clear affected area
      </button>
      <small>
        Colour and edge tools are approximate local selection, not AI object
        recognition. Paint/erase to correct them. Each stroke supports Undo.
      </small>
      <button className="primary" onClick={() => setEditor(null)}>
        Finish zone editing
      </button>
    </div>
  );
}
