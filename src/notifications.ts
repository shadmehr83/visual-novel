import { advance, type Project, type Runtime } from "./model";
export function openNotification(project: Project, runtime: Runtime) {
  const s = project.scenes.find(s => s.id === runtime.scene)!;
  const n = s.nodes.find(n => n.id === runtime.node)!;
  const open = (node: typeof n) => node.choices.find(c => /open|read.*message/i.test(c.text) && (!c.condition || runtime.values[c.condition.key] === c.condition.equals));
  const direct = open(n);
  if (direct) return advance(project, runtime, direct.id);
  if (!n.choices.length && n.next) {
    const next = s.nodes.find(v => v.id === n.next);
    const choice = next && open(next);
    if (choice) return advance(project, advance(project, runtime), choice.id);
  }
  return runtime;
}
