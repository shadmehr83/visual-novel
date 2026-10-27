import type { Project, Scene } from "./model";
export function InteractionControls({
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
  const node = scene.nodes.find((n) => n.id === nodeId)!;
  const screens = ["off", "home", "feed", "chat"] as const;
  return (
    <section className="property-section" data-effect-panel="Phone">
      <h3>Phone & screen schedule</h3>
      <p>
        Keep chat-only mode for the original device. Phone system adds Home,
        Nearside messages and the fictional Loop feed. Select a dialogue below
        to schedule its screen without creating another scene.
      </p>
      {!scene.phone ? (
        <button
          onClick={() =>
            update((s) => {
              s.phone = {
                enabled: true,
                mode: "phone-system",
                defaultScreen: "home",
                device: "phone",
                contact: project.characters[0]?.name || "Maria",
                title: "Nearside · Online",
                avatar: null,
                x: 65,
                y: 50,
                width: 44,
                entrance: { style: "slide", seconds: 0.7 },
                typingSeconds: 0.65,
                keyboard: true,
              };
            })
          }
        >
          Add phone system
        </button>
      ) : (
        <>
          <label>
            <input
              type="checkbox"
              checked={scene.phone.enabled}
              onChange={(e) =>
                update((s) => {
                  s.phone!.enabled = e.target.checked;
                })
              }
            />{" "}
            Device enabled
          </label>
          <label>
            Device experience
            <select
              aria-label="Device experience"
              value={scene.phone.mode || "chat-only"}
              onChange={(e) =>
                update((s) => {
                  s.phone!.mode = e.target.value as
                    "phone-system" | "chat-only";
                })
              }
            >
              <option value="chat-only">Original chat UI</option>
              <option value="phone-system">
                Phone system: Home, chat & Loop
              </option>
            </select>
          </label>
          <label>
            Default phone screen
            <select
              value={scene.phone.defaultScreen || "home"}
              onChange={(e) =>
                update((s) => {
                  s.phone!.defaultScreen = e.target.value as
                    "home" | "feed" | "chat";
                })
              }
            >
              {screens
                .filter((s) => s !== "off")
                .map((s) => (
                  <option key={s}>{s}</option>
                ))}
            </select>
          </label>
          <label>
            Screen for current dialogue
            <select
              aria-label="Screen for current dialogue"
              value={node.deviceScreen || ""}
              onChange={(e) =>
                update((s) => {
                  s.nodes.find((n) => n.id === nodeId)!.deviceScreen =
                    (e.target.value as typeof node.deviceScreen) || undefined;
                })
              }
            >
              <option value="">Inherit previous screen</option>
              {screens.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label>
            Notification on this dialogue
            <input
              aria-label="Phone notification text"
              value={node.phoneNotice || ""}
              onChange={(e) =>
                update((s) => {
                  s.nodes.find((n) => n.id === nodeId)!.phoneNotice =
                    e.target.value || undefined;
                })
              }
            />
          </label>
          <h4>Dialogue screen schedule</h4>
          {scene.nodes.map((n, i) => (
            <label className="schedule-row" key={n.id}>
              <span>
                {i + 1}. {n.speaker}: {n.text.slice(0, 35)}
              </span>
              <select
                aria-label={"Screen at dialogue " + (i + 1)}
                value={n.deviceScreen || ""}
                onChange={(e) =>
                  update((s) => {
                    s.nodes[i].deviceScreen =
                      (e.target.value as typeof n.deviceScreen) || undefined;
                  })
                }
              >
                <option value="">Inherit</option>
                {screens.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
          ))}
          <p className="small muted">
            Switches apply when that dialogue is entered and persist through
            following dialogues until another switch. To change after a line,
            set its following dialogue. Branches follow the actual path played.
          </p>
        </>
      )}
    </section>
  );
}
