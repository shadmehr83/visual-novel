import {RangeInput} from "./RangeInput";
import type { Scene, Project } from "./model";
export const defaultCamera = () => ({
  enabled: true,
  x: 500,
  y: 281.5,
  zoom: 1.4,
  duration: 4,
  bob: 3,
  shake: 1,
  stepSeconds: 0.6,
  footsteps: false,
  footstepVolume: 0.2,
});
export function CameraControls({
  scene,
  project,
  update,
  restart,
}: {
  scene: Scene;
  project: Project;
  update: (fn: (s: Scene) => void) => void;
  restart: () => void;
}) {
  const c = scene.camera;
  return (
    <section className="property-section" data-effect-panel="Camera">
      <h3>Depth / camera movement</h3>
      <p className="small muted">
        Zoom and pan toward a focal point to suggest approaching the closet or a
        character. Optional walking bob and sway move the whole scene; dialogue
        stays steady. This is 2D camera motion.
      </p>
      <button
        className="wide"
        onClick={() =>
          update(
            (s) =>
              (s.camera = s.camera
                ? { ...s.camera, enabled: !s.camera.enabled }
                : defaultCamera()),
          )
        }
      >
        {c?.enabled ? "Disable camera" : "Enable camera"}
      </button>
      {c && (
        <>
          {(
            [
              "x",
              "y",
              "zoom",
              "duration",
              "bob",
              "shake",
              "stepSeconds",
            ] as const
          ).map((key) => (
            <label className="slider" key={key}>
              <span>
                {
                  {
                    x: "Focal point X",
                    y: "Focal point Y",
                    zoom: "Target zoom",
                    duration: "Approach duration",
                    bob: "Walking bob",
                    shake: "Camera sway",
                    stepSeconds: "Footstep interval",
                  }[key]
                }
                <output>{c[key]}</output>
              </span>
              <RangeInput
                aria-label={"Camera " + key}
                data-help={
                  key === "x" || key === "y"
                    ? "Choose the point in the image that the camera will approach. Coordinates use the scene canvas."
                    : undefined
                }
                type="range"
                min={
                  key === "zoom"
                    ? 1
                    : key === "duration"
                      ? 0.2
                      : key === "stepSeconds"
                        ? 0.2
                        : 0
                }
                max={
                  key === "x"
                    ? 1000
                    : key === "y"
                      ? 563
                      : key === "zoom"
                        ? 3
                        : key === "duration"
                          ? 30
                          : key === "stepSeconds"
                            ? 2
                            : 15
                }
                step={
                  key === "zoom" || key === "duration" || key === "stepSeconds"
                    ? 0.05
                    : 1
                }
                value={c[key]}
                onChange={(e) =>
                  update((s) => {
                    s.camera![key] = +e.target.value;
                  })
                }
              />
            </label>
          ))}
          <label className="toggle-row">
            Footsteps during camera movement
            <input
              type="checkbox"
              checked={c.footsteps}
              onChange={(e) =>
                update((s) => (s.camera!.footsteps = e.target.checked))
              }
            />
          </label>
          <label>
            Footstep audio
            <select
              value={c.footstepAsset || ""}
              onChange={(e) =>
                update(
                  (s) =>
                    (s.camera!.footstepAsset = e.target.value || undefined),
                )
              }
            >
              <option value="">Generated soft footstep</option>
              {project.audioAssets?.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>
          <label className="slider">
            Footstep volume
            <RangeInput
              aria-label="Footstep volume"
              type="range"
              min="0"
              max="1"
              step=".01"
              value={c.footstepVolume}
              onChange={(e) =>
                update((s) => (s.camera!.footstepVolume = +e.target.value))
              }
            />
          </label>
          <p className="small muted">
            Players must enable sound. Generated steps are simple synthetic
            sounds; import your own footsteps in Audio for a production
            recording. Reduced motion skips zoom animation and pauses bob.
          </p>
          <button className="wide" onClick={restart}>
            Replay camera preview
          </button>
        </>
      )}
    </section>
  );
}
