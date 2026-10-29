import {useEffect,useRef,useState} from 'react';
import {deviceDialogue} from './interactions';
import type {Project,Runtime} from './model';
/** Direct author jumps preview a line without replaying branch actions. */
export function jumpAuthorDialogue(p:Project,r:Runtime,scene:string,node:string):Runtime {
 const s=p.scenes.find(s=>s.id===scene),n=s?.nodes.find(n=>n.id===node);
 if(!s||!n)return r;
 const visits=[...(r.nodeVisits||[]),{scene,node}].slice(-1000);
 return {...r,scene,node,ended:false,nodeVisits:visits,deviceBookmark:undefined,
 ...(deviceDialogue(s,n,visits.filter(v=>v.scene===scene).map(v=>v.node)) && [s.phone?.contact,'You'].includes(n.speaker) ? {phoneMessages:[...(r.phoneMessages||[]),{scene,node,sender:n.speaker,text:n.text}].slice(-100)} : {})};
}
export function AuthorNavigation({project:p,runtime:r,onChange}:{project:Project;runtime:Runtime;onChange:(r:Runtime)=>void}) {
 const [history,setHistory]=useState<Runtime[]>([r]),[at,setAt]=useState(0);
 const restoring=useRef(false);
 useEffect(()=>{
  if(restoring.current){restoring.current=false;return;}
  setHistory(before=>{
   const current=before[at];
   if(current?.scene===r.scene&&current.node===r.node&&current.ended===r.ended){const next=[...before];next[at]=r;return next;}
   const next=[...before.slice(0,at+1),r].slice(-100);setAt(next.length-1);return next;
  });
 },[r]);
 const restore=(index:number)=>{restoring.current=true;setAt(index);onChange(history[index]);};
 const entries=p.scenes.flatMap((s,i)=>s.nodes.map((n,j)=>({s,n,label:`Scene ${i+1} · Dialogue ${j+1} · ${n.speaker}: ${n.text.slice(0,45)}`})));
 const index=entries.findIndex(e=>e.s.id===r.scene&&e.n.id===r.node),current=entries[index];
 const next=entries.find(e=>e.s.id===r.scene&&e.n.id===current?.n.next)||entries.find(e=>e.s.id===current?.n.next)||entries[index+1];
 return <div className="author-dialogue-navigation" data-no-advance>
 <button disabled={at===0} data-help="Return to the previous position visited in this author session, restoring its story variables, choices and chat transcript. Project edits remain saved." onClick={()=>restore(at-1)}>Previous dialogue</button>
 <button disabled={at===history.length-1&&!next} data-help="Restore a position you stepped back from, or preview the linked next dialogue (otherwise the next editor-listed dialogue). Direct previews do not apply choice actions." onClick={()=>at<history.length-1?restore(at+1):next&&onChange(jumpAuthorDialogue(p,r,next.s.id,next.n.id))}>Next dialogue</button>
 <select aria-label="Jump to dialogue in author playthrough" value={JSON.stringify([r.scene,r.node])} data-help="Jump directly to any dialogue for editing. Current variables and choices are kept; skipped branch actions are not simulated. Previous dialogue returns to the position before the jump." onChange={e=>{const [s,n]=JSON.parse(e.target.value);onChange(jumpAuthorDialogue(p,r,s,n));}}>{entries.map(e=><option key={JSON.stringify([e.s.id,e.n.id])} value={JSON.stringify([e.s.id,e.n.id])}>{e.label}</option>)}</select>
 <small>Previous restores visited progress. Direct jumps keep current variables; edits stay saved.</small>
 </div>;
}
