import {expect,it} from "vitest";
import {savedProject} from "./savedProject";
import {integrateLibraryUpdate,importPublishedArtwork} from "./libraryUpdate";
import {validateProject,start,advance,putAwayDevice,type Runtime} from "./model";
import {canPutAway,returnDestination} from "./deviceReturn";
import {deviceScreen} from "./interactions";
import {removeDialogue,dialogueLabel} from "./authoring";
it("repairs older saved libraries once without replacing custom images, scenes or café data",()=>{
 const source=savedProject(),p=savedProject();p.contentUpdates=["2.4.0","2.5.0"];
 p.assets=p.assets.filter(a=>!a.id.startsWith("outfit-")&&a.id!=="first-match-window");
 const room=p.scenes[0],cafe=structuredClone(p.scenes.find(s=>s.id==="cafe"));
 room.effects.brightness=.63;delete room.phone!.returnControl;
 room.subscenes=room.subscenes!.filter(v=>v.id!=="wardrobe-closeup");
 delete room.nodes.find(n=>n.id==="clothes")!.view;
 const outfit=p.scenes.find(s=>s.id==="outfit")!;outfit.items!.enabled=false;outfit.items!.options[0].description="Keep my notes";
 const result=integrateLibraryUpdate(p,source)!;
 expect(result.assets.filter(a=>a.folder==="Outfits & items")).toHaveLength(3);
 expect(result.scenes[0].effects.brightness).toBe(.63);
 expect(result.scenes[0].nodes.find(n=>n.id==="clothes")!.view).toBe("wardrobe-closeup");
 expect(result.scenes.find(s=>s.id==="cafe")).toEqual(cafe);
 expect(result.scenes.find(s=>s.id==="outfit")!.items!.options[0].description).toBe("Keep my notes");
 expect(result.scenes.find(s=>s.id==="outfit")!.items!.enabled).toBe(true);
 expect(integrateLibraryUpdate(result,source)).toBeNull();
 expect(p.assets.some(a=>a.id==="outfit-smart")).toBe(false);
 expect(()=>validateProject(result)).not.toThrow();
});
it("missing-art import preserves present image data and custom folder names",()=>{
 const p=savedProject(),source=savedProject();p.assets[1].folder="My custom shots";const data=p.assets[1].data;
 importPublishedArtwork(p,source);expect(p.assets[1].folder).toBe("My custom shots");expect(p.assets[1].data).toBe(data);expect(p.assets).toHaveLength(source.assets.length);
});
it("putting a phone away returns to the four options and resumes its exact dialogue without repeating actions",()=>{
 const p=savedProject(),scene=p.scenes[0];let r=start(p);r=advance(p,r);r=advance(p,r);
 const room=r.node;expect(room).toBe("room");
 const choice=scene.nodes.find(n=>n.id===room)!.choices.find(c=>c.target==="browse-feed")!;
 p.variables.open_count=0;choice.actions.push({key:"open_count",op:"add",value:1});r.values.open_count=0;
 r=advance(p,r,choice.id);r=advance(p,r);r=advance(p,r);
 expect(r.node).toBe("first-decision");const values=structuredClone(r.values),messages=r.phoneMessages;
 r=putAwayDevice(p,r);expect(r.node).toBe(room);expect(r.values).toEqual(values);expect(r.phoneMessages).toEqual(messages);
 r=advance(p,r,choice.id);expect(r.node).toBe("first-decision");expect(r.values.open_count).toBe(1);
 expect(deviceScreen(scene,scene.nodes.find(n=>n.id===r.node)!,r.nodeVisits!.map(v=>v.node))).toBe("feed");
});
it("return ranges include their end, follow actual branches and allow individual on/off switches",()=>{
 const p=savedProject(),s=p.scenes[0],n=s.nodes.find(n=>n.id==="discover")!;
 expect(canPutAway(s,n,["room","browse-feed","discover"])).toBe(true);
 expect(canPutAway(s,s.nodes.find(n=>n.id==="stay")!,["browse-feed","discover","stay"])).toBe(false);
 expect(canPutAway(s,n,["room","discover"])).toBe(false);
 n.deviceReturn=true;expect(canPutAway(s,n,["discover"])).toBe(true);
 n.deviceReturn=false;expect(canPutAway(s,n,["browse-feed","discover"])).toBe(false);
 delete s.phone!.returnControl!.target;
 const r:Runtime={...start(p),node:"discover",nodeVisits:[{scene:s.id,node:"room"},{scene:s.id,node:"discover"}]};
 expect(returnDestination(s,n,r)).toBe("room");
 delete r.nodeVisits;expect(returnDestination(s,n,r)).toBeUndefined();
});
it("deleting a return endpoint cleans its schedule, and numbered destinations identify temporary views",()=>{
 const p=savedProject(),s=p.scenes[0];expect(dialogueLabel(p,s,"window")).toContain("Sub-scene: At the window");
 removeDialogue(s,"browse-feed");expect(s.phone!.returnControl).toBeUndefined();expect(()=>validateProject(p)).not.toThrow();
});
