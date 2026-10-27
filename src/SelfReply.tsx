import { useEffect, useState } from "react";
export function SelfReply({
  nodeId,
  onSend,
}: {
  nodeId: string;
  onSend: (text: string) => void;
}) {
  const [open, setOpen] = useState(false),
    [text, setText] = useState("");
  useEffect(() => {
    setOpen(false);
    setText("");
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
              onSend(text.trim());
              setText("");
              setOpen(false);
            }
          }}
        >
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
