import { cloneData as structuredClone } from "./cloneData";
import { RangeInput } from "./RangeInput";
import { useState } from "react";
import type { Project, Scene } from "./model";
import { applyEffectPreset } from "./authoring";
export function EffectPresets({
  project,
  scene,
  edit,
}: {
  project: Project;
  scene: Scene;
  edit: (f: (p: Project) => void) => void;
}) {
  const [name, setName] = useState(""),
    [kind, setKind] = useState<"rain" | "lighting" | "motion" | "all">(
      "lighting",
    );
  return (
    <section className="property-section" data-effect-panel="Effect Presets">
      <h3>Reusable effect presets</h3>
      <label>
        Preset name
        <input
          aria-label="Preset name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      <select
        aria-label="Preset category"
        value={kind}
        onChange={(e) => setKind(e.target.value as typeof kind)}
      >
        {["rain", "lighting", "motion", "all"].map((k) => (
          <option key={k}>{k}</option>
        ))}
      </select>
      <button
        disabled={!name.trim() || (project.presets?.length || 0) >= 100}
        onClick={() => {
          edit((p) => {
            (p.presets ??= []).push({
              id: crypto.randomUUID(),
              name: name.trim(),
              kind,
              effects: structuredClone(scene.effects),
            });
          });
          setName("");
        }}
      >
        Save effect preset
      </button>
      <p className="small muted">
        Presets travel with project exports. Applying replaces this category,
        including its regions: review placement on different artwork. Undo
        restores the previous setup.
      </p>
      {project.presets?.map((preset) => (
        <div className="preset-row" key={preset.id}>
          <span>
            {preset.name} · {preset.kind}
          </span>
          <button
            onClick={() =>
              edit((p) =>
                applyEffectPreset(
                  p.scenes.find((s) => s.id === scene.id)!,
                  preset,
                ),
              )
            }
          >
            Apply {preset.name}
          </button>
          <button
            onClick={() =>
              edit((p) => {
                p.presets = p.presets?.filter((x) => x.id !== preset.id);
              })
            }
          >
            Delete preset {preset.name}
          </button>
        </div>
      ))}
    </section>
  );
}
export function StoryAppearance({
  project,
  edit,
}: {
  project: Project;
  edit: (f: (p: Project) => void) => void;
}) {
  return (
    <section className="property-section">
      <h3>Story typography & speaker colours</h3>
      <label>
        Dialogue font
        <select
          aria-label="Dialogue font"
          value={project.settings.dialogueFont || "Georgia"}
          onChange={(e) =>
            edit((p) => {
              p.settings.dialogueFont = e.target
                .value as typeof p.settings.dialogueFont;
            })
          }
        >
          {["Georgia", "Arial", "Verdana", "Trebuchet MS", "monospace"].map(
            (f) => (
              <option key={f}>{f}</option>
            ),
          )}
        </select>
      </label>
      <label>
        Dialogue size {project.settings.dialogueSize || 17}px
        <RangeInput
          aria-label="Dialogue font size"
          type="range"
          min="10"
          max="30"
          value={project.settings.dialogueSize || 17}
          onChange={(e) =>
            edit((p) => {
              p.settings.dialogueSize = +e.target.value;
            })
          }
        />
      </label>
      {project.characters.map((c, i) => (
        <label key={c.id}>
          {c.name} name colour
          <input
            aria-label={c.name + " name colour"}
            type="color"
            value={c.color || "#dfb897"}
            onChange={(e) =>
              edit((p) => {
                p.characters[i].color = e.target.value;
              })
            }
          />
        </label>
      ))}
      <p className="small muted">
        Story typography is included in exports. Interface typography stays in
        this browser.
      </p>
    </section>
  );
}
