import { useSyncExternalStore } from "react";
import type { Project } from "./model";
import { autoContinuePreference, hasTimedDecisions, timedDecisionsPreference } from "./storyTiming";
// Pause menu switch (by Claude): the player turns auto-continue on or off for this game in this browser.
export function AutoContinueSetting({ project }: { project: Project }) {
  const on = useSyncExternalStore(autoContinuePreference.subscribe, () => autoContinuePreference.get(project));
  return (
    <label className="auto-continue-setting" data-help="When on, lines without replies move on by themselves after a short reading time, shown as a bar in the dialogue box (or the corner while a phone is up).">
      <input type="checkbox" aria-label="Auto-continue dialogue" checked={on} onChange={(e) => autoContinuePreference.set(project, e.target.checked)} />
      Auto-continue dialogue
    </label>
  );
}
// Pause menu switch (by Claude): shown only when the story has decisions that count down.
export function TimedDecisionsSetting({ project }: { project: Project }) {
  const on = useSyncExternalStore(timedDecisionsPreference.subscribe, () => timedDecisionsPreference.get(project));
  if (!hasTimedDecisions(project)) return null;
  return (
    <label className="auto-continue-setting" data-help="When on, some decisions have a time limit shown as a draining bar, and a reply is picked for you when it runs out. Turn off to take as long as you like.">
      <input type="checkbox" aria-label="Timed decisions" checked={on} onChange={(e) => timedDecisionsPreference.set(project, e.target.checked)} />
      Timed decisions
    </label>
  );
}
