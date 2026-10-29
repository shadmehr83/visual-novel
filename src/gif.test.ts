import { describe, it, expect } from "vitest";
import { defaultGif, frameAt, initialGif, stepGif, cueGif } from "./gif";
import { demo } from "./demo";
import { validateProject } from "./model";
import { viewTransition } from "./viewTransitions";
import { sceneView } from "./SceneViews";
describe("GIF transport", () => {
  it("uses source frame delays and holds the final frame at the endpoint", () => {
    expect(
      [0, 0.199, 0.2, 0.49, 0.5, 0.9, 99].map((t) =>
        frameAt([0.2, 0.5, 0.9], t),
      ),
    ).toEqual([0, 0, 1, 1, 2, 2, 2]);
  });
  it("slows playback by 100 times and loops by the source duration", () => {
    const s = initialGif({ ...defaultGif, speed: 0.01 }, 2);
    expect(stepGif(s, 100, 2).time).toBe(1);
    expect(stepGif({ ...s, speed: 4 }, 1.1, 2).time).toBeCloseTo(0.4);
  });
  it("plays a single cycle then holds a specified frame without restarting", () => {
    const s = initialGif({ ...defaultGif, mode: "once", pauseAt: 0.35 }, 1);
    const finished = stepGif(s, 2, 1);
    expect(finished).toMatchObject({ time: 0.35, running: false });
    expect(stepGif(finished, 100, 1)).toBe(finished);
    expect(
      stepGif(initialGif({ ...defaultGif, mode: "once" }, 1), 5, 1),
    ).toMatchObject({ time: 1, running: false });
  });
  it("pauses and resumes the current frame unless an exact cue seeks", () => {
    const s = { ...initialGif(defaultGif, 2), time: 0.8 };
    const paused = cueGif(s, { action: "pause" }, 2, defaultGif);
    expect(paused).toMatchObject({ time: 0.8, running: false });
    expect(
      cueGif(paused, { action: "resume", speed: 0.05 }, 2, defaultGif),
    ).toMatchObject({ time: 0.8, running: true, speed: 0.05 });
    expect(
      cueGif(s, { action: "pause", time: 99 }, 2, defaultGif),
    ).toMatchObject({ time: 2, running: false });
    expect(
      cueGif(s, { action: "once", time: 0, pauseAt: 0.1 }, 2, defaultGif),
    ).toMatchObject({ time: 0, mode: "once", pauseAt: 0.1 });
  });
  it("saves playback, per-dialogue cues and durations without stripping them on import", () => {
    const p = demo(),
      s = p.scenes[0];
    s.gif = { mode: "paused", speed: 0.01, startTime: 0, pauseAt: 0.3 };
    s.nodes[0].gifCue = { action: "once", time: 0, pauseAt: 0.4, speed: 0.25 };
    s.nodes[0].viewTransition = { style: "fade", seconds: 25 };
    expect(validateProject(JSON.parse(JSON.stringify(p))).scenes[0]).toEqual(s);
    s.gif.speed = 0;
    expect(() => validateProject(p)).toThrow();
  });
});
describe("view transitions", () => {
  it("selects dialogue override, sub-scene and return duration independently", () => {
    const s = demo().scenes[0];
    s.subscenes = [
      {
        id: "close",
        title: "Close",
        background: null,
        transition: { style: "fade", seconds: 4 },
        gif: { ...defaultGif, mode: "paused" },
      },
    ];
    s.nodes[1].view = "close";
    s.returnTransition = { style: "slide", seconds: 3 };
    expect(viewTransition(s, s.nodes[1].id, s, s.nodes[0].id)).toEqual({
      style: "fade",
      seconds: 4,
    });
    expect(viewTransition(s, s.nodes[0].id, s, s.nodes[1].id)).toEqual({
      style: "slide",
      seconds: 3,
    });
    s.nodes[1].viewTransition = { style: "smooth", seconds: 1.25 };
    expect(viewTransition(s, s.nodes[1].id, s, s.nodes[0].id)?.seconds).toBe(
      1.25,
    );
    expect(sceneView(s, s.nodes[1].id).gif?.mode).toBe("paused");
  });
  it("uses source scene exit on scene changes and avoids unrelated dialogue replays", () => {
    const p = demo(),
      a = p.scenes[0],
      b = p.scenes[1];
    a.exitTransition = { style: "fade", seconds: 7 };
    expect(viewTransition(b, b.nodes[0].id, a, a.nodes[0].id)?.seconds).toBe(7);
    expect(viewTransition(a, a.nodes[1].id, a, a.nodes[0].id)).toBeUndefined();
  });
});
