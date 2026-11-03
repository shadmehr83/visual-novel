import type { Node, Scene } from "./model";
import { timerRule } from "./storyTiming";
// Story timer switches (by Claude), in the Normal and Advanced dialogue editors. Per dialogue: the
// timer on or off, and its bar shown or hidden (a hidden timer still runs). Per scene: the same for
// the whole scene or for a dialogue range. A dialogue's own choice wins over the scene's.
export function StoryTimerControls({ scene, node, disabled = false, update, sceneOpen = false }: {
  scene: Scene;
  node?: Node;
  disabled?: boolean;
  update: (fn: (s: Scene) => void) => void;
  sceneOpen?: boolean;
}) {
  const t = scene.storyTimers;
  const fromScene = node ? timerRule(scene, { ...node, timerOff: undefined, timerHidden: undefined }) : null;
  const rule = node ? timerRule(scene, node) : null;
  const editNode = (fn: (n: Node) => void) => update((s) => fn(s.nodes.find((n) => n.id === node!.id)!));
  const editTimers = (fn: (t: NonNullable<Scene["storyTimers"]>) => void) => update((s) => {
    s.storyTimers = s.storyTimers || {};
    fn(s.storyTimers);
  });
  const label = (n: Node, i: number) => `${i + 1}. ${n.speaker}: ${n.text.slice(0, 40)}`;
  return (
    <section className="timed-decision story-timer-controls">
      <h4>Story timer</h4>
      {node && fromScene && rule && <>
        <div className="field-row">
          <label data-help="Switch the story timer for this dialogue only: auto-continue and a timed decision's countdown. Follow scene uses the scene settings below. A line's own Auto-advance time still runs.">
            Timer on this dialogue
            <select aria-label="Timer on this dialogue" disabled={disabled}
              value={node.timerOff === undefined ? "" : node.timerOff ? "off" : "on"}
              onChange={(e) => editNode((n) => {
                if (!e.target.value) delete n.timerOff;
                else n.timerOff = e.target.value === "off";
              })}>
              <option value="">Follow scene ({fromScene.off ? "off" : "on"})</option>
              <option value="on">On</option>
              <option value="off">Off</option>
            </select>
          </label>
          <label data-help="Hide the timer bar on this dialogue while the timer keeps running, so the player does not see how long is left. In the studio a hidden bar shows as a faint outline.">
            Timer bar on this dialogue
            <select aria-label="Timer bar on this dialogue" disabled={disabled}
              value={node.timerHidden === undefined ? "" : node.timerHidden ? "hidden" : "shown"}
              onChange={(e) => editNode((n) => {
                if (!e.target.value) delete n.timerHidden;
                else n.timerHidden = e.target.value === "hidden";
              })}>
              <option value="">Follow scene ({fromScene.hidden ? "hidden" : "shown"})</option>
              <option value="shown">Shown</option>
              <option value="hidden">Hidden (timer still runs)</option>
            </select>
          </label>
        </div>
        <p className="small muted" role="status">
          This dialogue: timer {rule.off ? "off" : "on"}{!rule.off && (rule.hidden ? ", bar hidden from players" : ", bar shown")}
          {node.timerOff === undefined && node.timerHidden === undefined && rule.inRange ? " (from the scene's dialogue range)" : ""}.
        </p>
      </>}
      <details open={sceneOpen || !!t?.off || !!t?.hidden || !!t?.range?.enabled}>
        <summary>Whole scene or a dialogue range</summary>
        <label className="consent" data-help="Switch every story timer in this scene on or off: auto-continue and timed decisions. Dialogues set to On or Off above keep their own choice.">
          <input type="checkbox" aria-label="Timers on in this scene" disabled={disabled} checked={!t?.off}
            onChange={(e) => editTimers((x) => { if (e.target.checked) delete x.off; else x.off = true; })} />
          Timers on in this scene
        </label>
        <label className="consent" data-help="Hide the timer bar on every dialogue in this scene while the timers keep running. Dialogues set to Shown or Hidden above keep their own choice.">
          <input type="checkbox" aria-label="Hide timer bar in this scene" disabled={disabled} checked={!!t?.hidden}
            onChange={(e) => editTimers((x) => { if (e.target.checked) x.hidden = true; else delete x.hidden; })} />
          Hide the timer bar in this scene
        </label>
        <label className="consent" data-help="Apply a timer setting from one dialogue to another, along the path the player takes, instead of setting each dialogue. The range starts at the selected dialogue.">
          <input type="checkbox" aria-label="Timer dialogue range" disabled={disabled} checked={!!t?.range?.enabled}
            onChange={(e) => editTimers((x) => {
              x.range = { effect: "hidden", start: node?.id || scene.nodes[0].id, end: scene.nodes.at(-1)!.id, ...x.range, enabled: e.target.checked };
            })} />
          From one dialogue to another
        </label>
        {t?.range?.enabled && <div className="field-row">
          {(["start", "end"] as const).map((key) => (
            <label key={key} data-help={key === "start" ? "The first dialogue the range applies to." : "The last dialogue the range applies to, included."}>
              {key === "start" ? "From dialogue" : "To dialogue"}
              <select aria-label={key === "start" ? "Timer range from" : "Timer range to"} disabled={disabled} value={t.range![key]}
                onChange={(e) => editTimers((x) => { x.range![key] = e.target.value; })}>
                {scene.nodes.map((n, i) => <option key={n.id} value={n.id}>{label(n, i)}</option>)}
              </select>
            </label>
          ))}
          <label data-help="What happens on the dialogues in the range: hide the bar while the timer runs, or switch the timer off.">
            In this range
            <select aria-label="Timer range effect" disabled={disabled} value={t.range.effect}
              onChange={(e) => editTimers((x) => { x.range!.effect = e.target.value as "hidden" | "off"; })}>
              <option value="hidden">Hide the timer bar</option>
              <option value="off">Switch the timer off</option>
            </select>
          </label>
        </div>}
      </details>
    </section>
  );
}
