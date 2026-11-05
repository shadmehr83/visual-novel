import type { Scene } from "./model";
// Sub-scenes of a scene. Edit effects picks a sub-scene for the effects controls without opening
// anything (by Claude), so it also works while the preview is on another screen; Preview also
// fills this window with it. Both work for sub-scenes that no dialogue uses yet.
export function SubsceneList({scene,onOpen,update,editing,onEffects}:{scene:Scene;onOpen:(node:string)=>void;update?:(fn:(s:Scene)=>void)=>void;
 editing?:string|null;onEffects?:(view:string|null,preview:boolean)=>void}) {
 return <details className="subscene-list"><summary>{scene.subscenes?.length || 0} sub-scenes · {scene.title}</summary>
 {scene.subscenes?.map((v,i)=><div key={v.id} data-editing={editing===v.id||undefined}><strong>{i+1}. {v.title}</strong><small> · {v.effects?.lights?.filter(l=>l.enabled).length || 0} lights · {v.effects?.rain ? "Rain on" : "Rain off"} · {v.audio?.length || 0} sounds</small>
  {update && <span>{(["lights","rain","sound"] as const).map(kind=><label key={kind}><input type="checkbox" aria-label={v.title+" "+kind+" enabled"} checked={kind==="lights" ? !!v.effects?.lights?.some(l=>l.enabled) : kind==="rain" ? !!v.effects?.rain : !!v.audio?.some(a=>a.volume>0)} onChange={e=>update(s=>{const target=s.subscenes!.find(x=>x.id===v.id)!;if(kind==="lights")target.effects?.lights?.forEach(l=>l.enabled=e.target.checked);else if(kind==="rain"&&target.effects)target.effects.rain=e.target.checked;else if(kind==="sound")target.audio?.forEach(a=>a.volume=e.target.checked?.3:0);})}/>{kind}</label>)}</span>}
  {onEffects && <span className="subscene-actions">
   <button aria-pressed={editing===v.id} aria-label={"Edit effects of "+v.title} data-help="Select this sub-scene in the effects controls (lights, rain, motion, sound). Nothing opens: the preview and controls you have open show it." onClick={()=>onEffects(editing===v.id?null:v.id,false)}>{editing===v.id?"Editing effects":"Edit effects"}</button>
   <button aria-label={"Preview "+v.title} data-help="Fill this window with this sub-scene, with its effects controls beside it when Show controls is on." onClick={()=>onEffects(v.id,true)}>Preview</button>
  </span>}
  {scene.nodes.filter(n=>n.view===v.id).map(n=><button key={n.id} onClick={()=>onOpen(n.id)}>Edit · dialogue {scene.nodes.indexOf(n)+1}</button>)}{!scene.nodes.some(n=>n.view===v.id)&&<small> Not assigned to a dialogue</small>}</div>)}
 </details>;
}
