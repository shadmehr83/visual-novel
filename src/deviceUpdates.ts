import { cloneData as structuredClone } from "./cloneData";
import {validateProject, type Project} from './model';
export function integrateDeviceUpdate(local:Project, source:Project):Project|null {
 if(local.id!==source.id || local.contentUpdates?.includes('2.5.0'))return null;
 const p=structuredClone(local),s=p.scenes.find(s=>s.id==='bedroom'),from=source.scenes[0];if(!s)return null;
 for(const a of source.assets)if(!p.assets.some(b=>b.id===a.id))p.assets.push(structuredClone(a));
 for(const a of source.audioAssets||[])if(a.id==='studio-rain-window'&&!p.audioAssets?.some(b=>b.id===a.id))(p.audioAssets??=[]).push(structuredClone(a));
 for(const view of from.subscenes||[]){const old=s.subscenes?.find(v=>v.id===view.id);if(!old)(s.subscenes??=[]).push(structuredClone(view));else old.effects??=structuredClone(view.effects);}
 for(const n of s.nodes){if(from.nodes.some(v=>v.id===n.id))n.deviceDialogue??=false;for(const c of n.choices)if(n.deviceDialogue===false)c.sendAsMessage=false;}
 const w=s.nodes.find(n=>n.id==='window');if(w){w.view??='window-closeup';w.sound??=from.nodes.find(n=>n.id==='window')!.sound;}
 if(!s.nodes.some(n=>n.id==='desktop-view'))s.nodes.push(structuredClone(from.nodes.find(n=>n.id==='desktop-view')!));
 const m=s.nodes.find(n=>n.id==='monitor');if(m){if(m.next){m.choices.push({id:'monitor-original-return',text:'Back to the room',target:m.next,actions:[],note:'Preserved return route',sendAsMessage:false});delete m.next;}if(!m.choices.some(c=>c.target==='desktop-view'))m.choices.push(structuredClone(from.nodes.find(n=>n.id==='monitor')!.choices[0]));}
 (p.contentUpdates??=[]).push('2.5.0');return validateProject(p);
}
