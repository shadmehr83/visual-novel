import { expect, it } from "vitest";
import { savedProject } from "./savedProject";
import { advance, start, type Runtime } from "./model";
import { choiceAvailable } from "./choices";

// Story check (by Claude): plays every reachable branch of the published project through the real
// engine, so broken links, dead ends and unreachable lines show up as test output.
it("plays every branch of the published story without errors or dead ends", () => {
  const p = savedProject();
  const seen = new Set<string>(), reached = new Set<string>(), endings = new Map<string, number>();
  const errors: string[] = [];
  // Only variables that a reply depends on can change where the story goes.
  const gates = [...new Set(p.scenes.flatMap((s) => s.nodes.flatMap((n) => n.choices.flatMap((c) => (c.condition ? [c.condition.key] : [])))))];
  const key = (r: Runtime) => `${r.scene}|${r.node}|${gates.map((g) => r.values[g]).join(",")}|${r.ended}`;
  const queue: Runtime[] = [start(p)];
  let steps = 0;
  while (queue.length && steps < 200000) {
    const r = queue.shift()!;
    steps++;
    if (seen.has(key(r))) continue;
    seen.add(key(r));
    reached.add(r.scene + "|" + r.node);
    if (r.ended) {
      endings.set(r.scene + "|" + r.node, (endings.get(r.scene + "|" + r.node) || 0) + 1);
      continue;
    }
    const scene = p.scenes.find((s) => s.id === r.scene);
    const node = scene?.nodes.find((n) => n.id === r.node);
    if (!scene || !node) { errors.push(`Missing ${r.scene}/${r.node}`); continue; }
    try {
      if (node.qte) {
        // Timed actions branch to success or timeout.
        for (const outcome of [node.qte.success, node.qte.timeout]) queue.push({ ...r, node: outcome });
      } else if (node.choices.length) {
        const open = node.choices.filter((c) => choiceAvailable(c, r.values));
        if (!open.length) errors.push(`No available reply at ${scene.title} · "${node.text.slice(0, 50)}"`);
        for (const c of open) queue.push(advance(p, r, c.id));
      } else queue.push(advance(p, r));
    } catch (e) {
      errors.push(`${scene.title} · "${node.text.slice(0, 50)}": ${(e as Error).message}`);
    }
  }
  const unreachable = p.scenes.flatMap((s) => s.nodes.filter((n) => !n.disabled && !reached.has(s.id + "|" + n.id)).map((n) => `${s.title} · ${s.nodes.indexOf(n) + 1}: ${n.text.slice(0, 50)}`));
  console.info(`Story check: ${steps} states, ${reached.size} lines reached, ${endings.size} endings, ${unreachable.length} unreachable lines.`);
  if (unreachable.length) console.info("Unreachable lines:\n" + unreachable.join("\n"));
  console.info("Endings:\n" + [...endings.keys()].map((k) => { const [s, n] = k.split("|"); const sc = p.scenes.find((x) => x.id === s)!; return `${sc.title} · ${sc.nodes.find((x) => x.id === n)?.text.slice(0, 60)}`; }).join("\n"));
  expect(errors).toEqual([]);
  expect(unreachable).toEqual([]);
  expect(endings.size).toBeGreaterThan(0);
});
