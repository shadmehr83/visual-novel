import type { Project, Scene } from "./model";
import { readImage } from "./storage";
import { useState } from "react";
export function sceneView(scene: Scene, nodeId?: string): Scene {
  const view = scene.subscenes?.find(v => v.id === scene.nodes.find(n => n.id === nodeId)?.view);
  return view ? { ...scene, background: view.background, x: 0, y: 0, scale: 1, fit: "cover", camera: undefined, effects: view.effects || { ...scene.effects, rain: false, glass: false, rainZones: [], lights: [], motionZones: [], light: 0, lightLoop: undefined }, transition: view.transition } : scene;
}
export function SceneViewControls({ project, scene, nodeId, edit }: { project: Project; scene: Scene; nodeId: string; edit: (fn: (p: Project) => void) => void }) {
  const [error, setError] = useState("");
  const node = scene.nodes.find(n => n.id === nodeId) || scene.nodes[0];
  const change = (fn: (s: Scene) => void) => edit(p => fn(p.scenes.find(s => s.id === scene.id)!));
  return <section className="property-section" data-effect-panel="Sub-scenes">
    <h3>Sub-scenes · temporary views</h3>
    <p>Show a different angle for this dialogue without adding a main scene. The next dialogue uses its own view; Original scene fades back to the main image. Effects stay with the main view so masks do not land on the wrong image.</p>
    <label>This dialogue view<select aria-label="This dialogue view" value={node.view || ""} onChange={e => change(s => { s.nodes.find(n => n.id === node.id)!.view = e.target.value || undefined; })}><option value="">Original scene</option>{scene.subscenes?.map(v => <option key={v.id} value={v.id}>{v.title}</option>)}</select></label>
    <button onClick={() => change(s => { const id = crypto.randomUUID(); (s.subscenes ??= []).push({ id, title: "New close-up", background: s.background, transition: { style: "fade", seconds: 0.65 } }); s.nodes.find(n => n.id === node.id)!.view = id; })}>Add sub-scene for this dialogue</button>
    {scene.subscenes?.map(view => <details key={view.id} open={view.id === node.view}><summary>{view.title}</summary>
      <label>Sub-scene name<input aria-label="Sub-scene name" value={view.title} onChange={e => change(s => { s.subscenes!.find(v => v.id === view.id)!.title = e.target.value || "Close-up"; })} /></label>
      <label>Sub-scene background<select aria-label="Sub-scene background" value={view.background || ""} onChange={e => change(s => { s.subscenes!.find(v => v.id === view.id)!.background = e.target.value || null; })}><option value="">Illustrated placeholder</option>{project.assets.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select></label>
      <label>Upload sub-scene image<input type="file" accept="image/png,image/jpeg,image/webp" onChange={async e => { const f = e.target.files?.[0]; e.target.value = ""; if (!f) return; try { const a = await readImage(f); edit(p => { p.assets.push(a); p.scenes.find(s => s.id === scene.id)!.subscenes!.find(v => v.id === view.id)!.background = a.id; }); setError(""); } catch (e) { setError(String(e)); } }} /></label>
      <label>View transition<select aria-label="Sub-scene transition" value={view.transition.style} onChange={e => change(s => { s.subscenes!.find(v => v.id === view.id)!.transition.style = e.target.value as typeof view.transition.style; })}>{["fade", "smooth", "slide", "cut"].map(t => <option key={t}>{t}</option>)}</select></label>
      <button onClick={() => change(s => { s.subscenes = s.subscenes!.filter(v => v.id !== view.id); for (const n of s.nodes) if (n.view === view.id) delete n.view; })}>Remove sub-scene</button>
    </details>)}
    {error && <p role="alert">{error}</p>}
  </section>;
}
