import type { Project, Scene } from "./model";
import { sceneLightLoop } from "./lighting";
export function effectSummary(scene: Scene, reduced = false) {
  const e = scene.effects;
  const items: { name: string; paused?: boolean }[] = [];
  if (e.rain)
    items.push({
      name: `Falling rain (${e.rainZones?.filter((r) => r.enabled).length || (e.mask.length >= 3 ? 1 : 0)} selected regions)`,
    });
  if (e.glass) items.push({ name: "Rain on glass" });
  if (e.brightness !== 1 || e.contrast !== 1)
    items.push({ name: "Brightness / contrast grading" });
  if (e.tintOpacity > 0) items.push({ name: "Ambient tint" });
  if (e.light > 0) {
    items.push({ name: "Legacy soft light" });
    if (sceneLightLoop(scene).enabled)
      items.push({ name: "Legacy light cycle", paused: reduced });
  }
  if (e.vignette) items.push({ name: "Vignette" });
  for (const light of e.lights || [])
    if (light.enabled)
      items.push({
        name: light.name + (light.shape === "region" ? " (selected area)" : ""),
        paused: light.cycle.enabled && reduced,
      });
  for (const wind of e.motionZones || [])
    if (wind.enabled)
      items.push({ name: wind.name + " (motion)", paused: reduced });
  if (scene.keyframes?.length)
    items.push({ name: "Sprite keyframe animation" });
  if (scene.camera?.enabled) {
    items.push({ name: "Camera approach", paused: reduced });
    if (scene.camera.bob || scene.camera.shake)
      items.push({ name: "Walking bob / sway", paused: reduced });
  }
  return items;
}
export function EffectSummary({
  scene,
  project,
}: {
  scene: Scene;
  project: Project;
}) {
  const reduced =
    project.settings.reducedEffects ||
    matchMedia("(prefers-reduced-motion: reduce)").matches;
  const items = effectSummary(scene, reduced);
  return (
    <section className="property-section">
      <h3>{items.length} enabled visual effects</h3>
      <p className="small muted">
        Counts enabled layers/zones, not particles or measured GPU cost. Paused
        effects retain their settings. Rain regions share one weather pass.
        Sound plays only after you enable it.
      </p>
      {items.map((item, i) => (
        <div className="state-row" key={i}>
          <span>{item.name}</span>
          <b>{item.paused ? "Paused" : "Enabled"}</b>
        </div>
      ))}
      <p className="small muted">
        Scene audio tracks: {scene.audio?.length || 0}. Footsteps:{" "}
        {scene.camera?.enabled && scene.camera.footsteps
          ? "configured; enable sound to hear"
          : "off"}
        .
      </p>
    </section>
  );
}
