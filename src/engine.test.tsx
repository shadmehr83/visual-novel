import { describe, it, expect, vi, afterEach } from "vitest";
import {
  render,
  fireEvent,
  screen,
  act,
  cleanup,
} from "@testing-library/react";
import { demo } from "./demo";
import { applyProposal, aiContext } from "./ai";
import { start, validateProject, resolveQte } from "./model";
import { Qte } from "./EngineTools";
import { onRequestPost, onRequestGet } from "../functions/api/assistant";
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
describe("AI proposals", () => {
  const p = demo();
  it("never changes original before approval", () => {
    const next = applyProposal(p, {
      explanation: "dim",
      assumptions: [],
      operations: [
        { type: "effects", scene: "cafe", values: { brightness: 0.8 } },
      ],
    });
    expect(next.scenes[3].effects.brightness).toBe(0.8);
    expect(p.scenes[3].effects.brightness).toBe(1);
  });
  it("rejects unknown IDs and unsafe parameter ranges", () => {
    for (const op of [
      { type: "effects", scene: "missing", values: {} },
      { type: "effects", scene: "cafe", values: { density: 9999 } },
      { type: "effects", scene: "cafe", values: { execute: "code" } },
      { type: "setVariable", key: "danger", value: true },
    ])
      expect(() =>
        applyProposal(p, {
          explanation: "x",
          assumptions: [],
          operations: [op],
        }),
      ).toThrow();
  });
  it("adds new scenes and links them without state actions", () => {
    const next = applyProposal(p, {
      explanation: "new scene",
      assumptions: [],
      operations: [
        { type: "addScene", id: "park", title: "Park", text: "Quiet trees." },
        {
          type: "addChoice",
          scene: "cafe",
          node: "ending",
          text: "Walk to the park",
          target: "park",
        },
      ],
    });
    expect(next.scenes).toHaveLength(5);
    expect(next.scenes[3].nodes.at(-1)!.choices[0].actions).toEqual([]);
  });
  it("excludes art and audio from provider context", () => {
    p.audioAssets = [
      { id: "a", name: "secret.wav", data: "data:audio/wav;base64,PRIVATE" },
    ];
    expect(JSON.stringify(aiContext(p))).not.toContain("PRIVATE");
    expect(JSON.stringify(aiContext(p))).not.toContain("data:");
  });
});
describe("Engine persistence", () => {
  it("loads original v1 projects unchanged", () =>
    expect(validateProject(demo()).schemaVersion).toBe(1));
  it("roundtrips audio, sprite and QTE data", () => {
    const p = demo();
    p.assets.push({
      id: "a",
      name: "test",
      mime: "image/png",
      width: 1,
      height: 1,
      data: "data:image/png;base64,YQ==",
      tags: "",
      notes: "",
      approved: true,
      reference: false,
    });
    p.scenes[0].sprites = [
      {
        id: "s",
        name: "Mara",
        asset: "a",
        x: 200,
        y: 400,
        scale: 1,
        opacity: 1,
        flip: false,
        expression: "happy",
      },
    ];
    p.audioAssets = [
      { id: "sound", name: "test.wav", data: "data:audio/wav;base64,YQ==" },
    ];
    p.scenes[0].audio = [{ id: "sound", volume: 0.5, loop: true }];
    p.scenes[0].nodes[0].qte = {
      prompt: "Hide phone",
      seconds: 3,
      success: "notification",
      timeout: "again",
    };
    expect(validateProject(JSON.parse(JSON.stringify(p)))).toEqual(p);
  });
  it("rejects dangling sprite/audio references", () => {
    const p = demo();
    p.scenes[0].audio = [{ id: "missing", volume: 1, loop: false }];
    expect(() => validateProject(p)).toThrow("Missing audio");
  });
});
describe("QTE", () => {
  function setup() {
    const p = demo();
    p.scenes[0].nodes[0].qte = {
      prompt: "Act now",
      seconds: 1,
      success: "notification",
      timeout: "again",
    };
    return p;
  }
  it("resolves authored success and timeout separately", () => {
    const p = setup();
    expect(resolveQte(p, start(p), "success").node).toBe("notification");
    expect(resolveQte(p, start(p), "timeout").node).toBe("again");
  });
  it("resolves action/timeout race once and cleans timers", () => {
    vi.useFakeTimers();
    const p = setup();
    const fn = vi.fn();
    const result = render(
      <Qte project={p} runtime={start(p)} onResolve={fn} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Act · Space / tap" }));
    act(() => vi.advanceTimersByTime(2000));
    expect(fn).toHaveBeenCalledTimes(1);
    result.unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
  it("timeouts and supports accessibility skip", () => {
    vi.useFakeTimers();
    const p = setup();
    const fn = vi.fn();
    render(<Qte project={p} runtime={start(p)} onResolve={fn} />);
    act(() => vi.advanceTimersByTime(1100));
    expect(fn.mock.calls[0][0].node).toBe("again");
    cleanup();
    p.settings.skipQte = true;
    render(<Qte project={p} runtime={start(p)} onResolve={fn} />);
    expect(fn.mock.calls.at(-1)![0].node).toBe("notification");
  });
});
describe("Server adapter", () => {
  const env = { AI_API_KEY: "server-only", STUDIO_ACCESS_TOKEN: "access" };
  const req = (body: unknown, token = "access") =>
    new Request("https://studio.test/api/assistant", {
      method: "POST",
      headers: {
        origin: "https://studio.test",
        authorization: "Bearer " + token,
      },
      body: JSON.stringify(body),
    });
  it("reports unconfigured without disclosing keys", async () => {
    const r = await onRequestGet({ env: {} });
    expect(await r.json()).toMatchObject({ configured: false });
  });
  it("rejects absent credentials and incorrect studio passwords", async () => {
    expect((await onRequestPost({ request: req({}), env: {} })).status).toBe(
      503,
    );
    expect(
      (await onRequestPost({ request: req({}, "wrong"), env })).status,
    ).toBe(401);
  });
  it("validates provider output and never returns the server key", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          Response.json({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    explanation: "Ready",
                    assumptions: [],
                    operations: [],
                  }),
                },
              },
            ],
          }),
        ),
    );
    const response = await onRequestPost({
      request: req({ prompt: "Help me", context: {} }),
      env,
    });
    expect(response.status).toBe(200);
    expect(await response.text()).not.toContain("server-only");
  });
  it("handles provider errors gracefully", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("secret error", { status: 401 })),
    );
    const r = await onRequestPost({ request: req({ prompt: "Help" }), env });
    expect(r.status).toBe(502);
    expect(await r.text()).not.toContain("secret error");
  });
});

describe('Keyframes and knowledge memory',()=>{
 it('interpolates positions and holds final values',async()=>{const {animateSprite}=await import('./animation');const sprite={id:'s',name:'Mara',asset:'a',x:0,y:0,scale:1,opacity:1,flip:false,expression:'neutral'};const frames=[{sprite:'s',time:2,x:100,y:200,opacity:0}];expect(animateSprite(sprite,frames,1).x).toBe(50);expect(animateSprite(sprite,frames,10).opacity).toBe(0);});
 it('captures knowledge before a decision rather than rewriting past memories',async()=>{const {advance}=await import('./model');const p=demo();const r=advance(p,advance(p,start(p)),'wait');expect(r.memories![0].knowledge.delayed).toBe(false);expect(r.values.delayed).toBe(true);});
});
