import type { Project, Runtime } from "./model";
/** Reflect an edit to the currently spoken authored message without replaying choices. */
export function syncActiveDialogue(
  previous: Project,
  next: Project,
  runtime: Runtime,
): Runtime {
  const before = previous.scenes
    .find((s) => s.id === runtime.scene)
    ?.nodes.find((n) => n.id === runtime.node);
  const after = next.scenes
    .find((s) => s.id === runtime.scene)
    ?.nodes.find((n) => n.id === runtime.node);
  if (
    !before ||
    !after ||
    (before.text === after.text && before.speaker === after.speaker)
  )
    return runtime;
  const messages = runtime.phoneMessages;
  if (!messages) return runtime;
  // Only the latest exact authored line is eligible. Custom replies are history.
  let at = -1;
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (
      m.scene === runtime.scene &&
      m.node === runtime.node &&
      m.sender === before.speaker &&
      m.text === before.text
    ) {
      at = i;
      break;
    }
  }
  if (at < 0) return runtime;
  return {
    ...runtime,
    phoneMessages: messages.map((m, i) =>
      i === at ? { ...m, sender: after.speaker, text: after.text } : m,
    ),
  };
}
