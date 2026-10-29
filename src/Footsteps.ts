import { useEffect, useRef } from "react";
import type { Project, Scene } from "./model";
export function useFootsteps(
  project: Project,
  scene: Scene,
  enabled: boolean,
  onError: (message: string) => void,
  masterVolume = 1,
) {
  const origin = useRef(performance.now());
  useEffect(() => {
    origin.current = performance.now();
  }, [scene.id, scene.camera]);
  useEffect(() => {
    const c = scene.camera;
    if (!enabled || !c?.enabled || !c.footsteps) return;
    let ctx: AudioContext | null = null;
    let sample: HTMLAudioElement | null = null;
    try {
      if (c.footstepAsset) {
        sample = new Audio(
          project.audioAssets?.find((a) => a.id === c.footstepAsset)?.data,
        );
        sample.volume = c.footstepVolume * masterVolume;
      } else {
        ctx = new AudioContext();
        ctx
          .resume()
          .catch(() =>
            onError("Footsteps were blocked. Toggle sound to retry."),
          );
      }
    } catch {
      onError("Audio is unavailable in this browser.");
      return;
    }
    let stride = 0;
    const step = () => {
      if (
        document.hidden ||
        (performance.now() - origin.current) / 1000 >= c.duration
      )
        return;
      if (sample) {
        sample.currentTime = 0;
        sample.playbackRate = stride++ % 2 ? 1.025 : .975;
        sample.volume = c.footstepVolume * masterVolume * (stride % 2 ? 1 : .92);
        sample
          .play()
          .catch(() =>
            onError("Footsteps were blocked. Toggle sound to retry."),
          );
        return;
      }
      if (!ctx) return;
      const buffer = ctx.createBuffer(
        1,
        Math.floor(ctx.sampleRate * 0.12),
        ctx.sampleRate,
      );
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++)
        data[i] =
          (Math.sin(i * 123.45) * 0.5 + Math.sin(i * 47.17) * 0.5) *
          Math.exp(-i / (data.length * 0.13));
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 350;
      const gain = ctx.createGain();
      gain.gain.value = c.footstepVolume * masterVolume;
      source.connect(filter).connect(gain).connect(ctx.destination);
      source.onended = () => {
        source.disconnect();
        filter.disconnect();
        gain.disconnect();
      };
      source.start();
    };
    step();
    const timer = setInterval(step, c.stepSeconds * 1000);
    return () => {
      clearInterval(timer);
      sample?.pause();
      if (sample) sample.src = "";
      void ctx?.close();
    };
  }, [enabled, scene.id, scene.camera, project.audioAssets, masterVolume]);
}
