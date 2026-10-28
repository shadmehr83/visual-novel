import type { Scene } from "./model";
export function DeviceReturnControls({scene, nodeId, update}: {scene: Scene; nodeId: string; update: (fn:(s:Scene)=>void)=>void}) {
  const node = scene.nodes.find(n => n.id === nodeId) || scene.nodes[0], control = scene.phone?.returnControl;
  if (!scene.phone) return null;
  const options = scene.nodes.map((n,i) => <option key={n.id} value={n.id}>{i+1}. {n.speaker}: {n.text.slice(0,45)}{n.view ? " · Sub-scene" : ""}</option>);
  return <section className="device-return-controls">
    <h3>Put device away · return route</h3>
    <p>Allow the player to leave the phone or computer during a dialogue range. Existing Home and app navigation keep working.</p>
    <label><input type="checkbox" aria-label="Enable put-device-away range" checked={control?.enabled || false} onChange={e => update(s => {
      s.phone!.returnControl = {...(s.phone!.returnControl || {start:node.id, end:node.id}), enabled:e.target.checked};
    })}/>Allow put away from a start dialogue to an end dialogue</label>
    {control && <>
      {(["start","end"] as const).map(key => <label key={key}>{key === "start" ? "Allow return starting at" : "Allow return through"}<select aria-label={"Device return " + key} value={control[key]} onChange={e => update(s => {s.phone!.returnControl![key]=e.target.value;})}>{options}</select></label>)}
      <label>Return destination<select aria-label="Device return destination" value={control.target || ""} onChange={e => update(s => {s.phone!.returnControl!.target=e.target.value || undefined;})}>
        <option value="">Automatic · last choice menu (or hide and reopen)</option>{options}
      </select></label>
    </>}
    <label>Put-away button on this dialogue<select aria-label="Put-away button on this dialogue" value={node.deviceReturn === undefined ? "inherit" : String(node.deviceReturn)} onChange={e => update(s => {s.nodes.find(n => n.id === node.id)!.deviceReturn = e.target.value === "inherit" ? undefined : e.target.value === "true";})}>
      <option value="inherit">Follow range</option><option value="true">On for this dialogue</option><option value="false">Off for this dialogue · continue on device</option>
    </select></label>
    <p className="small muted">Start and end are inclusive along the played route. Turning the range off keeps the story on the device; a per-dialogue On switch overrides it.</p>
  </section>;
}
