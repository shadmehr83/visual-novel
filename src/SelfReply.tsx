import { useEffect, useRef, useState } from "react";
import { useStory } from "./PlaySession";
import { respond } from "./model";
import {
  aiLog, askCharacter, askRewrite, characterReplyMode, characterReplyRequest, chatStore, keepRewrites, onlinePlay,
  pendingReply, playthroughId, upcomingLines,
  type CharacterReplyMode, type CharacterReplyRequest, type ReplyThread, type Rewrite,
} from "./characterReply";
// Who answers here: the Claude edition and play link call their server; the studio follows
// Assistant → Character replies; ordinary exports keep the authored story only.
function replyMode(studio: boolean): CharacterReplyMode {
  if (onlinePlay()) return "online";
  return studio && location.protocol !== "file:" ? characterReplyMode() : "off";
}
type Conversation = { first: string; choice?: string; speaker: string; messages: ReplyThread; turn: number; typing: boolean; error?: string };
type Base = { request: CharacterReplyRequest; mode: CharacterReplyMode };
export function SelfReply({
  nodeId,
  onSend,
  choices = [],
  inChat = false,
}: {
  nodeId: string;
  // `thread` holds the character's answers and any further texts after the first reply;
  // `rewrites` are the next authored lines rephrased to follow on from that conversation.
  onSend: (text: string, choiceId?: string, thread?: ReplyThread, rewrites?: Rewrite[]) => void;
  choices?: { id: string; text: string }[];
  // Phone chats show the conversation as messages with typing dots.
  inChat?: boolean;
}) {
  const story = useStory();
  const key = (story?.runtime.scene || "") + ":" + nodeId;
  const answers = replyMode(!!story?.studio) !== "off";
  const [open, setOpen] = useState(false),
    [text, setText] = useState("");
  const [branch, setBranch] = useState("");
  const [convo, setConvo] = useState<Conversation | null>(null);
  const base = useRef<Base | null>(null);
  const mounted = useRef(true);
  const sendRef = useRef(onSend);
  sendRef.current = onSend;
  // A conversation in progress is kept outside the component, so opening the pause menu or another
  // workspace and coming back restores it; answers that arrive meanwhile are kept too.
  useEffect(() => {
    mounted.current = true;
    setOpen(false);
    setText("");
    setBranch("");
    const saved = chatStore.get(key);
    base.current = (saved?.base as Base) || null;
    const restored = (saved?.convo as Conversation) || null;
    setConvo(restored);
    if (inChat && story && restored) pendingReply.set({ scene: story.runtime.scene, node: nodeId, messages: restored.messages, typing: restored.typing });
    if (saved?.finished && restored) void finish(restored);
    return () => {
      mounted.current = false;
    };
  }, [key]);
  const show = (c: Conversation | null) => {
    if (c) chatStore.set({ key, convo: c, base: base.current });
    if (mounted.current) setConvo(c);
    if (inChat && story) pendingReply.set(c && { scene: story.runtime.scene, node: nodeId, messages: c.messages, typing: c.typing });
  };
  // Hand back to the story. Before that, the next authored lines are rephrased to follow on from the
  // conversation (same meaning, information and branches), while the character still shows as typing.
  async function finish(c: Conversation) {
    const start = base.current;
    let rewrites: Rewrite[] = [];
    if (start && story && c.messages.length > 1) {
      show({ ...c, typing: true });
      try {
        const after = respond(story.project, story.runtime, c.first, c.choice, c.messages.slice(1));
        const upcoming = upcomingLines(story.project, after);
        if (upcoming.length) {
          const conversation = [
            ...start.request.recent,
            { speaker: c.speaker, text: start.request.line },
            ...c.messages.map((m) => ({ speaker: m.sender === "You" ? "Player" : c.speaker, text: m.text })),
          ].slice(-40);
          const result = await askRewrite({ storyTitle: start.request.storyTitle, sceneTitle: start.request.sceneTitle, speaker: c.speaker, characterNotes: start.request.characterNotes, conversation, upcoming }, start.mode);
          rewrites = keepRewrites(after.scene, upcoming, result);
          aiLog.add({ time: new Date().toISOString(), playthrough: playthroughId, mode: start.mode, story: story.project.title, scene: after.scene, node: after.node, line: upcoming.map((u) => u.text).join(" / "), turn: c.turn, player: "(script adapted)", answer: rewrites.map((w) => w.text + (w.choices ? " [" + w.choices.map((x) => x.text).join(" | ") + "]" : "")).join(" / ") || "(unchanged)", ms: 0, choicesSoFar: story.runtime.choices.slice(-20) });
        }
      } catch {
        // The authored lines are always a valid fallback.
      }
    }
    chatStore.delete(key);
    pendingReply.set(null);
    if (mounted.current) setConvo(null);
    sendRef.current(c.first, c.choice, c.messages.slice(1), rewrites);
  }
  // One free turn: the character answers, then either the story resumes or the player may text again.
  async function turn(c: Conversation) {
    const start = base.current;
    if (!start || !story) return;
    show({ ...c, typing: true, error: undefined });
    const request: CharacterReplyRequest = {
      ...start.request,
      thread: c.messages.slice(1).map((m) => ({ speaker: m.sender === "You" ? "Player" : c.speaker, text: m.text })),
      turn: c.turn,
    };
    const player = c.messages.at(-1)!.text;
    const began = performance.now();
    const log = { time: new Date().toISOString(), playthrough: playthroughId, mode: start.mode, story: story.project.title, scene: story.runtime.scene, node: story.runtime.node, line: start.request.line, chosenPath: start.request.chosenPath, turn: c.turn, player, choicesSoFar: story.runtime.choices.slice(-20) };
    try {
      // One quiet retry covers an occasional failed answer before the player sees an error.
      const answer = await askCharacter(request, start.mode).catch(() => askCharacter(request, start.mode));
      aiLog.add({ ...log, answer: answer.text, advance: answer.advance, ms: Math.round(performance.now() - began) });
      // When the character moves the story on, their answer stands in for the next authored line.
      const next = { ...c, typing: false, messages: [...c.messages, { sender: c.speaker, text: answer.text, ...(answer.advance ? { bridge: true } : {}) }] };
      if (!answer.advance) return show(next);
      if (mounted.current) return void finish(next);
      // Left the chat meanwhile: finish when it is shown again.
      chatStore.set({ key, convo: next, base: start, finished: true });
    } catch (err) {
      const error = (err as Error).message || "The character could not answer right now.";
      aiLog.add({ ...log, error, ms: Math.round(performance.now() - began) });
      show({ ...c, typing: false, error });
    }
  }
  if (convo) {
    if (convo.typing) return inChat ? null : (
      <div className="self-reply claude-reply" data-no-advance aria-live="polite">
        {convo.messages.map((m, i) => <p key={i} className={m.sender === "You" ? "claude-reply-you" : "claude-reply-answer"}><b>{m.sender}:</b> {m.text}</p>)}
        <p className="claude-reply-thinking">{convo.speaker} is typing…</p>
      </div>
    );
    return (
      <div className={"self-reply" + (inChat ? " chat-followup" : " claude-reply")} data-no-advance aria-live="polite">
        {!inChat && convo.messages.map((m, i) => <p key={i} className={m.sender === "You" ? "claude-reply-you" : "claude-reply-answer"}><b>{m.sender}:</b> {m.text}</p>)}
        {convo.error && <p role="alert" className="small">{convo.error}</p>}
        {!convo.error && (
          <form
            className="custom-response"
            onSubmit={(e) => {
              e.preventDefault();
              const reply = text.trim();
              if (!reply) return;
              setText("");
              void turn({ ...convo, turn: convo.turn + 1, messages: [...convo.messages, { sender: "You", text: reply }] });
            }}
          >
            <input
              autoFocus
              aria-label="Keep texting"
              value={text}
              maxLength={1000}
              onChange={(e) => setText(e.target.value)}
              placeholder={`Reply to ${convo.speaker}…`}
            />
            <button disabled={!text.trim()}>Send</button>
          </form>
        )}
        <button
          type="button"
          autoFocus={!!convo.error}
          data-help="Leave the free conversation and continue with the next authored line on your chosen path."
          onClick={() => void finish(convo)}
        >
          Continue story
        </button>
      </div>
    );
  }
  return (
    <div className="self-reply">
      <button type="button" aria-expanded={open} onClick={() => setOpen(!open)}>
        Self-reply
      </button>
      {open && (
        <form
          className="custom-response"
          onSubmit={(e) => {
            e.preventDefault();
            const reply = text.trim();
            if (!reply) return;
            const choice = choices.length ? branch || choices[0].id : undefined;
            const mode = replyMode(!!story?.studio);
            const request = mode !== "off" && story ? characterReplyRequest(story.project, story.runtime, reply, choice) : null;
            setText("");
            setOpen(false);
            if (!request) return onSend(reply, choice);
            request.chat = inChat;
            base.current = { request, mode };
            void turn({ first: reply, choice, speaker: request.speaker, messages: [{ sender: "You", text: reply }], turn: 1, typing: true });
          }}
        >
          {choices.length > 0 && (
            <label>
              Follow this authored path
              <select
                aria-label="Custom reply path"
                data-help="Your own words are read with this reply's intent and consequence, then the story follows this authored path."
                value={branch || choices[0].id}
                onChange={(e) => setBranch(e.target.value)}
              >
                {choices.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.text}
                  </option>
                ))}
              </select>
            </label>
          )}
          <input
            autoFocus
            aria-label="Custom dialogue response"
            value={text}
            maxLength={1000}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write your own response…"
          />
          <button disabled={!text.trim()}>Send response</button>
          <small>
            {answers
              ? "The character answers you. Keep texting a little, then the story returns to the chosen path."
              : "Saved in this playthrough. Continues the authored story; no automatic AI response."}
          </small>
        </form>
      )}
    </div>
  );
}
