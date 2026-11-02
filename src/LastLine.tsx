import { useEffect, useState } from "react";
import { shownText, type Project, type Runtime } from "./model";

// A faint, optional reminder of what was said just before a choice (by Claude).
export function lastLine(project: Project, runtime: Runtime | null | undefined) {
  if (!runtime) return null;
  const visits = runtime.nodeVisits || [];
  const prev = [...visits].reverse().find((v) => !(v.scene === runtime.scene && v.node === runtime.node));
  if (!prev) return null;
  // A free conversation's last message is the freshest thing said.
  const reply = runtime.responses?.at(-1);
  if (reply && reply.scene === prev.scene && reply.node === prev.node && reply.thread?.length) {
    const m = reply.thread.at(-1)!;
    return { speaker: m.sender, text: m.text };
  }
  const scene = project.scenes.find((s) => s.id === prev.scene);
  const node = scene?.nodes.find((n) => n.id === prev.node);
  if (!scene || !node || !node.text.trim()) return null;
  return { speaker: node.speaker, text: shownText(runtime, scene.id, node) };
}
export function LastLine({ project, runtime }: { project: Project; runtime: Runtime | null | undefined }) {
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [runtime?.scene, runtime?.node]);
  const line = lastLine(project, runtime);
  if (!line) return null;
  return (
    <div className="last-line" data-no-advance>
      <button
        type="button"
        aria-expanded={open}
        data-help="Show the line said just before this one, so you remember what you are answering."
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
      >
        {open ? "Hide last line" : "↶ Last line"}
      </button>
      {open && <p><b>{line.speaker}:</b> {line.text}</p>}
    </div>
  );
}
