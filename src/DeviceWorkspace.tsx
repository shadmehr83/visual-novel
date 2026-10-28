import { useState } from "react";
import type { Project, Scene } from "./model";
import { DeviceFrameControls } from "./DeviceFrameControls";
import { DeviceAppearanceControls, withDeviceUpload } from "./DeviceAppearance";
import { InteractionControls } from "./InteractionControls";
import { makeDevice } from "./deviceFrame";
import { PhoneUI } from "./PhoneUI";
import { Stage } from "./Stage";
import { savedProject } from "./savedProject";
export function DeviceSummary({
  scene,
  update,
  onOpen,
}: {
  scene: Scene;
  update: (f: (s: Scene) => void) => void;
  onOpen: () => void;
}) {
  return (
    <section className="property-section" data-effect-panel="Phone">
      <h3>Phone & computer</h3>
      <p>
        Home, Ember messages, scrolling Insta and Settings remain available.
        Their full settings now have a dedicated workspace.
      </p>
      {scene.phone ? (
        <>
          <label>
            <input
              type="checkbox"
              aria-label="Device enabled"
              checked={scene.phone.enabled}
              onChange={(e) =>
                update((s) => {
                  s.phone!.enabled = e.target.checked;
                })
              }
            />
            Device enabled
          </label>
          <p>
            {scene.phone.device === "phone" ? "Phone" : "Computer"} ·{" "}
            {scene.phone.mode === "phone-system"
              ? "Full app system"
              : "Chat opens first"}{" "}
            · {scene.phone.contact}
          </p>
        </>
      ) : (
        <button
          onClick={() =>
            update((s) => {
              s.phone = makeDevice(s);
            })
          }
        >
          Add phone system
        </button>
      )}
      <button className="primary" onClick={onOpen}>
        Open advanced devices
      </button>
    </section>
  );
}
export function DeviceWorkspace({
  project,
  sceneId,
  nodeId,
  edit,
  onSelect,
  onOriginal,
}: {
  project: Project;
  sceneId: string;
  nodeId: string;
  edit: (fn: (p: Project) => void) => void;
  onSelect: (sid: string, nid?: string) => void;
  onOriginal: (sid: string, nid: string) => void;
}) {
  const scene =
      project.scenes.find((s) => s.id === sceneId) || project.scenes[0],
    node = scene.nodes.find((n) => n.id === nodeId) || scene.nodes[0];
  const [section, setSection] = useState("Frame & placement"),
    [screen, setScreen] = useState<"home" | "chat" | "feed" | "settings">(
      "home",
    ),
    [notice, setNotice] = useState("");
  const update = (fn: (s: Scene) => void) =>
    edit((p) => fn(p.scenes.find((s) => s.id === scene.id)!));
  const phone = scene.phone;
  const changeAppearance = (
    a: NonNullable<NonNullable<Scene["phone"]>["appearance"]>,
  ) =>
    update((s) => {
      s.phone!.appearance = a;
    });
  const upload = (asset: Project["assets"][number], target: string) =>
    edit((p) => {
      p.assets.push(asset);
      const s = p.scenes.find((s) => s.id === scene.id)!;
      s.phone!.appearance = withDeviceUpload(
        s.phone!.appearance,
        asset,
        target,
      );
    });
  const previewScene = {
    ...scene,
    phone: phone ? { ...phone, enabled: true } : undefined,
    items: undefined,
  };
  return (
    <main className="device-workspace" aria-label="Advanced devices workspace">
      <header className="device-workspace-heading">
        <div>
          <span className="eyebrow">PHONE & COMPUTER AUTHORING</span>
          <h1>Advanced devices</h1>
          <p>
            One place for device frames, apps, appearance, dialogue timing and
            replies. Existing story features stay in place.
          </p>
        </div>
        <button onClick={() => onOriginal(scene.id, node.id)}>
          Back to dialogue editor
        </button>
      </header>
      <div className="device-workspace-toolbar">
        <label>
          Scene
          <select
            aria-label="Device workspace scene"
            value={scene.id}
            onChange={(e) => onSelect(e.target.value)}
          >
            {project.scenes.map((s, i) => (
              <option key={s.id} value={s.id}>
                {i + 1}. {s.title}
                {s.phone ? " · device" : ""}
              </option>
            ))}
          </select>
        </label>
        <label>
          Dialogue
          <select
            aria-label="Device workspace dialogue"
            value={node.id}
            onChange={(e) => onSelect(scene.id, e.target.value)}
          >
            {scene.nodes.map((n, i) => (
              <option key={n.id} value={n.id}>
                {i + 1}. {n.speaker}: {n.text.slice(0, 40)}
              </option>
            ))}
          </select>
        </label>
        <button
          onClick={() => {
            const s = project.scenes.find((s) => !!s.phone);
            if (s) onSelect(s.id, s.nodes[0].id);
          }}
        >
          Open existing app system
        </button>
      </div>
      <nav
        className="device-section-tabs"
        aria-label="Advanced device sections"
      >
        {[
          "Frame & placement",
          "Timing",
          "Appearance",
          "Apps",
          "Dialogue & replies",
        ].map((t) => (
          <button
            key={t}
            aria-pressed={section === t}
            onClick={() => setSection(t)}
          >
            {t}
          </button>
        ))}
      </nav>
      {!phone ? (
        <section className="device-empty">
          <h2>This scene has no device overlay</h2>
          <p>
            Select an existing device scene above, or add one here. The
            background and dialogue are preserved.
          </p>
          <button
            className="primary"
            onClick={() =>
              update((s) => {
                s.phone = makeDevice(s, project.characters[0]?.name || "Maria");
              })
            }
          >
            Add phone or computer
          </button>
        </section>
      ) : (
        <div className="device-workspace-content">
          <section className="device-live-preview">
            <div className="device-preview-apps">
              <span>Preview app</span>
              {(
                [
                  ["home", "Home"],
                  ["chat", "Ember"],
                  ["feed", "Insta"],
                  ["settings", "Settings"],
                ] as const
              ).map(([id, label]) => (
                <button
                  aria-pressed={screen === id}
                  key={id}
                  onClick={() => setScreen(id)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="device-preview-frame">
              <Stage
                idPrefix="device-preview-"
                project={project}
                scene={previewScene}
                playing={false}
                nodeId={node.id}
                maskMode={false}
                onMask={() => {}}
              >
                <PhoneUI
                  key={scene.id}
                  screenOverride={screen}
                  project={project}
                  scene={previewScene}
                  node={node}
                  runtime={null}
                  onStep={() =>
                    setNotice(
                      "This is an editing preview. Play story in the Editor to follow dialogue choices.",
                    )
                  }
                  onReply={() =>
                    setNotice(
                      "Self-reply is available during Play story. This preview never changes a playthrough.",
                    )
                  }
                  onAppearance={changeAppearance}
                  onUpload={upload}
                />
              </Stage>
            </div>
            <p>
              Home and the app buttons work here. Scroll Insta or chat inside
              the device. Previewing an app does not alter the authored screen
              schedule.
            </p>
            {notice && <p role="status">{notice}</p>}
          </section>
          <section
            className="device-workspace-settings"
            aria-label="Advanced device settings"
          >
            {section === "Frame & placement" && (
              <DeviceFrameControls
                project={project}
                scene={scene}
                update={update}
              />
            )}
            {section === "Timing" && (
              <InteractionControls
                section="timing"
                project={project}
                scene={scene}
                nodeId={node.id}
                edit={edit}
                update={update}
              />
            )}
            {section === "Appearance" && (
              <>
                <DeviceAppearanceControls
                  area="appearance"
                  project={project}
                  value={phone.appearance}
                  onChange={changeAppearance}
                  onUpload={upload}
                />
                <button
                  onClick={() => {
                    const a = savedProject().assets.find(
                      (a) => a.id === "maria-device-profile",
                    );
                    if (a)
                      edit((p) => {
                        if (!p.assets.some((b) => b.id === a.id))
                          p.assets.push(a);
                        p.scenes.find((s) => s.id === scene.id)!.phone!.avatar =
                          a.id;
                      });
                  }}
                >
                  Use Maria’s new profile portrait
                </button>
              </>
            )}
            {section === "Apps" && (
              <>
                <section className="property-section">
                  <h2>Apps & navigation</h2>
                  <label>
                    Device experience
                    <select
                      aria-label="Device experience"
                      value={phone.mode || "chat-only"}
                      onChange={(e) =>
                        update((s) => {
                          s.phone!.mode = e.target.value as
                            | "phone-system"
                            | "chat-only";
                        })
                      }
                    >
                      <option value="phone-system">
                        Home and apps · Ember, Insta & Settings
                      </option>
                      <option value="chat-only">
                        Chat opens first · Home remains available
                      </option>
                    </select>
                  </label>
                  <p>
                    Full device retains app switching and the scrolling Insta
                    feed. Extra shortcuts can have your own icons and names and
                    open any built-in screen.
                  </p>
                  <button
                    onClick={() =>
                      update((s) => {
                        s.phone!.mode = "phone-system";
                        s.phone!.enabled = true;
                      })
                    }
                  >
                    Enable full app system
                  </button>
                </section>
                <DeviceAppearanceControls
                  area="apps"
                  project={project}
                  value={phone.appearance}
                  onChange={changeAppearance}
                  onUpload={upload}
                />
              </>
            )}
            {section === "Dialogue & replies" && (
              <section className="property-section">
                <h2>Current device dialogue</h2>
                <label>Dialogue placement<select aria-label="Dialogue placement" value={node.deviceDialogue === undefined ? "auto" : String(node.deviceDialogue)} onChange={e => update(s => { s.nodes.find(n => n.id === node.id)!.deviceDialogue = e.target.value === "auto" ? undefined : e.target.value === "true"; })}><option value="auto">Automatic · only actual chat speakers</option><option value="false">Story dialogue outside device</option><option value="true">Texting inside device</option></select></label>
                <label><input type="checkbox" checked={phone.dialogueRange?.enabled || false} onChange={e => update(s => { s.phone!.dialogueRange = {enabled: e.target.checked, start: node.id, end: scene.nodes.at(-1)!.id}; })} />Enable texting only in a dialogue range</label>
                {phone.dialogueRange && (["start", "end"] as const).map(key => <label key={key}>Texting {key}<select aria-label={"Texting " + key} value={phone.dialogueRange![key]} onChange={e => update(s => { s.phone!.dialogueRange![key] = e.target.value; })}>{scene.nodes.map((n,i) => <option key={n.id} value={n.id}>{i+1}. {n.text.slice(0,45)}</option>)}</select></label>)}
                <label><input type="checkbox" aria-label="Show phone keyboard by default" checked={phone.keyboard} onChange={e => update(s => { s.phone!.keyboard = e.target.checked; })} />Show phone keyboard by default</label>
                <label>
                  Speaker
                  <input
                    aria-label="Device dialogue speaker"
                    value={node.speaker}
                    onChange={(e) =>
                      update((s) => {
                        s.nodes.find((n) => n.id === node.id)!.speaker =
                          e.target.value;
                      })
                    }
                  />
                </label>
                <label>
                  Dialogue text
                  <textarea
                    aria-label="Device dialogue text"
                    value={node.text}
                    onChange={(e) =>
                      update((s) => {
                        s.nodes.find((n) => n.id === node.id)!.text =
                          e.target.value;
                      })
                    }
                  />
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={
                      (node.allowPhoneCustomResponse ??
                        node.allowCustomResponse) !== false
                    }
                    onChange={(e) =>
                      update((s) => {
                        s.nodes.find(
                          (n) => n.id === node.id,
                        )!.allowPhoneCustomResponse = e.target.checked;
                      })
                    }
                  />
                  Allow self-reply in this device dialogue
                </label>
                <p>
                  The normal dialogue’s self-reply preference stays separate.
                  All original reply choices and routes remain available in the
                  dialogue editor and map.
                </p>
                <button onClick={() => onOriginal(scene.id, node.id)}>
                  Edit dialogue and reply choices
                </button>
              </section>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
