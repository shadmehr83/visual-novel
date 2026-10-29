import {it,expect} from 'vitest';
import {savedProject} from './savedProject';
import {integrateContentUpdates} from './contentUpdates';
import {integrateDemoUpdates} from './demoUpdates';
import {integrateDeviceUpdate} from './deviceUpdates';
import {validateProject} from './model';
import {assetFolder,artworkFolders} from './AssetPicker';
import {setDialogueArtwork} from './dialogueImages';
function older(){
 const p=savedProject();p.contentUpdates=[];
 p.assets=p.assets.filter(a=>!a.id.startsWith('studio-icon-')&&!a.id.startsWith('outfit-')&&!['first-match-window','first-match-monitor'].includes(a.id));
 for(const scene of p.scenes)if(scene.phone?.appearance)scene.phone.appearance.icons={};
 const s=p.scenes[0];delete s.subscenes;delete s.phone!.returnControl;
 for(const n of s.nodes){delete n.view;delete n.deviceReturn;}
 delete p.scenes.find(s=>s.id==='outfit')!.items;
 return validateProject(p);
}
it('resolves images before old migrations validate newly published sub-scenes',()=>{
 const p=older(),source=savedProject();
 expect(()=>integrateDemoUpdates(p,source)).not.toThrow();
 p.contentUpdates=['2.4.0'];expect(()=>integrateDeviceUpdate(p,source)).not.toThrow();
 p.contentUpdates=[];
 const cafe=structuredClone(p.scenes.find(s=>s.id==='cafe'));
 const result=integrateContentUpdates(p,source)!;
 expect(result.assets).toHaveLength(source.assets.length);
 expect(result.scenes.find(s=>s.id==='cafe')).toEqual(cafe);
 expect(result.scenes[0].subscenes!.every(v=>result.assets.some(a=>a.id===v.background))).toBe(true);
 expect(result.scenes.find(s=>s.id==='outfit')!.items!.options.filter(i=>i.asset)).toHaveLength(3);
 expect(integrateContentUpdates(result,source)).toBeNull();
 expect(p.contentUpdates).toEqual([]);
});
it('every published image belongs to a populated folder',()=>{
 const p=savedProject();const folders=artworkFolders(p.assets);
 expect(folders).toEqual(['Background scenes','Outfits & items','Profiles & app icons']);
 for(const a of p.assets)expect(a.folder).toBeTruthy();
 expect(p.assets.filter(a=>assetFolder(a)==='Outfits & items')).toHaveLength(3);
 expect(p.assets.filter(a=>assetFolder(a)==='Profiles & app icons')).toHaveLength(5);
});
it('assigning map artwork creates a private dialogue view and preserves other users of a shared view',()=>{
 const s=savedProject().scenes[0],a=s.nodes.find(n=>n.id==='window')!,b=s.nodes.find(n=>n.id==='clothes')!;
 b.view=a.view;const shared=s.subscenes!.find(v=>v.id===a.view)!,original=structuredClone(shared),main=s.background;
 setDialogueArtwork(s,b.id,'first-match-wardrobe');
 expect(a.view).not.toBe(b.view);expect(shared).toEqual(original);expect(s.background).toBe(main);
 const view=s.subscenes!.find(v=>v.id===b.view)!;view.effects=structuredClone(s.effects);
 setDialogueArtwork(s,b.id,'first-match-monitor');expect(view.effects).toBeUndefined();
 setDialogueArtwork(s,b.id,null);expect(b.view).toBeUndefined();expect(s.background).toBe(main);
});
