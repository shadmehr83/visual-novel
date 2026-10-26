import { useState } from "react";
import { createRoot } from "react-dom/client";
import { start, advance, validateProject } from "./model";
import { Stage } from "./Stage";
import { Qte, SceneAudio } from "./EngineTools";
function Player() {
  const [project] = useState(() =>
    validateProject(
      JSON.parse(document.getElementById("story-data")!.textContent!),
    ),
  );
  const [runtime, setRuntime] = useState(() => start(project));
  const scene = project.scenes.find((s) => s.id === runtime.scene)!;
  const node = scene.nodes.find((n) => n.id === runtime.node)!;
  return (
    <main style={{ maxWidth: 1100, margin: "30px auto", padding: 15 }}>
      <h1>{project.title}</h1>
      <Stage
        project={project}
        scene={scene}
        playing
        maskMode={false}
        onMask={() => {}}
      >
        <SceneAudio project={project} scene={scene} />
        {node.qte ? (
          <Qte
            key={runtime.scene + runtime.node + runtime.history.length}
            project={project}
            runtime={runtime}
            onResolve={setRuntime}
          />
        ) : (
          <div className="dialogue-overlay">
            <b>{node.speaker}</b>
            <p>
              {node.text.replace(/\{(\w+)\}/g, (_, key) =>
                String(runtime.values[key] ?? ""),
              )}
            </p>
            {runtime.ended ? (
              <button onClick={() => setRuntime(start(project))}>
                Restart story
              </button>
            ) : node.choices.length ? (
              <div className="play-choices">
                {node.choices
                  .filter(
                    (c) =>
                      !c.condition ||
                      runtime.values[c.condition.key] === c.condition.equals,
                  )
                  .map((c) => (
                    <button
                      key={c.id}
                      onClick={() =>
                        setRuntime((r) => advance(project, r, c.id))
                      }
                    >
                      {c.text}
                    </button>
                  ))}
              </div>
            ) : (
              <button onClick={() => setRuntime((r) => advance(project, r))}>
                Continue
              </button>
            )}
          </div>
        )}
      </Stage>
      <p>
        This standalone player contains your authored project and original
        assets. No AI connection is needed.
      </p>
    </main>
  );
}
createRoot(document.getElementById("root")!).render(<Player />);
