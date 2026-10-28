import { AssetPicker } from "./AssetPicker";
import { useState } from "react";
import { readImage } from "./storage";
import { RangeInput } from "./RangeInput";
import type { Scene, Project } from "./model";
export function ItemControls({
  scene,
  project,
  nodeId,
  update,
  edit,
}: {
  scene: Scene;
  project: Project;
  nodeId: string;
  edit: (f: (p: Project) => void) => void;
  update: (f: (s: Scene) => void) => void;
}) {
  const node = scene.nodes.find((n) => n.id === nodeId) || scene.nodes[0];
  const [error, setError] = useState("");
  return (
    <section className="property-section" data-effect-panel="Outfits & Items">
      <h3>Outfits & Items · inspect and choose</h3>
      <p>
        Clothing and book cards live here. Select a dialogue and add an item. A
        choice is created when needed. Upload its image below, then choose which
        story path confirms it. Inspecting does not commit the choice.
      </p>
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
            <input
              aria-label="Enable item picker"
              type="checkbox"
              checked={scene.items.enabled}
              onChange={(e) =>
                update((s) => {
                  s.items!.enabled = e.target.checked;
                })
              }
            />
            Enable item picker · keep saved cards
          </label>
          <label>
            <input type="checkbox" aria-label="Keep selected outfit visible" checked={scene.items.showSelected ?? false} onChange={e => update(s => { s.items!.showSelected = e.target.checked; })} />
            Keep selected item visible on its result dialogue
          </label>
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
            disabled={scene.items.options.length >= 40}
            onClick={() =>
              update((s) => {
                const current = s.nodes.find((n) => n.id === node.id)!;
                let target =
                  current.next ||
                  current.choices[0]?.target ||
                  s.nodes[s.nodes.indexOf(current) + 1]?.id;
                if (!target) {
                  target = crypto.randomUUID();
                  s.nodes.push({
                    id: target,
                    speaker: "Narrator",
                    text: "You put the item away.",
                    choices: [],
                  });
                }
                const choice = {
                  id: "item-route-" + crypto.randomUUID(),
                  text: "Choose New item",
                  target,
                  actions: [],
                  note: "",
                };
                current.choices.push(choice);
                delete current.next;
                s.items!.options.push({
                  id: crypto.randomUUID(),
                  label: "New item",
                  description: "Describe this item",
                  asset: null,
                  choice: choice.id,
                });
              })
            }
          >
            Add item for current dialogue
          </button>
          {error && <p role="alert">{error}</p>}
          {scene.items.options.length === 0 && (
            <p>
              Add an item above to reveal its image upload, name, description
              and story path.
            </p>
          )}
          {scene.items.options.map((item, i) => (
            <details key={item.id} open>
              <summary>{item.label}</summary>
              <label>
                Item name
                <input
                  value={item.label}
                  onChange={(e) =>
                    update((s) => {
                      s.items!.options[i].label = e.target.value;
                      const choice = s.nodes
                        .flatMap((n) => n.choices)
                        .find((c) => c.id === item.choice);
                      if (choice?.id.startsWith("item-route-"))
                        choice.text = "Choose " + e.target.value;
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
              <label className="item-image-upload">
                Upload item image
                <input
                  aria-label={"Upload image for " + item.label}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    e.target.value = "";
                    if (!f) return;
                    try {
                      const asset = await readImage(f);
                      edit((p) => {
                        asset.folder = "Outfits & items";
                        p.assets.push(asset);
                        const sceneItem = p.scenes
                          .find((s) => s.id === scene.id)
                          ?.items?.options.find((x) => x.id === item.id);
                        if (sceneItem) sceneItem.asset = asset.id;
                      });
                      setError("");
                    } catch (e) {
                      setError(String(e));
                    }
                  }}
                />
              </label>
              {item.asset && (
                <img
                  className="item-author-thumbnail"
                  src={project.assets.find((a) => a.id === item.asset)?.data}
                  alt={item.label}
                />
              )}
              <AssetPicker project={project} label={"Image for " + item.label} initialFolder="Outfits & items" value={item.asset} onChange={id => update(s => { s.items!.options[i].asset = id; })} />
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
