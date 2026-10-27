import { useEffect, useState } from "react";
import type { Project, Scene, Node, Runtime } from "./model";
export function ItemOverlay({
  project,
  scene,
  node,
  runtime,
  onStep,
}: {
  project: Project;
  scene: Scene;
  node: Node;
  runtime: Runtime | null;
  onStep: (id: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  useEffect(() => setSelected(null), [node.id]);
  const options =
    scene.items?.options.filter((item) =>
      node.choices.some(
        (c) =>
          c.id === item.choice &&
          (!c.condition ||
            runtime?.values[c.condition.key] === c.condition.equals),
      ),
    ) || [];
  if (!scene.items?.enabled || !options.length) return null;
  const current = options.find((x) => x.id === selected);
  const picture = (id: string | null) =>
    project.assets.find((a) => a.id === id)?.data;
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
          <button onClick={() => onStep(current.choice)}>
            Choose {current.label}
          </button>
          <button onClick={() => setSelected(null)}>See other options</button>
        </div>
      ) : (
        <div className="item-grid">
          {options.map((item) => (
            <button key={item.id} onClick={() => setSelected(item.id)}>
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
