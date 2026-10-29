import { validateProject, type Project } from "./model";
const UPDATE = "phone-vibration-1";
/** Add the requested cue once without overwriting any user-authored audio. */
export function integrateVibration(local: Project, source: Project): Project | null {
  if (local.contentUpdates?.includes(UPDATE)) return null;
  const node = local.scenes.find(s => s.id === "bedroom")?.nodes.find(n => n.id === "vibrate");
  const original = source.scenes.find(s => s.id === "bedroom")?.nodes.find(n => n.id === "vibrate");
  if (!node || !original?.sound || node.text !== original.text || node.sound) return null;
  const sound = source.audioAssets?.find(a => a.id === original.sound!.asset);
  if (!sound) return null;
  const existing = local.audioAssets?.find(a => a.id === sound.id);
  if (existing && existing.data !== sound.data) return null;
  const p = structuredClone(local);
  if (!existing) (p.audioAssets ??= []).push(structuredClone(sound));
  p.scenes.find(s => s.id === "bedroom")!.nodes.find(n => n.id === "vibrate")!.sound = structuredClone(original.sound);
  (p.contentUpdates ??= []).push(UPDATE);
  return validateProject(p);
}
