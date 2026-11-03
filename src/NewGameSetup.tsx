import { useSyncExternalStore } from "react";
import type { Project } from "./model";
import { autoContinuePreference, hasTimedDecisions, timedDecisionsPreference } from "./storyTiming";
type Mode = "continue" | "enter" | "screen";
// New game settings (by Claude): after Start new game, the player picks how the story moves on and
// whether it is timed. Choices apply at once and stay changeable from the pause menu's Settings.
export function NewGameSetup({ project, mobile, mode, onMode, onBegin, onBack }: {
  project: Project;
  mobile: boolean;
  mode: Mode;
  onMode: (mode: Mode) => void;
  onBegin: () => void;
  onBack: () => void;
}) {
  const auto = useSyncExternalStore(autoContinuePreference.subscribe, () => autoContinuePreference.get(project));
  const timed = useSyncExternalStore(timedDecisionsPreference.subscribe, () => timedDecisionsPreference.get(project));
  const modes: [Mode, string, string][] = [
    ["continue", "Press Continue on the screen", "A Continue button sits under each line."],
    ...(mobile ? [] : [["enter", "Press Enter", "Use the keyboard to move to the next line."] as [Mode, string, string]]),
    ["screen", mobile ? "Tap the scene" : "Click the scene", (mobile ? "Tap" : "Click") + " anywhere on the picture to move on."],
  ];
  const option = (name: string, checked: boolean, onPick: () => void, label: string, help: string) => (
    <label className={"setup-option" + (checked ? " picked" : "")} key={label}>
      <input type="radio" name={name} checked={checked} onChange={onPick} />
      <span><b>{label}</b><small>{help}</small></span>
    </label>
  );
  return (
    <main className="player-title new-game-setup">
      <h1>{project.title}</h1>
      <section aria-label="New game settings">
        <h2>Before you start</h2>
        <fieldset>
          <legend>How do you want to move the story on?</legend>
          {modes.map(([value, label, help]) => option("advance", mode === value, () => onMode(value), label, help))}
        </fieldset>
        <fieldset>
          <legend>Would you like the dialogue to be timed?</legend>
          {option("timed-dialogue", auto, () => autoContinuePreference.set(project, true), "Yes, move on by itself", "Each line continues after a short reading time, shown as a draining bar.")}
          {option("timed-dialogue", !auto, () => autoContinuePreference.set(project, false), "No, wait for me", "The story waits until you continue.")}
        </fieldset>
        {hasTimedDecisions(project) && <fieldset>
          <legend>Should decisions have a time limit?</legend>
          {option("timed-decisions", timed, () => timedDecisionsPreference.set(project, true), "Yes, keep the pressure on", "Some choices must be made before the bar runs out, or one is picked for you.")}
          {option("timed-decisions", !timed, () => timedDecisionsPreference.set(project, false), "No, let me take my time", "Every choice waits for you.")}
        </fieldset>}
        <p className="setup-note">You can change these settings anytime during the game: open the Pause menu, go to Settings and turn them on or off.</p>
        <div className="setup-actions">
          <button onClick={onBack} data-help="Go back to the title screen without starting.">Back</button>
          <button autoFocus onClick={onBegin} data-help="Begin the story from its opening with these settings.">Start the story</button>
        </div>
      </section>
    </main>
  );
}
