import { useEffect, useRef, useState } from "react";
import {
  Layers,
  Film,
  ImagePlus,
  Play,
  Undo2,
  Redo2,
  Download,
  Upload,
  Settings2,
  ChevronRight,
  Plus,
  CloudRain,
  Sun,
  SlidersHorizontal,
  Square,
  RotateCcw,
  BookOpen,
  Code2,
  Check,
  MousePointer2,
  Trash2,
  Save,
  Eye,
  Volume2,
  MessageSquare,
  Sparkles,
  X,
  FolderOpen,
} from "lucide-react";
import { demo } from "./demo";
import {
  advance,
  enter,
  start,
  validateProject,
  type Project,
  type Scene,
  type Runtime,
  type Effects,
} from "./model";
import { exportProject, load, save, readImage, readProject } from "./storage";
import { Stage } from "./Stage";
const clone = <T,>(v: T): T => structuredClone(v);
function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  suffix = "",
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (n: number) => void;
  suffix?: string;
}) {
  return (
    <label className="slider">
      <span>
        {label}
        <output>
          {Math.round(value * 100) / 100}
          {suffix}
        </output>
      </span>
      <input
        aria-label={label}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
      />
    </label>
  );
}
function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="toggle-row">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}
export default function App() {
  const [project, setProject] = useState<Project>(() => demo());
  const [sceneId, setSceneId] = useState("cafe");
  const [nodeId, setNodeId] = useState("arrival");
  const [runtime, setRuntime] = useState<Runtime | null>(null);
  const [playing, setPlaying] = useState(false);
  const [tab, setTab] = useState("Scenes");
  const [inspector, setInspector] = useState("Atmosphere");
  const [bottom, setBottom] = useState("Dialogue");
  const [maskMode, setMaskMode] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [status, setStatus] = useState("Opening local project…");
  const [error, setError] = useState("");
  const [modal, setModal] = useState("");
  const [undo, setUndo] = useState<Project[]>([]);
  const [redo, setRedo] = useState<Project[]>([]);
  const [proposal, setProposal] = useState(false);
  const [prompt, setPrompt] = useState(
    "Add gentle rain to the café window and dim the background slightly.",
  );
  const [assetId, setAssetId] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const importInput = useRef<HTMLInputElement>(null);
  const revision = useRef(0);
  const saveQueue = useRef(Promise.resolve());
  useEffect(() => {
    load()
      .then((v) => {
        if (v) {
          setProject(v.project);
          setSceneId(v.project.scenes[0].id);
          setNodeId(v.project.scenes[0].nodes[0].id);
          if (
            v.runtime &&
            v.project.scenes.some(
              (s) =>
                s.id === v.runtime!.scene &&
                s.nodes.some((n) => n.id === v.runtime!.node),
            )
          )
            setRuntime(v.runtime);
        }
        setStatus("Saved on this device");
      })
      .catch((e) => {
        setError("Could not recover local project: " + e.message);
        setStatus("Recovery failed");
      })
      .finally(() => setLoaded(true));
  }, []);
  useEffect(() => {
    if (!loaded) return;
    const rev = ++revision.current;
    setStatus("Unsaved changes…");
    const timer = setTimeout(
      () => {
        saveQueue.current = saveQueue.current
          .catch(() => {})
          .then(() => save(project, runtime));
        saveQueue.current
          .then(() => {
            if (rev === revision.current) setStatus("Saved on this device");
          })
          .catch((e) => {
            setStatus("Save failed");
            setError("Local save failed. Export a backup. " + e.message);
          });
      },
      runtime ? 0 : 600,
    );
    return () => clearTimeout(timer);
  }, [project, runtime, loaded]);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (status === "Unsaved changes…") {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [status]);
  const selected =
    project.scenes.find((s) => s.id === sceneId) || project.scenes[0];
  const scene =
    playing && runtime
      ? project.scenes.find((s) => s.id === runtime.scene) || selected
      : selected;
  const node =
    scene.nodes.find((n) => n.id === (playing ? runtime?.node : nodeId)) ||
    scene.nodes[0];
  function edit(fn: (p: Project) => void) {
    setProject((p) => {
      const next = clone(p);
      fn(next);
      setUndo((u) => [...u.slice(-39), p]);
      setRedo([]);
      return next;
    });
  }
  function updateScene(fn: (s: Scene) => void) {
    edit((p) => fn(p.scenes.find((s) => s.id === sceneId)!));
  }
  function effect<K extends keyof Effects>(key: K, value: Effects[K]) {
    updateScene((s) => {
      s.effects[key] = value;
    });
  }
  function history(back: boolean) {
    const source = back ? undo : redo;
    if (!source.length) return;
    const last = source[source.length - 1];
    if (back) {
      setRedo((r) => [...r, project]);
      setUndo(source.slice(0, -1));
    } else {
      setUndo((u) => [...u, project]);
      setRedo(source.slice(0, -1));
    }
    setProject(last);
  }
  function selectScene(id: string) {
    setSceneId(id);
    setNodeId(project.scenes.find((s) => s.id === id)!.nodes[0].id);
    setMaskMode(false);
  }
  function play(restart = false) {
    try {
      validateProject(project);
      if (restart || !runtime) setRuntime(start(project));
      setPlaying(true);
      setMaskMode(false);
    } catch (e) {
      setError(String(e));
    }
  }
  function step(id?: string) {
    try {
      setRuntime((r) => advance(project, r!, id));
    } catch (e) {
      setError(String(e));
    }
  }
  async function images(files: FileList | null) {
    if (!files) return;
    try {
      const imported: Project["assets"] = [];
      for (const f of Array.from(files)) imported.push(await readImage(f));
      edit((p) => {
        p.assets.push(...imported);
        p.scenes.find((s) => s.id === sceneId)!.background = imported[0].id;
      });
      setAssetId(imported[0].id);
      setTab("Assets");
    } catch (e) {
      setError(String(e));
    }
  }
  async function importFile(f?: File) {
    if (!f) return;
    try {
      const p = await readProject(f);
      edit((current) => Object.assign(current, p));
      setRuntime(null);
      setPlaying(false);
      setSceneId(p.scenes[0].id);
      setNodeId(p.scenes[0].nodes[0].id);
    } catch (e) {
      setError("Import failed: " + String(e));
    }
  }
  function newProject() {
    const p = demo();
    p.title = "Untitled story";
    p.scenes = [
      {
        ...p.scenes[0],
        title: "Opening scene",
        nodes: [
          {
            id: "start",
            speaker: "Narrator",
            text: "Every story starts somewhere.",
            choices: [],
          },
        ],
      },
    ];
    p.assets = [];
    setProject(p);
    setSceneId(p.scenes[0].id);
    setNodeId("start");
    setRuntime(null);
    setPlaying(false);
    setUndo([]);
    setRedo([]);
    setModal("");
  }
  const asset = project.assets.find(
    (a) => a.id === (assetId || selected.background),
  );
  const e = selected.effects;
  const availableChoices = node.choices.filter(
    (c) =>
      !playing ||
      !c.condition ||
      runtime?.values[c.condition.key] === c.condition.equals,
  );
  if (!loaded)
    return (
      <div className="loading-screen">
        <Layers size={30} />
        <p>Opening your studio…</p>
      </div>
    );
  return (
    <div className={"app " + (playing ? "is-playing" : "")}>
      <header>
        <a
          className="brand"
          href="#"
          onClick={(ev) => {
            ev.preventDefault();
            setModal("projects");
          }}
        >
          <span className="brand-icon">
            <Layers size={21} />
          </span>
          stillframe<span className="brand-sub">STUDIO</span>
        </a>
        <div className="project-name">
          <span className="separator">/</span>
          <input
            aria-label="Project title"
            value={project.title}
            onChange={(e) =>
              edit((p) => {
                p.title = e.target.value;
              })
            }
          />
          <span className="version">LOCAL PROJECT</span>
        </div>
        <div className="header-actions">
          <span className="save-status">
            <i className={status.startsWith("Saved") ? "saved" : ""} />
            {status}
          </span>
          <button
            title="Save now"
            aria-label="Save now"
            onClick={() => {
              saveQueue.current = saveQueue.current
                .catch(() => {})
                .then(() => save(project, runtime));
              saveQueue.current
                .then(() => setStatus("Saved on this device"))
                .catch((err) => setError(String(err)));
            }}
          >
            <Save size={16} />
          </button>
          <button
            title="Undo"
            aria-label="Undo"
            disabled={!undo.length || playing}
            onClick={() => history(true)}
          >
            <Undo2 size={16} />
          </button>
          <button
            title="Redo"
            aria-label="Redo"
            disabled={!redo.length || playing}
            onClick={() => history(false)}
          >
            <Redo2 size={16} />
          </button>
          <div className="divider" />
          <button onClick={() => setModal("settings")} aria-label="Settings">
            <Settings2 size={17} />
          </button>
          <button
            className="primary"
            onClick={() => (playing ? setPlaying(false) : play())}
          >
            {playing ? (
              <Square size={14} />
            ) : (
              <Play size={14} fill="currentColor" />
            )}
            {playing ? "Back to editor" : "Play story"}
          </button>
        </div>
      </header>
      <div className="workspace">
        <nav className="rail">
          {[
            [Film, "Scenes"],
            [ImagePlus, "Assets"],
            [BookOpen, "Characters"],
            [Code2, "State"],
            [Sparkles, "Assistant"],
          ].map(([Icon, label]) => {
            const I = Icon as typeof Film;
            return (
              <button
                key={String(label)}
                title={String(label)}
                aria-label={String(label)}
                className={tab === label ? "active" : ""}
                onClick={() => setTab(String(label))}
              >
                <I size={20} />
              </button>
            );
          })}
          <span className="rail-spacer" />
          <button
            title="Project settings"
            aria-label="Project settings"
            onClick={() => setModal("settings")}
          >
            <Settings2 size={20} />
          </button>
          <span className="avatar">Y</span>
        </nav>
        <aside className="library">
          <div className="panel-heading">
            <span>{tab === "Scenes" ? "Your story" : tab}</span>
            {tab === "Scenes" && (
              <button
                title="Add scene"
                aria-label="Add scene"
                onClick={() => {
                  const id = crypto.randomUUID();
                  edit((p) =>
                    p.scenes.push({
                      ...clone(selected),
                      id,
                      title: "Untitled scene",
                      nodes: [
                        {
                          id: "start",
                          speaker: "Narrator",
                          text: "A new moment.",
                          choices: [],
                        },
                      ],
                      entry: [],
                    }),
                  );
                  setSceneId(id);
                  setNodeId("start");
                }}
              >
                <Plus size={16} />
              </button>
            )}
          </div>
          {tab === "Scenes" && (
            <>
              <div className="section-label">
                SCENES{" "}
                <span>{String(project.scenes.length).padStart(2, "0")}</span>
              </div>
              <div className="scene-list">
                {project.scenes.map((s, i) => (
                  <button
                    key={s.id}
                    className={
                      "scene-card " + (scene.id === s.id ? "selected" : "")
                    }
                    onClick={() =>
                      playing
                        ? setRuntime((r) => enter(project, r!, s.id))
                        : selectScene(s.id)
                    }
                  >
                    <div className={"scene-thumb " + s.art}>
                      {s.background ? (
                        <img
                          src={
                            project.assets.find((a) => a.id === s.background)
                              ?.data
                          }
                        />
                      ) : (
                        <span>
                          {s.art === "cafe"
                            ? "☕"
                            : s.art === "phone"
                              ? "▣"
                              : s.art === "outfit"
                                ? "♧"
                                : "☾"}
                        </span>
                      )}
                      <small>{String(i + 1).padStart(2, "0")}</small>
                    </div>
                    <div className="scene-title">
                      {s.title}
                      <span>{s.nodes.length} dialogue nodes</span>
                    </div>
                    {scene.id === s.id && <i className="scene-dot" />}
                  </button>
                ))}
              </div>
              <div className="story-note">
                <span className="section-label">OPENING CHAPTER</span>
                <p>
                  Small decisions.
                  <br />
                  Things remembered later.
                </p>
                <span className="note-line" />
                <small>A playable, branching first encounter.</small>
              </div>
            </>
          )}
          {tab === "Assets" && (
            <div className="library-body">
              <button
                className="wide dashed"
                onClick={() => input.current?.click()}
              >
                <Upload size={16} /> Import artwork
              </button>
              <p className="muted small">
                PNG, JPEG or WebP · up to 15 MB. Originals stay in your project.
              </p>
              {project.assets.length === 0 && (
                <div className="empty">
                  <ImagePlus />
                  <p>Your visual world starts here.</p>
                  <small>Import a background, reference or portrait.</small>
                </div>
              )}
              {project.assets.map((a) => (
                <button
                  key={a.id}
                  className={
                    "asset-card " + (assetId === a.id ? "selected" : "")
                  }
                  onClick={() => {
                    setAssetId(a.id);
                    setInspector("Background");
                  }}
                >
                  <img src={a.data} />
                  <b>{a.name}</b>
                  <small>
                    {a.width} × {a.height} ·{" "}
                    {a.reference
                      ? "Reference"
                      : a.approved
                        ? "Approved"
                        : "Candidate"}
                  </small>
                </button>
              ))}
              {asset && (
                <div className="asset-meta">
                  <label>
                    Name
                    <input
                      value={asset.name}
                      onChange={(ev) =>
                        edit((p) => {
                          p.assets.find((a) => a.id === asset.id)!.name =
                            ev.target.value;
                        })
                      }
                    />
                  </label>
                  <label>
                    Tags
                    <input
                      value={asset.tags}
                      onChange={(ev) =>
                        edit((p) => {
                          p.assets.find((a) => a.id === asset.id)!.tags =
                            ev.target.value;
                        })
                      }
                    />
                  </label>
                  <label>
                    Notes
                    <textarea
                      value={asset.notes}
                      onChange={(ev) =>
                        edit((p) => {
                          p.assets.find((a) => a.id === asset.id)!.notes =
                            ev.target.value;
                        })
                      }
                    />
                  </label>
                  <Toggle
                    label="Approved artwork"
                    value={asset.approved}
                    onChange={(v) =>
                      edit((p) => {
                        p.assets.find((a) => a.id === asset.id)!.approved = v;
                      })
                    }
                  />
                  <Toggle
                    label="Reference only"
                    value={asset.reference}
                    onChange={(v) =>
                      edit((p) => {
                        p.assets.find((a) => a.id === asset.id)!.reference = v;
                      })
                    }
                  />
                  <button
                    className="wide"
                    disabled={asset.reference}
                    onClick={() =>
                      updateScene((s) => {
                        s.background = asset.id;
                      })
                    }
                  >
                    Use as background
                  </button>
                  <button
                    className="wide"
                    disabled={asset.reference}
                    onClick={() =>
                      edit((p) => {
                        p.characters[0].portrait = asset.id;
                      })
                    }
                  >
                    Use as Mara’s portrait
                  </button>
                </div>
              )}
            </div>
          )}
          {tab === "Characters" && (
            <div className="library-body">
              {project.characters.map((c) => (
                <div className="character-card" key={c.id}>
                  <div className="portrait">
                    {c.portrait ? (
                      <img
                        src={
                          project.assets.find((a) => a.id === c.portrait)?.data
                        }
                      />
                    ) : (
                      <span>M</span>
                    )}
                  </div>
                  <label>
                    Character name
                    <input
                      value={c.name}
                      onChange={(e) =>
                        edit((p) => {
                          p.characters.find((x) => x.id === c.id)!.name =
                            e.target.value;
                        })
                      }
                    />
                  </label>
                  <label>
                    Voice & knowledge boundaries
                    <textarea
                      rows={6}
                      value={c.notes}
                      onChange={(e) =>
                        edit((p) => {
                          p.characters.find((x) => x.id === c.id)!.notes =
                            e.target.value;
                        })
                      }
                    />
                  </label>
                  <small className="muted">
                    Import a portrait in Assets, then choose “Use as Mara’s
                    portrait”.
                  </small>
                </div>
              ))}
            </div>
          )}
          {tab === "State" && (
            <div className="library-body">
              <p className="muted small">
                {runtime ? "Current playthrough" : "Initial story state"}
              </p>
              {Object.entries(runtime?.values || project.variables).map(
                ([k, v]) => (
                  <div className="state-row" key={k}>
                    <span>{k}</span>
                    <code>{String(v)}</code>
                  </div>
                ),
              )}
              <h4>Clue registry</h4>
              {project.clues.map((c) => (
                <div className="clue" key={c.id}>
                  <b>
                    {runtime?.values[c.id] ? "● Discovered" : "○ Undiscovered"}
                  </b>
                  <p>{c.fact}</p>
                  <small>Possible interpretations</small>
                  {c.interpretations.map((x) => (
                    <p className="muted small" key={x}>
                      {x}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          )}
          {tab === "Assistant" && (
            <div className="library-body">
              <span className="badge">LOCAL PRESET · NO AI CONNECTED</span>
              <h3>An atmospheric adjustment</h3>
              <p className="muted small">
                This offline helper recognises rain and dimming requests. It
                does not call an AI provider or send your work anywhere.
              </p>
              <textarea
                rows={6}
                aria-label="Atmosphere request"
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                  setProposal(false);
                }}
              />
              <button
                className="wide"
                onClick={() => {
                  if (!/rain|dim/i.test(prompt)) {
                    setError(
                      "This local helper supports rain or dimming only. Other requests need a future provider adapter.",
                    );
                    return;
                  }
                  setProposal(true);
                }}
              >
                Review proposal
              </button>
              {proposal && (
                <div className="clue">
                  <b>Proposed changes · {selected.title}</b>
                  <p>Target: {selected.id}</p>
                  {/rain/i.test(prompt) && (
                    <p>
                      Enable rain, density 65, opacity 0.3. Use a window polygon
                      covering the left side.
                    </p>
                  )}
                  {/dim/i.test(prompt) && <p>Set brightness to 0.85.</p>}
                  <small>
                    Assumption: the window is on the left. Adjust the region
                    manually if needed.
                  </small>
                  <button
                    className="wide primary"
                    onClick={() => {
                      updateScene((s) => {
                        if (/rain/i.test(prompt)) {
                          s.effects.rain = true;
                          s.effects.density = 65;
                          s.effects.opacity = 0.3;
                          s.effects.mask = [
                            { x: 60, y: 30 },
                            { x: 590, y: 30 },
                            { x: 590, y: 370 },
                            { x: 60, y: 370 },
                          ];
                        }
                        if (/dim/i.test(prompt)) s.effects.brightness = 0.85;
                      });
                      setProposal(false);
                    }}
                  >
                    Apply changes
                  </button>
                  <button className="wide" onClick={() => setProposal(false)}>
                    Reject
                  </button>
                </div>
              )}
            </div>
          )}
          <div className="library-footer">
            <button onClick={() => importInput.current?.click()}>
              <FolderOpen size={15} /> Open project
            </button>
            <button
              onClick={() => {
                try {
                  exportProject(project);
                } catch (e) {
                  setError(String(e));
                }
              }}
            >
              <Download size={15} /> Export project
            </button>
          </div>
        </aside>
        <main>
          <div className="workspace-toolbar">
            <div className="breadcrumb">
              Scenes <ChevronRight size={12} />
              <b>{scene.title}</b>
            </div>
            <span className="badge">
              {playing ? "PLAYTEST" : "SCENE EDITOR"}
            </span>
          </div>
          <section className="preview-area">
            <div className="preview-header">
              <div>
                <span className="eyebrow">{scene.subtitle}</span>
                <h1>{scene.title}</h1>
              </div>
              <div className="preview-tools">
                <button
                  title="Toggle safe area"
                  aria-label="Toggle safe area"
                  className={project.settings.guides ? "active" : ""}
                  onClick={() =>
                    edit((p) => {
                      p.settings.guides = !p.settings.guides;
                    })
                  }
                >
                  <Square size={15} />
                </button>
                <span>16:9</span>
                <span className="live-dot" /> <small>LIVE PREVIEW</small>
              </div>
            </div>
            <Stage
              project={project}
              scene={scene}
              playing={playing}
              maskMode={maskMode && !playing}
              onMask={(v) => effect("mask", v)}
            >
              {!maskMode && (
                <div className="dialogue-overlay">
                  {node.speaker === "Mara" &&
                    project.characters[0]?.portrait && (
                      <img
                        className="dialogue-portrait"
                        src={
                          project.assets.find(
                            (a) => a.id === project.characters[0].portrait,
                          )?.data
                        }
                      />
                    )}
                  <span className="dialogue-speaker">
                    {node.speaker === "Mara"
                      ? project.characters[0]?.name
                      : node.speaker}
                  </span>
                  <p>
                    {node.text.replace(/\{(\w+)\}/g, (_, key) =>
                      String(
                        (playing ? runtime?.values : project.variables)?.[
                          key
                        ] || "{" + key + "}",
                      ),
                    )}
                  </p>
                  {playing ? (
                    <>
                      {runtime?.ended ? (
                        <button className="continue" onClick={() => play(true)}>
                          End of opening chapter · Play again{" "}
                          <RotateCcw size={13} />
                        </button>
                      ) : availableChoices.length ? (
                        <div className="play-choices">
                          {availableChoices.map((c) => (
                            <button key={c.id} onClick={() => step(c.id)}>
                              {c.text}
                              <ChevronRight size={13} />
                            </button>
                          ))}
                        </div>
                      ) : (
                        <button className="continue" onClick={() => step()}>
                          Continue <ChevronRight size={15} />
                        </button>
                      )}
                    </>
                  ) : (
                    <span className="dialogue-hint">
                      DIALOGUE PREVIEW <span>◇</span>
                    </span>
                  )}
                </div>
              )}
              {maskMode && (
                <div className="mask-hint">
                  Click to add a vertex · use the inspector to remove the last
                  point
                </div>
              )}
            </Stage>
            <div className="stage-footer">
              <div>
                <span className="live-dot" />{" "}
                {playing
                  ? "Story is running"
                  : maskMode
                    ? "Editing rain region"
                    : "Changes preview in real time"}
                <span className="footer-sep">·</span>
                {scene.background
                  ? "Imported artwork"
                  : "Replaceable illustration"}
              </div>
              <button
                onClick={() =>
                  playing ? setRuntime(start(project)) : play(true)
                }
              >
                <RotateCcw size={13} />
                {playing ? "Restart story" : "Play from beginning"}
              </button>
            </div>
          </section>
          <section className="bottom-panel">
            <div className="bottom-tabs">
              {["Dialogue", "State & clues", "Event log"].map((t) => (
                <button
                  key={t}
                  className={bottom === t ? "active" : ""}
                  onClick={() => setBottom(t)}
                >
                  {t === "Dialogue" ? (
                    <MessageSquare size={14} />
                  ) : t === "State & clues" ? (
                    <Code2 size={14} />
                  ) : (
                    <BookOpen size={14} />
                  )}{" "}
                  {t}
                </button>
              ))}
              <span />
              {!playing && (
                <button
                  onClick={() => {
                    const id = crypto.randomUUID();
                    updateScene((s) =>
                      s.nodes.push({
                        id,
                        speaker: "Narrator",
                        text: "A new line of dialogue.",
                        choices: [],
                      }),
                    );
                    setNodeId(id);
                  }}
                >
                  <Plus size={14} /> Add node
                </button>
              )}
            </div>
            {bottom === "Dialogue" && (
              <div className="dialogue-editor">
                <div className="node-list">
                  {scene.nodes.map((n, i) => (
                    <button
                      disabled={playing}
                      key={n.id}
                      className={node.id === n.id ? "active" : ""}
                      onClick={() => setNodeId(n.id)}
                    >
                      <span>{String(i + 1).padStart(2, "0")}</span>
                      <div>
                        {n.speaker}
                        <small>{n.text.slice(0, 42)}…</small>
                      </div>
                      {n.choices.length > 0 && (
                        <span className="node-count">{n.choices.length} ⑂</span>
                      )}
                    </button>
                  ))}
                </div>
                <div className="node-fields">
                  <div className="field-row">
                    <label>
                      Speaker
                      <input
                        disabled={playing}
                        aria-label="Speaker"
                        value={node.speaker}
                        onChange={(ev) =>
                          updateScene((s) => {
                            s.nodes.find((n) => n.id === node.id)!.speaker =
                              ev.target.value;
                          })
                        }
                      />
                    </label>
                    <label>
                      Next dialogue
                      <select
                        disabled={playing || node.choices.length > 0}
                        value={node.next || ""}
                        onChange={(ev) =>
                          updateScene((s) => {
                            s.nodes.find((n) => n.id === node.id)!.next =
                              ev.target.value || undefined;
                          })
                        }
                      >
                        <option value="">End scene</option>
                        {scene.nodes
                          .filter((n) => n.id !== node.id)
                          .map((n) => (
                            <option key={n.id} value={n.id}>
                              {n.speaker}: {n.text.slice(0, 25)}
                            </option>
                          ))}
                      </select>
                    </label>
                  </div>
                  <textarea
                    disabled={playing}
                    aria-label="Dialogue text"
                    value={node.text}
                    rows={3}
                    onChange={(ev) =>
                      updateScene((s) => {
                        s.nodes.find((n) => n.id === node.id)!.text =
                          ev.target.value;
                      })
                    }
                  />
                  <div className="choices-heading">
                    <span>
                      CHOICES <small>{node.choices.length}</small>
                    </span>
                    <button
                      disabled={playing}
                      onClick={() =>
                        updateScene((s) => {
                          const n = s.nodes.find((n) => n.id === node.id)!;
                          n.next = undefined;
                          n.choices.push({
                            id: crypto.randomUUID(),
                            text: "A new choice",
                            target:
                              s.nodes.find((x) => x.id !== n.id)?.id || n.id,
                            actions: [],
                            note: "",
                          });
                        })
                      }
                    >
                      <Plus size={13} /> Add choice
                    </button>
                  </div>
                  {node.choices.map((c, i) => (
                    <div className="choice-editor" key={c.id}>
                      <span>{String(i + 1).padStart(2, "0")}</span>
                      <input
                        disabled={playing}
                        aria-label={"Choice " + (i + 1)}
                        value={c.text}
                        onChange={(ev) =>
                          updateScene((s) => {
                            s.nodes.find((n) => n.id === node.id)!.choices[
                              i
                            ].text = ev.target.value;
                          })
                        }
                      />
                      <select
                        disabled={playing}
                        aria-label={"Choice " + (i + 1) + " target"}
                        value={c.target}
                        onChange={(ev) =>
                          updateScene((s) => {
                            s.nodes.find((n) => n.id === node.id)!.choices[
                              i
                            ].target = ev.target.value;
                          })
                        }
                      >
                        <optgroup label="Dialogue">
                          {scene.nodes.map((n) => (
                            <option key={n.id} value={n.id}>
                              {n.text.slice(0, 24)}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="Scenes">
                          {project.scenes.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.title}
                            </option>
                          ))}
                        </optgroup>
                      </select>
                      <button
                        disabled={playing}
                        aria-label={"Delete choice " + (i + 1)}
                        onClick={() =>
                          updateScene((s) => {
                            s.nodes
                              .find((n) => n.id === node.id)!
                              .choices.splice(i, 1);
                          })
                        }
                      >
                        <Trash2 size={13} />
                      </button>
                      <details>
                        <summary>
                          {c.actions.length} state changes
                          {c.condition ? " · conditional" : ""}
                        </summary>
                        <label>
                          State actions (JSON)
                          <textarea
                            disabled={playing}
                            key={c.id + "actions"}
                            defaultValue={JSON.stringify(c.actions, null, 2)}
                            onBlur={(ev) => {
                              try {
                                const actions = JSON.parse(ev.target.value);
                                const p = clone(project);
                                p.scenes
                                  .find((s) => s.id === sceneId)!
                                  .nodes.find((n) => n.id === node.id)!.choices[
                                  i
                                ].actions = actions;
                                validateProject(p);
                                edit((current) => Object.assign(current, p));
                              } catch (err) {
                                setError(
                                  "State actions were not applied: " +
                                    String(err),
                                );
                              }
                            }}
                          />
                        </label>
                        <label>
                          Condition (JSON or null)
                          <textarea
                            disabled={playing}
                            key={c.id + "condition"}
                            defaultValue={JSON.stringify(c.condition || null)}
                            onBlur={(ev) => {
                              try {
                                const condition =
                                  JSON.parse(ev.target.value) || undefined;
                                const p = clone(project);
                                p.scenes
                                  .find((s) => s.id === sceneId)!
                                  .nodes.find((n) => n.id === node.id)!.choices[
                                  i
                                ].condition = condition;
                                validateProject(p);
                                edit((current) => Object.assign(current, p));
                              } catch (err) {
                                setError(
                                  "Condition was not applied: " + String(err),
                                );
                              }
                            }}
                          />
                        </label>
                      </details>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {bottom === "State & clues" && (
              <div className="debug-state">
                <div className="state-grid">
                  {Object.entries(runtime?.values || project.variables).map(
                    ([k, v]) => (
                      <div key={k}>
                        <span>{k}</span>
                        <code className={v === true ? "positive" : ""}>
                          {String(v)}
                        </code>
                      </div>
                    ),
                  )}
                </div>
                {project.clues
                  .filter((c) => runtime?.values[c.id])
                  .map((c) => (
                    <div key={c.id} className="clue">
                      <b>Observation: {c.fact}</b>
                      <p>
                        Interpretations remain unconfirmed:{" "}
                        {c.interpretations.join(" / ")}
                      </p>
                    </div>
                  ))}
              </div>
            )}
            {bottom === "Event log" && (
              <div className="event-log">
                {runtime?.history.length ? (
                  runtime.history.map((x, i) => (
                    <p key={i}>
                      <span>{String(i + 1).padStart(2, "0")}</span>
                      {x}
                    </p>
                  ))
                ) : (
                  <p className="muted">
                    Play the story to record choices and transitions.
                  </p>
                )}
              </div>
            )}
          </section>
        </main>
        <aside className="inspector">
          <div className="panel-heading">
            <span>
              <SlidersHorizontal size={15} /> Scene properties
            </span>
            <button
              title="Reset atmosphere"
              aria-label="Reset atmosphere"
              disabled={playing}
              onClick={() =>
                updateScene((s) => {
                  s.effects = demo().scenes.find(
                    (x) => x.art === s.art,
                  )!.effects;
                })
              }
            >
              <RotateCcw size={14} />
            </button>
          </div>
          <div className="inspector-tabs">
            {["Atmosphere", "Background"].map((t) => (
              <button
                key={t}
                className={inspector === t ? "active" : ""}
                onClick={() => setInspector(t)}
              >
                {t}
              </button>
            ))}
          </div>
          <fieldset disabled={playing}>
            {inspector === "Atmosphere" ? (
              <>
                <section className="property-section">
                  <h3>
                    <Sun size={15} /> Lighting & colour{" "}
                    <span className="tiny-dot" />
                  </h3>
                  <Slider
                    label="Brightness"
                    value={e.brightness}
                    min={0.2}
                    max={2}
                    step={0.01}
                    onChange={(v) => effect("brightness", v)}
                  />
                  <Slider
                    label="Contrast"
                    value={e.contrast}
                    min={0.5}
                    max={2}
                    step={0.01}
                    onChange={(v) => effect("contrast", v)}
                  />
                  <label className="color-row">
                    Ambient tint{" "}
                    <span>
                      <input
                        aria-label="Ambient tint"
                        type="color"
                        value={e.tint}
                        onChange={(ev) => effect("tint", ev.target.value)}
                      />
                      <code>{e.tint.toUpperCase()}</code>
                    </span>
                  </label>
                  <Slider
                    label="Tint strength"
                    value={e.tintOpacity}
                    min={0}
                    max={0.7}
                    step={0.01}
                    onChange={(v) => effect("tintOpacity", v)}
                  />
                  <Slider
                    label="Soft light intensity"
                    value={e.light}
                    min={0}
                    max={1}
                    step={0.01}
                    onChange={(v) => effect("light", v)}
                  />
                  <details>
                    <summary>Light position</summary>
                    <Slider
                      label="Light X"
                      value={e.lightX}
                      min={0}
                      max={100}
                      onChange={(v) => effect("lightX", v)}
                    />
                    <Slider
                      label="Light Y"
                      value={e.lightY}
                      min={0}
                      max={100}
                      onChange={(v) => effect("lightY", v)}
                    />
                  </details>
                </section>
                <section className="property-section">
                  <h3>
                    <CloudRain size={16} /> Falling rain{" "}
                    <input
                      aria-label="Falling rain"
                      type="checkbox"
                      checked={e.rain}
                      onChange={(ev) => effect("rain", ev.target.checked)}
                    />
                  </h3>
                  <p className="help">A little weather. A different feeling.</p>
                  <Slider
                    label="Intensity / density"
                    value={e.density}
                    min={0}
                    max={200}
                    onChange={(v) => effect("density", v)}
                  />
                  <Slider
                    label="Speed"
                    value={e.speed}
                    min={0}
                    max={3}
                    step={0.05}
                    suffix="×"
                    onChange={(v) => effect("speed", v)}
                  />
                  <Slider
                    label="Angle"
                    value={e.angle}
                    min={-50}
                    max={50}
                    suffix="°"
                    onChange={(v) => effect("angle", v)}
                  />
                  <Slider
                    label="Drop length"
                    value={e.length}
                    min={2}
                    max={45}
                    suffix="px"
                    onChange={(v) => effect("length", v)}
                  />
                  <Slider
                    label="Opacity"
                    value={e.opacity}
                    min={0}
                    max={1}
                    step={0.01}
                    onChange={(v) => effect("opacity", v)}
                  />
                  <label className="color-row">
                    Rain colour
                    <input
                      aria-label="Rain colour"
                      type="color"
                      value={e.color}
                      onChange={(ev) => effect("color", ev.target.value)}
                    />
                  </label>
                  <div className="region-box">
                    <div>
                      <MousePointer2 size={14} /> Effect region{" "}
                      <span className="badge">
                        {e.mask.length >= 3 ? "MASKED" : "FULL STAGE"}
                      </span>
                    </div>
                    <p>Rain stays inside the selected region.</p>
                    <button
                      className={"wide " + (maskMode ? "primary" : "")}
                      onClick={() => setMaskMode(!maskMode)}
                    >
                      {maskMode ? <Check size={13} /> : <Plus size={13} />}{" "}
                      {maskMode ? "Finish region" : "Edit polygon mask"}
                    </button>
                    {maskMode && (
                      <p className="help">
                        Click stage to add points. Clear to draw a new region.
                        Minimum 3 points.
                      </p>
                    )}
                    <div className="field-row">
                      <button
                        disabled={!e.mask.length}
                        onClick={() => effect("mask", e.mask.slice(0, -1))}
                      >
                        Remove last
                      </button>
                      <button
                        disabled={!e.mask.length}
                        onClick={() => effect("mask", [])}
                      >
                        Clear
                      </button>
                    </div>
                    <Toggle
                      label="Invert region"
                      value={e.invert}
                      onChange={(v) => effect("invert", v)}
                    />
                  </div>
                  <Toggle
                    label="Rain on glass"
                    value={e.glass}
                    onChange={(v) => effect("glass", v)}
                  />
                </section>
                <section className="property-section">
                  <h3>
                    <Eye size={15} /> Finishing touches
                  </h3>
                  <Toggle
                    label="Soft vignette"
                    value={e.vignette}
                    onChange={(v) => effect("vignette", v)}
                  />
                  <Toggle
                    label="Reduced effects"
                    value={project.settings.reducedEffects}
                    onChange={(v) =>
                      edit((p) => {
                        p.settings.reducedEffects = v;
                      })
                    }
                  />
                  <button
                    className="wide subtle"
                    onClick={() =>
                      updateScene((s) => {
                        s.effects.rain = false;
                        s.effects.glass = false;
                        s.effects.light = 0;
                        s.effects.tintOpacity = 0;
                        s.effects.vignette = false;
                        s.effects.brightness = 1;
                        s.effects.contrast = 1;
                      })
                    }
                  >
                    Disable all effects
                  </button>
                </section>
              </>
            ) : (
              <section className="property-section">
                <h3>
                  <ImagePlus size={15} /> Background artwork
                </h3>
                <label>
                  Scene title
                  <input
                    value={selected.title}
                    onChange={(ev) =>
                      updateScene((s) => {
                        s.title = ev.target.value;
                      })
                    }
                  />
                </label>
                <label>
                  Source
                  <select
                    value={selected.background || ""}
                    onChange={(ev) =>
                      updateScene((s) => {
                        s.background = ev.target.value || null;
                      })
                    }
                  >
                    <option value="">Included illustration</option>
                    {project.assets
                      .filter((a) => !a.reference)
                      .map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                  </select>
                </label>
                <button className="wide" onClick={() => input.current?.click()}>
                  <Upload size={14} /> Import background
                </button>
                <label>
                  Image fit
                  <select
                    value={selected.fit}
                    onChange={(ev) =>
                      updateScene((s) => {
                        s.fit = ev.target.value as Scene["fit"];
                      })
                    }
                  >
                    {["cover", "contain", "stretch"].map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                </label>
                <Slider
                  label="Horizontal position"
                  value={selected.x}
                  min={-100}
                  max={100}
                  onChange={(v) =>
                    updateScene((s) => {
                      s.x = v;
                    })
                  }
                />
                <Slider
                  label="Vertical position"
                  value={selected.y}
                  min={-100}
                  max={100}
                  onChange={(v) =>
                    updateScene((s) => {
                      s.y = v;
                    })
                  }
                />
                <Slider
                  label="Scale"
                  value={selected.scale}
                  min={0.2}
                  max={3}
                  step={0.01}
                  onChange={(v) =>
                    updateScene((s) => {
                      s.scale = v;
                    })
                  }
                />
                <p className="muted small">
                  Transforms preserve the original image. The rain region uses
                  scene coordinates and follows background position and scale.
                </p>
                <button
                  className="wide"
                  onClick={() =>
                    updateScene((s) => {
                      s.x = 0;
                      s.y = 0;
                      s.scale = 1;
                      s.fit = "cover";
                    })
                  }
                >
                  Reset transform
                </button>
              </section>
            )}
          </fieldset>
          <div className="inspector-foot">
            <span className="live-dot" /> NON-DESTRUCTIVE EDITING
          </div>
        </aside>
      </div>
      <footer className="app-footer">
        <span>
          <span className="live-dot" /> All yours. Stored locally.
        </span>
        <span>
          CHAPTER 01 <span className="footer-sep">/</span>{" "}
          {project.scenes.length} SCENES <span className="footer-sep">/</span>{" "}
          {project.scenes.reduce((a, s) => a + s.nodes.length, 0)} NODES
        </span>
        <span>Made for the stories in between.</span>
      </footer>
      <input
        hidden
        ref={input}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        multiple
        onChange={(ev) => {
          void images(ev.target.files);
          ev.target.value = "";
        }}
      />
      <input
        hidden
        ref={importInput}
        type="file"
        accept=".json"
        onChange={(ev) => {
          void importFile(ev.target.files?.[0]);
          ev.target.value = "";
        }}
      />
      {error && (
        <div className="error-toast" role="alert">
          <span>{error}</span>
          <button aria-label="Dismiss error" onClick={() => setError("")}>
            <X size={16} />
          </button>
        </div>
      )}
      {modal && (
        <div className="modal-backdrop" onClick={() => setModal("")}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label={modal === "settings" ? "Project settings" : "Projects"}
            onClick={(ev) => ev.stopPropagation()}
          >
            <button
              className="close"
              aria-label="Close dialog"
              onClick={() => setModal("")}
            >
              <X size={18} />
            </button>
            <Layers size={28} />
            <h2>
              {modal === "settings" ? "Your workspace" : "A new beginning"}
            </h2>
            {modal === "settings" ? (
              <>
                <p>
                  This is a local-first studio. Projects and original images are
                  saved in this browser’s IndexedDB. Export regularly to back up
                  your work or move between devices.
                </p>
                <Toggle
                  label="Reduced effects"
                  value={project.settings.reducedEffects}
                  onChange={(v) =>
                    edit((p) => {
                      p.settings.reducedEffects = v;
                    })
                  }
                />
                <Toggle
                  label="Safe-area guides"
                  value={project.settings.guides}
                  onChange={(v) =>
                    edit((p) => {
                      p.settings.guides = v;
                    })
                  }
                />
                <p className="muted">
                  No AI provider, cloud account, or analytics is connected.
                  Offline editing works after this page loads. The production
                  build caches the app for offline reloads once its service
                  worker installs over HTTPS.
                </p>
                <button
                  className="wide"
                  onClick={() => {
                    try {
                      validateProject(project);
                      setError(
                        "Validation passed: all dialogue targets and state actions are valid.",
                      );
                      setModal("");
                    } catch (e) {
                      setError(String(e));
                    }
                  }}
                >
                  Validate story
                </button>
              </>
            ) : (
              <>
                <p>
                  Export your current project before starting another. This
                  browser stores one active project.
                </p>
                <button className="wide" onClick={() => exportProject(project)}>
                  <Download size={15} /> Back up current project
                </button>
                <button className="wide primary" onClick={newProject}>
                  Create blank project
                </button>
                <button
                  className="wide"
                  onClick={() => {
                    const p = demo();
                    setProject(p);
                    setSceneId("cafe");
                    setNodeId("arrival");
                    setRuntime(null);
                    setPlaying(false);
                    setModal("");
                  }}
                >
                  Load opening demo
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
