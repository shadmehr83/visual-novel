import {cloneData} from './cloneData';
import type {Project} from './model';
export function integrateCafeMusic(local:Project,source:Project):Project|null {
 if(local.id!==source.id||local.contentUpdates?.includes('2.21.0'))return null;
 const track=source.audioAssets?.find(a=>a.id==='cafe-first-meeting-score');
 if(!track||!local.scenes.some(s=>s.id==='cafe'))return null;
 const p=cloneData(local);if(!p.audioAssets?.some(a=>a.id===track.id))(p.audioAssets??=[]).push(cloneData(track));
 const s=p.scenes.find(s=>s.id==='cafe')!;if(!s.audio?.some(a=>a.id===track.id))(s.audio??=[]).push({id:track.id,volume:.36,loop:true});
 (p.contentUpdates??=[]).push('2.21.0');return p;
}
