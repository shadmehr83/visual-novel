import type { Scene } from "./model";
export function SceneTransitionControls({
  scene,
  update,
}: {
  scene: Scene;
  update: (f: (s: Scene) => void) => void;
}) {
  return (
    <section className="property-section">
      <h3>Scene changes</h3>
      <p>
        Entrance applies when arriving here. Exit queues the change after this
        scene’s last dialogue or a choice leading to a different scene. It takes
        priority over the next scene’s entrance.
      </p>
      {(["transition", "exitTransition"] as const).map((key) => {
        const t = scene[key] || { style: "cut", seconds: 0.6 };
        return (
          <div key={key}>
            <label>
              {key === "transition"
                ? "Scene entrance"
                : "After this scene · exit effect"}
              <select
                aria-label={
                  key === "transition"
                    ? "Scene transition"
                    : "Scene exit transition"
                }
                value={
                  scene[key]?.style ||
                  (key === "exitTransition" ? "inherit" : "cut")
                }
                onChange={(e) =>
                  update((s) => {
                    if (e.target.value === "inherit") delete s[key];
                    else
                      s[key] = {
                        ...t,
                        style: e.target.value as typeof t.style,
                      };
                  })
                }
              >
                {key === "exitTransition" && (
                  <option value="inherit">Use next scene’s entrance</option>
                )}
                {["cut", "snappy", "smooth", "slide", "fade"].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            <label>
              {key === "transition" ? "Entrance duration" : "Exit duration"}
              <input
                aria-label={
                  key === "transition"
                    ? "Scene transition seconds"
                    : "Scene exit seconds"
                }
                type="number"
                min=".05"
                max="10"
                step=".05"
                value={t.seconds}
                onChange={(e) => {
                  const seconds = +e.target.value;
                  if (seconds >= 0.05 && seconds <= 10)
                    update((s) => {
                      s[key] = { ...t, seconds };
                    });
                }}
              />
            </label>
          </div>
        );
      })}
    </section>
  );
}
