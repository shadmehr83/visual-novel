import {DOCK_TITLES} from './DockPanels';
import {panelLayout,type DockLayouts,type DockMode} from './docking';
export function PanelLayoutSettings({layouts,onMove,onReset}:{layouts:DockLayouts;onMove:(id:string,mode:DockMode)=>void;onReset:()=>void}){
 return <section className="window-layout-settings"><h3>Windows & docking</h3><p>Float a panel inside the studio, dock it at an edge, or give it a split column. Drag a panel title near an edge to see snap targets. Pop-out windows have a Restore icon; their bottom-right corner resizes them.</p>
 {Object.entries(DOCK_TITLES).map(([id,title])=><label key={id}>{title}<select aria-label={title+' window placement'} value={panelLayout(layouts,id).mode} onChange={e=>onMove(id,e.target.value as DockMode)} data-help={'Choose where '+title+' appears. Original position returns to the built-in layout; floating makes it movable; Split gives it a column beside the workspace.'}>{(['home','float','left','right','top','bottom','split'] as const).map(mode=><option key={mode} value={mode}>{mode==='home'?'Original position':mode==='float'?'Floating window':mode==='split'?'Split beside workspace':'Dock '+mode}</option>)}</select></label>)}
 <button onClick={onReset} data-help="Return all panels and workspaces to their original dock positions. Story artwork, dialogue, effects, fonts and colours are kept.">Restore all window positions</button>
 </section>;
}
