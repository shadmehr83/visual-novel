import { cloneData as structuredClone } from "./cloneData";
import { validateProject, type Project } from "./model";
import { assetFolder } from "./AssetPicker";
import { restoreSavedOutfits } from "./outfits";
export const LIBRARY_UPDATE = "2.7.0";
export function isPublishedDemo(local: Project, source: Project) {
  return local.id === source.id || (local.scenes.some(s => s.id === "bedroom" && s.nodes.some(n => n.id === "wake")) && local.scenes.some(s => s.id === "outfit" && s.nodes.some(n => n.id === "effort")));
}
/** Adds missing committed art and repairs known demo links; never replaces custom images or café data. */
export function importPublishedArtwork(target: Project, source: Project) {
  for (const a of source.assets)
    if (!target.assets.some(old => old.id === a.id)) target.assets.push(structuredClone(a));
  for (const a of target.assets) a.folder ??= assetFolder(a);
}
export function integrateLibraryUpdate(local: Project, source: Project, force = false): Project | null {
  if ((!force && local.contentUpdates?.includes(LIBRARY_UPDATE)) || !isPublishedDemo(local, source)) return null;
  const p = structuredClone(local);
  importPublishedArtwork(p, source);
  if (p.scenes.some(s => s.id === "outfit")) {
    restoreSavedOutfits(p, source);
    p.scenes.find(s => s.id === "outfit")!.items!.showSelected = true;
  }
  const room = p.scenes.find(s => s.id === "bedroom"), original = source.scenes.find(s => s.id === "bedroom");
  if (room && original) {
    for (const id of ["window-closeup", "wardrobe-closeup"]) {
      const template = original.subscenes?.find(v => v.id === id);
      if (!template) continue;
      const existing = room.subscenes?.find(v => v.id === id);
      if (!existing) (room.subscenes ??= []).push(structuredClone(template));
      else if (!existing.background || existing.background === room.background) existing.background = template.background;
    }
    for (const id of ["window", "clothes"]) {
      const n = room.nodes.find(n => n.id === id);
      if (n) { n.view ??= original.nodes.find(n => n.id === id)?.view; n.deviceScreen ??= "off"; }
    }
    const choice = room.nodes.find(n => n.id === "room")?.choices.find(c => c.target === "clothes");
    if (choice?.text === "Look at the clothes on the chair") choice.text = "Check the wardrobe";
    if (room.phone && room.nodes.some(n => n.id === "browse-feed") && room.nodes.some(n => n.id === "discover"))
      room.phone.returnControl ??= { enabled: true, start: "browse-feed", end: "discover", target: "room" };
    const desktop = room.nodes.find(n => n.id === "desktop-view");
    if (desktop) desktop.deviceReturn ??= true;
  }
  (p.contentUpdates ??= []).push(LIBRARY_UPDATE);
  return validateProject(p);
}
