import { SceneTransition } from "./SceneTransition";
import { PhoneUI } from "./PhoneUI";
import { SelfReply } from "./SelfReply";
import { FullscreenButton } from "./FullscreenButton";
import { useState } from "react";
import { createRoot } from "react-dom/client";
import { start, advance, respond, validateProject } from "./model";
import { Stage } from "./Stage";
import { Qte, SceneAudio } from "./EngineTools";
function Player() {
  const [project] = useState(() =>
    validateProject(
      JSON.parse(document.getElementById("story-data")!.textContent!),
    ),
  );
  const [reply, setReply] = useState("");
  const [runtime, setRuntime] = useState(() => start(project));
  const scene = project.scenes.find((s) => s.id === runtime.scene)!;
  const node = scene.nodes.find((n) => n.id === runtime.node)!;
  return (
    <main
      className="standalone-experience"
      style={{ maxWidth: 1100, margin: "30px auto", padding: 15 }}
    >
      <h1>{project.title}</h1>
      <FullscreenButton />
      <SceneTransition
        scene={scene}
        playing
        reduced={
          project.settings.reducedEffects ||
          matchMedia("(prefers-reduced-motion: reduce)").matches
        }
      >
        <Stage
          project={project}
          scene={scene}
          playing
          nodeId={node.id}
          maskMode={false}
          onMask={() => {}}
        >
          <SceneAudio project={project} scene={scene} />
          {scene.phone?.enabled ? (
            <PhoneUI
              onRestart={() => setRuntime(start(project))}
              project={project}
              scene={scene}
              node={node}
              runtime={runtime}
              onStep={(id) => setRuntime((r) => advance(project, r, id))}
              onReply={(text) => setRuntime((r) => respond(project, r, text))}
            />
          ) : node.qte ? (
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
              {!runtime.ended &&
                !node.choices.length &&
                node.allowCustomResponse !== false && (
                  <SelfReply
                    nodeId={node.id}
                    onSend={(text) =>
                      setRuntime((r) => respond(project, r, text))
                    }
                  />
                )}
            </div>
          )}
        </Stage>
      </SceneTransition>
      <p>
        This standalone player contains your authored project and original
        assets. No AI connection is needed.
      </p>
    </main>
  );
}
createRoot(document.getElementById("root")!).render(<Player />);
