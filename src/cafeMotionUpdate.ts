import { validateProject, type Project } from "./model";
export function integrateCafeMotion(
  local: Project,
  source: Project,
): Project | null {
  if (local.id !== source.id || local.contentUpdates?.includes("2.15.0"))
    return null;
  const p = structuredClone(local),
    c = p.scenes.find((s) => s.id === "cafe"),
    from = source.scenes.find((s) => s.id === "cafe");
  if (!c || !from) return null;
  for (const a of source.assets)
    if (!p.assets.some((x) => x.id === a.id)) p.assets.push(structuredClone(a));
  if (c.background === "2021e333-3387-4b6e-ad86-281b140a8cca") {
    c.background = from.background;
    c.effects = structuredClone(from.effects);
    c.transition = from.transition;
    for (const v of from.subscenes || [])
      if (!c.subscenes?.some((x) => x.id === v.id))
        (c.subscenes ??= []).push(structuredClone(v));
    for (const n of c.nodes)
      if (!n.view) n.view = from.nodes.find((x) => x.id === n.id)?.view;
  }
  const d = p.scenes.find((s) => s.id === "departure"),
    original = source.scenes.find((s) => s.id === "departure");
  if (d && original && d.background === "first-match-departure") {
    d.background = original.background;
    d.effects = structuredClone(original.effects);
  }
  (p.contentUpdates ??= []).push("2.15.0");
  return validateProject(p);
}
