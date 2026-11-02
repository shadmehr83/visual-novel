import { useState } from 'react';
import type { Project } from './model';
import { dialogueKey, exportScope } from './exportScope';
import { exportPlayer } from './playerExport';
import { ClaudeMark } from './ClaudeMark';
import { playCode } from './characterReply';
export function AdvancedExport({project:p}:{project:Project}) {
 const [target,setTarget]=useState<'desktop'|'phone'>('desktop');
 // Claude edition (by Claude): the export calls the hosted game server so characters answer self-replies.
 const [edition,setEdition]=useState<'offline'|'claude'>('offline');
 const [server,setServer]=useState(()=>location.protocol==='https:'?location.origin:'https://claude.visual-novel-8b9.pages.dev'),[code,setCode]=useState(()=>playCode());
 const claude=()=>edition==='claude'?{endpoint:server.replace(/\/+$/,'')+'/api/reply',token:code.trim()}:undefined;
 const [mode,setMode]=useState('all'),[chapter,setChapter]=useState(''),[first,setFirst]=useState(''),[last,setLast]=useState(''),[status,setStatus]=useState('');
 const entries=p.scenes.flatMap((s,i)=>s.nodes.map((n,j)=>({scene:s,key:dialogueKey(s.id,n.id),label:`${p.chapters?.find(c=>c.scenes.includes(s.id))?.title || "Story"} · Scene ${i+1} · ${s.title} · Dialogue ${j+1}: ${n.text.slice(0,45)}`})));
 const sceneOptions=p.scenes.map(s=>({value:s.id,label:s.title}));
 const select=(label:string,value:string,set:(v:string)=>void,options:{value:string,label:string}[])=><label>{label}<select aria-label={label} value={value} onChange={e=>set(e.target.value)} data-help="Choose the inclusive export boundary. Your editable project remains unchanged.">{options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select></label>;
 async function run(){try{
  if(edition==='claude'&&(!/^https:\/\//.test(server)||!code.trim()))throw Error('Claude edition needs the https game server address and its playtest code.');
  let a=first||entries[0].key,b=last||entries.at(-1)!.key;
  if(mode==='chapter'){const c=p.chapters?.find(c=>c.id===(chapter||p.chapters?.[0]?.id));if(!c)throw Error('No chapter available.');const e=entries.filter(e=>c.scenes.includes(e.scene.id));a=e[0].key;b=e.at(-1)!.key;const scope=exportScope(p,a,b);scope.nodes=e.map(n=>n.key);scope.scene=c.startScene;scope.node=p.scenes.find(s=>s.id===c.startScene)!.nodes[0].id;await exportPlayer(p,scope,target,claude());}
  else if(mode==='all')await exportPlayer(p,undefined,target,claude());
  else {if(mode==='scenes'){const sa=p.scenes.find(s=>s.id===(first||p.scenes[0].id))!,sb=p.scenes.find(s=>s.id===(last||p.scenes.at(-1)!.id))!;a=dialogueKey(sa.id,sa.nodes[0].id);b=dialogueKey(sb.id,sb.nodes.at(-1)!.id);}await exportPlayer(p,exportScope(p,a,b),target,claude());}
  setStatus('Playable HTML download requested.');
 }catch(e){setStatus(String(e));}}
 return <details className="advanced-export"><summary>Advanced playable export</summary><label>Player layout<select aria-label="Player layout" value={target} onChange={e=>setTarget(e.target.value as typeof target)} data-help="Phone export fills the viewport, starts with tap-to-continue, enlarges the device and uses compact text. Desktop export keeps your authored layout. Both put sound, fullscreen and progression settings in Pause."><option value="desktop">Desktop / normal</option><option value="phone">Phone · compact, tap to continue</option></select></label>
 <label>Character replies <ClaudeMark help="Added by Claude. The Claude edition lets testers type their own replies and the characters answer live. It needs an internet connection and the game server's Claude setup." /><select aria-label="Export edition" value={edition} onChange={e=>setEdition(e.target.value as typeof edition)} data-help="Offline keeps the authored story only and works without internet. Claude edition answers testers' self-replies live through your hosted game server, so it needs a connection."><option value="offline">Authored only · works offline</option><option value="claude">Claude edition · characters answer live (online)</option></select></label>
 {edition==='claude'&&<><label>Game server<input aria-label="Claude edition game server" value={server} onChange={e=>setServer(e.target.value)} data-help="The https address of your deployed Stillframe site. Testers' replies are answered there with your ANTHROPIC_API_KEY." /></label><label>Playtest code<input aria-label="Claude edition playtest code" type="password" autoComplete="off" value={code} onChange={e=>setCode(e.target.value)} data-help="The PLAYTEST_TOKEN secret on your game server. It is embedded in the exported file so testers need no password; change the secret to switch old copies off." /></label><p className="small">Uses your Anthropic API key on the server for each tester reply (the fastest Haiku model). Share the file only with people you trust.</p></>}<p>Export a playable story or an inclusive range. Branches leaving the range finish the demo. Starting mid-story uses initial variables; earlier choices are not replayed.</p><label>Export scope<select aria-label="Export scope" value={mode} data-help="Export the entire story, one chapter, consecutive scenes, or a precise dialogue range." onChange={e=>{setMode(e.target.value);setFirst('');setLast('');}}><option value="all">Entire story</option><option value="chapter">One chapter</option><option value="scenes">Scene range</option><option value="dialogues">Dialogue range</option></select></label>
 {mode==='chapter'&&select('Export chapter',chapter||p.chapters?.[0]?.id||'',setChapter,(p.chapters||[]).map(c=>({value:c.id,label:c.title})))}
 {mode==='scenes'&&<>{select('Start scene',first||p.scenes[0].id,setFirst,sceneOptions)}{select('End scene',last||p.scenes.at(-1)!.id,setLast,sceneOptions)}</>}
 {mode==='dialogues'&&<>{select('Start dialogue',first||entries[0].key,setFirst,entries.map(e=>({value:e.key,label:e.label})))}{select('End dialogue',last||entries.at(-1)!.key,setLast,entries.map(e=>({value:e.key,label:e.label})))}</>}
 <button onClick={()=>void run()} data-help="Download a playable HTML file using this range. This neither uploads to GitHub nor replaces your editable project.">Export selected playable HTML</button><p role="status">{status}</p></details>;
}
