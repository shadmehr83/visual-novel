import type { Project, Scene } from "./model";
import { deviceDialogue, deviceScreen } from "./interactions";
import { ensureDevice } from "./deviceShared";
export function DialogueDeviceControls({
  project,
  scene,
  nodeId,
  edit,
}: {
  project: Project;
  scene: Scene;
  nodeId: string;
  edit: (fn: (p: Project) => void) => void;
}) {
  const node = scene.nodes.find((n) => n.id === nodeId) || scene.nodes[0];
  const visible = deviceScreen(scene, node) !== "off";
  const separate = !deviceDialogue(scene, node);
  const change = (fn: (s: Scene, n: typeof node) => void) =>
    edit((p) => {
      const s = p.scenes.find((s) => s.id === scene.id)!;
      ensureDevice(p, s);
      fn(
        s,
        s.nodes.find((n) => n.id === node.id)!,
      );
    });
  return (
    <section
      className="dialogue-device-quick"
      aria-label="Phone for selected dialogue"
    >
      <h3>Phone on this dialogue</h3>
      <p>
        These controls affect only the selected dialogue box. A reply such as
        “Check your phone” should lead to a box with Phone visible switched on.
      </p>
      <label data-help="Show the phone immediately on this dialogue, even outside the scene’s phone range. Switch off to hide it on this dialogue. Other dialogue boxes keep their own schedule.">
        <input
          type="checkbox"
          aria-label="Phone visible on this dialogue"
          checked={visible}
          onChange={(e) =>
            change((s, n) => {
              n.deviceVisible = e.target.checked;
              if (
                e.target.checked &&
                (!n.deviceScreen || n.deviceScreen === "off")
              )
                n.deviceScreen = s.phone!.defaultScreen || "home";
            })
          }
        />
        Phone visible on this dialogue
      </label>
      <label data-help="On: keep the story text, choices and Continue in a separate dialogue box beside the phone. Off: put them inside the phone chat and open Ember. This applies only to this dialogue, and does not rewrite its speaker or text.">
        <input
          type="checkbox"
          aria-label="Dialogue separate from phone"
          checked={separate}
          disabled={!visible}
          onChange={(e) =>
            change((_, n) => {
              n.deviceVisible = true;
              n.deviceDialogue = !e.target.checked;
              if (!e.target.checked) n.deviceScreen = "chat";
            })
          }
        />
        Dialogue separate from phone
      </label>
      <label>
        Open app on this dialogue
        <select
          aria-label="Quick phone app"
          disabled={!visible}
          value={
            node.deviceScreen && node.deviceScreen !== "off"
              ? node.deviceScreen
              : scene.phone?.defaultScreen || "home"
          }
          data-help="Choose what opens when this dialogue begins: Home, scrolling Insta, or Ember chat. Choosing Home or Insta also keeps story dialogue outside the phone."
          onChange={(e) =>
            change((_, n) => {
              n.deviceVisible = true;
              n.deviceScreen = e.target.value as "home" | "feed" | "chat";
              if (n.deviceScreen !== "chat") n.deviceDialogue = false;
            })
          }
        >
          <option value="home">Home · app icons</option>
          <option value="feed">Insta · scrolling feed</option>
          <option value="chat">Ember · messages</option>
        </select>
      </label>
      <button
        data-help="Remove only this dialogue’s quick phone and text-placement overrides. Its phone visibility, app and dialogue placement will follow the existing scene schedule again."
        onClick={() =>
          edit((p) => {
            const n = p.scenes
              .find((s) => s.id === scene.id)!
              .nodes.find((n) => n.id === node.id)!;
            delete n.deviceVisible;
            delete n.deviceScreen;
            delete n.deviceDialogue;
          })
        }
      >
        Use scene schedule for this dialogue
      </button>
      <small>
        {node.deviceVisible === undefined
          ? "Following scene schedule"
          : "Dialogue override saved"}{" "}
        · {visible ? "Phone ON" : "Phone OFF"} ·{" "}
        {separate ? "Separate story dialogue" : "Dialogue inside Ember"}
      </small>
    </section>
  );
}
