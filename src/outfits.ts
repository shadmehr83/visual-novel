import type { Project } from "./model";
export function restoreSavedOutfits(target: Project, saved: Project) {
  const source = saved.scenes.find((s) => s.id === "outfit")!,
    scene = target.scenes.find((s) => s.id === "outfit");
  if (!scene)
    throw Error(
      "This project has no wardrobe scene. Add an item picker to your selected dialogue instead.",
    );
  const sourceNode = source.nodes.find((n) => n.id === "effort")!,
    node = scene.nodes.find((n) => n.id === "effort") || scene.nodes[0];
  scene.items ??= {
    enabled: true,
    title: source.items!.title,
    blur: source.items!.blur,
    options: [],
  };
  scene.items.enabled = true;
  for (const item of source.items!.options) {
    const asset = saved.assets.find((a) => a.id === item.asset);
    if (asset && !target.assets.some((a) => a.id === asset.id))
      target.assets.push(structuredClone(asset));
    const existing = scene.items.options.find((i) => i.id === item.id);
    const original = sourceNode.choices.find((c) => c.id === item.choice)!;
    let choice = node.choices.find(
      (c) => c.id === original.id || c.text === original.text,
    );
    if (!choice) {
      let destination =
        node.next ||
        node.choices[0]?.target ||
        scene.nodes.find((n) => n.id !== node.id)?.id;
      if (!destination) {
        destination = crypto.randomUUID();
        scene.nodes.push({
          id: destination,
          speaker: "Narrator",
          text: "Ready to leave.",
          choices: [],
        });
      }
      choice = {
        ...structuredClone(original),
        id: crypto.randomUUID(),
        target: destination,
      };
      for (const a of choice.actions)
        if (!(a.key in target.variables)) target.variables[a.key] = "";
      node.choices.push(choice);
      delete node.next;
    }
    if (existing) {
      if (!scene.nodes.some(n => n.choices.some(c => c.id === existing.choice))) existing.choice = choice.id;
      if (!existing.asset || !target.assets.some(a => a.id === existing.asset)) existing.asset = item.asset;
    } else scene.items.options.push({ ...structuredClone(item), choice: choice.id });
  }
  return { scene: scene.id, node: node.id };
}
