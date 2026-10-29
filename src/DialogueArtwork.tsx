import { TransitionFields } from "./TimelineControls";
import type { Project, Scene } from "./model";
import { AssetPicker } from "./AssetPicker";
import { setDialogueArtwork } from "./dialogueImages";
export function DialogueArtwork({
  project,
  scene,
  nodeId,
  update,
}: {
  project: Project;
  scene: Scene;
  nodeId: string;
  update: (f: (s: Scene) => void) => void;
}) {
  const node = scene.nodes.find((n) => n.id === nodeId) || scene.nodes[0];
  const view = scene.subscenes?.find((v) => v.id === node.view);
  return (
    <section
      className="map-artwork-controls"
      aria-label="Selected dialogue artwork"
    >
      <h3>Image for this dialogue</h3>
      <p>
        Choose a saved image by folder. It becomes a temporary view for this
        dialogue; the next dialogue keeps its own view.
      </p>
      <AssetPicker
        project={project}
        label="Dialogue background image"
        initialFolder="Background scenes"
        value={view?.background}
        empty="Use main scene background"
        onChange={(id) => update((s) => setDialogueArtwork(s, node.id, id))}
      />
      <label>
        Use an existing sub-scene
        <select
          aria-label="Dialogue existing sub-scene"
          value={node.view || ""}
          onChange={(e) =>
            update((s) => {
              s.nodes.find((n) => n.id === node.id)!.view =
                e.target.value || undefined;
            })
          }
        >
          <option value="">Main scene background</option>
          {scene.subscenes?.map((v) => (
            <option key={v.id} value={v.id}>
              {v.title}
            </option>
          ))}
        </select>
      </label>
      <TransitionFields
        label="Dialogue view"
        value={node.viewTransition}
        optional
        onChange={(t) =>
          update((s) => {
            s.nodes.find((n) => n.id === node.id)!.viewTransition = t;
          })
        }
      />
      {node.view && (
        <button
          onClick={() => update((s) => setDialogueArtwork(s, node.id, null))}
        >
          Return this dialogue to main background
        </button>
      )}
    </section>
  );
}
