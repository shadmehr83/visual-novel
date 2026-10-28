import type { Project, Scene } from "./model";
import { sceneLightLoop } from "./lighting";
type Activity = {
  id: string;
  name: string;
  enabled: boolean;
  paused?: boolean;
  toggle: (s: Scene) => void;
};
export function activities(scene: Scene, reduced = false): Activity[] {
  const e = scene.effects;
  const flag = (
    key: "rain" | "glass" | "vignette",
    name: string,
  ): Activity => ({
    id: key,
    name,
    enabled: !!e[key],
    toggle: (s) => {
      s.effects[key] = !s.effects[key];
    },
  });
  const amount = (
    key: "light" | "tintOpacity",
    name: string,
    fallback: number,
  ): Activity => ({
    id: key,
    name,
    enabled: e[key] > 0,
    toggle: (s) => {
      const old = s.effects[key];
      if (old > 0) {
        (s.effectBackup ??= {})[key] = old;
        s.effects[key] = 0;
      } else s.effects[key] = s.effectBackup?.[key] ?? fallback;
    },
  });
  const items: Activity[] = [
    flag(
      "rain",
      `Falling rain (${e.rainZones?.filter((r) => r.enabled).length || (e.mask.length >= 3 ? 1 : 0)} selected regions)`,
    ),
    flag("glass", "Rain on glass"),
    {
      id: "grading",
      name: "Brightness / contrast grading",
      enabled: e.brightness !== 1 || e.contrast !== 1,
      toggle: (s) => {
        const e = s.effects;
        if (e.brightness !== 1 || e.contrast !== 1) {
          s.effectBackup = {
            ...s.effectBackup,
            brightness: e.brightness,
            contrast: e.contrast,
          };
          e.brightness = 1;
          e.contrast = 1;
        } else {
          e.brightness = s.effectBackup?.brightness ?? 1.05;
          e.contrast = s.effectBackup?.contrast ?? 1;
        }
      },
    },
    amount("tintOpacity", "Ambient tint", 0.08),
    amount("light", "Legacy soft light", 0.22),
    flag("vignette", "Vignette"),
  ];
  if (e.light > 0 || sceneLightLoop(scene).enabled)
    items.push({
      id: "lightLoop",
      name: "Legacy light cycle",
      enabled: sceneLightLoop(scene).enabled && e.light > 0,
      paused: reduced,
      toggle: (s) => {
        s.effects.lightLoop = {
          ...sceneLightLoop(s),
          enabled: !sceneLightLoop(s).enabled,
        };
      },
    });
  for (const l of e.lights || [])
    items.push({
      id: l.id,
      name: l.name + (l.shape === "region" ? " (selected area)" : ""),
      enabled: l.enabled,
      paused: l.cycle.enabled && reduced,
      toggle: (s) => {
        const a = s.effects.lights?.find((a) => a.id === l.id);
        if (a) a.enabled = !a.enabled;
      },
    });
  for (const w of e.motionZones || [])
    items.push({
      id: w.id,
      name: w.name + " (motion)",
      enabled: w.enabled,
      paused: reduced,
      toggle: (s) => {
        const a = s.effects.motionZones?.find((a) => a.id === w.id);
        if (a) a.enabled = !a.enabled;
      },
    });
  for (const j of scene.joints || [])
    items.push({
      id: j.id,
      name: j.name + " (hinge / object)",
      enabled: j.enabled,
      paused: reduced,
      toggle: (s) => {
        const a = s.joints?.find((a) => a.id === j.id);
        if (a) a.enabled = !a.enabled;
      },
    });
  if (scene.phone)
    items.push({
      id: "phone",
      name: "Device UI",
      enabled: scene.phone.enabled,
      toggle: (s) => {
        s.phone!.enabled = !s.phone!.enabled;
      },
    });
  if (scene.items)
    items.push({
      id: "items",
      name: "Outfits & item picker",
      enabled: scene.items.enabled,
      toggle: (s) => {
        s.items!.enabled = !s.items!.enabled;
      },
    });
  if (scene.keyframes?.length)
    items.push({
      id: "keyframes",
      name: "Sprite keyframe animation",
      enabled: scene.keyframesEnabled !== false,
      toggle: (s) => {
        s.keyframesEnabled = s.keyframesEnabled === false;
      },
    });
  if (scene.camera) {
    items.push({
      id: "camera",
      name: "Camera approach",
      enabled: scene.camera.enabled,
      paused: reduced,
      toggle: (s) => {
        s.camera!.enabled = !s.camera!.enabled;
      },
    });
    if (scene.camera.bob || scene.camera.shake)
      items.push({
        id: "bob",
        name: "Walking bob / sway",
        enabled: scene.camera.enabled,
        paused: reduced,
        toggle: (s) => {
          s.camera!.enabled = !s.camera!.enabled;
        },
      });
  }
  return items;
}
export function effectSummary(scene: Scene, reduced = false) {
  return activities(scene, reduced)
    .filter((i) => i.enabled)
    .map(({ name, paused }) => ({ name, paused }));
}
export function EffectSummary({
  scene,
  project,
  update,
}: {
  scene: Scene;
  project: Project;
  update?: (f: (s: Scene) => void) => void;
}) {
  const reduced =
    project.settings.reducedEffects ||
    matchMedia("(prefers-reduced-motion: reduce)").matches;
  const items = activities(scene, reduced);
  return (
    <section className="property-section">
      <h3>{items.filter((i) => i.enabled).length} enabled visual effects</h3>
      <p className="small muted">
        Toggle a layer to compare it immediately. Disabled settings stay saved;
        enable the layer to restore them. Counts layers, not GPU cost.
      </p>
      {items.map((item) => (
        <label className="state-row" key={item.id}>
          <span>{item.name}</span>
          <input
            aria-label={"Enable " + item.name}
            type="checkbox"
            checked={item.enabled}
            disabled={!update}
            onChange={() => update?.(item.toggle)}
          />
          <b>
            {!item.enabled ? "Disabled" : item.paused ? "Paused" : "Enabled"}
          </b>
        </label>
      ))}
      <p className="small muted">
        Scene audio tracks: {scene.audio?.length || 0}. Sound plays after you
        enable it.
      </p>
    </section>
  );
}
