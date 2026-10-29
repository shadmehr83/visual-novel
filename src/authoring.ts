import { cloneData as structuredClone } from "./cloneData";
import type { Project, Scene } from "./model";
export function removeDialogue(scene: Scene, id: string) {
  if (scene.nodes.length <= 1)
    throw Error("Keep at least one dialogue in each scene.");
  const at = scene.nodes.findIndex((n) => n.id === id);
  if (at < 0) throw Error("Dialogue not found");
  const removed = scene.nodes[at];
  const successor = removed.next !== id ? removed.next : undefined;
  const replacement = successor || scene.nodes[at + 1]?.id;
  scene.nodes = scene.nodes.filter((n) => n.id !== id);
  for (const n of scene.nodes) {
    if (n.next === id) n.next = replacement === n.id ? undefined : replacement;
    n.choices = n.choices.flatMap((c) =>
      c.target !== id
        ? [c]
        : replacement
          ? [{ ...c, target: replacement }]
          : [],
    );
    if (n.qte && (n.qte.success === id || n.qte.timeout === id)) {
      if (replacement) {
        if (n.qte.success === id) n.qte.success = replacement;
        if (n.qte.timeout === id) n.qte.timeout = replacement;
      } else delete n.qte;
    }
  }
  for (const joint of scene.joints || []) {
    joint.poses = joint.poses.filter((p) => p.node !== id);
    if (joint.range && (joint.range.start === id || joint.range.end === id))
      delete joint.range;
  }
  if (
    scene.phone?.schedule &&
    [scene.phone.schedule.start, scene.phone.schedule.end].includes(id)
  )
    delete scene.phone.schedule;
  if (scene.phone?.returnControl && [scene.phone.returnControl.start, scene.phone.returnControl.end, scene.phone.returnControl.target].includes(id))
    delete scene.phone.returnControl;
  if (scene.phone?.dialogueRange && [scene.phone.dialogueRange.start, scene.phone.dialogueRange.end].includes(id))
    delete scene.phone.dialogueRange;
  if (scene.items)
    scene.items.options = scene.items.options.filter((item) =>
      scene.nodes.some((n) => n.choices.some((c) => c.id === item.choice)),
    );
  return scene.nodes[Math.min(at, scene.nodes.length - 1)].id;
}
export function applyEffectPreset(
  scene: Scene,
  preset: NonNullable<Project["presets"]>[number],
) {
  const keys =
    preset.kind === "rain"
      ? [
          "rain",
          "density",
          "speed",
          "angle",
          "length",
          "opacity",
          "color",
          "glass",
          "mask",
          "invert",
          "rainZones",
        ]
      : preset.kind === "lighting"
        ? [
            "lightLoop",
            "lights",
            "brightness",
            "contrast",
            "tint",
            "tintOpacity",
            "light",
            "lightX",
            "lightY",
            "vignette",
          ]
        : preset.kind === "motion"
          ? ["motionZones"]
          : Object.keys(preset.effects);
  for (const key of keys) {
    const k = key as keyof Scene["effects"];
    if (preset.effects[k] === undefined) delete (scene.effects as any)[k];
    else (scene.effects as any)[k] = structuredClone(preset.effects[k]);
  }
  if (keys.includes("rainZones"))
    scene.effects.rainZones?.forEach((r) => (r.id = crypto.randomUUID()));
  if (keys.includes("lights"))
    scene.effects.lights?.forEach((l) => {
      l.id = crypto.randomUUID();
      if (l.region) l.region.id = l.id;
    });
  if (keys.includes("motionZones"))
    scene.effects.motionZones?.forEach((m) => {
      m.id = crypto.randomUUID();
      m.region.id = m.id;
    });
}
export const dialogueLabel = (p: Project, scene: Scene, id: string) => {
  const i = scene.nodes.findIndex((n) => n.id === id);
  const n = scene.nodes[i];
  const view = scene.subscenes?.find(v => v.id === n?.view);
  return `Scene ${p.scenes.indexOf(scene) + 1} · Dialogue ${i + 1}${view ? " · Sub-scene: " + view.title : ""} · ${n?.speaker || ""}: ${n?.text.slice(0, 35) || ""}`;
};

// Opening a complete project replaces optional metadata as well as required fields.
export function replaceProjectContents(target: Project, source: Project) {
  for (const key of Object.keys(target))
    delete (target as unknown as Record<string, unknown>)[key];
  Object.assign(target, source);
}
