import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
type SoundState = {
  enabled: boolean;
  volume: number;
  play: (data?: string, volume?: number, event?: string) => void;
  onBlocked: () => void;
  controls?: ReactNode;
};
const SoundContext = createContext<SoundState>({ enabled: false, volume: 0.65, play: () => {}, onBlocked: () => {} });
export const useSound = () => useContext(SoundContext);
export function SoundSession({ children, playing, paused, showControls = true }: { children: ReactNode; playing: boolean; paused: boolean; showControls?: boolean }) {
  const [enabled, setEnabled] = useState(true), [volume, setVolume] = useState(0.65), [blocked, setBlocked] = useState(false);
  const live = useRef({ enabled, volume, playing, paused });
  live.current = { enabled, volume, playing, paused };
  const voices = useRef(new Set<HTMLAudioElement>());
  const lastChoiceEvent = useRef("");
  const onBlocked = useCallback(() => setBlocked(true), []);
  const play = useCallback((data?: string, gain = 0.5, event?: string) => {
    if (event === "reset-choice") { lastChoiceEvent.current = ""; return; }
    const state = live.current;
    if (!data || !state.enabled || !state.playing || state.paused || document.hidden) return;
    if (event && lastChoiceEvent.current === event) return;
    if (event) lastChoiceEvent.current = event;
    const audio = new Audio(data);
    audio.volume = gain * state.volume;
    voices.current.add(audio);
    const done = () => { voices.current.delete(audio); audio.src = ""; };
    audio.onended = done;
    void audio.play().catch(() => { setBlocked(true); done(); });
  }, []);
  useEffect(() => {
    if (!playing || paused || !enabled) {
      voices.current.forEach(a => { a.pause(); a.src = ""; });
      voices.current.clear();
    }
    if (!playing) lastChoiceEvent.current = "";
  }, [playing, paused, enabled]);
  useEffect(() => () => { voices.current.forEach(a => { a.pause(); a.src = ""; }); }, []);
  const controls = playing ? <div className="story-sound" data-no-advance>
      <button data-help="Enable or mute story audio. If autoplay was blocked, tap here to allow playback in this browser." onClick={() => { if (blocked) { setEnabled(false); setTimeout(() => setEnabled(true), 0); } else setEnabled(!enabled); setBlocked(false); }}>{blocked ? "Enable sound" : enabled ? "Mute sound" : "Enable sound"}</button>
      <label>Sound volume <input aria-label="Story sound volume" data-help="Set the master volume for the story, including ambience and effects. Individual authored track volumes are kept." type="range" min="0" max="1" step="0.01" value={volume} onChange={e => setVolume(+e.target.value)} /></label>
      {blocked && <small>Tap Enable sound if your browser blocks autoplay.</small>}
    </div> : null;

  return <SoundContext.Provider value={{ enabled: enabled && playing, volume, play, onBlocked, controls }}>
    {showControls && controls}
    {children}
  </SoundContext.Provider>;
}

export function SessionSoundControls() { return <>{useSound().controls}</>; }
