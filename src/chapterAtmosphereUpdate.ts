import { cloneData as structuredClone } from "./cloneData";
import { validateProject, type Project } from "./model";
const UPDATE = "2.14.0";
/** Repair older chapter grouping and add missing ambience without replacing user art. */
export function integrateChapterAtmosphere(
  local: Project,
  source: Project,
): Project | null {
  if (local.contentUpdates?.includes(UPDATE) || local.id !== source.id)
    return null;
  const sourceSecond = source.chapters?.find((c) => c.id === "chapter-two");
  const first = local.chapters?.find((c) => c.scenes.includes("bedroom"));
  if (
    !sourceSecond ||
    !first ||
    !local.scenes.some((s) => s.id === "departure")
  )
    return null;
  const p = structuredClone(local),
    c1 = p.chapters!.find((c) => c.id === first.id)!;
  for (const a of source.assets)
    if (!p.assets.some((x) => x.id === a.id)) p.assets.push(structuredClone(a));
  for (const a of source.audioAssets || [])
    if (!p.audioAssets?.some((x) => x.id === a.id))
      (p.audioAssets ??= []).push(structuredClone(a));
  for (const id of sourceSecond.scenes)
    if (!p.scenes.some((s) => s.id === id))
      p.scenes.push(structuredClone(source.scenes.find((s) => s.id === id)!));
  let c2 = p.chapters!.find((c) => c.id === sourceSecond.id);
  if (!c2) {
    c2 = structuredClone(sourceSecond);
    c2.scenes = [];
    p.chapters!.push(c2);
  }
  for (const id of sourceSecond.scenes) {
    const owner = p.chapters!.find((c) => c.scenes.includes(id));
    if (owner && owner !== c1 && owner !== c2) continue; // respect deliberate custom chapters
    c1.scenes = c1.scenes.filter((x) => x !== id);
    c1.starts = c1.starts.filter((x) => x.scene !== id);
    c1.exits = c1.exits.filter((x) => x.scene !== id);
    if (!c2.scenes.includes(id)) c2.scenes.push(id);
  }
  if (!c2.scenes.length) {
    p.chapters = p.chapters!.filter((c) => c !== c2);
    return null;
  }
  if (!c2.scenes.includes(c2.startScene)) c2.startScene = c2.scenes[0];
  c2.starts = c2.starts.filter((r) => c2!.scenes.includes(r.scene));
  c2.exits = c2.exits.filter((r) => c2!.scenes.includes(r.scene));
  if (!c1.next) c1.next = c2.id;
  if (!c1.scenes.includes(c1.startScene)) c1.startScene = c1.scenes[0];
  for (const scene of p.scenes) {
    const original = source.scenes.find((s) => s.id === scene.id);
    if (!original) continue;
    if (
      scene.id.startsWith("chapter2-") &&
      scene.background === "first-match-bedroom"
    )
      scene.background = original.background;
    if (
      ["journey", "departure"].includes(scene.id) &&
      scene.background === original.background
    ) {
      for (const zone of original.effects.motionZones || [])
        if (
          zone.mode === "puddle" &&
          !scene.effects.motionZones?.some((z) => z.id === zone.id)
        )
          (scene.effects.motionZones ??= []).push(structuredClone(zone));
      for (const lamp of original.effects.lights || [])
        if (!scene.effects.lights?.some((z) => z.id === lamp.id))
          (scene.effects.lights ??= []).push(structuredClone(lamp));
      for (const track of original.audio || [])
        if (!scene.audio?.some((t) => t.id === track.id))
          (scene.audio ??= []).push(structuredClone(track));
      if (scene.camera?.footstepAsset === "studio-footstep-wet-pavement")
        scene.camera.footstepAsset = "studio-walking-wet-detailed";
    }
    if (scene.id === "departure" || scene.id.startsWith("chapter2-"))
      for (const node of scene.nodes) {
        const from = original.nodes.find((n) => n.id === node.id);
        if (from && node.deviceScreen === undefined)
          node.deviceScreen = from.deviceScreen;
        if (
          scene.id === "departure" &&
          node.id === "again" &&
          node.text.startsWith("A few steps from the café, I pause")
        )
          node.text = from!.text;
        if (
          scene.id === "departure" &&
          node.id === "leaving-cafe" &&
          node.text.endsWith("I take out my phone again.")
        )
          node.text = from!.text;
      }
  }
  (p.contentUpdates ??= []).push(UPDATE);
  return validateProject(p);
}
