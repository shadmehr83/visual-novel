import type { Scene } from "./model";
/** Give this dialogue its own view. Shared views and the main background stay intact. */
export function setDialogueArtwork(scene: Scene, nodeId: string, asset: string | null) {
  const node = scene.nodes.find(n => n.id === nodeId);
  if (!node) throw Error("Select a dialogue first");
  if (!asset) { delete node.view; return; }
  const existing = scene.subscenes?.find(v => v.id === node.view);
  if (existing && scene.nodes.filter(n => n.view === existing.id).length === 1) {
    if (existing.background !== asset) { existing.background = asset; delete existing.effects; }
    return;
  }
  if ((scene.subscenes?.length || 0) >= 40) throw Error("This scene has 40 temporary views. Reuse an existing view or remove an unused one first.");
  const id = crypto.randomUUID();
  (scene.subscenes ??= []).push({id, title:"Dialogue " + (scene.nodes.indexOf(node) + 1) + " artwork", background:asset, transition:{style:"fade",seconds:0.65}});
  node.view = id;
}
