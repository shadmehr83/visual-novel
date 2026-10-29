import { useEffect, useRef, useState } from "react";
import type { GifCue, GifPlayback, Project, Scene } from "./model";
import { GifCanvas } from "./GifCanvas";
import { defaultGif, frameAt, gifPainter, type GifMovie } from "./gif";
import { ExactNumber, TransitionFields } from "./TimelineControls";
export function GifTimeline({
  asset,
  scene,
  viewId,
  config = defaultGif,
  update,
  changeConfig,
}: {
  asset: Project["assets"][number];
  scene: Scene;
  viewId?: string;
  config?: GifPlayback;
  update: (fn: (s: Scene) => void) => void;
  changeConfig: (v: GifPlayback) => void;
}) {
  const [movie, setMovie] = useState<GifMovie | null>(null),
    [time, setTime] = useState(0),
    [running, setRunning] = useState(false),
    [error, setError] = useState("");
  const [preview, setPreview] = useState<{ cue: GifCue; key: number }>({
    cue: { action: "pause", time: config.pauseAt ?? config.startTime },
    key: 0,
  });
  const eligible = scene.nodes.filter((n) =>
    viewId ? n.view === viewId : !n.view,
  );
  const [selected, setSelected] = useState(eligible[0]?.id || "");
  const node = eligible.find((n) => n.id === selected) || eligible[0],
    cue = node?.gifCue;
  const strip = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!movie || !strip.current) return;
    const buffer = document.createElement("canvas"),
      draw = gifPainter(movie, buffer);
    strip.current.querySelectorAll("canvas").forEach((c, i) => {
      draw(frameAt(movie.ends, (movie.duration * i) / 6));
      c.width = 120;
      c.height = Math.round((120 * movie.height) / movie.width);
      c.getContext("2d")!.drawImage(buffer, 0, 0, c.width, c.height);
    });
  }, [movie]);
  const command = (cue: GifCue) => setPreview((p) => ({ cue, key: p.key + 1 }));
  const setCue = (next: GifCue | undefined) => {
    if (node)
      update((s) => {
        s.nodes.find((n) => n.id === node.id)!.gifCue = next;
      });
  };
  const duration = movie?.duration || 0;
  return (
    <section
      className="gif-timeline"
      aria-label={asset.name + " GIF editor"}
      data-no-advance
    >
      <h4>GIF film editor</h4>
      <div className="gif-monitor">
        <GifCanvas
          data={asset.data}
          config={{ ...config, mode: "paused", pauseAt: config.startTime }}
          cue={preview.cue}
          cueKey={String(preview.key)}
          onMovie={setMovie}
          onTime={(t, r) => {
            setTime(t);
            setRunning(r);
          }}
          onError={setError}
        />
      </div>
      {error && <p role="alert">{error}</p>}
      <p className="gif-readout">
        <output aria-label="GIF playhead time">{time.toFixed(2)}s</output> /{" "}
        {duration.toFixed(2)}s · {movie?.frames.length || 0} frames
      </p>
      <div ref={strip} className="gif-filmstrip" aria-hidden>
        {Array.from({ length: 6 }, (_, i) => (
          <canvas key={i} />
        ))}
      </div>
      <label className="gif-scrub-label">
        Film playhead · click or drag to seek
        <input
          type="range"
          aria-label="GIF film playhead"
          data-help="Scrub to a precise GIF frame. Seeking pauses this preview. Use the buttons below to save this moment as the selected dialogue’s pause or play cue."
          min={0}
          max={duration || 1}
          step={0.01}
          value={time}
          disabled={!movie}
          onChange={(e) => command({ action: "pause", time: +e.target.value })}
        />
      </label>
      <div className="gif-film-markers" aria-label="Dialogue markers on film">
        {eligible
          .filter((n) => n.gifCue?.time !== undefined)
          .map((n) => (
            <button
              key={n.id}
              style={{
                left: `${Math.min(100, ((n.gifCue!.time || 0) / (duration || 1)) * 100)}%`,
              }}
              aria-label={`Dialogue ${scene.nodes.indexOf(n) + 1} ${n.gifCue!.action} marker at ${n.gifCue!.time} seconds`}
              data-help="A saved dialogue cue at this source-GIF position. Click to select its dialogue and pause the preview on this frame; the cue’s action is edited below."
              onClick={() => {
                setSelected(n.id);
                command({ action: "pause", time: n.gifCue!.time });
              }}
            >
              {n.gifCue!.action === "pause" ? "Ⅱ" : "▶"}
              {scene.nodes.indexOf(n) + 1}
            </button>
          ))}
      </div>
      <div className="gif-preview-actions">
        <button
          disabled={!movie}
          onClick={() =>
            command({
              action: running ? "pause" : "resume",
              time: time >= duration ? 0 : time,
              speed: config.speed,
            })
          }
        >
          {running ? "Pause GIF preview" : "Play GIF preview"}
        </button>
        <button
          disabled={!movie}
          onClick={() => command({ action: "pause", time: 0 })}
        >
          First frame
        </button>
        <button
          disabled={!movie}
          onClick={() => command({ action: "pause", time: duration })}
        >
          Last frame
        </button>
      </div>
      <ExactNumber
        label="GIF preview time (seconds)"
        value={Number(time.toFixed(2))}
        max={duration || 3600}
        onChange={(t) => command({ action: "pause", time: t })}
        help="Type an exact source-GIF time to preview and pause there. This alone does not change the story; save a dialogue cue below."
      />
      <h4>Default playback for this view</h4>
      <label>
        GIF playback mode
        <select
          aria-label="GIF playback mode"
          value={config.mode}
          data-help="Loop repeats continuously. Play once then hold runs one cycle and freezes. Paused holds the chosen frame until a dialogue cue starts playback."
          onChange={(e) =>
            changeConfig({
              ...config,
              mode: e.target.value as GifPlayback["mode"],
            })
          }
        >
          <option value="loop">Loop</option>
          <option value="once">Play once, then hold</option>
          <option value="paused">Paused / still frame</option>
        </select>
      </label>
      <ExactNumber
        label="GIF speed multiplier"
        value={config.speed}
        min={0.01}
        max={16}
        step={0.01}
        onChange={(speed) => changeConfig({ ...config, speed })}
        help="1 is original speed; 0.1 takes ten times as long, 0.01 takes one hundred times as long, and 2 plays twice as fast. Frame times below always refer to the original GIF."
      />
      <div className="gif-speed-shortcuts">
        {[0.01, 0.1, 0.25, 0.5, 1, 2, 4].map((speed) => (
          <button
            key={speed}
            onClick={() => changeConfig({ ...config, speed })}
          >
            {speed}×
          </button>
        ))}
      </div>
      {!!duration && (
        <p>
          One full cycle at this speed: {(duration / config.speed).toFixed(2)}{" "}
          seconds.
        </p>
      )}
      <ExactNumber
        label="GIF start time (seconds)"
        value={config.startTime}
        max={duration || 3600}
        onChange={(startTime) => changeConfig({ ...config, startTime })}
        help="Start the first cycle at this source-GIF time. Later loops repeat the whole GIF. Dialogue play cues can choose a different start."
      />
      <label>
        <input
          type="checkbox"
          aria-label="Choose GIF hold frame"
          checked={config.pauseAt !== undefined}
          onChange={(e) =>
            changeConfig({
              ...config,
              pauseAt: e.target.checked ? Number(time.toFixed(2)) : undefined,
            })
          }
        />
        Choose a specific frame to hold
      </label>
      {config.pauseAt !== undefined && (
        <ExactNumber
          label="GIF hold time (seconds)"
          value={config.pauseAt}
          max={duration || 3600}
          onChange={(pauseAt) => changeConfig({ ...config, pauseAt })}
          help="When paused, show this source-GIF moment. In Play once mode the full cycle completes, then freezes at this moment. Leave unchecked to hold the final frame."
        />
      )}
      <h4>Dialogue cues on this film</h4>
      <p>
        Choose a dialogue assigned to this view. A cue runs when that dialogue
        starts; later dialogues keep the current playback until another cue
        changes it.
      </p>
      {node ? (
        <>
          <label>
            Cue dialogue
            <select
              aria-label="GIF cue dialogue"
              value={node.id}
              onChange={(e) => setSelected(e.target.value)}
            >
              {eligible.map((n) => (
                <option key={n.id} value={n.id}>
                  {scene.nodes.indexOf(n) + 1}. {n.speaker}:{" "}
                  {n.text.slice(0, 70)}
                </option>
              ))}
            </select>
          </label>
          <label>
            GIF action at dialogue
            <select
              aria-label="GIF dialogue action"
              value={cue?.action || "inherit"}
              onChange={(e) =>
                setCue(
                  e.target.value === "inherit"
                    ? undefined
                    : {
                        action: e.target.value as GifCue["action"],
                        time:
                          e.target.value === "resume"
                            ? undefined
                            : Number(time.toFixed(2)),
                      },
                )
              }
              data-help="No cue keeps current playback. Play restarts a loop at the chosen time, Resume continues from where it stopped, Play once runs to the end then holds, and Pause freezes at the chosen time."
            >
              <option value="inherit">No cue · keep current playback</option>
              <option value="play">Play / restart loop</option>
              <option value="resume">Resume</option>
              <option value="once">Play once, then hold</option>
              <option value="pause">Pause</option>
            </select>
          </label>
          <div className="gif-cue-buttons">
            <button
              onClick={() =>
                setCue({ action: "pause", time: Number(time.toFixed(2)) })
              }
            >
              Pause here at dialogue
            </button>
            <button
              onClick={() =>
                setCue({
                  action: "once",
                  time: Number(time.toFixed(2)),
                  pauseAt: config.pauseAt,
                })
              }
            >
              Play one cycle at dialogue
            </button>
            <button
              onClick={() =>
                setCue({ action: "play", time: Number(time.toFixed(2)) })
              }
            >
              Play from here at dialogue
            </button>
          </div>
          {cue && (
            <>
              <label>
                <input
                  type="checkbox"
                  aria-label="Choose exact GIF cue time"
                  checked={cue.time !== undefined}
                  onChange={(e) =>
                    setCue({
                      ...cue,
                      time: e.target.checked
                        ? Number(time.toFixed(2))
                        : undefined,
                    })
                  }
                />
                Use an exact source time{" "}
                {cue.action === "resume" || cue.action === "pause"
                  ? "(off keeps the current position)"
                  : "(off uses the view start time)"}
              </label>
              {cue.time !== undefined && (
                <ExactNumber
                  label="GIF cue time (seconds)"
                  value={cue.time}
                  max={duration || 3600}
                  onChange={(time) => setCue({ ...cue, time })}
                  help="Exact source-GIF moment used by this dialogue’s action. Pause freezes here; Play starts here. This is a frame position, not a delay after dialogue entry."
                />
              )}
              <label>
                <input
                  type="checkbox"
                  aria-label="Override GIF cue speed"
                  checked={cue.speed !== undefined}
                  onChange={(e) =>
                    setCue({
                      ...cue,
                      speed: e.target.checked ? config.speed : undefined,
                    })
                  }
                />
                Set speed for this dialogue
              </label>
              {cue.speed !== undefined && (
                <ExactNumber
                  label="GIF cue speed multiplier"
                  value={cue.speed}
                  min={0.01}
                  max={16}
                  onChange={(speed) => setCue({ ...cue, speed })}
                  help="Change the GIF speed when this dialogue starts. The speed stays in effect until another cue or view changes it."
                />
              )}
              {cue.action === "once" && (
                <>
                  <label>
                    <input
                      type="checkbox"
                      aria-label="Choose dialogue hold frame"
                      checked={cue.pauseAt !== undefined}
                      onChange={(e) =>
                        setCue({
                          ...cue,
                          pauseAt: e.target.checked
                            ? Number(time.toFixed(2))
                            : undefined,
                        })
                      }
                    />
                    Choose frame after this cycle
                  </label>
                  {cue.pauseAt !== undefined && (
                    <ExactNumber
                      label="Dialogue GIF hold time (seconds)"
                      value={cue.pauseAt}
                      max={duration || 3600}
                      onChange={(pauseAt) => setCue({ ...cue, pauseAt })}
                      help="After this one-shot cycle finishes, freeze on this source frame. Without this override the view’s hold frame, or its last frame, is used."
                    />
                  )}
                </>
              )}
              <button
                onClick={() => {
                  command(cue);
                }}
              >
                Preview selected dialogue cue
              </button>
              <button onClick={() => setCue(undefined)}>
                Remove GIF dialogue cue
              </button>
            </>
          )}
          <TransitionFields
            label="Selected dialogue"
            value={node.viewTransition}
            optional
            onChange={(t) =>
              update((s) => {
                s.nodes.find((n) => n.id === node.id)!.viewTransition = t;
              })
            }
          />
          <div className="gif-cue-track" aria-label="Saved GIF dialogue cues">
            {eligible
              .filter((n) => n.gifCue)
              .map((n) => (
                <button
                  key={n.id}
                  onClick={() => {
                    setSelected(n.id);
                    command({
                      action: "pause",
                      time: n.gifCue!.time ?? config.startTime,
                    });
                  }}
                >
                  {scene.nodes.indexOf(n) + 1} · {n.gifCue!.action} ·{" "}
                  {n.gifCue!.time === undefined
                    ? "current"
                    : n.gifCue!.time + "s"}
                </button>
              ))}
          </div>
        </>
      ) : (
        <p>Assign a dialogue to this view first to add play and pause cues.</p>
      )}
      <p className="small muted">
        Preview controls do not change the story until you save a default or
        dialogue cue. Frame positions use seconds in the original GIF. Saved
        cues are included in project exports and the game player.
      </p>
    </section>
  );
}
