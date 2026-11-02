import {useEffect} from 'react';
import {releases} from './releases';
import {V3} from './v3/ui';
// Control name → release that added it. A name ending in "…" matches every control whose name starts with it.
const introduced:Record<string,string>={"AI Demand Export":"2.17.0","API assistant":"2.17.0","Assistant task":"2.18.0","AI task provider":"2.18.0","Restore all window positions":"2.18.0","Reset preview window":"2.18.0","Character replies":"2.23.0-claude","Export edition":"2.24.0-claude","Custom reply path":"2.24.0-claude","Download AI playthrough log":"2.25.0-claude","Keep texting":"2.25.0-claude",
  "Self-reply on this dialogue":"2.27.2-claude","Export playable HTML · with Claude":"2.28.0-claude","Export phone game · with Claude":"2.28.0-claude",
  "Dialogue switched on":"2.29.0-claude","Search by AI":"2.29.0-claude","✦ Ask Claude":"2.29.0-claude","Open playtest admin ↗":"2.29.0-claude","Enlarge background of …":"2.29.0-claude",
  "Windows":"3.0.0-claude"};
const prefixes=Object.keys(introduced).filter(k=>k.endsWith('…'));
const versionOf=(name:string)=>introduced[name]||introduced[prefixes.find(p=>name.startsWith(p.slice(0,-1)))||''];
// Releases made by Claude also carry a Claude tag on their new controls. Controls inside the game itself stay unmarked.
const byClaude=new Set(releases.filter(r=>r.by==="Claude").map(r=>r.version));
const game='.stage-frame,.device-shell,.standalone-experience';
// Stillframe 3 marks controls from its five latest releases with a "New" pill that shows the version on hover.
const recentCount=V3?5:2;
export function RecentFeatures(){useEffect(()=>{let timer:ReturnType<typeof setTimeout>;const update=()=>{clearTimeout(timer);timer=setTimeout(()=>{const recent=new Set(releases.slice(0,recentCount).map(r=>r.version));const marked=new Set<HTMLElement>();document.querySelectorAll<HTMLElement>('button,select,input,summary,a').forEach(el=>{const name=el.getAttribute('aria-label')||el.textContent?.trim()||'';const version=el.closest(game)?undefined:versionOf(name);if(!version||!recent.has(version))return;el.dataset.recent=version;if(byClaude.has(version))el.dataset.claude='';marked.add(el);if(V3){const host=el.matches('input,select')?el.closest<HTMLElement>('label')||el:el;host.dataset.new='v'+version.replace(/-claude$/,'');marked.add(host);}else el.title='✓ New in v'+version+(byClaude.has(version)?' (by Claude)':'')+(el.dataset.help?' — '+el.dataset.help:'');});document.querySelectorAll<HTMLElement>('[data-recent],[data-new]').forEach(el=>{if(marked.has(el))return;if(el.dataset.recent&&!V3)el.removeAttribute('title');delete el.dataset.recent;delete el.dataset.claude;delete el.dataset.new;});},150);};update();
  // Changes inside the playing scene (text reveal, effects) never add studio controls, so they are skipped.
  const observer=new MutationObserver(records=>{if(records.some(r=>!(r.target as HTMLElement).closest?.(game)))update();});observer.observe(document.body,{childList:true,subtree:true});return()=>{clearTimeout(timer);observer.disconnect();};},[]);return null;}
