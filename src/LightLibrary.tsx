import { useState } from "react";
import type { Project, Scene, ZoneLight } from "./model";
export function makePlacedLight(
  template: ZoneLight | undefined,
  x: number,
  y: number,
): ZoneLight {
  const light = template
    ? structuredClone(template)
    : {
        id: "",
        name: "Local light",
        enabled: true,
        kind: "local" as const,
        intensity: 0.3,
        color: "#ffd5a1",
        x: 0,
        y: 0,
        radius: 90,
        spread: 0.02,
        cycle: { enabled: true, values: [0.5, 1, 0.5], stepSeconds: 1 },
      };
  return {
    ...light,
    id: crypto.randomUUID(),
    kind: "local",
    enabled: true,
    x,
    y,
    region: undefined,
    shape: "radial",
  };
}
export function LightLibrary({
  project,
  scene,
  edit,
  placing,
  onPlace,
}: {
  project: Project;
  scene: Scene;
  edit: (f: (p: Project) => void) => void;
  placing: string | null;
  onPlace: (id: string | null) => void;
}) {
  const [name, setName] = useState(""),
    [source, setSource] = useState(""),
    [preset, setPreset] = useState("");
  const lights = scene.effects.lights?.filter((l) => l.kind === "local") || [];
  return (
    <section className="property-section" data-effect-panel="Light Library">
      <h3>Light Library · individual favourites</h3>
      <p>
        Save one lamp’s colour, radius and intensity cycle. Select a favourite,
        then click the scene to stamp lights at those positions. The original
        saved scene is unchanged.
      </p>
      <label>
        Light to save
        <select
          aria-label="Light to save"
          value={
            lights.some((l) => l.id === source) ? source : lights[0]?.id || ""
          }
          onChange={(e) => setSource(e.target.value)}
        >
          {lights.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Favourite name
        <input
          aria-label="Light favourite name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      <button
        disabled={
          !name.trim() ||
          !lights.length ||
          (project.lightPresets?.length || 0) >= 100
        }
        onClick={() => {
          const light = lights.find(
            (l) =>
              l.id ===
              (lights.some((l) => l.id === source) ? source : lights[0]?.id),
          );
          if (light) {
            edit((p) => {
              (p.lightPresets ??= []).push({
                id: crypto.randomUUID(),
                name: name.trim(),
                light: structuredClone(light),
              });
            });
            setName("");
          }
        }}
      >
        Save individual light favourite
      </button>
      <label>
        Placement preset
        <select
          aria-label="Placement preset"
          value={preset}
          onChange={(e) => {
            setPreset(e.target.value);
            if (placing !== null) onPlace(e.target.value);
          }}
        >
          <option value="">Default · gentle 0.5, 1, 0.5 / 1 second</option>
          {project.lightPresets?.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </label>
      <button
        disabled={placing === null && (scene.effects.lights?.length || 0) >= 20}
        onClick={() => onPlace(placing === null ? preset : null)}
      >
        {placing === null ? "Place lights on scene" : "Stop placing lights"}
      </button>
      {placing !== null && (
        <p role="status">
          Click the artwork to add a local light. Repeat for more lights. Stop
          placing when finished. Each placement supports Undo.
        </p>
      )}
      {project.lightPresets?.map((p) => (
        <div key={p.id} className="preset-row">
          <span>
            {p.name} · {p.light.cycle.values.join(" → ")} /{" "}
            {p.light.cycle.stepSeconds}s
          </span>
          <button
            onClick={() =>
              edit((doc) => {
                doc.lightPresets = doc.lightPresets?.filter(
                  (x) => x.id !== p.id,
                );
              })
            }
          >
            Delete favourite {p.name}
          </button>
        </div>
      ))}
      <p className="small muted">
        Favourites copy the light settings, not a selected-area mask. For
        complete rain or lighting setups use Effect Presets.
      </p>
    </section>
  );
}
