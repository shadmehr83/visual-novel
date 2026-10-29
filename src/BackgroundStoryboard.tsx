import { useState } from "react";
import type { Project, Scene } from "./model";
import { readImage } from "./storage";
import { GifCanvas } from "./GifCanvas";
import { GifTimeline } from "./GifTimeline";
import { TransitionFields } from "./TimelineControls";
export function BackgroundStoryboard({
  project,
  scene,
  edit,
  onOpen,
  onExpand,
}: {
  project: Project;
  scene: Scene;
  edit: (fn: (p: Project) => void) => void;
  onOpen: (node?: string) => void;
  onExpand?: () => void;
}) {
  const [trigger, setTrigger] = useState(scene.nodes[0].id),
    [error, setError] = useState("");
  const [active, setActive] = useState("main");
  const update = (fn: (s: Scene) => void) =>
    edit((p) => fn(p.scenes.find((s) => s.id === scene.id)!));
  const activeView = scene.subscenes?.find((v) => v.id === active);
  const selectedAsset = project.assets.find(
    (a) => a.id === (activeView ? activeView.background : scene.background),
  );
  const card = (id: string | null, title: string) => {
    const a = project.assets.find((a) => a.id === id);
    return (
      <div className="background-shot">
        {a ? (
          a.mime === "image/gif" ? (
            <div className="gif-card-still">
              <GifCanvas
                data={a.data}
                config={{ mode: "paused", speed: 1, startTime: 0 }}
              />
            </div>
          ) : (
            <img src={a.data} alt={title} />
          )
        ) : (
          <div>Included illustration</div>
        )}
        <strong>{title}</strong>
        <small>
          {a?.mime === "image/gif" ? "▶ Animated GIF" : "▣ Still image"} ·{" "}
          {a?.name || "Built-in artwork"}
        </small>
      </div>
    );
  };
  return (
    <details className="background-storyboard" open>
      <summary>
        Background sequence · {1 + (scene.subscenes?.length || 0)} views
      </summary>
      <p>
        Scene entrance: {scene.transition?.style || "cut"} ·{" "}
        {scene.transition?.seconds || 0}s
      </p>
      <div className="background-sequence">
        <div>
          <button
            className={active === "main" ? "selected-shot" : ""}
            data-help="Select the main background’s film editor. GIFs have precise playback and dialogue cues below the strip. This opens editing controls without changing the story’s artwork."
            aria-label="Edit main background timing"
            onClick={() => {
              setActive("main");
              if (
                project.assets.find((a) => a.id === scene.background)?.mime ===
                "image/gif"
              )
                onExpand?.();
            }}
          >
            {card(scene.background, "Main scene")}
          </button>
          <TransitionFields
            label="Scene entrance"
            value={scene.transition}
            onChange={(t) =>
              update((s) => {
                s.transition = t;
              })
            }
          />
          <TransitionFields
            label="Scene exit"
            value={scene.exitTransition}
            optional
            onChange={(t) =>
              update((s) => {
                s.exitTransition = t;
              })
            }
          />
          <TransitionFields
            label="Return to main view"
            value={scene.returnTransition || { style: "smooth", seconds: 0.45 }}
            onChange={(t) =>
              update((s) => {
                s.returnTransition = t;
              })
            }
          />
        </div>
        {scene.subscenes?.map((v) => (
          <div key={v.id}>
            <div className="background-link">
              → {v.transition.style} · {v.transition.seconds}s
            </div>
            <button
              className={active === v.id ? "selected-shot" : ""}
              data-help="Select this background’s timing controls. For a GIF, scrub the film and save play or pause cues below. This does not change dialogue assignments."
              aria-label={"Edit " + v.title + " timing"}
              onClick={() => {
                setActive(v.id);
                if (
                  project.assets.find((a) => a.id === v.background)?.mime ===
                  "image/gif"
                )
                  onExpand?.();
              }}
            >
              {card(v.background, v.title)}
            </button>
            {scene.nodes
              .filter((n) => n.view === v.id)
              .map((n) => (
                <button key={n.id} onClick={() => onOpen(n.id)}>
                  Dialogue {scene.nodes.indexOf(n) + 1} · {n.text.slice(0, 55)}
                </button>
              ))}
            <label>
              Cue this view at dialogue
              <select
                aria-label={v.title + " assign dialogue"}
                value=""
                onChange={(e) => {
                  const id = e.target.value;
                  if (id)
                    edit((p) => {
                      p.scenes
                        .find((s) => s.id === scene.id)!
                        .nodes.find((n) => n.id === id)!.view = v.id;
                    });
                }}
              >
                <option value="">Choose dialogue…</option>
                {scene.nodes.map((n, i) => (
                  <option key={n.id} value={n.id}>
                    {i + 1}. {n.text.slice(0, 55)}
                  </option>
                ))}
              </select>
            </label>
            <TransitionFields
              label={v.title + " visual"}
              value={v.transition}
              onChange={(t) =>
                update((s) => {
                  s.subscenes!.find((x) => x.id === v.id)!.transition = t!;
                })
              }
            />
          </div>
        ))}
      </div>
      {selectedAsset?.mime === "image/gif" && (
        <GifTimeline
          key={active + selectedAsset.id}
          asset={selectedAsset}
          scene={scene}
          viewId={activeView?.id}
          config={activeView?.gif || (!activeView ? scene.gif : undefined)}
          update={update}
          changeConfig={(gif) =>
            update((s) => {
              if (activeView)
                s.subscenes!.find((v) => v.id === activeView.id)!.gif = gif;
              else s.gif = gif;
            })
          }
        />
      )}
      <p>
        Each card is a view, not an automatic next slide. Its dialogue buttons
        show exactly where it is triggered. Unassigned dialogues return to the
        main background.
      </p>
      <label>
        Trigger new view at dialogue
        <select
          aria-label="New background trigger dialogue"
          value={trigger}
          onChange={(e) => setTrigger(e.target.value)}
        >
          {scene.nodes.map((n, i) => (
            <option key={n.id} value={n.id}>
              {i + 1}. {n.text.slice(0, 65)}
            </option>
          ))}
        </select>
      </label>
      <label>
        Add still / GIF sub-scene
        <input
          aria-label="Add storyboard background"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (!f) return;
            try {
              const a = await readImage(f);
              const id = crypto.randomUUID();
              edit((p) => {
                a.folder = "Background scenes";
                p.assets.push(a);
                const s = p.scenes.find((s) => s.id === scene.id)!;
                (s.subscenes ??= []).push({
                  id,
                  title: f.name,
                  background: a.id,
                  transition: { style: "smooth", seconds: 0.45 },
                });
                s.nodes.find((n) => n.id === trigger)!.view = id;
              });
              setError("");
            } catch (e) {
              setError(String(e));
            }
          }}
        />
      </label>
      {error && <p role="alert">{error}</p>}
    </details>
  );
}
