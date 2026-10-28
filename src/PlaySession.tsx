import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
const PauseContext = createContext(false);
export const usePaused = () => useContext(PauseContext);
export function PlaySession({
  children,
  playing,
  onExit,
  onRestart,
}: {
  children: ReactNode;
  playing: boolean;
  onExit?: () => void;
  onRestart: () => void;
}) {
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (!playing) setPaused(false);
  }, [playing]);
  useEffect(() => {
    if (!playing) return;
    const key = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      if (onExit) {
        setPaused(false);
        onExit();
      } else setPaused((p) => !p);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [playing, onExit]);
  return (
    <PauseContext.Provider value={playing && paused}>
      <div
        className={
          playing && paused ? "play-session session-paused" : "play-session"
        }
      >
        {playing && (
          <button
            className="pause-story"
            onClick={() => setPaused(true)}
            data-help="Pause story controls, animation, sound and timed choices. Escape returns to the editor while testing."
          >
            Pause menu
          </button>
        )}
        <div className="session-content" inert={playing && paused}>
          {children}
        </div>
        {playing && paused && (
          <div className="pause-backdrop">
            <section
              role="dialog"
              aria-modal="true"
              aria-label="Pause menu"
              className="pause-dialog"
            >
              <h2>Story paused</h2>
              <button autoFocus onClick={() => setPaused(false)}>
                Resume story
              </button>
              <button
                onClick={() => {
                  setPaused(false);
                  onRestart();
                }}
              >
                Restart story
              </button>
              {onExit && (
                <button
                  onClick={() => {
                    setPaused(false);
                    onExit();
                  }}
                >
                  Back to editor
                </button>
              )}
              <p>
                Use “Advance story” above the scene to choose Continue, Enter,
                or screen clicks.
              </p>
            </section>
          </div>
        )}
      </div>
    </PauseContext.Provider>
  );
}
