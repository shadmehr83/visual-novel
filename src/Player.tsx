import { playerSaveKey, readPlayerSave, savePlayerProgress } from "./playerSave";
import { choiceAvailable } from "./choices";
import { startScope, limitScope, type ExportScope } from "./exportScope";
import { cloneData as structuredClone } from "./cloneData";
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
  const mobile = document.getElementById("player-target")?.textContent === '"phone"';
  const [mode, setMode] = useState<"continue" | "enter" | "screen">(mobile ? "screen" : project.settings.progression || "continue");
  const scope: ExportScope | undefined = JSON.parse(document.getElementById("story-range")?.textContent || "null") || undefined;
  const [saveKey] = useState(() => playerSaveKey(project,scope));
  const [saved, setSaved] = useState(() => {
    try { return readPlayerSave(localStorage,saveKey,project,scope); } catch { return null; }
  });
  const [atTitle, setAtTitle] = useState(!!saved);
  const [saveError,setSaveError] = useState("");
  const [runtime, rawSetRuntime] = useState(() => startScope(project,scope));
  const setRuntime = (next: Runtime | ((r:Runtime)=>Runtime)) => rawSetRuntime(before=>limitScope(before,typeof next === 'function' ? next(before):next,scope));
  const scene = project.scenes.find((s) => s.id === runtime.scene)!;
  const node = scene.nodes.find((n) => n.id === runtime.node)!;
  const exitFullscreen = () => {
    document.querySelector(".presentation")?.classList.remove("presentation");
    if(document.fullscreenElement) void document.exitFullscreen().catch(()=>{});
  };
  const quit = () => { exitFullscreen(); setSaveError(""); setAtTitle(true); };
  const saveQuit = () => {
    try { savePlayerProgress(localStorage,saveKey,runtime); setSaved(runtime); quit(); }
    catch { setSaveError("Progress could not be saved in this browser. Free storage or allow local storage, then try again. The story is still open."); }
  };
  const restart = () => { setRuntime(startScope(project,scope)); setAtTitle(false); };
  if(atTitle) return <main className="player-title"><h1>{project.title}</h1>
    {saved && <button data-help="Resume your last saved dialogue, choices and chat transcript in this browser." onClick={()=>{setRuntime(saved);setAtTitle(false);}}>Continue saved game</button>}
    <button data-help="Begin this exported story from its opening. The previous saved checkpoint is kept until you choose Save and quit again." onClick={restart}>Start new game</button>
    <p>Progress stays in this browser on this device. Reopen the same exported game to continue.</p>
  </main>;
  return (
    <PlaySession key="game" playing project={project} runtime={runtime} onRestart={restart}
      exportControls={{mode,onMode:setMode,onSaveQuit:saveQuit,onQuit:quit,error:saveError}}>
      <main className={"standalone-experience exported-game " + (mobile ? "phone-export" : "desktop-export")}
        data-progression={mode}
        style={{"--story-font":project.settings.dialogueFont || "Georgia", "--story-size":(project.settings.dialogueSize || 17)+"px"} as React.CSSProperties}>
        <PlaybackControls mode={mode} onMode={setMode} showSetting={false}
          advance={() => setRuntime(r=>advance(project,r))}
          canAdvance={!runtime.ended && !node.choices.length && !node.qte} />

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
            fillViewport={mobile}
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
                    {!node.choices.some(c => choiceAvailable(c, runtime.values)) && <p role="status">No replies are currently available.</p>}
                    {node.choices
                      .filter(
                        (c) =>
                          choiceAvailable(c, runtime.values),
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
                  <button className="player-continue"
                    onClick={() => setRuntime((r) => advance(project, r))}
                  >
                    Continue
                  </button>
                )}
                {!runtime.ended && node.allowCustomResponse !== false && (!node.choices.length || node.choices.some(c => choiceAvailable(c, runtime.values))) && (
                  <SelfReply
                    choices={node.choices.filter(
                      (c) =>
                        choiceAvailable(c, runtime.values),
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
      </main>
    </PlaySession>
  );
}
createRoot(document.getElementById("root")!).render(
  <RecoveryBoundary>
    <Player />
  </RecoveryBoundary>,
);
