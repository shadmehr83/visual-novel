import type { Project, Scene } from "./model";
import { ItemControls } from "./ItemControls";
import { savedProject } from "./savedProject";
import { restoreSavedOutfits } from "./outfits";
export function DialogueItems({
  project,
  scene,
  nodeId,
  edit,
  update,
  onSelect,
}: {
  project: Project;
  scene: Scene;
  nodeId: string;
  edit: (f: (p: Project) => void) => void;
  update: (f: (s: Scene) => void) => void;
  onSelect: (scene: string, node?: string) => void;
}) {
  const wardrobe = project.scenes.find((s) => s.id === "outfit");
  return (
    <div className="dialogue-item-tools">
      <h3>Outfit & item picker</h3>
      <p>
        Existing cards stay saved when you select another dialogue. Each card
        appears on the dialogue containing its linked choice. Click a saved card
        to jump there.
      </p>
      <div className="item-picker-shortcut">
        {wardrobe && (
          <button
            onClick={() =>
              onSelect(
                wardrobe.id,
                wardrobe.nodes.find((n) => n.id === "effort")?.id ||
                  wardrobe.nodes[0].id,
              )
            }
          >
            Open saved outfit selection
          </button>
        )}
        {wardrobe && (
          <button
            onClick={() => {
              const source = savedProject();
              edit((p) => {
                restoreSavedOutfits(p, source);
              });
              onSelect(
                wardrobe.id,
                wardrobe.nodes.find((n) => n.id === "effort")?.id ||
                  wardrobe.nodes[0].id,
              );
            }}
          >
            Restore missing demo outfits
          </button>
        )}
      </div>
      <div className="item-author-cards">
        {scene.items?.options.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              const n = scene.nodes.find((n) =>
                n.choices.some((c) => c.id === item.choice),
              );
              if (n) onSelect(scene.id, n.id);
            }}
          >
            {item.asset && (
              <img
                src={project.assets.find((a) => a.id === item.asset)?.data}
                alt=""
              />
            )}
            <b>{item.label}</b>
            <small>Open its dialogue</small>
          </button>
        ))}
      </div>
      <ItemControls
        project={project}
        scene={scene}
        nodeId={nodeId}
        edit={edit}
        update={update}
      />
    </div>
  );
}
