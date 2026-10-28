import {useEffect,useMemo,useRef,useState} from 'react';
import {Search,X} from 'lucide-react';
import type {Project,Scene} from './model';
import {featureCatalog,liveControlCatalog,findFeatures,type FeatureRoute} from './searchIndex';
export function FeatureSearch({project,scene,onChoose,disabled}:{project:Project;scene:Scene;onChoose:(route:FeatureRoute)=>void;disabled:boolean}){
 const [open,setOpen]=useState(false),[query,setQuery]=useState(''),[selected,setSelected]=useState(0);const root=useRef<HTMLElement>(null),trigger=useRef<HTMLButtonElement>(null);
 const catalog=useMemo(()=>{const seen=new Set<string>();return [...featureCatalog(project,scene),...(open?liveControlCatalog():[])].filter(r=>{const key=r.title.toLowerCase()+'|'+r.action+'|'+(r.target||'');if(seen.has(key))return false;seen.add(key);return true;});},[project,scene,open]),results=useMemo(()=>findFeatures(catalog,query),[catalog,query]);
 const close=()=>{setOpen(false);trigger.current?.focus();};
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'&&!disabled){e.preventDefault();setOpen(v=>!v);}if(e.key==='Escape'&&open){e.preventDefault();close();}};document.addEventListener('keydown',key);return()=>document.removeEventListener('keydown',key);},[disabled,open]);
 useEffect(()=>{setSelected(0);},[query]);
 useEffect(()=>{if(open)document.getElementById('search-result-'+selected)?.scrollIntoView({block:'nearest'});},[selected,open]);
 return <><button ref={trigger} type="button" className="feature-search-trigger" disabled={disabled} onClick={()=>setOpen(true)} data-help="Search the whole studio for settings, windows, scenes, dialogue, artwork and tools. Select a result to open its location. Shortcut: Ctrl+K or Command+K."><Search size={14}/>Search features <kbd>⌘/Ctrl K</kbd></button>
 {open&&<div className="feature-search-backdrop" onPointerDown={e=>{if(e.target===e.currentTarget)close();}}><section ref={root} role="dialog" aria-modal="true" aria-label="Search studio features" className="feature-search-dialog" onKeyDown={e=>{
 if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();setSelected(i=>Math.max(0,Math.min(results.length-1,i+(e.key==='ArrowDown'?1:-1))));}
 if(e.key==='Enter'&&e.target instanceof HTMLInputElement&&results[selected]){e.preventDefault();onChoose(results[selected]);close();}
 if(e.key==='Tab'){const nodes=[...root.current!.querySelectorAll<HTMLElement>('button,input')],first=nodes[0],last=nodes.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}
 }}>
 <div className="search-dialog-heading"><h2>Find a feature</h2><button aria-label="Close feature search" onClick={close} data-help="Close the search without opening a feature."><X size={17}/></button></div>
 <input autoFocus data-help="Search locally by feature name, a setting label, scene, dialogue or artwork. Select a result to open its window or highlight its control; searching does not change effect values." aria-label="Search all studio features" placeholder="Rain on glass, Active, scenes, pop out, Maria…" value={query} onChange={e=>setQuery(e.target.value)} aria-controls="studio-search-results" aria-activedescendant={results[selected]?'search-result-'+selected:undefined}/>
 <p>Choose a result to open it. Arrow keys select; Enter opens; Escape closes.</p>
 <div className="feature-search-results" id="studio-search-results">{results.length?results.map((result,i)=><button key={result.id} id={'search-result-'+i} className={selected===i?'search-selected':''} onFocus={()=>setSelected(i)} onClick={()=>{onChoose(result);close();}} data-help={result.description}><b>{result.title}</b><span>{result.description}</span></button>):<p>No matching feature. Try a shorter name such as “rain”, “phone” or “windows”.</p>}</div>
 </section></div>}
 </>;
}
