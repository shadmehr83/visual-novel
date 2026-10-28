import { useRef, type ReactNode } from "react";
import type { StudioView } from "./StudioMenu";
export const WORKSPACES: [StudioView,string][] = [["editor","Editor"],["scenes","Scenes advanced"],["dialogues","Dialogue advanced"],["devices","Advanced devices"],["updates","Update history"]];
export function WorkspaceSplit({active,ratio,direction,reversed,onResize,primary,secondary}:{active:boolean;ratio:number;direction:"side-by-side"|"stacked";reversed:boolean;onResize:(n:number)=>void;primary:ReactNode;secondary:ReactNode}) {
  const container = useRef<HTMLDivElement>(null), dragging = useRef(false);
  const change = (n:number) => onResize(Math.min(75,Math.max(25,Math.round(n))));
  return <div ref={container} className={"workspace-panes " + (active ? "has-split " + direction + (reversed ? " panes-reversed" : "") : "single-workspace")} style={{"--workspace-first":ratio+"fr","--workspace-other":(100-ratio)+"fr"} as React.CSSProperties}>
    <section className="workspace-pane main-workspace" aria-label="Main workspace pane">{primary}</section>
    {active && <>
      <div role="separator" tabIndex={0} aria-label="Resize workspace panes" aria-orientation={direction === "side-by-side" ? "vertical" : "horizontal"} aria-valuenow={ratio} aria-valuemin={25} aria-valuemax={75} className="workspace-divider"
        data-help="Drag to divide the available width or height between the two workspaces. Arrow keys adjust it in five-percent steps."
        onPointerDown={e => {e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);dragging.current=true;}}
        onPointerMove={e => {if (!dragging.current || !container.current) return;const r=container.current.getBoundingClientRect();const value=direction === "side-by-side" ? (e.clientX-r.left)/r.width*100 : (e.clientY-r.top)/r.height*100;change(reversed ? 100-value:value);}}
        onPointerUp={() => {dragging.current=false;}} onPointerCancel={() => {dragging.current=false;}}
        onKeyDown={e => {if (["ArrowLeft","ArrowUp","ArrowRight","ArrowDown"].includes(e.key)) {e.preventDefault();change(ratio+(["ArrowLeft","ArrowUp"].includes(e.key)?-5:5)*(reversed?-1:1));}}}/>
      <section className="workspace-pane companion-workspace" aria-label="Second workspace pane">{secondary}</section>
    </>}
  </div>;
}
