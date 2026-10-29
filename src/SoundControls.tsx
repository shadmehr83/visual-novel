import { useState } from "react";
import { RangeInput } from "./RangeInput";
import type { Project, Scene } from "./model";
export function SoundControls({ project, scene, nodeId, edit, update }: { project: Project; scene: Scene; nodeId: string; edit: (fn: (p: Project) => void) => void; update?: (fn: (s: Scene) => void) => void }) {
  const [error, setError] = useState("");
  const node = scene.nodes.find(n => n.id === nodeId) || scene.nodes[0];
  const change = (fn: (s: Scene) => void) => update ? update(fn) : edit(p => fn(p.scenes.find(s => s.id === scene.id)!));
  const assets = <><option value="">None</option>{project.audioAssets?.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</>;
  const cue = (label: string, value: { asset: string; volume: number } | undefined, set: (s: Scene, v: typeof value) => void) => <div className="sound-cue" key={label}>
    <label>{label}<select aria-label={label} value={value?.asset || ""} onChange={e => change(s => set(s, e.target.value ? { asset: e.target.value, volume: value?.volume ?? 0.5 } : undefined))}>{assets}</select></label>
    {value && <label>{label} volume<RangeInput aria-label={label + " volume"} type="range" min="0" max="1" step="0.01" value={value.volume} onChange={e => change(s => set(s, { ...value, volume: +e.target.value }))} /></label>}
  </div>;
  return <section className="property-section" data-effect-panel="Sound">
    <h3>Sound library & scene audio</h3>
    <p>Use a looping ambience, a sound on this dialogue/reply, phone alerts, or item inspection. Stack multiple ambience tracks: upload each sound, then choose each one in Add background ambience. They play together with separate volumes. Sounds travel with project exports. Players control the master volume.</p>
    <label>Upload sound<input aria-label="Upload sound" type="file" accept="audio/*" onChange={async e => {
      const f = e.target.files?.[0]; e.target.value = ""; if (!f) return;
      try {
        if (!/^audio\/(mpeg|wav|ogg|mp4|x-wav|webm)$/.test(f.type) || f.size > 20 * 1024 * 1024) throw Error("Choose MP3, WAV, OGG, M4A or WebM up to 20 MB.");
        const ctx = new AudioContext(); try { await ctx.decodeAudioData(await f.arrayBuffer()); } finally { await ctx.close(); }
        const data = await new Promise<string>((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve(String(r.result)); r.onerror = reject; r.readAsDataURL(f); });
        edit(p => { (p.audioAssets ??= []).push({ id: crypto.randomUUID(), name: f.name, data }); }); setError("");
      } catch (e) { setError(String(e)); }
    }} /></label>
    {error && <p role="alert">{error}</p>}
    <label>Add background ambience<select aria-label="Add background ambience" value="" onChange={e => { const id = e.target.value; if (id) change(s => { if (!s.audio?.some(t => t.id === id)) (s.audio ??= []).push({ id, volume: 0.3, loop: true }); }); }}>{assets}</select></label>
    {scene.audio?.map((track, i) => <div className="sound-cue" key={track.id}>
      <b>{project.audioAssets?.find(a => a.id === track.id)?.name}</b>
      <label>Ambience volume<RangeInput aria-label={"Ambience volume " + i} type="range" min="0" max="1" step="0.01" value={track.volume} onChange={e => change(s => { s.audio![i].volume = +e.target.value; })} /></label>
      <label><input type="checkbox" checked={track.loop} onChange={e => change(s => { s.audio![i].loop = e.target.checked; })} />Loop ambience</label>
      <button onClick={() => change(s => { s.audio!.splice(i, 1); })}>Remove ambience</button>
    </div>)}
    {cue("This dialogue sound", node.sound, (s, v) => { s.nodes.find(n => n.id === node.id)!.sound = v; })}
    {node.choices.map((c, i) => cue("Reply sound " + (i + 1) + " · " + c.text.slice(0, 40), c.sound, (s, v) => { s.nodes.find(n => n.id === node.id)!.choices.find(x => x.id === c.id)!.sound = v; }))}
    {scene.phone && cue("Phone notification sound", scene.phone.notificationSound, (s, v) => { s.phone!.notificationSound = v; })}
    {scene.items && <>
      {cue("Inspect item sound", scene.items.inspectSound, (s, v) => { s.items!.inspectSound = v; })}
      {cue("Choose item sound", scene.items.chooseSound, (s, v) => { s.items!.chooseSound = v; })}
    </>}
    <details><summary>Preview reusable sounds</summary>{project.audioAssets?.map(a => <label key={a.id}>{a.name}<audio controls src={a.data} preload="none" /></label>)}</details>
    <p>Walking sounds and timing: Camera → Footstep audio. Enable Footsteps during camera movement.</p>
  </section>;
}
