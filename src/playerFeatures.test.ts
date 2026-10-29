import { it, expect } from "vitest";
import { demo } from "./demo";
import { advance, start, respond, validateProject } from "./model";
import { choiceAvailable } from "./choices";
import { makeDevice } from "./deviceFrame";
import { playerSaveKey, readPlayerSave, savePlayerProgress } from "./playerSave";
import { exportScope, dialogueKey } from "./exportScope";
import { savedProject } from "./savedProject";
import { deviceDialogue } from "./interactions";
it("disabled replies keep targets and actions but cannot be selected or sent as custom branches",()=>{
 const p=demo(), n=p.scenes[0].nodes[1], c=n.choices[0], original=JSON.stringify(c);
 c.enabled=false;
 const loaded=validateProject(JSON.parse(JSON.stringify(p)));
 expect(loaded.scenes[0].nodes[1].choices[0]).toEqual({...JSON.parse(original),enabled:false});
 let r=advance(p,start(p));
 expect(choiceAvailable(c,r.values)).toBe(false);
 expect(()=>advance(p,r,c.id)).toThrow("Choice unavailable");
 expect(()=>respond(p,r,"Custom reply",c.id)).toThrow("Choice unavailable");
 c.enabled=true;
 expect(choiceAvailable(c,r.values)).toBe(true);
 expect(advance(p,r,c.id).scene).toBe(c.target);
});
it("new devices and the published story start with keyboard hidden; chat choices stay inside except the deliberate question menu",()=>{
 const p=demo();expect(makeDevice(p.scenes[0]).keyboard).toBe(false);
 const published=savedProject();
 expect(published.scenes.filter(s=>s.phone).every(s=>!s.phone!.keyboard)).toBe(true);
 for(const id of ['offer','confirm']) {
  const scene=published.scenes[2];expect(deviceDialogue(scene,scene.nodes.find(n=>n.id===id)!)).toBe(true);
 }
 const messages=published.scenes[1];expect(deviceDialogue(messages,messages.nodes.find(n=>n.id==='ask-wants')!)).toBe(false);
});
it("progress saves retain the exact route and transcript; invalid or out-of-range saves are ignored",()=>{
 const p=demo(),key=playerSaveKey(p),map=new Map<string,string>();
 const storage={getItem:(k:string)=>map.get(k)||null,setItem:(k:string,v:string)=>{map.set(k,v);}};
 const r=advance(p,advance(p,start(p)),"open");
 savePlayerProgress(storage,key,r);
 expect(readPlayerSave(storage,key,p)).toEqual(r);
 expect(readPlayerSave(storage,key,{...p,scenes:p.scenes.slice(0,1)})).toBeNull();
 const s=p.scenes[0],scope=exportScope(p,dialogueKey(s.id,s.nodes[0].id),dialogueKey(s.id,s.nodes[1].id));
 expect(readPlayerSave(storage,key,p,scope)).toBeNull();
 expect(playerSaveKey(p,scope)).not.toBe(key);
 map.set(key,'{"values":null}');expect(readPlayerSave(storage,key,p)).toBeNull();
 expect(()=>savePlayerProgress({setItem:()=>{throw Error('Storage full');}},key,r)).toThrow('Storage full');
});
