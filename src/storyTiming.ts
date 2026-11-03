import type { Node, Project } from "./model";
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

// The player's auto-continue choice for one game, kept in this browser. Without one, the
// author's default (Settings → Auto-continue dialogue by default) applies.
const key = (project: Project) => "stillframe-auto-continue:" + project.id;
const listeners = new Set<() => void>();
export const autoContinuePreference = {
  get(project: Project): boolean {
    try {
      const saved = localStorage.getItem(key(project));
      if (saved === "on" || saved === "off") return saved === "on";
    } catch {
      /* falls back to the author's default */
    }
    return !!project.settings.autoContinue;
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
