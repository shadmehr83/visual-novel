import { useEffect, useRef, useState } from "react";
import { useStory } from "./PlaySession";
import { askCharacter, characterReplyMode, characterReplyRequest } from "./characterReply";
import { ClaudeMark } from "./ClaudeMark";
export function SelfReply({
  nodeId,
  onSend,
  choices = [],
}: {
  nodeId: string;
  onSend: (text: string, choiceId?: string) => void;
  choices?: { id: string; text: string }[];
}) {
  const story = useStory();
  // Characters answer automatically in the studio; Assistant → Character replies chooses who answers.
  const canAsk = !!story?.studio && location.protocol !== "file:";
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
    return () => abort.current?.abort();
  }, [nodeId]);
  const finish = () => {
    if (!pending) return;
    onSend(pending.text, pending.choice);
    setPending(null);
  };
  if (pending)
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
        <div className="claude-reply-actions">
          <button
            type="button"
            autoFocus={!!(pending.answer || pending.error)}
            data-help="Record your reply and continue with the next authored line. The character's AI answer never changes the story route."
            onClick={() => { abort.current?.abort(); finish(); }}
          >
            {pending.answer || pending.error ? "Continue story" : "Skip and continue"}
          </button>
          <ClaudeMark help="This answer was written live by Claude in the speaker's voice. It is not saved to the project and never changes the story route." />
        </div>
      </div>
    );
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
            const mode = characterReplyMode();
            const request = canAsk && mode !== "off" && story ? characterReplyRequest(story.project, story.runtime, reply) : null;
            setText("");
            setOpen(false);
            if (!request) return onSend(reply, choice);
            setPending({ text: reply, choice, speaker: request.speaker });
            abort.current = new AbortController();
            try {
              const answer = await askCharacter(request, mode, abort.current.signal);
              setPending((p) => p && { ...p, answer });
            } catch (err) {
              if (abort.current.signal.aborted) return;
              setPending((p) => p && { ...p, error: (err as Error).message || "Claude could not answer right now." });
            }
          }}
        >
          {choices.length > 0 && (
            <label>
              Follow this authored path
              <select
                aria-label="Custom reply path"
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
            {canAsk && characterReplyMode() !== "off"
              ? "The character answers you, then the authored story continues."
              : "Saved in this playthrough. Continues the authored story; no automatic AI response."}
          </small>
        </form>
      )}
    </div>
  );
}
