import { RangeInput } from "./RangeInput";
import type { Scene, Project } from "./model";
export function ItemControls({
  scene,
  project,
  nodeId,
  update,
}: {
  scene: Scene;
  project: Project;
  nodeId: string;
  update: (f: (s: Scene) => void) => void;
}) {
  const node = scene.nodes.find((n) => n.id === nodeId)!;
  return (
    <section className="property-section" data-effect-panel="Outfits & Items">
      <h3>Outfits & Items · inspect and choose</h3><p>Clothing and book cards live here. Choose a dialogue with choices, add items, then link each confirmation to its choice. Inspecting does not commit the choice.</p>
      <button
        onClick={() =>
          update((s) => {
            s.items = s.items
              ? undefined
              : {
                  enabled: true,
                  title: "Choose an item",
                  blur: 3,
                  options: [],
                };
          })
        }
      >
        {scene.items ? "Remove item picker" : "Add item picker"}
      </button>
      {scene.items && (
        <>
          <label>
            Overlay title
            <input
              value={scene.items.title}
              onChange={(e) =>
                update((s) => {
                  s.items!.title = e.target.value;
                })
              }
            />
          </label>
          <label>
            Background blur {scene.items.blur}px
            <RangeInput
              aria-label="Item background blur"
              type="range"
              min="0"
              max="15"
              step=".5"
              value={scene.items.blur}
              onChange={(e) =>
                update((s) => {
                  s.items!.blur = +e.target.value;
                })
              }
            />
          </label>
          <button
            disabled={!node.choices.length}
            onClick={() =>
              update((s) => {
                s.items!.options.push({
                  id: crypto.randomUUID(),
                  label: "New item",
                  description: "Describe this item",
                  asset: null,
                  choice: node.choices[0].id,
                });
              })
            }
          >
            Add item for current dialogue
          </button>
          {scene.items.options.map((item, i) => (
            <details key={item.id}>
              <summary>{item.label}</summary>
              <label>
                Item name
                <input
                  value={item.label}
                  onChange={(e) =>
                    update((s) => {
                      s.items!.options[i].label = e.target.value;
                    })
                  }
                />
              </label>
              <label>
                Description
                <textarea
                  value={item.description}
                  onChange={(e) =>
                    update((s) => {
                      s.items!.options[i].description = e.target.value;
                    })
                  }
                />
              </label>
              <label>
                PNG / image
                <select
                  value={item.asset || ""}
                  onChange={(e) =>
                    update((s) => {
                      s.items!.options[i].asset = e.target.value || null;
                    })
                  }
                >
                  <option value="">No image yet</option>
                  {project.assets.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Confirm follows choice
                <select
                  value={item.choice}
                  onChange={(e) =>
                    update((s) => {
                      s.items!.options[i].choice = e.target.value;
                    })
                  }
                >
                  {scene.nodes.flatMap((n) =>
                    n.choices.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.text}
                      </option>
                    )),
                  )}
                </select>
              </label>
              <button
                onClick={() =>
                  update((s) => {
                    s.items!.options.splice(i, 1);
                  })
                }
              >
                Remove item {item.label}
              </button>
            </details>
          ))}
        </>
      )}
    </section>
  );
}
