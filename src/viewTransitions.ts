import type { Scene } from "./model";
export function viewKey(scene: Scene, nodeId?: string) {
  return (
    scene.id + ":" + (scene.nodes.find((n) => n.id === nodeId)?.view || "main")
  );
}
export function viewTransition(
  scene: Scene,
  nodeId?: string,
  previous?: Scene,
  previousNode?: string,
): Scene["transition"] {
  const node = scene.nodes.find((n) => n.id === nodeId),
    view = scene.subscenes?.find((v) => v.id === node?.view);
  if (node?.viewTransition) return node.viewTransition;
  if (previous && previous.id !== scene.id)
    return previous.exitTransition || view?.transition || scene.transition;
  if (previous && viewKey(previous, previousNode) === viewKey(scene, nodeId))
    return undefined;
  return (
    view?.transition ||
    (previous?.id === scene.id
      ? scene.returnTransition || { style: "smooth", seconds: 0.45 }
      : scene.transition)
  );
}
