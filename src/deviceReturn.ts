import type { Scene, Node, Runtime } from "./model";
export function canPutAway(scene: Scene, node: Node, visits?: string[]) {
  if (node.deviceReturn !== undefined) return node.deviceReturn;
  const range = scene.phone?.returnControl;
  if (!range?.enabled) return false;
  const path = visits || scene.nodes.slice(0, scene.nodes.indexOf(node) + 1).map(n => n.id);
  const start = path.lastIndexOf(range.start), end = path.lastIndexOf(range.end);
  return start >= 0 && (end < start || node.id === range.end);
}
export function returnDestination(scene: Scene, node: Node, runtime: Runtime) {
  if (scene.phone?.returnControl?.target) return scene.phone.returnControl.target;
  return [...(runtime.nodeVisits || [])].reverse().find(v => v.scene === scene.id && v.node !== node.id && scene.nodes.some(n => n.id === v.node && n.choices.length))?.node;
}
