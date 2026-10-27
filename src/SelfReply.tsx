import { useEffect, useState } from "react";
export function SelfReply({
  nodeId,
  onSend,
  choices = [],
}: {
  nodeId: string;
  onSend: (text: string, choiceId?: string) => void;
  choices?: { id: string; text: string }[];
}) {
  const [open, setOpen] = useState(false),
    [text, setText] = useState("");
  const [branch, setBranch] = useState("");
  useEffect(() => {
    setOpen(false);
    setText("");
    setBranch("");
  }, [nodeId]);
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
            if (text.trim()) {
              onSend(
                text.trim(),
                choices.length ? branch || choices[0].id : undefined,
              );
              setText("");
              setOpen(false);
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
            Saved in this playthrough. Continues the authored story; no
            automatic AI response.
          </small>
        </form>
      )}
    </div>
  );
}
