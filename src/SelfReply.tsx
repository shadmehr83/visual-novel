import { useEffect, useRef, useState } from "react";
import { useStory } from "./PlaySession";
import { askCharacter, characterReplyMode, characterReplyRequest, onlinePlay, pendingReply, type CharacterReplyMode } from "./characterReply";
// Who answers here: the Claude-integrated export calls its server; the studio follows
// Assistant → Character replies; ordinary exports keep the authored story only.
function replyMode(studio: boolean): CharacterReplyMode {
  if (onlinePlay()) return "online";
  return studio && location.protocol !== "file:" ? characterReplyMode() : "off";
}
export function SelfReply({
  nodeId,
  onSend,
  choices = [],
  inChat = false,
}: {
  nodeId: string;
  onSend: (text: string, choiceId?: string, answer?: string) => void;
  choices?: { id: string; text: string }[];
  // Phone chats show the reply and the character's answer as messages with typing dots.
  inChat?: boolean;
}) {
  const story = useStory();
  const answers = replyMode(!!story?.studio) !== "off";
  const [open, setOpen] = useState(false),
    [text, setText] = useState("");
  const [branch, setBranch] = useState("");
  const [pending, setPending] = useState<{ text: string; choice?: string; speaker: string; answer?: string; error?: string } | null>(null);
  const abort = useRef<AbortController | null>(null);
  useEffect(() => {
    setOpen(false);
    setText("");
    setBranch("");
    setPending(null);
    return () => {
      abort.current?.abort();
      pendingReply.set(null);
    };
  }, [nodeId]);
  const finish = () => {
    if (!pending) return;
    onSend(pending.text, pending.choice, pending.answer);
    setPending(null);
  };
  if (pending && !inChat)
    return (
      <div className="self-reply claude-reply" data-no-advance aria-live="polite">
        <p className="claude-reply-you"><b>You:</b> {pending.text}</p>
        {pending.answer ? (
          <p className="claude-reply-answer"><b>{pending.speaker}:</b> {pending.answer}</p>
        ) : pending.error ? (
          <p role="alert">{pending.error}</p>
        ) : (
          <p className="claude-reply-thinking">{pending.speaker} is typing…</p>
        )}
        <button
          type="button"
          autoFocus={!!(pending.answer || pending.error)}
          data-help="Record your reply and continue with the next authored line. The character's answer never changes the story route."
          onClick={() => { abort.current?.abort(); finish(); }}
        >
          {pending.answer || pending.error ? "Continue story" : "Skip and continue"}
        </button>
      </div>
    );
  if (pending) return null;
  return (
    <div className="self-reply">
      <button type="button" aria-expanded={open} onClick={() => setOpen(!open)}>
        Self-reply
      </button>
      {open && (
        <form
          className="custom-response"
          onSubmit={async (e) => {
            e.preventDefault();
            const reply = text.trim();
            if (!reply) return;
            const choice = choices.length ? branch || choices[0].id : undefined;
            const mode = replyMode(!!story?.studio);
            const request = mode !== "off" && story ? characterReplyRequest(story.project, story.runtime, reply, choice) : null;
            setText("");
            setOpen(false);
            if (!request || !story) return onSend(reply, choice);
            request.chat = inChat;
            setPending({ text: reply, choice, speaker: request.speaker });
            if (inChat) pendingReply.set({ scene: story.runtime.scene, node: story.runtime.node, text: reply, speaker: request.speaker });
            abort.current = new AbortController();
            let answer: string | undefined, error: string | undefined;
            try {
              answer = await askCharacter(request, mode, abort.current.signal);
            } catch (err) {
              if (abort.current.signal.aborted) return;
              error = (err as Error).message || "The character could not answer right now.";
            }
            if (inChat) {
              // In a chat the conversation simply flows on: the answer arrives as a message.
              pendingReply.set(null);
              setPending(null);
              onSend(reply, choice, answer);
            } else setPending((p) => p && { ...p, answer, error });
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
              ? "The character answers you, then the story follows the chosen path."
              : "Saved in this playthrough. Continues the authored story; no automatic AI response."}
          </small>
        </form>
      )}
    </div>
  );
}
