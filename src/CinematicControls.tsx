import { SnippetControls } from "./SnippetControls";
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
  saveSnippet,
}: {
  saveSnippet?: (joint: string, asset: Project["assets"][number]) => void;
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
        <h3>Character motion, transitions & hinge poses</h3>
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
            <details key={joint.id} data-zone-id={joint.id} open className="clue">
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
              <fieldset><legend>Character motion · blink, gaze & head sway</legend>
                <label><input type="checkbox" aria-label={joint.name + " loop enabled"} checked={joint.loop?.enabled || false} onChange={e=>patch(j=>{j.loop={kind:"sway",seconds:4,amount:1,...j.loop,enabled:e.target.checked};})}/>Loop character motion</label>
                <label>Motion style<select data-help="Tilt rotates the selected head region about its pivot. Gaze shifts a small selected eye patch. Blink closes and opens the selected eye region over a matching eyelid colour; carefully paint just the eye opening." aria-label={joint.name + " loop style"} value={joint.loop?.kind||"sway"} onChange={e=>patch(j=>{j.loop={enabled:true,seconds:4,amount:1,...j.loop,kind:e.target.value as "sway"|"gaze"|"blink"};})}><option value="sway">Gentle head tilt</option><option value="gaze">Small eye / selected-patch drift</option><option value="blink">Blink selected eyelid region</option></select></label>
                {joint.loop && <><label>Loop interval (seconds)<input aria-label={joint.name+" loop seconds"} type="number" min="0.5" max="30" step=".1" value={joint.loop.seconds} onChange={e=>{const v=+e.target.value;if(v>=.5&&v<=30)patch(j=>j.loop!.seconds=v);}}/></label>
                <label>Amount (degrees for tilt, scene units for gaze)<RangeInput aria-label={joint.name+" loop amount"} min="0" max="20" step=".1" type="range" value={joint.loop.amount} onChange={e=>patch(j=>j.loop!.amount=+e.target.value)}/></label>
                {joint.loop.kind === "blink" && <label>Eyelid / skin colour<input aria-label={joint.name+" eyelid colour"} type="color" value={joint.loop.eyelidColor||"#b18b7e"} onChange={e=>patch(j=>j.loop!.eyelidColor=e.target.value)}/></label>}</>}
                <p>Select only the moving part, put its pivot at the joint, then use small amounts. For blinks select the eye opening and match the eyelid colour. Use a clean plate or cover colour to hide original pixels behind a moving head. This animates selected pixels; it does not reconstruct a face.</p>
                <button onClick={()=>setEditor({kind:"joint",id:joint.id,mode:"pose",tolerance:45})}>Drag selected patch on scene</button>
                <button onClick={()=>setEditor({kind:"joint",id:joint.id,mode:"rotate",tolerance:45})}>Drag head tilt on scene</button>
                <label>Clean plate behind moving patch<select data-help="An aligned image of the area without the moving object. Only the selected region is drawn from this image behind the patch, hiding the original head or object without moving the rest of the background." aria-label={joint.name+" clean plate"} value={joint.cleanPlate||""} onChange={e=>patch(j=>j.cleanPlate=e.target.value||undefined)}><option value="">None — original or cover colour</option>{project.assets.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select></label>
                {saveSnippet && <SnippetControls project={project} scene={scene} nodeId={nodeId} joint={joint} onSave={a=>saveSnippet(joint.id,a)}/>}
                <p>Dialogue poses below trigger smooth moves on entry. Combine them with the optional start/end range above; enable looping for repeated idle motion.</p>
              </fieldset>
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
    </>
  );
}
