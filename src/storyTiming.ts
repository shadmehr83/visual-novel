import type { Node, Project, Scene } from "./model";
// Story timers (by Claude): auto-continue for plain lines and timed decisions for reply lines.
// Auto-continue reading time: under 10 words 3 s, one line 4 s, two lines 8 s, then 4 s per line.
export const countWords = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;
// Lines the text fills in the dialogue box; measured on screen when possible, otherwise estimated.
export const estimateLines = (text: string) => Math.max(1, Math.ceil(text.trim().length / 70));
export function readingSeconds(text: string, lines = estimateLines(text)) {
  if (countWords(text) < 10) return 3;
  return 4 * Math.max(1, Math.round(lines));
}
export const DEFAULT_DECISION_SECONDS = 8;
// A reply line counts down only when its own switch and the project's master switch are on.
export function decisionTimer(project: Project, node: Node) {
  const t = node.timedChoice;
  if (!t?.enabled || project.settings.timedDecisions === false || !node.choices.length) return null;
  return t;
}

// Whether a line's timer runs and whether its bar shows. A dialogue's own switch wins, then the
// scene's dialogue range (counted along the path played, like the texting range), then the scene.
export function timerRule(scene: Scene, node: Node, visits?: string[]) {
  const t = scene.storyTimers;
  const range = t?.range;
  let inRange = false;
  if (range?.enabled) {
    const path = visits?.length ? visits : scene.nodes.slice(0, scene.nodes.indexOf(node) + 1).map((n) => n.id);
    const start = path.lastIndexOf(range.start), end = path.lastIndexOf(range.end);
    inRange = start >= 0 && (end < start || node.id === range.end);
  }
  const off = node.timerOff ?? (!!t?.off || (inRange && range!.effect === "off"));
  const hidden = node.timerHidden ?? (!!t?.hidden || (inRange && range!.effect === "hidden"));
  return { off, hidden, inRange };
}

// The player's own timer choices for one game, kept in this browser. Without one, the author's
// default applies (Settings → Auto-continue dialogue by default; timed decisions start on).
const listeners = new Set<() => void>();
function playerPreference(name: string, fallback: (project: Project) => boolean) {
  const key = (project: Project) => "stillframe-" + name + ":" + project.id;
  return {
    get(project: Project): boolean {
      try {
        const saved = localStorage.getItem(key(project));
        if (saved === "on" || saved === "off") return saved === "on";
      } catch {
        /* falls back to the author's default */
      }
      return fallback(project);
    },
    set(project: Project, on: boolean) {
      try {
        localStorage.setItem(key(project), on ? "on" : "off");
      } catch {
        /* this page only */
      }
      listeners.forEach((l) => l());
    },
    subscribe(l: () => void) {
      listeners.add(l);
      return () => {
        listeners.delete(l);
      };
    },
  };
}
export const autoContinuePreference = playerPreference("auto-continue", (project) => !!project.settings.autoContinue);
export const timedDecisionsPreference = playerPreference("timed-decisions", () => true);
// Whether the story has any decision that would count down, so players are only asked when it matters.
export const hasTimedDecisions = (project: Project) =>
  project.scenes.some((s) => s.nodes.some((n) => decisionTimer(project, n) && !timerRule(s, n).off));
