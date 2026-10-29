import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { PlaybackSetting } from "./PlaybackControls";
import { SoundSession, SessionSoundControls } from "./Sound";
import { FullscreenButton } from "./FullscreenButton";
import { ProgressView } from "./ProgressView";
import type { Project, Runtime } from "./model";
const PauseContext = createContext(false);
const AuthorEditingContext = createContext(false);
export const useAuthorEditing = () => useContext(AuthorEditingContext);
export const usePaused = () => useContext(PauseContext);
export function PlaySession({ children, playing, onExit, onRestart, project, runtime, authorEditing = false, exportControls }: {
  exportControls?: { mode: "continue" | "enter" | "screen"; onMode: (mode: "continue" | "enter" | "screen") => void; onSaveQuit: () => void; onQuit: () => void; error?: string };
  authorEditing?: boolean;
  children: ReactNode; playing: boolean; onExit?: () => void; onRestart: () => void; project?: Project; runtime?: Runtime | null;
}) {
  const [paused, setPaused] = useState(false), [progress, setProgress] = useState(false);
  const [host, setHost] = useState<Element | null>(null);
  const dialog = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!playing) { setPaused(false); setProgress(false); setHost(null); return; }
    const find = () => setHost(document.fullscreenElement || document.querySelector(".preview-area, .standalone-experience"));
    find();
    document.addEventListener("fullscreenchange", find);
    return () => document.removeEventListener("fullscreenchange", find);
  }, [playing]);
  useEffect(() => {
    if (!playing) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); setProgress(false); setPaused(p => !p); }
      if (e.key === "Tab" && paused && dialog.current) {
        const items = [...dialog.current.querySelectorAll<HTMLElement>('button:not(:disabled),select,input,[tabindex="0"]')];
        const first = items[0], last = items.at(-1);
        if (e.shiftKey && (document.activeElement === first || !dialog.current.contains(document.activeElement))) { e.preventDefault(); last?.focus(); }
        else if (!e.shiftKey && (document.activeElement === last || !dialog.current.contains(document.activeElement))) { e.preventDefault(); first?.focus(); }
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [playing, paused]);
  useEffect(() => {
    if (!playing || !paused) return;
    const elements = [...document.querySelectorAll<HTMLElement>(".scene-transition,.app>header,.studio-navigation,.bottom-panel,.inspector,.library,.rail,.preview-header")];
    const previous = elements.map(e => e.inert);
    elements.forEach(e => {e.inert=true;});
    return () => elements.forEach((e,i) => {e.inert=previous[i];});
  }, [playing, paused]);
  const controls = playing && <>
    <div className="play-hud" data-no-advance><button className="pause-story" onClick={() => {setProgress(false); setPaused(true);}} data-help="Pause the story, view the route you have taken, toggle fullscreen, resume or return to editing.">Pause menu</button>{!exportControls && <FullscreenButton />}</div>
    {paused && <div className="pause-backdrop"><section ref={dialog} role="dialog" aria-modal="true" aria-label="Pause menu" className={"pause-dialog" + (progress ? " showing-progress" : "")}>
      <h2>{progress ? "View Current Progress" : "Story paused"}</h2>
      {progress && project && runtime ? <><button autoFocus onClick={() => setProgress(false)}>Back to pause menu</button><ProgressView project={project} runtime={runtime} /></> : <>
        <button autoFocus onClick={() => setPaused(false)}>Resume story</button>
        <FullscreenButton />
        {exportControls && <><PlaybackSetting mode={exportControls.mode} onMode={exportControls.onMode} /><SessionSoundControls /></>}
        {project && runtime && <button onClick={() => setProgress(true)}>View Current Progress</button>}
        <button onClick={() => {setPaused(false); setProgress(false); onRestart();}}>Restart story</button>
        {onExit && <button onClick={() => {setPaused(false); document.querySelector(".presentation")?.classList.remove("presentation"); if (document.fullscreenElement) void document.exitFullscreen().catch(() => {}); onExit();}}>Back to editor</button>}
        {exportControls ? <>
          <button data-help="Save your exact story position and choices in this browser, then return to the game's title screen. Use the same exported file and browser to resume." onClick={() => { exportControls.onSaveQuit(); }}>Save and quit</button>
          <button data-help="Return to the title screen without overwriting the last saved position. Unsaved choices from this session are discarded." onClick={() => exportControls.onQuit()}>Quit without saving</button>
          {exportControls.error && <p role="alert">{exportControls.error}</p>}
          <p>Progress is saved on this device and browser. Your browser or operating system may also provide its own fullscreen exit gesture.</p>
        </> : <p>Choose Continue, Enter or screen clicks with “Advance story” above the scene. Escape opens or closes this menu.</p>}
      </>}
    </section></div>}
  </>;
  return <AuthorEditingContext.Provider value={authorEditing}><PauseContext.Provider value={playing && paused}><SoundSession playing={playing} paused={paused} showControls={!exportControls}>
    <div className={playing && paused ? "play-session session-paused" : "play-session"}><div className="session-content">{children}</div>{host ? createPortal(controls, host) : controls}</div>
  </SoundSession></PauseContext.Provider></AuthorEditingContext.Provider>;
}
