import { cloneData as clone } from "./cloneData";
import type { Project } from "./model";
/** Apply this requested continuity fix once to matching, unedited demo lines. */
export function integratePlayerContent(local: Project, source: Project): Project | null {
  if(local.id !== source.id || local.contentUpdates?.includes('2.20.0')) return null;
  const p = clone(local);
  for(const scene of p.scenes) {
    const from = source.scenes.find(s => s.id === scene.id);
    if(!from || scene.id === 'cafe') continue;
    if(scene.phone && from.phone) scene.phone.keyboard = false;
    if(!['messages','invitation'].includes(scene.id)) continue;
    for(const node of scene.nodes) {
      const original=from.nodes.find(n=>n.id===node.id);
      if(!original || original.text!==node.text || original.speaker!==node.speaker) continue;
      if(!original.choices.length || original.choices.map(c=>c.id).join('|')!==node.choices.map(c=>c.id).join('|')) continue;
      node.deviceDialogue = original.deviceDialogue;
      if(original.deviceVisible !== undefined) node.deviceVisible=original.deviceVisible;
      if(original.deviceScreen !== undefined) node.deviceScreen=original.deviceScreen;
    }
  }
  (p.contentUpdates ??= []).push('2.20.0');
  return p;
}
