import { SceneTransitionControls } from "./SceneTransitionControls";
import { PlaySession } from "./PlaySession";
import { withDeviceUpload } from "./DeviceAppearance";
import { deviceScreen } from "./interactions";
import { PlaybackControls } from "./PlaybackControls";
import { InteractionControls } from "./InteractionControls";
import { LightLibrary, makePlacedLight } from "./LightLibrary";
import { RangeInput } from "./RangeInput";
import { ItemOverlay } from "./ItemOverlay";
import { ItemControls } from "./ItemControls";
import { EffectPresets, StoryAppearance } from "./AuthoringExtras";
import { removeDialogue, dialogueLabel } from "./authoring";
import { CinematicControls } from "./CinematicControls";
import { SceneTransition } from "./SceneTransition";
import { PhoneUI } from "./PhoneUI";
import { SelfReply } from "./SelfReply";
import { FullscreenButton } from "./FullscreenButton";
import { SelectionToolbar } from "./SelectionToolbar";
import { useWorkspace, contrast } from "./workspace";
import { WorkspaceControls } from "./WorkspaceSettings";
import { ResizeHandle } from "./ResizeHandle";
import { CameraControls } from "./CameraControls";
import { HoverHelp } from "./HoverHelp";
import { EffectSummary, effectSummary } from "./EffectSummary";
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
import { downloadLocalEditor } from "./localEditor";
import { exportPlayer } from "./playerExport";
import { demo } from "./demo";
import { savedProject } from "./savedProject";
import {
  advance,
  respond,
  enter,
  start,
  validateProject,
  type Project,
  type Scene,
  type Runtime,
  type Effects,
} from "./model";
import {
  exportProject,
  load,
  save,
  readImage,
  readProject,
  openGithubSnapshot,
  loadSnapshotRecovery,
} from "./storage";
import { Assistant } from "./Assistant";
import { EngineTools, Qte, SceneAudio } from "./EngineTools";
import { Zones, type RegionEditor } from "./Zones";
import { ProjectSave } from "./ProjectSave";
import { Stage } from "./Stage";
import { LightingLoopControls } from "./LightingLoopControls";
import { sceneLightLoop } from "./lighting";
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
      <RangeInput
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
  const [workspace, setWorkspace] = useWorkspace();
  const [cameraPreview, setCameraPreview] = useState(0);
  const paneStyle = (key: string) =>
    workspace.panels[key]
      ? ({
          "--pane-bg": workspace.panels[key],
          "--pane-fg": contrast(workspace.panels[key]),
          colorScheme:
            contrast(workspace.panels[key]) === "#17242e" ? "light" : "dark",
        } as React.CSSProperties)
      : undefined;

  const [project, setProject] = useState<Project>(() => savedProject());
  const [sceneId, setSceneId] = useState("cafe");
  const [nodeId, setNodeId] = useState("arrival");
  const [runtime, setRuntime] = useState<Runtime | null>(null);
  const [playing, setPlaying] = useState(false);
  const [placingLight, setPlacingLight] = useState<string | null>(null);
  const [tab, setTab] = useState("Scenes");
  const [effectPanel, setEffectPanel] = useState("All");
  const [placement, setPlacement] = useState(() => {
    try {
      return localStorage.getItem("stillframe-controls-placement") || "right";
    } catch {
      return "right";
    }
  });
  const [floatPosition, setFloatPosition] = useState({
    x: Math.max(0, window.innerWidth - 320),
    y: 80,
  });
  useEffect(() => {
    const fit = () =>
      setFloatPosition((p) => ({
        x: Math.max(0, Math.min(innerWidth - workspace.controlsWidth, p.x)),
        y: Math.max(
          0,
          Math.min(innerHeight - Math.min(innerHeight * 0.75, 800), p.y),
        ),
      }));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [workspace.controlsWidth]);
  const drag = useRef<{
    x: number;
    y: number;
    left: number;
    top: number;
  } | null>(null);
  const [collapseBottom, setCollapseBottom] = useState(false);
  useEffect(() => setCollapseBottom(false), [workspace.dialogueMode]);
  useEffect(() => {
    try {
      localStorage.setItem("stillframe-controls-placement", placement);
    } catch {}
  }, [placement]);
  const [inspector, setInspector] = useState("Atmosphere");
  const [bottom, setBottom] = useState("Dialogue");
  const [regionEditor, setRegionEditor] = useState<RegionEditor | null>(null);
  const [hideDialogue, setHideDialogue] = useState(false);
  const [customReply, setCustomReply] = useState("");
  const [maskMode, setMaskMode] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [canSave, setCanSave] = useState(false);
  const [hasRecovery, setHasRecovery] = useState(false);
  const [snapshotNotice, setSnapshotNotice] = useState(
    "Your exported café project is available.",
  );
  function preferredScene(p: Project) {
    let previous: string | null = null;
    try {
      previous = localStorage.getItem("stillframe-scene:" + p.id);
    } catch {}
    return (
      p.scenes.find((s) => s.id === previous) ||
      (p.id === project.id
        ? p.scenes.find((s) => s.id === "cafe")
        : undefined) ||
      p.scenes[0]
    );
  }

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
    async function initialize() {
      try {
        const params = new URLSearchParams(location.search);
        const explicit = params.get("snapshot") === "github";
        let workspace;
        if (explicit) {
          const snapshot = savedProject();
          await openGithubSnapshot(snapshot);
          workspace = { project: snapshot, runtime: null };
          params.delete("snapshot");
          const query = params.toString();
          window.history.replaceState(
            null,
            "",
            location.pathname + (query ? "?" + query : "") + location.hash,
          );
          setSnapshotNotice(
            "Your exported café is loaded. Any different local project has a recovery copy.",
          );
        } else workspace = await load();
        if (workspace) {
          setProject(workspace.project);
          const focus = explicit
            ? workspace.project.scenes.find((s) => s.id === "cafe") ||
              workspace.project.scenes[0]
            : preferredScene(workspace.project);
          setSceneId(focus.id);
          setNodeId(focus.nodes[0].id);
          if (
            workspace.runtime &&
            workspace.project.scenes.some(
              (s) =>
                s.id === workspace.runtime!.scene &&
                s.nodes.some((n) => n.id === workspace.runtime!.node),
            )
          )
            setRuntime(workspace.runtime);
        }
        setHasRecovery(!!(await loadSnapshotRecovery()));
        setCanSave(true);
        setStatus("Saved on this device");
      } catch (e) {
        setCanSave(false);
        setError(
          "Could not load project safely: " +
            String(e) +
            ". Existing saved work was left intact.",
        );
        setStatus("Recovery failed");
      } finally {
        setLoaded(true);
      }
    }
    void initialize();
  }, []);
  useEffect(() => {
    if (!loaded || !canSave || !project.scenes.some((s) => s.id === sceneId))
      return;
    try {
      localStorage.setItem("stillframe-scene:" + project.id, sceneId);
    } catch {}
  }, [loaded, canSave, project.id, sceneId]);
  async function loadPublishedCafe() {
    setLoaded(false);
    try {
      await saveQueue.current.catch(() => {});
      const snapshot = savedProject();
      await openGithubSnapshot(snapshot, { project, runtime });
      edit((p) => Object.assign(p, snapshot));
      setSceneId("cafe");
      setNodeId("arrival");
      setRuntime(null);
      setMaskMode(false);
      setRegionEditor(null);
      setTab("Scenes");
      setHasRecovery(!!(await loadSnapshotRecovery()));
      setCanSave(true);
      setSnapshotNotice(
        "Your exported café is loaded. Any different local project has a recovery copy.",
      );
    } catch (e) {
      setError("Snapshot was not loaded: " + String(e));
    } finally {
      setLoaded(true);
    }
  }
  async function restoreLocalProject() {
    setLoaded(false);
    try {
      await saveQueue.current.catch(() => {});
      const recovery = await loadSnapshotRecovery();
      if (!recovery) throw Error("No previous project is available.");
      edit((p) => Object.assign(p, recovery.project));
      const focus = preferredScene(recovery.project);
      setSceneId(focus.id);
      setNodeId(focus.nodes[0].id);
      setRuntime(recovery.runtime);
      setMaskMode(false);
      setRegionEditor(null);
      setTab("Scenes");
      setCanSave(true);
      setSnapshotNotice("Your previous local project has been restored.");
    } catch (e) {
      setError("Recovery was not loaded: " + String(e));
    } finally {
      setLoaded(true);
    }
  }
  useEffect(() => {
    if (!loaded || !canSave) return;
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
  }, [project, runtime, loaded, canSave]);
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
    if (playing) setRuntime((r) => (r ? enter(project, r, id) : r));
    setPlacingLight(null);
    setSceneId(id);
    setNodeId(project.scenes.find((s) => s.id === id)!.nodes[0].id);
    setMaskMode(false);
    setRegionEditor(null);
  }
  function play(restart = false) {
    setPlacingLight(null);
    try {
      validateProject(project);
      if (restart || !runtime) setRuntime(start(project));
      setPlaying(true);
      setMaskMode(false);
      setRegionEditor(null);
    } catch (e) {
      setError(String(e));
    }
  }
  function step(id?: string) {
    try {
      if (runtime) setRuntime(advance(project, runtime, id));
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
  const selectedRegion =
    regionEditor?.kind === "joint"
      ? selected.joints?.find((j) => j.id === regionEditor.id)?.region
      : regionEditor?.kind === "rain"
        ? e.rainZones?.find((r) => r.id === regionEditor.id)
        : regionEditor?.kind === "light"
          ? e.lights?.find((l) => l.id === regionEditor.id)?.region
          : e.motionZones?.find((w) => w.id === regionEditor?.id)?.region;
  useEffect(() => {
    if (regionEditor && !selectedRegion) setRegionEditor(null);
  }, [regionEditor, selectedRegion]);
  const changeSelectedRegion = (region: import("./model").Region) =>
    updateScene((s) => {
      if (regionEditor?.kind === "joint") {
        const j = s.joints?.find((j) => j.id === regionEditor.id);
        if (j) j.region = region;
      } else if (regionEditor?.kind === "rain") {
        const at =
          s.effects.rainZones?.findIndex((r) => r.id === region.id) ?? -1;
        if (at >= 0) s.effects.rainZones![at] = region;
      } else if (regionEditor?.kind === "light") {
        const l = s.effects.lights?.find((l) => l.id === regionEditor.id);
        if (l) l.region = region;
      } else {
        const w = s.effects.motionZones?.find((w) => w.id === regionEditor?.id);
        if (w) w.region = region;
      }
    });

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
    <PlaySession
      playing={playing}
      onExit={() => setPlaying(false)}
      onRestart={() => play(true)}
    >
      <div
        data-theme={workspace.theme}
        className={
          "app " +
          (playing ? "is-playing " : "") +
          (workspace.dialogueMode === "page" ? "page-layout" : "")
        }
        style={
          {
            "--library-size":
              (workspace.libraryCollapsed ? 0 : workspace.libraryWidth) + "px",
            "--controls-size": workspace.controlsWidth + "px",
            "--bottom-size": workspace.bottomHeight + "px",
            "--preview-scale": workspace.previewScale,
            "--ui-font": workspace.font,
            "--ui-font-size": workspace.fontSize + "px",
            "--story-font": project.settings.dialogueFont || "Georgia",
            "--story-size": (project.settings.dialogueSize || 17) + "px",
          } as React.CSSProperties
        }
      >
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
              title="Save project file"
              aria-label="Save project file"
              onClick={() => setModal("save")}
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
        <div
          className={
            "workspace controls-" +
            placement +
            (workspace.libraryCollapsed ? " library-collapsed" : "") +
            (workspace.splitDocks ? " split-docks" : "")
          }
        >
          <nav className="rail">
            {[
              [Film, "Scenes"],
              [ImagePlus, "Assets"],
              [BookOpen, "Characters"],
              [Code2, "State"],
              [Sparkles, "Assistant"],
              [Volume2, "Tools"],
            ].map(([Icon, label]) => {
              const I = Icon as typeof Film;
              return (
                <button
                  key={String(label)}
                  title={String(label)}
                  aria-label={String(label)}
                  className={tab === label ? "active" : ""}
                  onClick={() => {
                    setTab(String(label));
                    setWorkspace((s) => ({ ...s, libraryCollapsed: false }));
                  }}
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
          <aside className="library ui-pane" style={paneStyle("library")}>
            <ResizeHandle
              label="Resize story library"
              className="library-resize"
              value={workspace.libraryWidth}
              min={160}
              max={400}
              reverse={placement === "left"}
              onChange={(n) => setWorkspace((s) => ({ ...s, libraryWidth: n }))}
            />
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
                  PNG, JPEG or WebP · up to 15 MB. Originals stay in your
                  project.
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
                          p.assets.find((a) => a.id === asset.id)!.reference =
                            v;
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
                            project.assets.find((a) => a.id === c.portrait)
                              ?.data
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
                      {runtime?.values[c.id]
                        ? "● Discovered"
                        : "○ Undiscovered"}
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
              <Assistant
                project={project}
                sceneId={sceneId}
                apply={(next) => edit((p) => Object.assign(p, next))}
              />
            )}
            {tab === "Tools" && (
              <EngineTools
                project={project}
                scene={selected}
                nodeId={nodeId}
                edit={edit}
              />
            )}
            <div className="library-footer">
              {!document.documentElement.hasAttribute(
                "data-stillframe-standalone",
              ) && (
                <button
                  onClick={() =>
                    downloadLocalEditor().catch((e) => setError(String(e)))
                  }
                >
                  <Download size={15} /> Download local editor
                </button>
              )}

              <button
                onClick={() =>
                  exportPlayer(project).catch((e) => setError(String(e)))
                }
              >
                <Download size={15} /> Export playable HTML
              </button>
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
          <main className="ui-pane" style={paneStyle("workspace")}>
            <div className="workspace-toolbar">
              <button
                aria-label={
                  workspace.libraryCollapsed
                    ? "Expand story library"
                    : "Collapse story library"
                }
                onClick={() =>
                  setWorkspace((s) => ({
                    ...s,
                    libraryCollapsed: !s.libraryCollapsed,
                  }))
                }
              >
                {workspace.libraryCollapsed ? "Show story" : "Hide story"}
              </button>
              <button onClick={() => setInspector("Workspace")}>Layout</button>
              <button onClick={() => setInspector("Appearance")}>
                Appearance
              </button>
              <button
                aria-label="Enabled effects"
                onClick={() => setInspector("Active")}
              >
                {effectSummary(scene, project.settings.reducedEffects).length}{" "}
                effects
              </button>
              <div className="breadcrumb">
                Scenes <ChevronRight size={12} />
                <b>{scene.title}</b>
              </div>
              {placement !== "right" && (
                <button onClick={() => setPlacement("right")}>
                  Reset panels
                </button>
              )}
              <span className="badge">
                {playing ? "PLAYTEST" : "SCENE EDITOR"}
              </span>
            </div>
            {!playing && (
              <div className="snapshot-toolbar">
                <span>{snapshotNotice}</span>
                <button
                  className="primary"
                  onClick={() => void loadPublishedCafe()}
                  disabled={!loaded}
                >
                  Load GitHub snapshot
                </button>
                {hasRecovery && (
                  <button
                    onClick={() => void restoreLocalProject()}
                    disabled={!loaded}
                  >
                    Restore previous local project
                  </button>
                )}
              </div>
            )}
            <section className="preview-area">
              <div className="preview-header">
                <div>
                  <span className="eyebrow">{scene.subtitle}</span>
                  <h1>{scene.title}</h1>
                </div>
                <div className="preview-tools">
                  {!playing && (
                    <button
                      aria-label={
                        hideDialogue ? "Show dialogue" : "Hide dialogue"
                      }
                      onClick={() => setHideDialogue((v) => !v)}
                    >
                      <Eye size={15} />
                      {hideDialogue ? "Show dialogue" : "Hide dialogue"}
                    </button>
                  )}
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
                  {playing && (
                    <PlaybackControls
                      mode={project.settings.progression || "continue"}
                      onMode={(mode) =>
                        edit((p) => {
                          p.settings.progression = mode;
                        })
                      }
                      advance={() => step()}
                      canAdvance={
                        !runtime?.ended && !node.choices.length && !node.qte
                      }
                    />
                  )}
                  {playing && <FullscreenButton />}
                  <span>16:9</span>
                  <span className="live-dot" /> <small>LIVE PREVIEW</small>
                </div>
              </div>
              <div className="stage-frame">
                <SceneTransition
                  scene={scene}
                  playing={playing}
                  reduced={
                    project.settings.reducedEffects ||
                    matchMedia("(prefers-reduced-motion: reduce)").matches
                  }
                >
                  <Stage
                    visits={
                      playing
                        ? runtime?.nodeVisits
                            ?.filter((v) => v.scene === scene.id)
                            .map((v) => v.node)
                        : undefined
                    }
                    onPlaceLight={
                      !playing && placingLight !== null
                        ? (x, y) =>
                            updateScene((s) => {
                              if ((s.effects.lights?.length || 0) < 20)
                                (s.effects.lights ??= []).push(
                                  makePlacedLight(
                                    project.lightPresets?.find(
                                      (p) => p.id === placingLight,
                                    )?.light,
                                    x,
                                    y,
                                  ),
                                );
                            })
                        : undefined
                    }
                    itemFocus={
                      !!scene.items?.enabled &&
                      scene.items.options.some((i) =>
                        node.choices.some((c) => c.id === i.choice),
                      )
                    }
                    project={project}
                    scene={scene}
                    playing={playing}
                    maskMode={maskMode && !playing}
                    onMask={(v) => effect("mask", v)}
                    nodeId={node.id}
                    onPivot={(x, y) =>
                      updateScene((s) => {
                        const j = s.joints?.find(
                          (j) => j.id === regionEditor?.id,
                        );
                        if (j) {
                          j.pivotX = x;
                          j.pivotY = y;
                        }
                      })
                    }
                    previewTick={cameraPreview}
                    regionEditor={playing ? null : regionEditor}
                    onRegion={changeSelectedRegion}
                  >
                    {playing && <SceneAudio project={project} scene={scene} />}
                    {playing && runtime && node.qte && (
                      <Qte
                        key={
                          runtime.scene + runtime.node + runtime.history.length
                        }
                        project={project}
                        runtime={runtime}
                        onResolve={setRuntime}
                      />
                    )}
                    {scene.items?.enabled && placingLight === null && (
                      <ItemOverlay
                        project={project}
                        scene={scene}
                        node={node}
                        runtime={runtime}
                        onStep={(id) => playing && step(id)}
                      />
                    )}
                    {!(playing && node.qte) &&
                      deviceScreen(
                        scene,
                        node,
                        playing
                          ? runtime?.nodeVisits
                              ?.filter((v) => v.scene === scene.id)
                              .map((v) => v.node)
                          : undefined,
                      ) !== "off" &&
                      !maskMode &&
                      placingLight === null &&
                      !regionEditor && (
                        <PhoneUI
                          onRestart={() => play(true)}
                          key={scene.id}
                          onAppearance={(a) =>
                            edit((p) => {
                              p.scenes.find(
                                (s) => s.id === scene.id,
                              )!.phone!.appearance = a;
                            })
                          }
                          onUpload={(asset, target) =>
                            edit((p) => {
                              p.assets.push(asset);
                              const s = p.scenes.find(
                                (s) => s.id === scene.id,
                              )!;
                              s.phone!.appearance = withDeviceUpload(
                                s.phone!.appearance,
                                asset,
                                target,
                              );
                            })
                          }
                          project={project}
                          scene={scene}
                          node={node}
                          runtime={playing ? runtime : null}
                          onStep={(id) => playing && step(id)}
                          onReply={(text, branch) => {
                            try {
                              if (runtime)
                                setRuntime(
                                  respond(project, runtime, text, branch),
                                );
                            } catch (e) {
                              setError(String(e));
                            }
                          }}
                        />
                      )}
                    {!maskMode &&
                      !regionEditor &&
                      !(playing && node.qte) &&
                      deviceScreen(
                        scene,
                        node,
                        playing
                          ? runtime?.nodeVisits
                              ?.filter((v) => v.scene === scene.id)
                              .map((v) => v.node)
                          : undefined,
                      ) === "off" &&
                      !(
                        scene.items?.enabled &&
                        scene.items.options.some((i) =>
                          node.choices.some((c) => c.id === i.choice),
                        )
                      ) && (
                        <div
                          className={
                            "dialogue-overlay " +
                            (!playing && hideDialogue ? "dialogue-hidden" : "")
                          }
                        >
                          {(node.portrait ||
                            (node.speaker === project.characters[0]?.name &&
                              project.characters[0]?.portrait)) && (
                            <img
                              className="dialogue-portrait"
                              src={
                                project.assets.find(
                                  (a) =>
                                    a.id ===
                                    (node.portrait ||
                                      project.characters[0]?.portrait),
                                )?.data
                              }
                            />
                          )}
                          <span
                            className="dialogue-speaker"
                            style={{
                              color: project.characters.find(
                                (c) => c.name === node.speaker,
                              )?.color,
                            }}
                          >
                            {node.speaker === project.characters[0]?.name
                              ? project.characters[0]?.name
                              : node.speaker}
                          </span>
                          <p>
                            {node.text.replace(/\{(\w+)\}/g, (_, key) =>
                              String(
                                (playing
                                  ? runtime?.values
                                  : project.variables)?.[key] ||
                                  "{" + key + "}",
                              ),
                            )}
                          </p>
                          {playing ? (
                            <>
                              {runtime?.ended ? (
                                <button
                                  className="continue"
                                  onClick={() => play(true)}
                                >
                                  End of opening chapter · Play again{" "}
                                  <RotateCcw size={13} />
                                </button>
                              ) : availableChoices.length ? (
                                <div className="play-choices">
                                  {availableChoices.map((c) => (
                                    <button
                                      key={c.id}
                                      onClick={() => step(c.id)}
                                    >
                                      {c.text}
                                      <ChevronRight size={13} />
                                    </button>
                                  ))}
                                </div>
                              ) : (
                                <button
                                  className="continue"
                                  onClick={() => step()}
                                >
                                  Continue <ChevronRight size={15} />
                                </button>
                              )}
                              {!runtime?.ended &&
                                node.allowCustomResponse !== false && (
                                  <SelfReply
                                    choices={availableChoices}
                                    nodeId={node.id}
                                    onSend={(text, branch) => {
                                      try {
                                        setRuntime((r) =>
                                          respond(project, r!, text, branch),
                                        );
                                      } catch (e) {
                                        setError(String(e));
                                      }
                                    }}
                                  />
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
                        Click to add a vertex · use the inspector to remove the
                        last point
                      </div>
                    )}
                  </Stage>
                </SceneTransition>
              </div>
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
            <section
              className={
                "bottom-panel ui-pane " +
                (collapseBottom ? "collapsed " : "") +
                (workspace.dialogueMode === "hidden" ? "bottom-hidden" : "")
              }
              style={{ ...paneStyle("dialogue") }}
            >
              <ResizeHandle
                label="Resize dialogue panel"
                className="dialogue-resize"
                value={workspace.bottomHeight}
                min={100}
                max={600}
                axis="y"
                reverse
                onChange={(n) =>
                  setWorkspace((s) => ({ ...s, bottomHeight: n }))
                }
              />
              <div className="bottom-tabs">
                <button
                  aria-label={
                    collapseBottom
                      ? "Expand dialogue editor"
                      : "Collapse dialogue editor"
                  }
                  onClick={() => setCollapseBottom((v) => !v)}
                >
                  {collapseBottom ? "Expand" : "Collapse"}
                </button>
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
                          <span className="node-count">
                            {n.choices.length} ⑂
                          </span>
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
                                {dialogueLabel(project, scene, n.id)}
                              </option>
                            ))}
                        </select>
                      </label>
                    </div>
                    <label>
                      Author note
                      <textarea
                        aria-label="Dialogue author note"
                        disabled={playing}
                        value={node.notes || ""}
                        onChange={(e) =>
                          updateScene((s) => {
                            s.nodes.find((n) => n.id === node.id)!.notes =
                              e.target.value;
                          })
                        }
                      />
                    </label>
                    <button
                      disabled={playing || scene.nodes.length <= 1}
                      onClick={() => {
                        const copy = structuredClone(selected);
                        const next = removeDialogue(copy, node.id);
                        updateScene((s) => Object.assign(s, copy));
                        setNodeId(next);
                        setRegionEditor(null);
                      }}
                    >
                      Delete dialogue node
                    </button>
                    <label className="consent">
                      <input
                        type="checkbox"
                        disabled={playing}
                        checked={node.allowCustomResponse !== false}
                        onChange={(ev) =>
                          updateScene(
                            (s) =>
                              (s.nodes.find(
                                (n) => n.id === node.id,
                              )!.allowCustomResponse = ev.target.checked),
                          )
                        }
                      />
                      Allow custom response in normal dialogue
                    </label>
                    <label className="consent">
                      <input
                        type="checkbox"
                        disabled={playing}
                        checked={
                          (node.allowPhoneCustomResponse ??
                            node.allowCustomResponse) !== false
                        }
                        onChange={(ev) =>
                          updateScene((s) => {
                            s.nodes.find(
                              (n) => n.id === node.id,
                            )!.allowPhoneCustomResponse = ev.target.checked;
                          })
                        }
                      />
                      Allow custom response in device dialogue
                    </label>
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
                                {dialogueLabel(project, scene, n.id)}
                              </option>
                            ))}
                          </optgroup>
                          <optgroup label="Scenes">
                            {project.scenes.map((s) => (
                              <option key={s.id} value={s.id}>
                                {`Scene ${project.scenes.indexOf(s) + 1} · ${s.title}`}
                              </option>
                            ))}
                          </optgroup>
                        </select>
                        <button
                          disabled={playing}
                          aria-label={"Delete choice " + (i + 1)}
                          onClick={() =>
                            updateScene((s) => {
                              const removed = s.nodes
                                .find((n) => n.id === node.id)!
                                .choices.splice(i, 1)[0];
                              if (s.items)
                                s.items.options = s.items.options.filter(
                                  (item) => item.choice !== removed.id,
                                );
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
                                    .nodes.find(
                                      (n) => n.id === node.id,
                                    )!.choices[i].actions = actions;
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
                                    .nodes.find(
                                      (n) => n.id === node.id,
                                    )!.choices[i].condition = condition;
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
          <aside
            className="inspector ui-pane"
            data-panel={effectPanel}
            data-inspector={inspector}
            style={{
              ...paneStyle("inspector"),
              ...(placement === "float"
                ? { left: floatPosition.x, top: floatPosition.y }
                : {}),
            }}
          >
            <div className="effects-dock" data-panel={effectPanel}>
              <h3 className="dock-title">Effects & interactions</h3>
              <div className="panel-layout">
                <label>
                  Controls placement
                  <select
                    aria-label="Controls placement"
                    value={placement}
                    onChange={(event) => setPlacement(event.target.value)}
                  >
                    <option value="right">Dock right</option>
                    <option value="left">Dock left</option>
                    <option value="float">Floating window</option>
                  </select>
                </label>
                <label>
                  <input
                    type="checkbox"
                    aria-label="Separate controls and properties docks"
                    checked={workspace.splitDocks}
                    onChange={(e) =>
                      setWorkspace((w) => ({
                        ...w,
                        splitDocks: e.target.checked,
                      }))
                    }
                  />
                  Two separate docks
                </label>
                {placement === "float" && (
                  <button
                    aria-label="Drag controls"
                    style={{ touchAction: "none" }}
                    onPointerDown={(event) => {
                      event.currentTarget.setPointerCapture(event.pointerId);
                      drag.current = {
                        x: event.clientX,
                        y: event.clientY,
                        left: floatPosition.x,
                        top: floatPosition.y,
                      };
                    }}
                    onPointerMove={(event) => {
                      if (!drag.current) return;
                      setFloatPosition({
                        x: Math.max(
                          0,
                          Math.min(
                            window.innerWidth - workspace.controlsWidth,
                            drag.current.left + event.clientX - drag.current.x,
                          ),
                        ),
                        y: Math.max(
                          0,
                          Math.min(
                            window.innerHeight -
                              Math.min(window.innerHeight * 0.75, 800),
                            drag.current.top + event.clientY - drag.current.y,
                          ),
                        ),
                      });
                    }}
                    onPointerUp={() => {
                      drag.current = null;
                    }}
                  >
                    Drag window
                  </button>
                )}
              </div>
              <div
                className="effect-tabs"
                role="group"
                aria-label="Effect panels"
              >
                {[
                  "All",
                  "Rain",
                  "Lighting",
                  "Motion",
                  "Cinematics",
                  "Outfits & Items",
                  "Phone",
                  "Light Library",
                  "Effect Presets",
                  "Camera",
                  "Save",
                ].map((panel) => (
                  <button
                    key={panel}
                    className={effectPanel === panel ? "active" : ""}
                    onClick={() => {
                      setEffectPanel(panel);
                      setInspector("Atmosphere");
                    }}
                  >
                    {panel}
                  </button>
                ))}
              </div>
              <fieldset className="specialized-controls" disabled={playing}>
                {" "}
                <LightLibrary
                  project={project}
                  scene={selected}
                  edit={edit}
                  placing={placingLight}
                  onPlace={(id) => {
                    setPlacingLight(id);
                    setRegionEditor(null);
                    setMaskMode(false);
                  }}
                />
                <InteractionControls
                  key={selected.id}
                  edit={edit}
                  project={project}
                  scene={selected}
                  nodeId={
                    selected.nodes.some((n) => n.id === node.id)
                      ? node.id
                      : selected.nodes[0].id
                  }
                  update={updateScene}
                />
                <EffectPresets project={project} scene={selected} edit={edit} />
                <ItemControls
                  key={selected.id}
                  edit={edit}
                  project={project}
                  scene={selected}
                  nodeId={
                    selected.nodes.some((n) => n.id === node.id)
                      ? node.id
                      : selected.nodes[0].id
                  }
                  update={updateScene}
                />
                <CinematicControls
                  scene={selected}
                  project={project}
                  nodeId={
                    selected.nodes.some((n) => n.id === node.id)
                      ? node.id
                      : selected.nodes[0].id
                  }
                  update={updateScene}
                  setEditor={setRegionEditor}
                  previewNode={setNodeId}
                />
                <CameraControls
                  scene={selected}
                  project={project}
                  update={updateScene}
                  restart={() => setCameraPreview((n) => n + 1)}
                />
                <ProjectSave project={project} />
                <Zones
                  scene={selected}
                  update={updateScene}
                  editor={regionEditor}
                  setEditor={(v) => {
                    setRegionEditor(v);
                    if (v) setMaskMode(false);
                  }}
                />
              </fieldset>
            </div>
            <div className="properties-dock">
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
                {[
                  "Atmosphere",
                  "Background",
                  "Workspace",
                  "Appearance",
                  "Active",
                  "Transitions",
                ].map((t) => (
                  <button
                    key={t}
                    className={inspector === t ? "active" : ""}
                    onClick={() => setInspector(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
              {regionEditor && selectedRegion && !playing && (
                <SelectionToolbar
                  editor={regionEditor}
                  region={selectedRegion}
                  setEditor={(next) => {
                    if (
                      next?.kind === "light" &&
                      !e.lights?.find((l) => l.id === next.id)?.region
                    )
                      updateScene((s) => {
                        const l = s.effects.lights?.find(
                          (l) => l.id === next.id,
                        );
                        if (l)
                          l.region = {
                            id: l.id,
                            name: l.name + " affected area",
                            enabled: true,
                            points: [],
                          };
                      });
                    setRegionEditor(next);
                  }}
                  change={changeSelectedRegion}
                  targets={[
                    ...(selected.joints || []).map((j) => ({
                      kind: "joint" as const,
                      id: j.id,
                      name: j.name,
                    })),
                    ...(e.rainZones || []).map((r) => ({
                      kind: "rain" as const,
                      id: r.id,
                      name: r.name,
                    })),
                    ...(e.lights || [])
                      .filter((l) => l.kind === "local")
                      .map((l) => ({
                        kind: "light" as const,
                        id: l.id,
                        name: l.name,
                      })),
                    ...(e.motionZones || []).map((w) => ({
                      kind: "motion" as const,
                      id: w.id,
                      name: w.name,
                    })),
                  ]}
                />
              )}
              <fieldset
                disabled={
                  playing &&
                  (inspector === "Atmosphere" || inspector === "Background")
                }
              >
                {inspector === "Workspace" ? (
                  <WorkspaceControls
                    value={workspace}
                    onChange={setWorkspace}
                  />
                ) : inspector === "Appearance" ? (
                  <>
                    <WorkspaceControls
                      value={workspace}
                      onChange={setWorkspace}
                      appearance
                    />
                    <StoryAppearance project={project} edit={edit} />
                  </>
                ) : inspector === "Transitions" ? (
                  <SceneTransitionControls
                    scene={selected}
                    update={updateScene}
                  />
                ) : inspector === "Active" ? (
                  <EffectSummary
                    scene={scene}
                    project={project}
                    update={(fn) =>
                      edit((p) => fn(p.scenes.find((s) => s.id === scene.id)!))
                    }
                  />
                ) : inspector === "Atmosphere" ? (
                  <>
                    <section
                      className="property-section"
                      data-effect-panel="Lighting"
                    >
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
                      <LightingLoopControls
                        key={selected.id}
                        value={sceneLightLoop(selected)}
                        onChange={(value) => effect("lightLoop", value)}
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
                    <section
                      className="property-section"
                      data-effect-panel="Rain"
                    >
                      <h3>
                        <CloudRain size={16} /> Falling rain{" "}
                        <input
                          aria-label="Falling rain"
                          type="checkbox"
                          checked={e.rain}
                          onChange={(ev) => effect("rain", ev.target.checked)}
                        />
                      </h3>
                      <p className="help">
                        A little weather. A different feeling.
                      </p>
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
                            {e.rainZones?.length
                              ? "MULTI ZONE"
                              : e.mask.length >= 3
                                ? "MASKED"
                                : "FULL STAGE"}
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
                            Click stage to add points. Clear to draw a new
                            region. Minimum 3 points.
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
                            if (s.camera) s.camera.enabled = false;
                            s.effects.motionZones?.forEach(
                              (w) => (w.enabled = false),
                            );
                            s.effects.lights?.forEach(
                              (l) => (l.enabled = false),
                            );
                            s.joints?.forEach((j) => {
                              j.enabled = false;
                            });
                            s.effects.rain = false;
                            s.effects.glass = false;
                            s.effects.light = 0;
                            s.effects.lightLoop = {
                              ...sceneLightLoop(s),
                              enabled: false,
                            };
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
                        aria-label="Background source"
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
                    <button
                      className="wide"
                      onClick={() => input.current?.click()}
                    >
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
                      Transforms preserve the original image. The rain region
                      uses scene coordinates and follows background position and
                      scale.
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
            </div>
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
        <HoverHelp enabled={workspace.help} />
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
              aria-label={
                modal === "save"
                  ? "Save project"
                  : modal === "settings"
                    ? "Project settings"
                    : "Projects"
              }
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
                {modal === "save"
                  ? "Save your project"
                  : modal === "settings"
                    ? "Your workspace"
                    : "A new beginning"}
              </h2>
              {modal === "save" ? (
                <ProjectSave project={project} />
              ) : modal === "settings" ? (
                <>
                  <p>
                    This is a local-first studio. Projects and original images
                    are saved in this browser’s IndexedDB. Export regularly to
                    back up your work or move between devices.
                  </p>
                  <p className="muted">
                    Load GitHub snapshot restores the project included with this
                    release. Later edits save on this device; they do not update
                    GitHub automatically. Undo can restore your local project
                    after loading the snapshot.
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
                    {document.documentElement.hasAttribute(
                      "data-stillframe-standalone",
                    )
                      ? "This single-file editor includes its own code and styles for offline use. Local-file storage support varies by browser; export backups regularly. Use the hosted studio for provider AI."
                      : "Projects are saved in this browser. The production app caches its shell for offline reloads after its service worker installs. Provider AI is optional and requires server configuration plus your consent."}
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
                  <button
                    className="wide"
                    onClick={() => exportProject(project)}
                  >
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
    </PlaySession>
  );
}
