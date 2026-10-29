import { useEffect, useRef } from "react";
import { ENGINE_VERSION, releases } from "./releases";
export type StudioView =
  | "editor"
  | "chapters"
  | "scenes"
  | "dialogues"
  | "devices"
  | "updates";
export function StudioMenu({
  view,
  onView,
  onAction,
  canUndo,
  canRedo,
  playing,
  collapsed,
  effects,
  placement,
  split = false,
  onSplit,
}: {
  view: StudioView;
  onView: (v: StudioView) => void;
  onAction: (action: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  playing: boolean;
  collapsed: boolean;
  effects: number;
  placement: string;
  split?: boolean;
  onSplit?: () => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (e: Event) => {
      if (e instanceof KeyboardEvent && e.key !== "Escape") return;
      if (
        !(e instanceof KeyboardEvent) &&
        root.current?.contains(e.target as Node)
      )
        return;
      root.current
        ?.querySelectorAll("details[open]")
        .forEach((d) => d.removeAttribute("open"));
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", close);
    };
  }, []);
  const command = (text: string, action: string, disabled = false) => (
    <button
      key={action}
      disabled={disabled}
      onClick={(e) => {
        e.currentTarget.closest("details")?.removeAttribute("open");
        onAction(action);
      }}
    >
      {text}
    </button>
  );
  return (
    <div className="studio-navigation" ref={root}>
      <nav className="studio-menu" aria-label="Studio menu">
        <details>
          <summary>File</summary>
          <div className="studio-menu-popover">
            {command("Save project…", "save")}
            {command("Open project…", "open")}
            {command("Export project JSON", "export-project")}
            {command("Export playable HTML", "export-player")}
            {command("Download local editor", "local-editor")}
          </div>
        </details>
        <details>
          <summary>Edit</summary>
          <div className="studio-menu-popover">
            {command("Undo", "undo", !canUndo || playing)}
            {command("Redo", "redo", !canRedo || playing)}
            {command("Original dialogue editor", "dialogue")}
            {command("Outfit & item picker", "items")}
            {command("Saved outfit selection", "wardrobe")}
          </div>
        </details>
        <details>
          <summary>View</summary>
          <div className="studio-menu-popover">
            {command("Workspace layout…", "layout")}
            {command("Interface appearance…", "appearance")}
            {command(
              collapsed ? "Show story library" : "Hide story library",
              "toggle-library",
            )}
            {command("Scene backgrounds…", "background")}
            {command("Playthrough event log", "events")}
            <hr />
            {[
              ["right", "Dock controls right"],
              ["left", "Dock controls left"],
              ["top", "Dock controls at top"],
              ["float", "Floating controls"],
            ].map(([key, name]) =>
              command((placement === key ? "✓ " : "") + name, "dock:" + key),
            )}
          </div>
        </details>
        <details>
          <summary>Effects</summary>
          <div className="studio-menu-popover">
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
              "Sound",
              "Sub-scenes",
              "Save",
            ].map((name) => command(name + " controls", "effect:" + name))}
            {command("Active effect switches", "active")}
          </div>
        </details>
        <details>
          <summary>Instructions</summary>
          <div className="studio-menu-popover">
            {command("Find a feature / update history", "updates")}
            {command("Scenes advanced guide", "scenes")}
            {command("Dialogue advanced guide", "dialogues")}
            {command("Advanced device workspace", "devices")}
            {command("AI helper", "assistant")}
            {command("Project settings…", "settings")}
          </div>
        </details>
        <div className="studio-quick-tools">
          <button
            aria-label={
              collapsed ? "Expand story library" : "Collapse story library"
            }
            onClick={() => onAction("toggle-library")}
          >
            {collapsed ? "Show story" : "Hide story"}
          </button>
          <button onClick={() => onAction("layout")}>Layout</button>
          <button onClick={() => onAction("appearance")}>Appearance</button>
          <button
            aria-label="Enabled effects"
            onClick={() => onAction("active")}
          >
            {effects} effects
          </button>
          <button
            className="engine-version"
            data-help="Engine version, separate from your story project. Open the update history for feature changes and directions."
            onClick={() => onView("updates")}
          >
            Stillframe v{ENGINE_VERSION} · {releases[0].name}
          </button>
        </div>
      </nav>
      <nav
        className="studio-workspace-tabs"
        role="tablist"
        aria-label="Studio workspaces"
      >
        {(
          [
            ["editor", "Editor"],
            ["chapters", "Chapters advanced"],
            ["scenes", "Scenes advanced"],
            ["dialogues", "Dialogue advanced"],
            ["devices", "Advanced devices"],
            ["updates", "Update history"],
          ] as const
        ).map(([id, label]) => (
          <button
            role="tab"
            key={id}
            aria-selected={view === id}
            aria-controls={"studio-" + id}
            onClick={() => onView(id)}
          >
            {label}
          </button>
        ))}
      </nav>
      {onSplit && <button className="split-workspace-button" aria-pressed={split} onClick={onSplit} data-help="Open two workspaces in one window. They share your story, selected dialogue, artwork and Undo history. Choose side-by-side or stacked and drag the divider.">{split ? "Single workspace" : "Split view"}</button>}
    </div>
  );
}
