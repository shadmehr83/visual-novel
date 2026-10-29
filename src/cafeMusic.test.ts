import {it,expect} from 'vitest';
import {savedProject} from './savedProject';
import {integrateCafeMusic} from './cafeMusicUpdate';
it('installs a looping cafe score once without replacing existing artwork, dialogue or soundtracks',()=>{
 const source=savedProject(),p=savedProject(),s=p.scenes.find(s=>s.id==='cafe')!;
 p.contentUpdates=p.contentUpdates!.filter(v=>v!=='2.21.0');s.audio=[];p.audioAssets=p.audioAssets!.filter(a=>a.id!=='cafe-first-meeting-score');
 const before=JSON.stringify({...s,audio:undefined});const updated=integrateCafeMusic(p,source)!;
 expect(JSON.stringify({...updated.scenes.find(s=>s.id==='cafe'),audio:undefined})).toBe(before);
 expect(updated.scenes.find(s=>s.id==='cafe')!.audio).toEqual([{id:'cafe-first-meeting-score',volume:.36,loop:true}]);
 expect(integrateCafeMusic(updated,source)).toBeNull();expect(s.audio).toEqual([]);
});
