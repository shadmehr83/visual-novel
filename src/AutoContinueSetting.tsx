import { useSyncExternalStore } from "react";
import type { Project } from "./model";
import { autoContinuePreference } from "./storyTiming";
// Pause menu switch (by Claude): the player turns auto-continue on or off for this game in this browser.
export function AutoContinueSetting({ project }: { project: Project }) {
  const on = useSyncExternalStore(autoContinuePreference.subscribe, () => autoContinuePreference.get(project));
  return (
    <label className="auto-continue-setting" data-help="When on, lines without replies move on by themselves after a short reading time, shown as a bar in the dialogue box (or the corner while a phone is up). Timed decisions are set by the author and stay as they are.">
      <input type="checkbox" aria-label="Auto-continue dialogue" checked={on} onChange={(e) => autoContinuePreference.set(project, e.target.checked)} />
      Auto-continue dialogue
    </label>
  );
}
