import { choiceAvailable } from "./choices";
import { useEffect, useState } from "react";
import type { Project, Scene, Node, Runtime } from "./model";
import { useSound } from "./Sound";
import { SelfReply } from "./SelfReply";
export function selectedItem(scene: Scene, node: Node) {
  return scene.items?.showSelected ? scene.items.options.find(item => scene.nodes.some(n => n.choices.some(c => c.id === item.choice && c.target === node.id))) : undefined;
}
export function hasItemUI(scene: Scene, node: Node) {
  return !!scene.items?.enabled && (!!selectedItem(scene, node) || scene.items.options.some(i => node.choices.some(c => c.id === i.choice)));
}
export function ItemOverlay({
  project,
  scene,
  node,
  runtime,
  onStep,
  onReply,
}: {
  project: Project;
  scene: Scene;
  node: Node;
  runtime: Runtime | null;
  onStep: (id?: string) => void;
  onReply?: (text: string, branch?: string) => void;
}) {
  const sound = useSound();
  const [selected, setSelected] = useState<string | null>(null);
  useEffect(() => setSelected(null), [node.id]);
  const options =
    scene.items?.options.filter((item) =>
      node.choices.some(
        (c) =>
          c.id === item.choice &&
          choiceAvailable(c, runtime?.values),
      ),
    ) || [];
  const current = options.find((x) => x.id === selected);
  const picture = (id: string | null) =>
    project.assets.find((a) => a.id === id)?.data;
  const outcome = selectedItem(scene, node);
  if (scene.items?.enabled && outcome) return <section className="item-overlay" aria-label="Selected outfit">
    <h2>{outcome.label}</h2><p className="item-original-text">{node.text}</p>
    <div className="item-detail">
      {picture(outcome.asset) && <img src={picture(outcome.asset)} alt={outcome.label} />}
      <p>{outcome.description}</p>
      {node.choices.length ? node.choices.filter(c => choiceAvailable(c, runtime?.values)).map(c => <button key={c.id} onClick={() => onStep(c.id)}>{c.text}</button>) : <button onClick={() => onStep()}>Continue</button>}
      {onReply && node.allowCustomResponse !== false && (!node.choices.length || node.choices.some(c => choiceAvailable(c, runtime?.values))) && <SelfReply choices={node.choices.filter(c => choiceAvailable(c, runtime?.values))} nodeId={node.id} onSend={onReply} />}
    </div>
  </section>;
  if (!scene.items?.enabled) return null;
  if (!options.length) return <section className="item-overlay"><p>{node.text}</p><p role="status">No items are currently available.</p></section>;
  const playCue = (cue?: {asset: string; volume: number}) => sound.play(project.audioAssets?.find(a => a.id === cue?.asset)?.data, cue?.volume);
  return (
    <section className="item-overlay" aria-label="Item selection">
      <h2>{scene.items.title}</h2>
      <p className="item-original-text">{node.text}</p>
      {current ? (
        <div className="item-detail">
          {picture(current.asset) && (
            <img src={picture(current.asset)} alt={current.label} />
          )}
          <h3>{current.label}</h3>
          <p>{current.description}</p>
          <button onClick={() => { playCue(scene.items?.chooseSound); onStep(current.choice); }}>
            Choose {current.label}
          </button>
          <button onClick={() => setSelected(null)}>See other options</button>
        </div>
      ) : (
        <div className="item-grid">
          {options.map((item) => (
            <button key={item.id} onClick={() => { playCue(scene.items?.inspectSound); setSelected(item.id); }}>
              {picture(item.asset) ? (
                <img src={picture(item.asset)} alt="" />
              ) : (
                <span className="item-placeholder">◇</span>
              )}
              <b>{item.label}</b>
              <span>Inspect item</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
