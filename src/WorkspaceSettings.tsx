import { RangeInput } from "./RangeInput";
import type { Dispatch, SetStateAction } from "react";
import { defaults, type WorkspaceSettings } from "./workspace";
export function WorkspaceControls({
  value,
  onChange,
  appearance = false,
  placement,
  onPlacement,
}: {
  value: WorkspaceSettings;
  onChange: Dispatch<SetStateAction<WorkspaceSettings>>;
  appearance?: boolean;
  placement?: string;
  onPlacement?: (v:string)=>void;
}) {
  const set = <K extends keyof WorkspaceSettings>(
    key: K,
    v: WorkspaceSettings[K],
  ) => onChange((s) => ({ ...s, [key]: v }));
  return (
    <section className="property-section">
      <h3>{appearance ? "Interface appearance" : "Workspace sizing"}</h3>
      {appearance ? (
        <>
          <label>
            Interface font
            <select
              aria-label="Interface font"
              value={value.font}
              onChange={(e) =>
                set("font", e.target.value as WorkspaceSettings["font"])
              }
            >
              {["Arial", "Verdana", "Trebuchet MS", "Georgia", "monospace"].map(
                (f) => (
                  <option key={f}>{f}</option>
                ),
              )}
            </select>
          </label>
          <label>
            Interface font size {value.fontSize}px
            <RangeInput
              aria-label="Interface font size"
              type="range"
              min="10"
              max="20"
              value={value.fontSize}
              onChange={(e) => set("fontSize", +e.target.value)}
            />
          </label>
          <label>
            Interface theme
            <select
              value={value.theme}
              onChange={(e) =>
                set("theme", e.target.value as WorkspaceSettings["theme"])
              }
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="warm">Warm paper</option>
            </select>
          </label>
          <p className="small muted">
            These colours affect the editor, never the scene artwork. Each panel
            can have its own background; text contrast adjusts automatically.
          </p>
          {["library", "inspector", "dialogue", "workspace"].map((key) => (
            <label className="color-row" key={key}>
              {key} background
              <input
                aria-label={key + " background colour"}
                type="color"
                value={
                  value.panels[key] ||
                  (value.theme === "dark"
                    ? "#1c2022"
                    : value.theme === "warm"
                      ? "#f1e7d4"
                      : "#f4f7fa")
                }
                onChange={(e) =>
                  set("panels", { ...value.panels, [key]: e.target.value })
                }
              />
              <button
                onClick={() => {
                  const panels = { ...value.panels };
                  delete panels[key];
                  set("panels", panels);
                }}
              >
                Reset
              </button>
            </label>
          ))}
          <label className="toggle-row">
            Delayed hover help
            <input
              type="checkbox"
              checked={value.help}
              onChange={(e) => set("help", e.target.checked)}
            />
          </label>
        </>
      ) : (
        <>
          <label>Tools bar location<select aria-label="Tools bar location" value={value.toolsPlacement} onChange={e => set("toolsPlacement", e.target.value as "left" | "top")}><option value="left">Left edge</option><option value="top">Top bar</option></select></label>
          {onPlacement && <label>Effects and properties location<select aria-label="Effects and properties location" value={placement} onChange={e => onPlacement(e.target.value)}><option value="right">Right</option><option value="left">Left</option><option value="top">Top</option><option value="float">Floating window</option></select></label>}
          <label><input type="checkbox" checked={value.splitDocks} onChange={e => set("splitDocks", e.target.checked)} />Separate effects and properties into two docks</label>
          <label><input type="checkbox" checked={value.previewLocked} onChange={e => set("previewLocked", e.target.checked)} />Lock game preview window</label>
          <label><input type="checkbox" checked={value.previewCustom} onChange={e => set("previewCustom", e.target.checked)} />Use a custom preview window size</label>
          {value.previewCustom && (["previewWidth", "previewHeight"] as const).map(key => <label key={key}>{key === "previewWidth" ? "Preview width" : "Preview height"} (px)<RangeInput aria-label={key === "previewWidth" ? "Preview width" : "Preview height"} type="range" min={key === "previewWidth" ? 280 : 180} max={key === "previewWidth" ? 3200 : 1800} value={value[key]} onChange={e => set(key, +e.target.value)} /></label>)}
          <label className="toggle-row">
            Show story library
            <input
              type="checkbox"
              checked={!value.libraryCollapsed}
              onChange={(e) => set("libraryCollapsed", !e.target.checked)}
            />
          </label>
          {(["libraryWidth", "controlsWidth", "bottomHeight"] as const).map(
            (key) => (
              <label className="slider" key={key}>
                <span>
                  {key === "libraryWidth"
                    ? "Story library width"
                    : key === "controlsWidth"
                      ? "Controls width"
                      : "Dialogue panel height"}
                  <output>{value[key]} px</output>
                </span>
                <RangeInput
                  aria-label={
                    key === "libraryWidth"
                      ? "Story library width"
                      : key === "controlsWidth"
                        ? "Controls width"
                        : "Dialogue panel height"
                  }
                  type="range"
                  min={
                    key === "bottomHeight"
                      ? 100
                      : key === "libraryWidth"
                        ? 160
                        : 250
                  }
                  max={
                    key === "bottomHeight"
                      ? 600
                      : key === "libraryWidth"
                        ? 400
                        : 450
                  }
                  value={value[key]}
                  onChange={(e) => set(key, +e.target.value)}
                />
              </label>
            ),
          )}
          <label className="slider">
            Editor preview zoom {value.previewScale}×
            <RangeInput
              aria-label="Editor preview zoom"
              data-help="Enlarge the editing preview without changing your story camera. If the image exceeds the available view, scroll inside the scene view."
              type="range"
              min=".5"
              max="2"
              step=".05"
              value={value.previewScale}
              onChange={(e) => set("previewScale", +e.target.value)}
            />
          </label>
          <label>
            Dialogue layout
            <select
              value={value.dialogueMode}
              onChange={(e) =>
                set(
                  "dialogueMode",
                  e.target.value as WorkspaceSettings["dialogueMode"],
                )
              }
            >
              <option value="pinned">Pinned scrolling panel</option>
              <option value="page">
                Full page scrolling (previous layout)
              </option>
              <option value="hidden">Completely hidden</option>
            </select>
          </label>
          <p className="small muted">
            Drag the story panel edge or the divider above dialogue to resize
            directly. Page scrolling lets you scroll down through the editor;
            hidden removes the entire bottom panel.
          </p>
        </>
      )}
      <button className="wide" onClick={() => onChange(defaults())}>
        Reset sizes & colours
      </button>
    </section>
  );
}
