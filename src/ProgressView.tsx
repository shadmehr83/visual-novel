import type { Project, Runtime } from "./model";
export function ProgressView({project, runtime}: {project: Project; runtime: Runtime}) {
  const visits = runtime.nodeVisits || [{scene:runtime.scene,node:runtime.node}];
  return <section className="player-progress" aria-label="Current story progress">
    <p>Your route so far. Highlighted lines were visited; question marks hide unexplored paths. This view cannot change your story.</p>
    <ol className="progress-route">
      {visits.map((visit, i) => {
        const scene = project.scenes.find(s => s.id === visit.scene), node = scene?.nodes.find(n => n.id === visit.node);
        if (!scene || !node) return null;
        const memory = runtime.memories?.filter(m => m.scene === scene.id && m.node === node.id);
        const choices = node.choices.map(c => ({id:c.id, chosen:memory?.some(m => m.choice === c.text), text:c.text}));
        const current = i === visits.length-1;
        return <li key={i} className={"visited-progress" + (current ? " current-progress" : "")} aria-current={current ? "step" : undefined}>
          <small>{scene.title} · Dialogue {scene.nodes.indexOf(node)+1}{current ? " · You are here" : ""}</small>
          <b>{node.speaker}</b><p>{node.text}</p>
          {choices.length > 0 && <ul className="progress-branches">{choices.map(c => <li key={c.id} className={c.chosen ? "chosen-progress" : "unknown-progress"}>{c.chosen ? "✓ " + c.text : "? Unexplored path"}</li>)}</ul>}
        </li>;
      })}
    </ol>
    {!runtime.ended && <p className="unknown-progress">? The rest of your story is still undiscovered.</p>}
  </section>;
}
