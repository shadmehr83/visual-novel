import { cloneData as structuredClone } from "./cloneData";
import { validateProject, type Project } from "./model";
import { restoreSavedOutfits } from "./outfits";
export const DEMO_UPDATE = "2.4.0";
/** One focused, recoverable content update. User art and the café are never replaced. */
export function integrateDemoUpdates(local: Project, source: Project): Project | null {
  if (local.contentUpdates?.includes(DEMO_UPDATE) ||
    !(local.id === source.id || (local.scenes.some(s => s.id === "bedroom" && s.nodes.some(n => n.id === "wake")) && local.scenes.some(s => s.id === "outfit" && s.nodes.some(n => n.id === "effort"))))) return null;
  const p = structuredClone(local);
  // Import dependencies before copying views: newer published views can reference
  // artwork that was not present when this older migration was first written.
  for (const a of source.assets)
    if (!p.assets.some(b => b.id === a.id)) p.assets.push(structuredClone(a));
  for (const a of source.audioAssets || [])
    if (!p.audioAssets?.some(b => b.id === a.id)) (p.audioAssets ??= []).push(structuredClone(a));
  for (const s of p.scenes) {
    const original = source.scenes.find(v => v.id === s.id);
    if (!original || s.id === "cafe") continue;
    if (s.phone) {
      s.phone.notificationSound ??= original.phone?.notificationSound;
      s.phone.appearance ??= { background: "#211e29", textColor: "#eee1e9", fontSize: 14, font: "Arial", wallpaper: null, icons: {}, profiles: {}, apps: [] };
      for (const [key, value] of Object.entries(original.phone?.appearance?.icons || {}))
        if (!s.phone.appearance.icons[key]) s.phone.appearance.icons[key] = value;
    }
    for (const track of original.audio || [])
      if (!s.audio?.some(t => t.id === track.id)) (s.audio ??= []).push(structuredClone(track));
    if (["journey", "departure"].includes(s.id) && original.camera) {
      s.camera ??= structuredClone(original.camera);
      s.camera.enabled = true;
      s.camera.footsteps = true;
      s.camera.footstepAsset ??= original.camera.footstepAsset;
      if (!s.camera.bob) s.camera.bob = original.camera.bob;
    }
    if (s.id === "bedroom") {
      if (s.phone) { s.phone.mode = "phone-system"; s.phone.defaultScreen = "feed"; }
      const browse = original.nodes.find(n => n.id === "browse-feed");
      if (browse && !s.nodes.some(n => n.id === browse.id)) {
        s.nodes.push(structuredClone(browse));
        for (const c of s.nodes.find(n => n.id === "room")?.choices || [])
          if (c.target === "notification") c.target = browse.id;
      }
      for (const id of ["notification", "first-decision"])
        if (s.nodes.some(n => n.id === id)) {
          const n = s.nodes.find(n => n.id === id)!;
          n.deviceScreen = "feed";
          n.phoneNotice ??= original.nodes.find(n => n.id === id)?.phoneNotice;
        }
      for (const v of original.subscenes || [])
        if (!s.subscenes?.some(x => x.id === v.id)) (s.subscenes ??= []).push(structuredClone(v));
      const monitor = s.nodes.find(n => n.id === "monitor");
      if (monitor) {
        monitor.view ??= "monitor-closeup";
        if (monitor.text === "Black screen. A faint reflection of the bed. Whatever I was doing last night can wait.") monitor.text = original.nodes.find(n => n.id === "monitor")!.text;
      }
    }
  }
  if (p.scenes.some(s => s.id === "outfit")) {
    restoreSavedOutfits(p, source);
    const s = p.scenes.find(s => s.id === "outfit")!, original = source.scenes.find(s => s.id === "outfit")!;
    s.items!.showSelected = true;
    s.items!.inspectSound ??= original.items?.inspectSound;
    s.items!.chooseSound ??= original.items?.chooseSound;
    for (const n of s.nodes.filter(n => ["comfortable", "put-together", "familiar"].includes(n.id)))
      if (!n.choices.length && n.next === "mirror") {
        n.choices = structuredClone(original.nodes.find(x => x.id === n.id)!.choices);
        delete n.next;
      }
  }
  (p.contentUpdates ??= []).push(DEMO_UPDATE);
  return validateProject(p);
}
