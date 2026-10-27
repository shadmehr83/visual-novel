import {RangeInput} from "./RangeInput";
import {useFootsteps} from "./Footsteps";
import { useEffect, useRef, useState } from "react";
import {
  validateProject,
  type Project,
  type Scene,
  type Runtime,
  resolveQte,
} from "./model";
export function Qte({
  project,
  runtime,
  onResolve,
}: {
  project: Project;
  runtime: Runtime;
  onResolve: (r: Runtime) => void;
}) {
  const node = project.scenes
    .find((s) => s.id === runtime.scene)!
    .nodes.find((n) => n.id === runtime.node)!;
  const q = node.qte!;
  const [remaining, setRemaining] = useState(
    q.seconds * (project.settings.timing || 1),
  );
  const [paused, setPaused] = useState(document.hidden);
  const done = useRef(false);
  const elapsed = useRef(0);
  const last = useRef(performance.now());
  const resolve = (outcome: "success" | "timeout") => {
    if (done.current) return;
    done.current = true;
    onResolve(resolveQte(project, runtime, outcome));
  };
  useEffect(() => {
    const focus = () => {
      setPaused(document.hidden || !document.hasFocus());
      last.current = performance.now();
    };
    document.addEventListener("visibilitychange", focus);
    window.addEventListener("blur", focus);
    window.addEventListener("focus", focus);
    return () => {
      document.removeEventListener("visibilitychange", focus);
      window.removeEventListener("blur", focus);
      window.removeEventListener("focus", focus);
    };
  }, []);
  useEffect(() => {
    if (project.settings.skipQte) {
      resolve("success");
      return;
    }
    last.current = performance.now();
    const timer = setInterval(() => {
      const now = performance.now();
      if (!paused && !done.current) {
        elapsed.current += (now - last.current) / 1000;
        const value =
          q.seconds * (project.settings.timing || 1) - elapsed.current;
        setRemaining(Math.max(0, value));
        if (value <= 0) resolve("timeout");
      }
      last.current = now;
    }, 50);
    const key = (e: KeyboardEvent) => {
      if (e.code === "Space" && !paused) {
        e.preventDefault();
        resolve("success");
      }
    };
    window.addEventListener("keydown", key);
    return () => {
      clearInterval(timer);
      window.removeEventListener("keydown", key);
    };
  }, [paused]);
  return (
    <div className="qte">
      <b>{q.prompt}</b>
      <progress
        value={remaining}
        max={q.seconds * (project.settings.timing || 1)}
      />
      <span>
        {remaining.toFixed(1)} seconds {paused ? "· Paused" : ""}
      </span>
      <button disabled={paused} onClick={() => resolve("success")}>
        Act · Space / tap
      </button>
      <button onClick={() => setPaused((v) => !v)}>
        {paused ? "Resume" : "Pause"}
      </button>
      <details>
        <summary>Debug / accessibility</summary>
        <button onClick={() => resolve("timeout")}>Force timeout</button>
        <button onClick={() => resolve("success")}>Skip successfully</button>
      </details>
    </div>
  );
}
export function SceneAudio({
  project,
  scene,
}: {
  project: Project;
  scene: Scene;
}) {
  const [enabled, setEnabled] = useState(false);
  const [error, setError] = useState("");
  useFootsteps(project,scene,enabled,setError);
  useEffect(() => {
    if (!enabled) return;
    const tracks = (scene.audio || []).map((t) => {
      const asset = project.audioAssets?.find((a) => a.id === t.id);
      if (!asset) return null;
      const audio = new Audio(asset.data);
      audio.volume = t.volume;
      audio.loop = t.loop;
      audio
        .play()
        .catch(() =>
          setError("Audio playback was blocked. Toggle sound to retry."),
        );
      return audio;
    });
    return () =>
      tracks.forEach((a) => {
        a?.pause();
        if (a) a.src = "";
      });
  }, [enabled, scene.id, JSON.stringify(scene.audio)]);
  if (!scene.audio?.length&&!(scene.camera?.enabled&&scene.camera.footsteps)) return null;
  return (
    <div className="sound-control">
      <button
        onClick={() => {
          setError("");
          setEnabled((v) => !v);
        }}
      >
        {enabled ? "Mute sound" : "Enable scene sound"}
      </button>
      {error && <small>{error}</small>}
    </div>
  );
}
export function EngineTools({
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
  const [error, setError] = useState("");
  const [view, setView] = useState("Sprites");
  const node = scene.nodes.find((n) => n.id === nodeId) || scene.nodes[0];
  const change = (fn: (s: Scene) => void) =>
    edit((p) => fn(p.scenes.find((s) => s.id === scene.id)!));
  async function audio(file?: File) {
    if (!file) return;
    try {
      if (
        !/^audio\/(mpeg|wav|ogg|mp4|x-wav|webm)$/.test(file.type) ||
        file.size > 20 * 1024 * 1024
      )
        throw Error("Choose MP3, WAV, OGG, M4A or WebM audio up to 20 MB.");
      const data = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result));
        r.onerror = reject;
        r.readAsDataURL(file);
      });
      const ctx = new AudioContext();
      try {
        await ctx.decodeAudioData(await file.arrayBuffer());
      } finally {
        await ctx.close();
      }
      const id = crypto.randomUUID();
      edit((p) => {
        (p.audioAssets ??= []).push({ id, name: file.name, data });
        (p.scenes.find((s) => s.id === scene.id)!.audio ??= []).push({
          id,
          volume: 0.5,
          loop: true,
        });
      });
    } catch (e) {
      setError(String(e));
    }
  }
  return (
    <div className="library-body engine-tools">
      <div className="tool-tabs">
        {["Sprites", "Cast", "Audio", "QTE", "Timeline", "Graph", "State"].map(
          (t) => (
            <button
              key={t}
              className={view === t ? "active" : ""}
              onClick={() => setView(t)}
            >
              {t}
            </button>
          ),
        )}
      </div>
      <p className="small muted">
        Editing: {scene.title}. All changes support Undo and project export.
      </p>
      {error && <p role="alert">{error}</p>}
      {view === "Sprites" && (
        <>
          <button
            className="wide"
            disabled={!project.assets.length}
            onClick={() =>
              change((s) =>
                (s.sprites ??= []).push({
                  id: crypto.randomUUID(),
                  asset: project.assets[0].id,
                  name: "New sprite",
                  x: 500,
                  y: 480,
                  scale: 1,
                  opacity: 1,
                  flip: false,
                  expression: "neutral",
                }),
              )
            }
          >
            Add sprite layer
          </button>
          <p className="small muted">
            Import artwork in Assets first. Layers draw in list order; use
            Up/Down to reorder.
          </p>
          {scene.sprites?.map((sprite, i) => (
            <div className="clue" key={sprite.id}>
              <label>
                Name
                <input
                  value={sprite.name}
                  onChange={(e) =>
                    change((s) => (s.sprites![i].name = e.target.value))
                  }
                />
              </label>
              <label>
                Artwork / expression
                <select
                  value={sprite.asset}
                  onChange={(e) =>
                    change((s) => (s.sprites![i].asset = e.target.value))
                  }
                >
                  {project.assets
                    .filter((a) => !a.reference)
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                </select>
              </label>
              {(["x", "y", "scale", "opacity"] as const).map((k) => (
                <label key={k}>
                  {k}: {sprite[k]}
                  <RangeInput
                    aria-label={"Sprite " + k}
                    type="range"
                    min={0}
                    max={
                      k === "x" ? 1000 : k === "y" ? 563 : k === "scale" ? 3 : 1
                    }
                    step={k === "x" || k === "y" ? 1 : 0.05}
                    value={sprite[k]}
                    onChange={(e) =>
                      change((s) => {
                        s.sprites![i][k] = Math.max(
                          k === "scale" ? 0.1 : 0,
                          +e.target.value,
                        );
                      })
                    }
                  />
                </label>
              ))}
              <label>
                Expression label
                <input
                  value={sprite.expression}
                  onChange={(e) =>
                    change((s) => (s.sprites![i].expression = e.target.value))
                  }
                />
              </label>
              <button
                onClick={() =>
                  change((s) => (s.sprites![i].flip = !sprite.flip))
                }
              >
                Flip horizontally
              </button>
              <button
                disabled={!i}
                onClick={() =>
                  change((s) => {
                    [s.sprites![i - 1], s.sprites![i]] = [
                      s.sprites![i],
                      s.sprites![i - 1],
                    ];
                  })
                }
              >
                Up
              </button>
              <button
                disabled={i === scene.sprites!.length - 1}
                onClick={() =>
                  change((s) => {
                    [s.sprites![i + 1], s.sprites![i]] = [
                      s.sprites![i],
                      s.sprites![i + 1],
                    ];
                  })
                }
              >
                Down
              </button>
              <button
                onClick={() =>
                  change((s) => {
                    s.sprites!.splice(i, 1);
                    s.keyframes = s.keyframes?.filter(
                      (f) => f.sprite !== sprite.id,
                    );
                  })
                }
              >
                Remove sprite
              </button>
            </div>
          ))}
        </>
      )}
      {view === "Cast" && (
        <>
          <button
            className="wide"
            onClick={() =>
              edit((p) =>
                p.characters.push({
                  id: crypto.randomUUID(),
                  name: "New character",
                  notes: "",
                  portrait: null,
                  expressions: {},
                }),
              )
            }
          >
            Add character
          </button>
          {project.characters.map((c, i) => (
            <div className="clue" key={c.id}>
              <label>
                Name
                <input
                  value={c.name}
                  onChange={(e) =>
                    edit((p) => (p.characters[i].name = e.target.value))
                  }
                />
              </label>
              <label>
                Voice and knowledge notes
                <textarea
                  value={c.notes}
                  onChange={(e) =>
                    edit((p) => (p.characters[i].notes = e.target.value))
                  }
                />
              </label>
              <button
                onClick={() => {
                  const name = prompt("Expression name (e.g. happy, worried)");
                  if (name && project.assets.length)
                    edit((p) => {
                      (p.characters[i].expressions ??= {})[name] =
                        project.assets[0].id;
                    });
                }}
              >
                Add expression
              </button>
              {Object.entries(c.expressions || {}).map(([name, asset]) => (
                <div key={name}>
                  <label>
                    {name}
                    <select
                      value={asset}
                      onChange={(e) =>
                        edit(
                          (p) =>
                            (p.characters[i].expressions![name] =
                              e.target.value),
                        )
                      }
                    >
                      {project.assets.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    onClick={() =>
                      change((s) => {
                        const n = s.nodes.find((n) => n.id === node.id)!;
                        n.speaker = c.name;
                        n.portrait = asset;
                      })
                    }
                  >
                    Use on selected dialogue
                  </button>
                  <button
                    onClick={() =>
                      change((s) => {
                        const sprite = s.sprites?.find(
                          (s) => s.name === c.name,
                        );
                        if (sprite) {
                          sprite.asset = asset;
                          sprite.expression = name;
                        } else
                          (s.sprites ??= []).push({
                            id: crypto.randomUUID(),
                            asset,
                            name: c.name,
                            expression: name,
                            x: 500,
                            y: 490,
                            scale: 1,
                            opacity: 1,
                            flip: false,
                          });
                      })
                    }
                  >
                    Use stage expression
                  </button>
                  <button
                    onClick={() =>
                      edit((p) => {
                        delete p.characters[i].expressions![name];
                      })
                    }
                  >
                    Remove expression
                  </button>
                </div>
              ))}
            </div>
          ))}
        </>
      )}
      {view === "Audio" && (
        <>
          <label className="wide">
            Import scene audio
            <input
              aria-label="Import audio"
              type="file"
              accept="audio/*"
              onChange={(e) => {
                void audio(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </label>
          {project.audioAssets?.map((a) => (
            <div className="clue" key={a.id}>
              <b>{a.name}</b>
              <audio controls src={a.data} preload="none" />
              <button
                onClick={() =>
                  change((s) => {
                    if (!s.audio?.some((t) => t.id === a.id))
                      (s.audio ??= []).push({
                        id: a.id,
                        volume: 0.5,
                        loop: true,
                      });
                  })
                }
              >
                Use in scene
              </button>
            </div>
          ))}
          {scene.audio?.map((track, i) => (
            <div className="clue" key={track.id}>
              <b>{project.audioAssets?.find((a) => a.id === track.id)?.name}</b>
              <label>
                Volume {Math.round(track.volume * 100)}%
                <RangeInput
                  type="range"
                  min="0"
                  max="1"
                  step=".01"
                  value={track.volume}
                  onChange={(e) =>
                    change((s) => (s.audio![i].volume = +e.target.value))
                  }
                />
              </label>
              <label className="consent">
                <input
                  type="checkbox"
                  checked={track.loop}
                  onChange={(e) =>
                    change((s) => (s.audio![i].loop = e.target.checked))
                  }
                />
                Loop
              </label>
              <button onClick={() => change((s) => s.audio!.splice(i, 1))}>
                Remove from scene
              </button>
            </div>
          ))}
        </>
      )}
      {view === "QTE" && (
        <>
          <h4>Selected dialogue: {node.speaker}</h4>
          <p className="small muted">
            Select the dialogue below the stage. QTEs pause when the browser
            loses focus. Space, click and touch resolve the action once.
          </p>
          <button
            className="wide"
            onClick={() =>
              change((s) => {
                const n = s.nodes.find((n) => n.id === node.id)!;
                if (n.qte) delete n.qte;
                else
                  n.qte = {
                    prompt: "Act now",
                    seconds: 5,
                    success:
                      s.nodes.find((n) => n.id !== node.id)?.id || node.id,
                    timeout:
                      s.nodes.find((n) => n.id !== node.id)?.id || node.id,
                  };
              })
            }
          >
            {node.qte ? "Remove QTE" : "Add QTE to this dialogue"}
          </button>
          {node.qte && (
            <>
              <label>
                Prompt
                <input
                  value={node.qte.prompt}
                  onChange={(e) =>
                    change(
                      (s) =>
                        (s.nodes.find((n) => n.id === node.id)!.qte!.prompt =
                          e.target.value),
                    )
                  }
                />
              </label>
              <label>
                Duration (seconds)
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={node.qte.seconds}
                  onChange={(e) =>
                    change(
                      (s) =>
                        (s.nodes.find((n) => n.id === node.id)!.qte!.seconds =
                          Math.max(1, Math.min(120, +e.target.value))),
                    )
                  }
                />
              </label>
              {(["success", "timeout"] as const).map((outcome) => (
                <label key={outcome}>
                  {outcome} target
                  <select
                    value={node.qte![outcome]}
                    onChange={(e) =>
                      change(
                        (s) =>
                          (s.nodes.find((n) => n.id === node.id)!.qte![
                            outcome
                          ] = e.target.value),
                      )
                    }
                  >
                    {scene.nodes
                      .filter((n) => n.id !== node.id)
                      .map((n) => (
                        <option key={n.id} value={n.id}>
                          {n.text.slice(0, 30)}
                        </option>
                      ))}
                    {project.scenes
                      .filter((s) => s.id !== scene.id)
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title}
                        </option>
                      ))}
                  </select>
                </label>
              ))}
            </>
          )}
          <label className="consent">
            <input
              type="checkbox"
              checked={!!project.settings.skipQte}
              onChange={(e) =>
                edit((p) => (p.settings.skipQte = e.target.checked))
              }
            />
            Skip QTEs successfully
          </label>
          <label>
            Timing multiplier
            <RangeInput
              type="range"
              min=".5"
              max="3"
              step=".25"
              value={project.settings.timing || 1}
              onChange={(e) =>
                edit((p) => (p.settings.timing = +e.target.value))
              }
            />
          </label>
        </>
      )}
      {view === "Timeline" && (
        <>
          <h4>Sprite keyframes</h4>
          <p className="small muted">
            Linear position and opacity animation, measured in seconds from
            scene entry. Playback holds the final keyframe.
          </p>
          <button
            className="wide"
            disabled={!scene.sprites?.length}
            onClick={() =>
              change((s) =>
                (s.keyframes ??= []).push({
                  sprite: s.sprites![0].id,
                  time: 0,
                  x: s.sprites![0].x,
                  y: s.sprites![0].y,
                  opacity: 1,
                }),
              )
            }
          >
            Add keyframe
          </button>
          {scene.keyframes?.map((f, i) => (
            <div className="clue" key={i}>
              <label>
                Sprite
                <select
                  value={f.sprite}
                  onChange={(e) =>
                    change((s) => (s.keyframes![i].sprite = e.target.value))
                  }
                >
                  {scene.sprites?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
              {(["time", "x", "y", "opacity"] as const).map((k) => (
                <label key={k}>
                  {k}
                  <input
                    type="number"
                    min="0"
                    max={
                      k === "time"
                        ? 120
                        : k === "x"
                          ? 1000
                          : k === "y"
                            ? 563
                            : 1
                    }
                    step={k === "opacity" ? 0.05 : 1}
                    value={f[k]}
                    onChange={(e) =>
                      change((s) => {
                        s.keyframes![i][k] = Math.max(
                          0,
                          Math.min(
                            k === "time"
                              ? 120
                              : k === "x"
                                ? 1000
                                : k === "y"
                                  ? 563
                                  : 1,
                            +e.target.value,
                          ),
                        );
                      })
                    }
                  />
                </label>
              ))}
              <button onClick={() => change((s) => s.keyframes!.splice(i, 1))}>
                Remove keyframe
              </button>
            </div>
          ))}
        </>
      )}
      {view === "Graph" && (
        <>
          <h4>Story connections</h4>
          {project.scenes.map((s) => (
            <details key={s.id} open={s.id === scene.id}>
              <summary>{s.title}</summary>
              {s.nodes.map((n) => (
                <div className="clue" key={n.id}>
                  <b>
                    {n.speaker}: {n.text.slice(0, 40)}
                  </b>
                  <p>
                    Next: {n.next || (!n.choices.length ? "END" : "choice")}
                  </p>
                  {n.choices.map((c) => (
                    <p key={c.id}>
                      {c.text} →{" "}
                      {project.scenes.find((s) => s.id === c.target)?.title ||
                        s.nodes
                          .find((n) => n.id === c.target)
                          ?.text.slice(0, 30)}{" "}
                      {c.condition ? "[conditional]" : ""}
                    </p>
                  ))}
                </div>
              ))}
            </details>
          ))}
        </>
      )}
      {view === "State" && (
        <>
          <p className="small muted">
            Define state in JSON. Existing action types and targets are
            validated before committing changes.
          </p>
          <label>
            Variables
            <textarea
              rows={12}
              defaultValue={JSON.stringify(project.variables, null, 2)}
              onBlur={(e) => {
                try {
                  const p = structuredClone(project);
                  p.variables = JSON.parse(e.target.value);
                  validateProject(p);
                  edit((current) => Object.assign(current, p));
                  setError("");
                } catch (e) {
                  setError("Not applied: " + String(e));
                }
              }}
            />
          </label>
          <label>
            Clue registry
            <textarea
              rows={12}
              defaultValue={JSON.stringify(project.clues, null, 2)}
              onBlur={(e) => {
                try {
                  const p = structuredClone(project);
                  p.clues = JSON.parse(e.target.value);
                  validateProject(p);
                  edit((current) => Object.assign(current, p));
                  setError("");
                } catch (e) {
                  setError("Not applied: " + String(e));
                }
              }}
            />
          </label>
        </>
      )}
    </div>
  );
}
