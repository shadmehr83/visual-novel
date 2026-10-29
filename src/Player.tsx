import { startScope, limitScope, type ExportScope } from "./exportScope";
import { cloneData as structuredClone } from "./cloneData";
import { ChapterBadge } from "./ChapterWorkspace";
import { effectiveDevice, saveDeviceAppearance } from "./deviceShared";
import { RecoveryBoundary } from "./RecoveryBoundary";
import { PlaySession } from "./PlaySession";
import { withDeviceUpload } from "./DeviceAppearance";
import { deviceScreen } from "./interactions";
import { PlaybackControls } from "./PlaybackControls";
import { ItemOverlay, hasItemUI } from "./ItemOverlay";
import { SceneTransition } from "./SceneTransition";
import { DeviceOverlay as PhoneUI } from "./DeviceOverlay";
import { openNotification } from "./notifications";
import { SelfReply } from "./SelfReply";
import { FullscreenButton } from "./FullscreenButton";
import { useState } from "react";
import { createRoot } from "react-dom/client";
import { start, advance, respond, putAwayDevice, validateProject, type Runtime } from "./model";
import { Stage } from "./Stage";
import { Qte, SceneAudio } from "./EngineTools";
function Player() {
  const [project, setProject] = useState(() =>
    validateProject(
      JSON.parse(document.getElementById("story-data")!.textContent!),
    ),
  );
  const [reply, setReply] = useState("");
  const scope: ExportScope | undefined = JSON.parse(document.getElementById("story-range")?.textContent || "null") || undefined;
  const [runtime, rawSetRuntime] = useState(() => startScope(project,scope));
  const setRuntime = (next: Runtime | ((r:Runtime)=>Runtime)) => rawSetRuntime(before=>limitScope(before,typeof next === 'function' ? next(before):next,scope));
  const scene = project.scenes.find((s) => s.id === runtime.scene)!;
  const node = scene.nodes.find((n) => n.id === runtime.node)!;
  return (
    <PlaySession playing project={project} runtime={runtime} onRestart={() => setRuntime(startScope(project,scope))}>
      <main
        className="standalone-experience"
        style={
          {
            maxWidth: 1100,
            margin: "30px auto",
            padding: 15,
            "--story-font": project.settings.dialogueFont || "Georgia",
            "--story-size": (project.settings.dialogueSize || 17) + "px",
          } as React.CSSProperties
        }
      >
        <h1>{project.title}</h1>
        <FullscreenButton />
        <ChapterBadge project={project} scene={scene.id} /><PlaybackControls
          mode={project.settings.progression || "continue"}
          onMode={(mode) =>
            setProject((p) => ({
              ...p,
              settings: { ...p.settings, progression: mode },
            }))
          }
          advance={() => setRuntime((r) => advance(project, r))}
          canAdvance={!runtime.ended && !node.choices.length && !node.qte}
        />

        <SceneTransition
          scene={scene}
          nodeId={node.id}
          playing
          reduced={
            project.settings.reducedEffects ||
            matchMedia("(prefers-reduced-motion: reduce)").matches
          }
        >
          <Stage
            visits={runtime.nodeVisits
              ?.filter((v) => v.scene === scene.id)
              .map((v) => v.node)}
            itemFocus={
              hasItemUI(scene, node)
            }
            project={project}
            scene={scene}
            playing
            nodeId={node.id}
            maskMode={false}
            onMask={() => {}}
          >
            <SceneAudio project={project} scene={scene} nodeId={node.id} choices={runtime.choices} choiceSource={runtime.memories?.at(-1)} onAdvance={() => setRuntime(r => advance(project, r))} />
            {hasItemUI(scene, node) ? (
              <ItemOverlay
                onReply={(text, branch) => setRuntime(r => respond(project, r, text, branch))}
                project={project}
                scene={scene}
                node={node}
                runtime={runtime}
                onStep={(id) => setRuntime((r) => advance(project, r, id))}
              />
            ) : !node.qte &&
              deviceScreen(
                scene,
                node,
                runtime.nodeVisits
                  ?.filter((v) => v.scene === scene.id)
                  .map((v) => v.node),
              ) !== "off" ? (
              <PhoneUI
                onPutAway={() => setRuntime(r => putAwayDevice(project, r))}
                onNotification={() => setRuntime(r => openNotification(project, r))}
                key={scene.id}
                onAppearance={(a) =>
                  setProject((p) => {
                    const next = structuredClone(p);
                    saveDeviceAppearance(next, scene.id, a);
                    return next;
                  })
                }
                onUpload={(asset, target) =>
                  setProject((p) => {
                    const next = structuredClone(p);
                    next.assets.push(asset);
                    const s = next.scenes.find((s) => s.id === scene.id)!;
                    saveDeviceAppearance(next, scene.id, withDeviceUpload(effectiveDevice(next,s).appearance, asset, target));
                    return next;
                  })
                }
                onRestart={() => setRuntime(startScope(project,scope))}
                project={project}
                scene={scene}
                node={node}
                runtime={runtime}
                onStep={(id) => setRuntime((r) => advance(project, r, id))}
                onReply={(text, branch) =>
                  setRuntime((r) => respond(project, r, text, branch))
                }
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
                <b
                  style={{
                    color: project.characters.find(
                      (c) => c.name === node.speaker,
                    )?.color,
                  }}
                >
                  {node.speaker}
                </b>
                <p>
                  {node.text.replace(/\{(\w+)\}/g, (_, key) =>
                    String(runtime.values[key] ?? ""),
                  )}
                </p>
                {runtime.ended ? (
                  <button onClick={() => setRuntime(startScope(project,scope))}>
                    Restart story
                  </button>
                ) : node.choices.length ? (
                  <div className="play-choices">
                    {node.choices
                      .filter(
                        (c) =>
                          !c.condition ||
                          runtime.values[c.condition.key] ===
                            c.condition.equals,
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
                  <button
                    onClick={() => setRuntime((r) => advance(project, r))}
                  >
                    Continue
                  </button>
                )}
                {!runtime.ended && node.allowCustomResponse !== false && (
                  <SelfReply
                    choices={node.choices.filter(
                      (c) =>
                        !c.condition ||
                        runtime.values[c.condition.key] === c.condition.equals,
                    )}
                    nodeId={node.id}
                    onSend={(text, branch) =>
                      setRuntime((r) => respond(project, r, text, branch))
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
    </PlaySession>
  );
}
createRoot(document.getElementById("root")!).render(
  <RecoveryBoundary>
    <Player />
  </RecoveryBoundary>,
);
