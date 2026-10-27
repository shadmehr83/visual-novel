import type { Scene, Node, Joint } from "./model";
export function deviceScreen(scene: Scene, node: Node, visits?: string[]) {
  if (!scene.phone?.enabled) return "off";
  const path =
    visits ||
    scene.nodes.slice(0, scene.nodes.indexOf(node) + 1).map((n) => n.id);
  const directive = [...path]
    .reverse()
    .map((id) => scene.nodes.find((n) => n.id === id)?.deviceScreen)
    .find(Boolean);
  return (
    node.deviceScreen ||
    directive ||
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
