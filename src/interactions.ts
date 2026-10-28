import type { Scene, Node, Joint } from "./model";
export function deviceDialogue(scene: Scene, node: Node, visits?: string[]) {
  if (deviceScreen(scene, node, visits) !== "chat") return false;
  if (node.deviceDialogue !== undefined) return node.deviceDialogue;
  const range = scene.phone?.dialogueRange;
  if (range?.enabled) {
    const path = visits || scene.nodes.slice(0, scene.nodes.indexOf(node) + 1).map(n => n.id);
    const start = path.lastIndexOf(range.start), end = path.lastIndexOf(range.end);
    return start >= 0 && (end < start || node.id === range.end);
  }
  return [scene.phone?.contact, "You"].includes(node.speaker);
}
export function deviceScreen(scene: Scene, node: Node, visits?: string[]) {
  if (!scene.phone?.enabled) return "off";
  let path =
    visits ||
    scene.nodes.slice(0, scene.nodes.indexOf(node) + 1).map((n) => n.id);
  const schedule = scene.phone.schedule;
  if (schedule) {
    const first = path.lastIndexOf(schedule.start),
      last = path.lastIndexOf(schedule.end);
    if (first < 0 || (last >= first && node.id !== schedule.end)) return "off";
    if (!schedule.advanced) return schedule.screen;
    path = path.slice(first);
  }
  const directive = [...path]
    .reverse()
    .map((id) => scene.nodes.find((n) => n.id === id)?.deviceScreen)
    .find(Boolean);
  return (
    node.deviceScreen ||
    directive ||
    schedule?.screen ||
    (scene.phone.mode === "phone-system"
      ? scene.phone.defaultScreen || "home"
      : "chat")
  );
}
export function hingeWindow(
  joint: Joint,
  nodeId: string,
  visits: string[],
  scene: Scene,
) {
  if (!joint.range) return { visible: true, ended: false };
  const { start, end, after } = joint.range;
  const first = visits.lastIndexOf(start),
    last = visits.lastIndexOf(end);
  const ended = first >= 0 && last >= first && nodeId !== end;
  return { visible: first >= 0 && (!ended || after === "hold"), ended };
}

export function allowsReply(scene: Scene, node: Node, inPhone: boolean) {
  if (inPhone)
    return (
      (node.allowPhoneCustomResponse ?? node.allowCustomResponse) !== false
    );
  return node.allowCustomResponse !== false;
}
