import type { Node, Project } from "./model";
import { DEFAULT_DECISION_SECONDS } from "./storyTiming";
// Dialogue editor (by Claude): a reply line can count down. When time runs out the chosen reply is
// taken, as if the player picked it. Switch it off at any time; the time and reply are kept.
export function TimedDecisionControls({ project, node, disabled, update }: {
  project: Project;
  node: Node;
  disabled: boolean;
  update: (fn: (n: Node) => void) => void;
}) {
  const t = node.timedChoice;
  const masterOff = project.settings.timedDecisions === false;
  return (
    <section className="timed-decision">
      <label className="toggle-row" data-help="Give the player limited time to pick a reply. A bar in the dialogue box (or the corner while a phone is up) runs down; when it is empty, the reply chosen below is taken.">
        <span>Timed decision</span>
        <input
          type="checkbox"
          aria-label="Timed decision"
          disabled={disabled}
          checked={!!t?.enabled}
          onChange={(e) => update((n) => {
            n.timedChoice = { seconds: DEFAULT_DECISION_SECONDS, ...n.timedChoice, enabled: e.target.checked };
          })}
        />
      </label>
      {t?.enabled && (
        <div className="field-row">
          <label data-help="How long the player has to choose. Project timing in QTE tools scales it.">
            Seconds to choose
            <input
              type="number"
              min={2}
              max={60}
              disabled={disabled}
              value={t.seconds}
              onChange={(e) => {
                const v = +e.target.value;
                if (v >= 2 && v <= 60) update((n) => { n.timedChoice!.seconds = v; });
              }}
            />
          </label>
          <label data-help="The reply taken when time runs out. If it is switched off or unavailable, the first available reply is taken.">
            When time runs out
            <select
              disabled={disabled}
              value={t.choice || ""}
              onChange={(e) => update((n) => { n.timedChoice!.choice = e.target.value || undefined; })}
            >
              <option value="">First available reply</option>
              {node.choices.map((c, i) => (
                <option key={c.id} value={c.id}>{i + 1}. {c.text}</option>
              ))}
            </select>
          </label>
        </div>
      )}
      {t?.enabled && masterOff && <p className="small muted">Timed decisions are switched off for the whole project in Settings, so this one waits for the player.</p>}
    </section>
  );
}
