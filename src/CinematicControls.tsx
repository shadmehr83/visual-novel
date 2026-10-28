import { SceneTransitionControls } from "./SceneTransitionControls";
import { RangeInput } from "./RangeInput";
import type { Project, Scene } from "./model";
import { restingPose } from "./cinematics";
import type { RegionEditor } from "./Zones";
export function CinematicControls({
  scene,
  project,
  nodeId,
  update,
  setEditor,
  previewNode,
}: {
  scene: Scene;
  project: Project;
  nodeId: string;
  update: (f: (s: Scene) => void) => void;
  setEditor: (r: RegionEditor | null) => void;
  previewNode: (id: string) => void;
}) {
  const transition = scene.transition || {
    style: "cut" as const,
    seconds: 0.6,
  };
  return (
    <>
      <section
        className="property-section cinematic-controls"
        data-effect-panel="Cinematics"
      >
        <h3>Transitions & hinge poses</h3>
        <SceneTransitionControls scene={scene} update={update} />
        <p className="small muted">
          Select a region, place its pivot, then save a different pose on
          another dialogue slide. Pose changes run when that slide is entered.
          Unkeyed slides hold the previous pose.
        </p>
        <button
          onClick={() => {
            const id = crypto.randomUUID();
            update((s) => {
              (s.joints ??= []).push({
                id,
                name: "Hinge " + ((s.joints?.length || 0) + 1),
                enabled: true,
                region: { id, name: "Hinge area", enabled: true, points: [] },
                pivotX: 500,
                pivotY: 281.5,
                transition: { style: "smooth", seconds: 0.5 },
                poses: [],
              });
            });
            setEditor({ kind: "joint", id, mode: "polygon", tolerance: 45 });
          }}
          disabled={(scene.joints?.length || 0) >= 20}
        >
          Add hinge region
        </button>
        <button
          onClick={() =>
            update((s) => {
              const id = crypto.randomUUID();
              (s.joints ??= []).push({
                id,
                name: "Foreground object",
                enabled: true,
                region: {
                  id,
                  name: "Object bounds",
                  enabled: true,
                  points: [
                    { x: 0, y: 0 },
                    { x: 1000, y: 0 },
                    { x: 1000, y: 563 },
                    { x: 0, y: 563 },
                  ],
                },
                pivotX: 500,
                pivotY: 281.5,
                transition: { style: "slide", seconds: 0.8 },
                source: project.assets[0]?.id,
                poses: [],
              });
            })
          }
        >
          Add foreground object
        </button>
        {(scene.joints || []).map((joint, i) => {
          const pose =
            joint.poses.find((p) => p.node === nodeId) || restingPose(nodeId);
          const patch = (fn: (j: typeof joint) => void) =>
            update((s) => fn(s.joints![i]));
          return (
            <details key={joint.id} open className="clue">
              <summary>{joint.name}</summary>
              <fieldset>
                <legend>Dialogue activation range (optional)</legend>
                <label>
                  <input
                    type="checkbox"
                    checked={!!joint.range}
                    onChange={(e) =>
                      patch((j) => {
                        j.range = e.target.checked
                          ? {
                              start: scene.nodes[0].id,
                              end: scene.nodes[scene.nodes.length - 1].id,
                              after: "hide",
                            }
                          : undefined;
                      })
                    }
                  />{" "}
                  Restrict hinge to a dialogue range
                </label>
                {joint.range && (
                  <>
                    {(["start", "end"] as const).map((key) => (
                      <label key={key}>
                        {key === "start"
                          ? "Start on dialogue"
                          : "End on dialogue"}
                        <select
                          aria-label={joint.name + " " + key + " dialogue"}
                          value={joint.range![key]}
                          onChange={(e) =>
                            patch((j) => {
                              j.range![key] = e.target.value;
                            })
                          }
                        >
                          {scene.nodes.map((n, i) => (
                            <option key={n.id} value={n.id}>
                              {i + 1}. {n.speaker}: {n.text.slice(0, 30)}
                            </option>
                          ))}
                        </select>
                      </label>
                    ))}
                    <label>
                      After end dialogue
                      <select
                        value={joint.range.after}
                        onChange={(e) =>
                          patch((j) => {
                            j.range!.after = e.target.value as "hide" | "hold";
                          })
                        }
                      >
                        <option value="hide">Hide moved layer</option>
                        <option value="hold">Hold final pose</option>
                      </select>
                    </label>
                  </>
                )}
              </fieldset>

              <label>
                Name
                <input
                  aria-label="Hinge name"
                  value={joint.name}
                  onChange={(e) =>
                    patch((j) => {
                      j.name = e.target.value;
                    })
                  }
                />
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={joint.enabled}
                  onChange={(e) =>
                    patch((j) => {
                      j.enabled = e.target.checked;
                    })
                  }
                />{" "}
                Enabled
              </label>
              <button
                onClick={() =>
                  setEditor({
                    kind: "joint",
                    id: joint.id,
                    mode: "brush",
                    radius: 25,
                    tolerance: 45,
                  })
                }
              >
                Edit hinge selection
              </button>
              <button
                onClick={() =>
                  setEditor({
                    kind: "joint",
                    id: joint.id,
                    mode: "pivot",
                    tolerance: 45,
                  })
                }
              >
                Place hinge pivot
              </button>
              {(["pivotX", "pivotY"] as const).map((key) => (
                <label key={key}>
                  {key}
                  <RangeInput
                    aria-label={joint.name + " " + key}
                    type="range"
                    min="0"
                    max={key === "pivotX" ? 1000 : 563}
                    value={joint[key]}
                    onChange={(e) =>
                      patch((j) => {
                        j[key] = +e.target.value;
                      })
                    }
                  />
                </label>
              ))}
              <label>
                Transition
                <select
                  aria-label={joint.name + " transition"}
                  value={joint.transition.style}
                  onChange={(e) =>
                    patch((j) => {
                      j.transition.style = e.target
                        .value as typeof j.transition.style;
                    })
                  }
                >
                  {["snappy", "smooth", "slide", "fade", "cut"].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
              <label>
                Duration
                <input
                  aria-label={joint.name + " duration"}
                  type="number"
                  min="0.05"
                  max="10"
                  step=".05"
                  value={joint.transition.seconds}
                  onChange={(e) => {
                    if (+e.target.value >= 0.05 && +e.target.value <= 10)
                      patch((j) => {
                        j.transition.seconds = +e.target.value;
                      });
                  }}
                />
              </label>
              <label>
                Source image
                <select
                  aria-label={joint.name + " source image"}
                  value={joint.source || ""}
                  onChange={(e) =>
                    patch((j) => {
                      j.source = e.target.value || undefined;
                    })
                  }
                >
                  <option value="">Selected pixels from background</option>
                  {project.assets.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Cover original pixels
                <input
                  type="checkbox"
                  checked={!!joint.coverColor}
                  onChange={(e) =>
                    patch((j) => {
                      j.coverColor = e.target.checked ? "#27232b" : undefined;
                    })
                  }
                />
              </label>
              {joint.coverColor && (
                <input
                  aria-label={joint.name + " cover colour"}
                  type="color"
                  value={joint.coverColor}
                  onChange={(e) =>
                    patch((j) => {
                      j.coverColor = e.target.value;
                    })
                  }
                />
              )}
              <p className="small muted">
                A cut-out cannot reveal hidden pixels. For clean movement use a
                transparent foreground asset over a clean background; a matching
                cover colour is a simple alternative. No AI anatomy or face
                reconstruction is performed.
              </p>
              <label>
                Pose dialogue
                <select
                  aria-label={joint.name + " pose dialogue"}
                  value={nodeId}
                  onChange={(e) => previewNode(e.target.value)}
                >
                  {scene.nodes.map((n) => (
                    <option value={n.id} key={n.id}>
                      {n.speaker}: {n.text.slice(0, 45)}
                    </option>
                  ))}
                </select>
              </label>
              <button
                onClick={() =>
                  patch((j) => {
                    if (!j.poses.some((p) => p.node === nodeId))
                      j.poses.push(restingPose(nodeId));
                  })
                }
              >
                Save resting pose for this slide
              </button>
              {(
                ["x", "y", "angle", "scaleX", "scaleY", "opacity"] as const
              ).map((key) => (
                <label key={key}>
                  {key} {pose[key]}
                  <RangeInput
                    aria-label={joint.name + " pose " + key}
                    type="range"
                    min={
                      key === "x"
                        ? -1000
                        : key === "y"
                          ? -563
                          : key === "angle"
                            ? -180
                            : key === "opacity"
                              ? 0
                              : 0.05
                    }
                    max={
                      key === "x"
                        ? 1000
                        : key === "y"
                          ? 563
                          : key === "angle"
                            ? 180
                            : key === "opacity"
                              ? 1
                              : 4
                    }
                    step={
                      ["scaleX", "scaleY", "opacity"].includes(key) ? 0.01 : 1
                    }
                    value={pose[key]}
                    onChange={(e) =>
                      patch((j) => {
                        let target = j.poses.find((p) => p.node === nodeId);
                        if (!target) {
                          target = restingPose(nodeId);
                          j.poses.push(target);
                        }
                        target[key] = +e.target.value;
                      })
                    }
                  />
                </label>
              ))}
              <label>
                Expression replacement image
                <select
                  aria-label={joint.name + " expression image"}
                  value={pose.asset || ""}
                  onChange={(e) =>
                    patch((j) => {
                      let target = j.poses.find((p) => p.node === nodeId);
                      if (!target) {
                        target = restingPose(nodeId);
                        j.poses.push(target);
                      }
                      target.asset = e.target.value || undefined;
                    })
                  }
                >
                  <option value="">Keep source pixels</option>
                  {project.assets.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </label>
              <button
                onClick={() =>
                  patch((j) => {
                    j.poses = j.poses.filter((p) => p.node !== nodeId);
                  })
                }
              >
                Remove this slide’s pose
              </button>
              <button
                onClick={() => {
                  update((s) => {
                    s.joints = s.joints?.filter((j) => j.id !== joint.id);
                  });
                  setEditor(null);
                }}
              >
                Remove hinge
              </button>
            </details>
          );
        })}
      </section>
      <section className="property-section" data-effect-panel="Phone">
        <h3>Device placement & contact</h3>
        <p>
          Phone and computer use the same apps. Choose the shape here;
          scheduling and app appearance are in the Phone panel above.
        </p>
        {scene.phone ? (
          <button
            onClick={() =>
              update((s) => {
                delete s.phone;
              })
            }
          >
            Remove device UI
          </button>
        ) : (
          <p>
            Add a phone system above to create a Phone or Computer interface.
          </p>
        )}
        {scene.phone && (
          <>
            <label>
              Contact name
              <input
                aria-label="Device contact"
                value={scene.phone.contact}
                onChange={(e) =>
                  update((s) => {
                    s.phone!.contact = e.target.value;
                  })
                }
              />
            </label>
            <label>
              Device shape
              <select
                aria-label="Device shape"
                value={scene.phone.device}
                onChange={(e) =>
                  update((s) => {
                    s.phone!.device = e.target.value as "phone" | "desktop";
                  })
                }
              >
                <option value="phone">Phone</option>
                <option value="desktop">Computer / desktop</option>
              </select>
            </label>
            <label>
              Contact portrait
              <select
                aria-label="Device portrait"
                value={scene.phone.avatar || ""}
                onChange={(e) =>
                  update((s) => {
                    s.phone!.avatar = e.target.value || null;
                  })
                }
              >
                <option value="">Initials (no new portrait)</option>
                {project.assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </label>
            {(["x", "y", "width", "typingSeconds"] as const).map((key) => (
              <label key={key}>
                Device {key}
                <RangeInput
                  aria-label={"Device " + key}
                  type="range"
                  min={key === "width" ? 20 : 0}
                  max={key === "typingSeconds" ? 5 : key === "width" ? 90 : 100}
                  step={key === "typingSeconds" ? 0.1 : 1}
                  value={scene.phone![key]}
                  onChange={(e) =>
                    update((s) => {
                      s.phone![key] = +e.target.value;
                    })
                  }
                />
              </label>
            ))}
            <label>
              Device entrance
              <select
                aria-label="Device entrance"
                value={scene.phone.entrance.style}
                onChange={(e) =>
                  update((s) => {
                    s.phone!.entrance.style = e.target
                      .value as typeof transition.style;
                  })
                }
              >
                {["cut", "snappy", "smooth", "slide", "fade"].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            <label>
              <input
                type="checkbox"
                checked={scene.phone.keyboard}
                onChange={(e) =>
                  update((s) => {
                    s.phone!.keyboard = e.target.checked;
                  })
                }
              />{" "}
              Show animated keyboard for reply options
            </label>
          </>
        )}
      </section>
    </>
  );
}
