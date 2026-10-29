import type {Project,Scene} from './model';
import {releases} from './releases';
import {activities,activitySetting} from './EffectSummary';
export type FeatureRoute={id:string;title:string;description:string;action:string;target?:string;zone?:string;scene?:string;node?:string;asset?:string;keywords?:string};
const defs:[string,string,string,string?][]=[
 ['Active effects','See enabled and disabled layers. Open a layer’s settings or use its separate on/off toggle.','active','enabled falling rain glass count'],
 ['Chapters advanced','Organise scenes into chapters, set conditional opening scenarios from prior choices and test start rules.','chapters','chapter count next chapter start branch scenarios'],
 ['Scenes advanced','Edit the scene route map, connections, scene names and backgrounds.','scenes','graph branches'],
 ['Dialogue advanced','Edit dialogue boxes, choices, notes, connections and per-dialogue artwork.','dialogues','nodes flow graph'],
 ['Editor','Open the scene preview with visual controls and dialogue editing.','editor','main studio'],
 ['Scene list','Open the story library and choose a scene.','library:Scenes','scenes backgrounds'],
 ['Artwork library and folders','Browse embedded backgrounds, outfits, portraits and app icons.','library:Assets','images import png assets'],
 ['Characters','Edit character names, portraits and knowledge notes.','library:Characters','speaker maria'],
 ['Story state and variables','Inspect and edit story variables and relationship values.','library:State','flags trust clues'],
 ['AI assistant','Open the optional authoring helper; review proposals before applying them.','assistant','voice speak microphone ask ai'],
 ['Engine tools','Open sprites, keyframes, timed choices and other engine tools.','tools','qte animation'],
 ['Dialogue editor','Open the dialogue panel, author text and next-line choices.','dialogue','bottom self reply response notes'],
 ['Outfits and item selection','Open the saved clothing picker and its inspect-then-confirm item cards.','wardrobe','dress clothes png choose item'],
 ['Items and outfits editor','Edit item cards, descriptions, images and confirmation routes for this scene.','items','overlay blur inventory'],
 ['Insta feed videos and comments','Upload videos, reorder posts, edit captions and fictional comments, and set autoplay and feed audio volume.','devices','instagram insta social feed like heart video upload comments'],
 ['Advanced devices','Open phone and computer frames, apps, timing, return routes and appearance.','devices','phone laptop desktop ui screen home feed messages'],
 ['Rain settings','Adjust falling rain, density, speed, angle, glass streaks and affected regions.','effect:Rain','weather drops mask brush wand'],
 ['Move light with mouse','In Lighting, open a local radial light and press Move light with mouse, then click its new centre on the scene. X/Y update together without changing its loop or colour.','effect:Lighting','mouse position click move lamp coordinates'],
 ['Lighting settings','Adjust brightness, tint, illumination and local light zones.','effect:Lighting','luminosity candle intensity color'],
 ['Motion and wind','Animate selected cloth, leaves or other pixels with gentle sway and distortion.','effect:Motion','cloth flower foliage distortion wind'],
 ['Hinges and poses','Move selected foreground objects around a pivot; set poses and dialogue ranges.','effect:Cinematics','joint finger facial expression hinge foreground'],
 ['Camera and depth','Set zoom, focal point, walking bob, sway and footsteps.','effect:Camera','zoom walk depth shake pan'],
 ['Light Library favourites','Save one light’s colour, radius and cycle, then stamp copies onto the scene.','effect:Light Library','preset favorite favourite click placement'],
 ['Effect presets','Save and reapply lighting, rain or motion setups across scenes.','effect:Effect Presets','approved favourite favorite setup'],
 ['Sound and audio','Manage ambience, dialogue and choice cues and footsteps.','effect:Sound','music volume rain loop upload audio'],
 ['Sub-scenes and temporary views','Choose another background angle for selected dialogue and configure its return.','effect:Sub-scenes','close up window wardrobe artwork'],
 ['Background artwork','Choose and frame the main scene background.','background','image fit crop scale'],
 ['Scene transitions','Set scene entrances, exits and fade, slide or cut timing.','transitions','fade smooth snappy'],
 ['Workspace layout','Adjust sizes, dialogue layout, tool placement and panel colours.','layout','resize positions pinned page hidden'],
 ['Window docking and pop-outs','Move, float, restore or snap panels and choose their dock positions.','windows','windows snap pop out movable floating restore'],
 ['Split view','Open two shared workspaces, side by side or stacked.','split-view','two windows panes editor scenes dialogue'],
 ['Interface appearance','Choose editor theme, window colours, interface fonts and text size.','appearance','light dark warm font customization'],
 ['Project settings','Open project options, workspace sizing and interface preferences.','settings','reduced effects safe area'],
 ['Save and publish project','Export the full project with embedded artwork or use the configured publisher.','save','backup github sync json export'],
 ['Restore artwork','Recover missing published artwork and outfit cards while retaining custom project edits.','restore-artwork','missing empty folders images recovery'],
 ['Update history','Search version history and find directions for older and newer features.','updates','release help instructions'],
 ['Playthrough event log','Review recorded story choices, dialogue transitions and responses.','events','progress history log'],
];
export function featureCatalog(project:Project,scene:Scene):FeatureRoute[]{
 const list:FeatureRoute[]=defs.map(([title,description,action,keywords],i)=>({id:'feature-'+i,title,description,action,keywords}));
 const controls:[string,string,string][]=[['Rain on glass','effect:Rain','Rain on glass'],['Falling rain density','effect:Rain','Intensity / density'],['Light intensity sequence','effect:Lighting','Intensity sequence'],['Brightness','effect:Lighting','Brightness'],['Ambient tint','effect:Lighting','Ambient tint'],['Walking camera bob','effect:Camera','Camera bob'],['Magic wand tolerance','effect:Rain','Wand tolerance']];
 for(const [title,action,target]of controls)list.push({id:'control-'+title,title,action,target,description:'Open '+title+' controls in the settings panel without changing the saved value.'});
 for(const s of project.scenes){list.push({id:'scene-'+s.id,title:s.title,description:'Open scene '+(project.scenes.indexOf(s)+1)+' in the editor.',action:'editor',scene:s.id});for(const n of s.nodes)list.push({id:'dialogue-'+s.id+'-'+n.id,title:(project.scenes.indexOf(s)+1)+'.'+(s.nodes.indexOf(n)+1)+' '+n.speaker+': '+n.text.slice(0,75),description:'Open this authored dialogue in '+s.title+'.',action:'dialogue',scene:s.id,node:n.id,keywords:n.notes});}
 for(const a of project.assets)list.push({id:'asset-'+a.id,title:a.name,description:'Open saved artwork in '+(a.folder||'the artwork library')+'.',action:'library:Assets',asset:a.id,keywords:a.tags});
 for(const a of activities(scene)){const destination=activitySetting(scene,a.id);list.push({id:'activity-'+a.id,title:a.name,description:'Open settings for this '+(a.enabled?'enabled':'disabled')+' layer in '+scene.title+'.',action:destination.action,target:destination.label,zone:destination.zone});}
 for(const r of releases)for(const f of r.features)if(f.action)list.push({id:'release-'+r.version+'-'+f.name,title:f.name,description:f.description,action:f.action==='workspace'?'layout':f.action,keywords:f.steps.join(' ')});
 const seen=new Set<string>();return list.filter(item=>{const key=item.title.toLowerCase()+"|"+item.action+"|"+(item.target||"");if(seen.has(key))return false;seen.add(key);return true;});
}
const normal=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export function findFeatures(list:FeatureRoute[],query:string){
 const terms=normal(query.trim()).split(/\s+/).filter(Boolean);
 if(!terms.length)return list.slice(0,12);
 return list.map((item,i)=>{const title=normal(item.title),rest=normal(item.description+' '+(item.keywords||''));if(!terms.every(term=>title.includes(term)||rest.includes(term)))return null;const score=(title===normal(query.trim())?1000:0)+terms.reduce((s,t)=>s+(title.startsWith(t)?50:title.includes(t)?30:5),0);return {item,score,i};}).filter((v):v is {item:FeatureRoute;score:number;i:number}=>!!v).sort((a,b)=>b.score-a.score||a.i-b.i).slice(0,40).map(v=>v.item);
}
/** Index currently mounted settings without invoking buttons or changing values. */
export function liveControlCatalog():FeatureRoute[]{
 if(typeof document==='undefined')return [];
 const results:FeatureRoute[]=[];
 for(const el of document.querySelectorAll<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>('input,select,textarea')){
  if(el.matches('[type=password],[type=file],[hidden]')||el.closest('.feature-search-dialog'))continue;
  const title=(el.getAttribute('aria-label')||el.labels?.[0]?.textContent||'').trim().replace(/\s+/g,' ').slice(0,90);
  if(!title||title==='Project title')continue;
  let action='';const area=el.closest<HTMLElement>('[data-effect-panel]');
  const properties=el.closest<HTMLElement>('.properties-dock');
  if(area)action='effect:'+area.dataset.effectPanel;
  else if(properties){const section=properties.dataset.inspector;action=section==='Active'?'active':section==='Workspace'?'layout':section==='Appearance'?'appearance':section==='Background'?'background':section==='Transitions'?'transitions':'effect:'+(properties.dataset.panel||'All');}
  else if(el.closest('.device-workspace'))action='devices';
  else if(el.closest('.bottom-panel'))action='dialogue';
  else if(el.closest('.flow-details'))action='dialogues';
  else if(el.closest('.library')){const heading=el.closest('.library')?.querySelector('.panel-heading span')?.textContent?.trim();action='library:'+(heading==='Your story'?'Scenes':heading||'Assets');}
  else if(el.closest('.effects-dock'))action='effect:'+(el.closest<HTMLElement>('.effects-dock')?.dataset.panel||'All');
  if(!action)continue;
  results.push({id:'live-'+results.length,title,description:el.dataset.help||'Open the '+title+' control at its current settings location. This does not change its value.',action,target:el.getAttribute('aria-label')||title});
 }
 return results;
}
