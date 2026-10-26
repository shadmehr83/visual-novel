import { it, expect, vi, afterEach } from "vitest";
import { connectedMask } from "./wand";
import { demo } from "./demo";
import { validateProject, start, respond, advance } from "./model";
import { publishProject } from "../functions/api/project";
afterEach(() => vi.unstubAllGlobals());
it("selects only connected matching colours, not disconnected matching islands", () => {
  const pixels = new Uint8ClampedArray([
    10, 10, 10, 255, 255, 255, 255, 255, 10, 10, 10, 255,
  ]);
  const path = connectedMask(pixels, 3, 1, 0, 0, 10);
  expect(path).toContain("h333.33");
  expect(path).not.toContain("666.67");
});
it("roundtrips multiple rain and light zones and rejects bad geometry", () => {
  const p = demo();
  p.scenes[0].effects.rainZones = [
    {
      id: "a",
      name: "A",
      enabled: true,
      points: [
        { x: 0, y: 0 },
        { x: 50, y: 0 },
        { x: 50, y: 50 },
      ],
    },
    {
      id: "b",
      name: "B",
      enabled: true,
      points: [],
      path: "M500 0h50v50h-50Z",
    },
  ];
  p.scenes[0].effects.lights = [
    {
      id: "c",
      name: "candle",
      kind: "local",
      enabled: true,
      intensity: 0.8,
      x: 200,
      y: 100,
      radius: 80,
      color: "#ffcc88",
      spread: 0.5,
      cycle: { enabled: true, values: [0, 2, 1], stepSeconds: 1 },
      region: {
        id: "face",
        name: "face",
        enabled: true,
        points: [],
        path: "M0 0h50v50h-50Z",
      },
    },
  ];
  expect(validateProject(JSON.parse(JSON.stringify(p)))).toEqual(p);
  p.scenes[0].effects.lights[0].radius = -1;
  expect(() => validateProject(p)).toThrow();
});
it("records custom replies while following authored transitions, and rejects reply injection into choices", () => {
  const p = demo();
  const result = respond(p, start(p), "I should check my phone.");
  expect(result.node).toBe("notification");
  expect(result.values).toEqual(start(p).values);
  expect(result.responses![0].text).toBe("I should check my phone.");
  expect(() => respond(p, result, "override choices")).toThrow();
  expect(() => respond(p, start(p), " ")).toThrow();
});
it("publishes only the dedicated project path and never arbitrary engine files", async () => {
  const p = demo();
  const fetcher = vi
    .fn()
    .mockResolvedValueOnce(Response.json({ sha: "old" }))
    .mockResolvedValueOnce(Response.json({ commit: { sha: "new" } }));
  vi.stubGlobal("fetch", fetcher);
  const r = await publishProject(
    new Request("https://studio.test/api/project", {
      method: "POST",
      headers: { origin: "https://studio.test", authorization: "Bearer pass" },
      body: JSON.stringify(p),
    }),
    { STUDIO_ACCESS_TOKEN: "pass", GITHUB_PROJECT_TOKEN: "private" },
  );
  expect(r.status).toBe(200);
  expect(fetcher.mock.calls[1][0]).toBe(
    "https://api.github.com/repos/shadmehr83/visual-novel/contents/projects/published.stillframe.json",
  );
  const sent = JSON.parse(fetcher.mock.calls[1][1].body);
  expect(
    JSON.parse(
      new TextDecoder().decode(
        Uint8Array.from(atob(sent.content), (c) => c.charCodeAt(0)),
      ),
    ),
  ).toEqual(p);
  expect(await r.text()).not.toContain("private");
});
it("publishing requires server configuration and valid user access", async () => {
  const request = new Request("https://studio.test/api/project", {
    method: "POST",
    headers: { origin: "https://studio.test", authorization: "Bearer wrong" },
    body: "{}",
  });
  expect((await publishProject(request, {})).status).toBe(503);
  expect(
    (
      await publishProject(request, {
        GITHUB_PROJECT_TOKEN: "private",
        STUDIO_ACCESS_TOKEN: "right",
      })
    ).status,
  ).toBe(401);
});
