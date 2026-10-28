import { savedProject } from "./savedProject";
import { DeviceAppearanceControls, withDeviceUpload } from "./DeviceAppearance";
import type { Project, Scene } from "./model";
import { DeviceReturnControls } from "./DeviceReturnControls";
export function InteractionControls({
  project,
  scene,
  nodeId,
  update,
  edit,
  section = "all",
}: {
  section?: "all" | "timing" | "appearance";
  project: Project;
  scene: Scene;
  nodeId: string;
  edit: (f: (p: Project) => void) => void;
  update: (f: (s: Scene) => void) => void;
}) {
  const node = scene.nodes.find((n) => n.id === nodeId) || scene.nodes[0];
  const screens = ["off", "home", "feed", "chat"] as const;
  return (
    <section className="property-section" data-effect-panel="Phone">
      <h3>Phone & screen schedule</h3>
      <p>
        Messages only opens a conversation directly. Device with apps adds Home,
        Ember messages and the fictional Insta feed. Select a dialogue below to
        schedule its screen without creating another scene.
      </p>
      {!scene.phone ? (
        <button
          onClick={() =>
            update((s) => {
              s.phone = {
                enabled: true,
                schedule: {
                  start: node.id,
                  end: scene.nodes.at(-1)!.id,
                  screen: "home",
                  advanced: false,
                },
                mode: "phone-system",
                defaultScreen: "home",
                device: "phone",
                contact: project.characters[0]?.name || "Maria",
                title: "Ember · Online",
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
          {section !== "appearance" && (
            <>
              <DeviceReturnControls scene={scene} nodeId={nodeId} update={update} />
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
                        | "phone-system"
                        | "chat-only";
                    })
                  }
                >
                  <option value="chat-only">
                    Chat opens first · Home remains available
                  </option>
                  <option value="phone-system">
                    Device with apps · Home, Ember, Insta & Settings
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
                        | "home"
                        | "feed"
                        | "chat";
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
                Interaction timing
                <select
                  aria-label="Phone interaction timing"
                  value={scene.phone.schedule ? "range" : "legacy"}
                  onChange={(e) =>
                    update((s) => {
                      if (e.target.value === "legacy") delete s.phone!.schedule;
                      else
                        s.phone!.schedule = {
                          start: node.id,
                          end: s.nodes.at(-1)!.id,
                          screen: s.phone!.defaultScreen || "home",
                          advanced: false,
                        };
                    })
                  }
                >
                  <option value="legacy">
                    Existing dialogue schedule (keep current setup)
                  </option>
                  <option value="range">Simple start & end dialogues</option>
                </select>
              </label>
              {scene.phone.schedule && (
                <div className="phone-range">
                  <p>
                    The device appears on the start dialogue, stays through the
                    end dialogue, then closes. Dialogues between them need no
                    settings.
                  </p>
                  {(["start", "end"] as const).map((key) => (
                    <label key={key}>
                      {key === "start"
                        ? "Start phone on dialogue"
                        : "End phone after dialogue"}
                      <select
                        aria-label={
                          key === "start"
                            ? "Start phone on dialogue"
                            : "End phone after dialogue"
                        }
                        value={scene.phone!.schedule![key]}
                        onChange={(e) =>
                          update((s) => {
                            s.phone!.schedule![key] = e.target.value;
                          })
                        }
                      >
                        {scene.nodes.map((n, i) => (
                          <option key={n.id} value={n.id}>
                            {i + 1}. {n.speaker}: {n.text.slice(0, 35)}
                          </option>
                        ))}
                      </select>
                    </label>
                  ))}
                  <label>
                    Screen during interaction
                    <select
                      aria-label="Screen during interaction"
                      value={scene.phone.schedule.screen}
                      onChange={(e) =>
                        update((s) => {
                          s.phone!.schedule!.screen = e.target.value as
                            | "home"
                            | "chat"
                            | "feed";
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
                    <input
                      type="checkbox"
                      checked={scene.phone.schedule.advanced}
                      onChange={(e) =>
                        update((s) => {
                          s.phone!.schedule!.advanced = e.target.checked;
                        })
                      }
                    />
                    Advanced: override individual dialogues
                  </label>
                </div>
              )}
              <label>
                Notification on this dialogue
                <input
                  aria-label="Phone notification text"
                  value={node.phoneNotice || ""}
                  onChange={(e) =>
                    update((s) => {
                      s.nodes.find((n) => n.id === node.id)!.phoneNotice =
                        e.target.value || undefined;
                    })
                  }
                />
              </label>
              <details
                className="advanced-phone-schedule"
                open={scene.phone.schedule?.advanced || undefined}
              >
                <summary>Advanced dialogue screen schedule</summary>
                {scene.phone.schedule && !scene.phone.schedule.advanced && (
                  <p>
                    Enable “Advanced: override individual dialogues” above to
                    use these switches.
                  </p>
                )}
                <fieldset
                  disabled={
                    !!scene.phone.schedule && !scene.phone.schedule.advanced
                  }
                >
                  <label>
                    Screen for current dialogue
                    <select
                      aria-label="Screen for current dialogue"
                      value={node.deviceScreen || ""}
                      onChange={(e) =>
                        update((s) => {
                          s.nodes.find((n) => n.id === node.id)!.deviceScreen =
                            (e.target.value as typeof node.deviceScreen) ||
                            undefined;
                        })
                      }
                    >
                      <option value="">Inherit previous screen</option>
                      {screens.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
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
                              (e.target.value as typeof n.deviceScreen) ||
                              undefined;
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
                </fieldset>
              </details>
            </>
          )}
          {section !== "timing" && (
            <>
              <button
                data-help="Add the newly generated Maria profile portrait to this project and use it for this scene’s device contact. Your scene background and other images stay intact."
                onClick={() => {
                  const portrait = savedProject().assets.find(
                    (a) => a.id === "maria-device-profile",
                  );
                  if (portrait)
                    edit((p) => {
                      if (!p.assets.some((a) => a.id === portrait.id))
                        p.assets.push(portrait);
                      p.scenes.find((s) => s.id === scene.id)!.phone!.avatar =
                        portrait.id;
                    });
                }}
              >
                Use Maria’s new profile portrait
              </button>
              <DeviceAppearanceControls
                project={project}
                value={scene.phone.appearance}
                onChange={(a) =>
                  update((s) => {
                    s.phone!.appearance = a;
                  })
                }
                onUpload={(asset, target) =>
                  edit((p) => {
                    p.assets.push(asset);
                    const s = p.scenes.find((s) => s.id === scene.id)!;
                    s.phone!.appearance = withDeviceUpload(
                      s.phone!.appearance,
                      asset,
                      target,
                    );
                  })
                }
              />
            </>
          )}
          {section !== "appearance" && (
            <p className="small muted">
              Switches apply when that dialogue is entered and persist through
              following dialogues until another switch. To change after a line,
              set its following dialogue. Branches follow the actual path
              played.
            </p>
          )}
        </>
      )}
    </section>
  );
}
