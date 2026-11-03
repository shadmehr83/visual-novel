import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { useAuthorEditing, usePaused } from "./PlaySession";
import { pendingReply } from "./characterReply";
import { choiceAvailable } from "./choices";
import type { Node, Project, Runtime } from "./model";
import { autoContinuePreference, decisionTimer, estimateLines, readingSeconds, timedDecisionsPreference } from "./storyTiming";
// Story timer bar (by Claude). Plain lines move on by themselves when auto-continue is on (or the
// line has its own Auto-advance time); timed decisions take a reply when time runs out. The bar
// shows the time left without numbers: inside the dialogue box, or in the scene's lower-right
// corner while a phone or computer screen is up. It waits while the story is paused, the author
// is editing, the player is typing or a character is still answering.
export function StoryTimer({ project, node, runtime, text, corner = false, onContinue, onChoose }: {
  project: Project;
  node: Node;
  runtime: Runtime;
  text: string;
  corner?: boolean;
  onContinue: () => void;
  onChoose: (id: string) => void;
}) {
  const autoOn = useSyncExternalStore(autoContinuePreference.subscribe, () => autoContinuePreference.get(project));
  const timedOn = useSyncExternalStore(timedDecisionsPreference.subscribe, () => timedDecisionsPreference.get(project));
  const paused = usePaused(), editing = useAuthorEditing();
  const chatting = useSyncExternalStore(pendingReply.subscribe, pendingReply.get);
  const [typing, setTyping] = useState(false);
  const [lines, setLines] = useState<number | null>(null);
  const root = useRef<HTMLDivElement>(null), fill = useRef<HTMLSpanElement>(null);
  const latest = useRef({ onContinue, onChoose });
  latest.current = { onContinue, onChoose };
  // A player who turned timed decisions off gets no countdown; the reply waits for them.
  const decision = timedOn ? decisionTimer(project, node) : null;
  const replies = node.choices.filter((c) => choiceAvailable(c, runtime.values));
  const fallback = replies.find((c) => c.id === decision?.choice) || replies[0];
  const seconds = runtime.ended
    ? 0
    : decision
      ? (fallback ? decision.seconds * (project.settings.timing || 1) : 0)
      : node.choices.length || node.qte
        ? 0
        : (node.autoAdvance ?? (autoOn ? readingSeconds(text, lines ?? estimateLines(text)) : 0));
  // Lines are counted as the dialogue box shows them.
  useLayoutEffect(() => {
    if (corner) return;
    const p = root.current?.closest(".dialogue-overlay")?.querySelector<HTMLElement>(":scope > p");
    const height = parseFloat(p ? getComputedStyle(p).lineHeight : "");
    if (p && height) setLines(Math.max(1, Math.round(p.getBoundingClientRect().height / height)));
  }, [text, corner]);
  useEffect(() => {
    const focus = () => {
      const el = document.activeElement;
      setTyping(el instanceof HTMLTextAreaElement || (el instanceof HTMLInputElement && el.type === "text"));
    };
    document.addEventListener("focusin", focus);
    document.addEventListener("focusout", focus);
    return () => {
      document.removeEventListener("focusin", focus);
      document.removeEventListener("focusout", focus);
    };
  }, []);
  const restart = runtime.scene + ":" + node.id + ":" + runtime.history.length + ":" + (runtime.responses?.length || 0) + ":" + seconds;
  const held = paused || editing || typing || !!chatting;
  const elapsed = useRef(0), done = useRef("");
  useEffect(() => {
    elapsed.current = 0;
  }, [restart]);
  useEffect(() => {
    if (!seconds || held || done.current === restart) return;
    let last = performance.now(), frame = 0;
    const tick = (now: number) => {
      // A phone message still being typed holds the timer too.
      const waiting = document.hidden || (corner && !!root.current?.closest(".stage")?.querySelector(".typing-bubble"));
      if (!waiting) elapsed.current += (now - last) / 1000;
      last = now;
      const left = Math.max(0, 1 - elapsed.current / seconds);
      if (fill.current) fill.current.style.transform = `scaleX(${left})`;
      if (left > 0) {
        frame = requestAnimationFrame(tick);
        return;
      }
      done.current = restart;
      if (decision && fallback) latest.current.onChoose(fallback.id);
      else latest.current.onContinue();
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [restart, held]);
  if (!seconds) return null;
  return (
    <div
      ref={root}
      className={"story-timer" + (corner ? " story-timer-corner" : "") + (decision ? " story-timer-decision" : "") + (held ? " story-timer-held" : "")}
      role="timer"
      aria-label={decision ? "Time left to choose a reply" : "Time until the story continues"}
      data-no-advance
    >
      <span ref={fill} />
    </div>
  );
}
