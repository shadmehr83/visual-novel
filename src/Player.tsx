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
import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { start, advance, respond, putAwayDevice, shownText, validateProject, type Runtime } from "./model";
import { Stage } from "./Stage";
import { Qte, SceneAudio } from "./EngineTools";
import { aiLog, onlinePlay, type AiLogEntry } from "./characterReply";
import { nickname, playtest, setNickname } from "./playtest";
import { LastLine } from "./LastLine";
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
  // Claude edition exports start on the title screen so testers see it needs a connection.
  const claudeEdition = !!onlinePlay();
  const [atTitle, setAtTitle] = useState(!!saved || claudeEdition);
  const [saveError,setSaveError] = useState("");
  const [runtime, rawSetRuntime] = useState(() => startScope(project,scope));
  const setRuntime = (next: Runtime | ((r:Runtime)=>Runtime)) => rawSetRuntime(before=>limitScope(before,typeof next === 'function' ? next(before):next,scope));
  const scene = project.scenes.find((s) => s.id === runtime.scene)!;
  const node = scene.nodes.find((n) => n.id === runtime.node)!;
  // Playtest tracking for Claude versions (by Claude): access check, story steps, choices and AI chats.
  const online = onlinePlay();
  const [access, setAccess] = useState<"checking" | "ok" | "blocked">(online ? "checking" : "ok");
  const [name, setName] = useState(nickname);
  useEffect(() => {
    if (!online) return;
    playtest.start(online.endpoint, online.token);
    void playtest.allowed(online.endpoint, online.token).then((ok) => setAccess(ok ? "ok" : "blocked"));
    const onAi = (e: AiLogEntry) => playtest.record("ai", project.scenes.find((s) => s.id === e.scene)?.title, { turn: e.turn, player: e.player, answer: e.answer, advance: e.advance, chosenPath: e.chosenPath, error: e.error, ms: e.ms });
    aiLog.listeners.push(onAi);
    return () => { aiLog.listeners.splice(aiLog.listeners.indexOf(onAi), 1); };
  }, []);
  const seen = useRef<Runtime | null>(null);
  useEffect(() => {
    if (!online || atTitle) return;
    const before = seen.current;
    seen.current = runtime;
    if (before && before.scene === runtime.scene && before.node === runtime.node) return;
    const fromScene = before && project.scenes.find((s) => s.id === before.scene);
    const fromNode = fromScene?.nodes.find((n) => n.id === before!.node);
    const picked = before && runtime.choices.length > before.choices.length ? fromNode?.choices.find((c) => c.id === runtime.choices.at(-1)) : undefined;
    const typed = before && (runtime.responses?.length || 0) > (before.responses?.length || 0) ? runtime.responses!.at(-1)!.text : undefined;
    const index = scene.nodes.findIndex((n) => n.id === node.id) + 1;
    playtest.record("step", scene.title, {
      at: `Scene ${project.scenes.indexOf(scene) + 1} · Dialogue ${index}`,
      line: `${node.speaker}: ${shownText(runtime, scene.id, node).slice(0, 240)}`,
      ...(picked ? { choice: picked.text } : {}),
      ...(typed ? { typed } : {}),
    });
    if (runtime.ended) playtest.record("end", scene.title, { at: `Scene ${project.scenes.indexOf(scene) + 1}` });
  }, [runtime, atTitle]);
  const exitFullscreen = () => {
    document.querySelector(".presentation")?.classList.remove("presentation");
    if(document.fullscreenElement) void document.exitFullscreen().catch(()=>{});
  };
  const quit = () => { exitFullscreen(); setSaveError(""); setAtTitle(true); };
  const saveQuit = () => {
    try { savePlayerProgress(localStorage,saveKey,runtime); setSaved(runtime); quit(); }
    catch { setSaveError("Progress could not be saved in this browser. Free storage or allow local storage, then try again. The story is still open."); }
  };
  const restart = () => { setRuntime(startScope(project,scope)); setAtTitle(false); seen.current = null; playtest.record("open", project.scenes[0]?.title, { start: "new game", layout: mobile ? "phone" : "desktop" }); };
  if (access === "blocked") return <main className="player-title claude-edition"><h1>{project.title}</h1>
    <p className="claude-edition-badge">This playtest is no longer available on this device. If you think this is a mistake, contact the author.</p>
  </main>;
  if(atTitle) return <main className={"player-title" + (claudeEdition ? " claude-edition" : "")}><h1>{project.title}</h1>
    {claudeEdition && <p className="claude-edition-badge">Claude edition · characters answer your own replies live · needs an internet connection</p>}
    {claudeEdition && <label className="playtest-name">Your name for the author (optional)<input value={name} maxLength={40} placeholder="e.g. Alex" onChange={e=>{setName(e.target.value);setNickname(e.target.value);}} /></label>}
    {saved && <button data-help="Resume your last saved dialogue, choices and chat transcript in this browser." onClick={()=>{setRuntime(saved);setAtTitle(false);seen.current=null;playtest.record("open", project.scenes.find(s=>s.id===saved.scene)?.title, { start: "continue saved game", layout: mobile ? "phone" : "desktop" });}}>Continue saved game</button>}
    <button data-help="Begin this exported story from its opening. The previous saved checkpoint is kept until you choose Save and quit again." onClick={restart}>Start new game</button>
    <p>Progress stays in this browser on this device. Reopen the same exported game to continue.</p>
    {claudeEdition && <p className="playtest-notice">This is a playtest. To help the author fix problems, it records your choices, the messages you type, the characters' answers, your approximate country and your browser type, linked to a random ID kept in this browser. No account, email or IP address is stored.</p>}
  </main>;
  return (
    <PlaySession key="game" playing project={project} runtime={runtime} onRestart={restart}
      exportControls={{mode,onMode:setMode,onSaveQuit:saveQuit,onQuit:quit,error:saveError}}>
      <main className={"standalone-experience exported-game " + (mobile ? "phone-export" : "desktop-export") + (claudeEdition ? " claude-edition" : "")}
        data-progression={mode}
        style={{"--story-font":project.settings.dialogueFont || "Georgia", "--story-size":(project.settings.dialogueSize || 17)+"px"} as React.CSSProperties}>
        <PlaybackControls mode={mode} onMode={setMode} showSetting={false}
          advance={() => setRuntime(r=>advance(project,r))}
          canAdvance={!runtime.ended && !node.choices.length && !node.qte} />

            <SceneAudio project={project} scene={scene} nodeId={node.id} choices={runtime.choices} choiceSource={runtime.memories?.at(-1)} onAdvance={() => setRuntime(r => advance(project, r))} />
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

            {hasItemUI(scene, node) ? (
              <ItemOverlay
                onReply={(text, branch, answer, rewrites) => setRuntime(r => respond(project, r, text, branch, answer, rewrites))}
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
                onReply={(text, branch, answer, rewrites) =>
                  setRuntime((r) => respond(project, r, text, branch, answer, rewrites))
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
                {node.choices.length > 0 && <LastLine project={project} runtime={runtime} />}
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
                  {shownText(runtime, scene.id, node).replace(/\{(\w+)\}/g, (_, key) =>
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
                    onSend={(text, branch, answer, rewrites) =>
                      setRuntime((r) => respond(project, r, text, branch, answer, rewrites))
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
