import { it, expect, vi, afterEach } from "vitest";
import { demo } from "./demo";
import { validateProject } from "./model";
import {
  makeDemand,
  demandPath,
  demandMarkdown,
  demandHandoff,
  githubDemandDraft,
  chatDestination,
} from "./demands";
import { sydneyTimestamp } from "./time";
import { demandConfiguration, publishDemand } from "../functions/api/demands";
afterEach(() => vi.unstubAllGlobals());
const env = {
  GITHUB_PROJECT_TOKEN: "github-server-only",
  STUDIO_ACCESS_TOKEN: "studio-only",
};
const record = () => {
  const p = demo();
  return makeDemand(
    p,
    p.scenes[0].id,
    p.scenes[0].nodes[0].id,
    "Add a warm lamp — café / فارسی.",
  );
};
function request(
  body: unknown,
  token = "studio-only",
  origin = "https://studio.test",
) {
  return new Request("https://studio.test/api/demands", {
    method: "POST",
    headers: { origin, authorization: "Bearer " + token },
    body: JSON.stringify(body),
  });
}
it("exports original request context without embedding project artwork or credentials", () => {
  const p = demo(),
    s = p.scenes[0];
  p.assets = [
    {
      id: "private",
      name: "secret.png",
      mime: "image/png",
      data: "data:image/png;base64,cHJpdmF0ZQ==",
      width: 1,
      height: 1,
      tags: "",
      notes: "",
      approved: false,
      reference: false,
    },
  ];
  const d = makeDemand(p, s.id, s.nodes[0].id, "Change the lamp");
  p.demands = [d];
  expect(validateProject(JSON.parse(JSON.stringify(p))).demands).toEqual([d]);
  const handoff = demandHandoff(d);
  expect(handoff).toContain(s.nodes[0].id);
  expect(handoff).toContain("Change the lamp");
  expect(handoff).not.toContain("base64");
  expect(demandMarkdown(d)).not.toContain("secret.png");
  const url = new URL(githubDemandDraft(d)!);
  expect(url.searchParams.get("filename")).toBe(demandPath(d));
  expect(url.searchParams.get("value")).toBe(demandMarkdown(d));
});
it("keeps long Unicode requests intact when GitHub and ChatGPT URLs are too large", () => {
  const d = record();
  d.text = "照明の変更 ".repeat(900);
  expect(githubDemandDraft(d)).toBeNull();
  expect(demandHandoff(d)).toContain(d.text);
  expect(chatDestination(demandHandoff(d), "")).toBe("https://chatgpt.com/");
});
it("opens only HTTPS ChatGPT conversation destinations and formats Sydney seconds", () => {
  expect(chatDestination("hello", "https://chatgpt.com/c/example")).toBe(
    "https://chatgpt.com/c/example",
  );
  for (const url of [
    "javascript:alert(1)",
    "https://chatgpt.com.evil.test/",
    "https://user:pass@chatgpt.com/",
    "http://chatgpt.com/",
  ])
    expect(() => chatDestination("hello", url)).toThrow();
  expect(sydneyTimestamp("2026-10-29T10:16:13Z")).toContain("21:16:13");
  expect(sydneyTimestamp("2026-06-29T10:16:13Z")).toContain("20:16:13");
});
it("checks publisher configuration without returning credential values", async () => {
  expect(await demandConfiguration({}).json()).toEqual({ configured: false });
  expect(await demandConfiguration(env).json()).toEqual({ configured: true });
});
it("rejects missing credentials, other origins, invalid passwords and invalid records before GitHub calls", async () => {
  const fetcher = vi.fn();
  vi.stubGlobal("fetch", fetcher);
  expect((await publishDemand(request(record()), {})).status).toBe(503);
  expect(
    (
      await publishDemand(
        request(record(), "studio-only", "https://other.test"),
        env,
      )
    ).status,
  ).toBe(403);
  expect((await publishDemand(request(record(), "bad"), env)).status).toBe(401);
  expect(
    (await publishDemand(request({ id: "../../engine" }), env)).status,
  ).toBe(400);
  expect(fetcher).not.toHaveBeenCalled();
});
it("commits a new immutable Unicode request file, never the engine or project snapshot", async () => {
  const d = record(),
    fetcher = vi
      .fn()
      .mockResolvedValueOnce(new Response("", { status: 404 }))
      .mockResolvedValueOnce(
        Response.json({ commit: { sha: "abc123" } }, { status: 201 }),
      );
  vi.stubGlobal("fetch", fetcher);
  const response = await publishDemand(request(d), env),
    result = await response.json();
  expect(response.status).toBe(200);
  expect(result.url).toContain("/demands/inbox/");
  expect(JSON.stringify(result)).not.toContain("server-only");
  const [url, options] = fetcher.mock.calls[1];
  expect(String(url).endsWith(demandPath(d))).toBe(true);
  expect(options.method).toBe("PUT");
  const payload = JSON.parse(options.body);
  expect(payload.branch).toBe("main");
  expect(payload).not.toHaveProperty("sha");
  const decoded = new TextDecoder().decode(
    Uint8Array.from(atob(payload.content), (c) => c.charCodeAt(0)),
  );
  expect(decoded).toBe(demandMarkdown(d));
  expect(decoded).toContain("فارسی");
});
it("recognises an identical retry and refuses to overwrite a different existing request", async () => {
  const d = record(),
    content = btoa(
      String.fromCharCode(...new TextEncoder().encode(demandMarkdown(d))),
    );
  const fetcher = vi
    .fn()
    .mockImplementation(async () => Response.json({ content }));
  vi.stubGlobal("fetch", fetcher);
  expect(await (await publishDemand(request(d), env)).json()).toMatchObject({
    alreadySaved: true,
  });
  expect(fetcher).toHaveBeenCalledTimes(1);
  d.text = "A different request";
  expect((await publishDemand(request(d), env)).status).toBe(409);
  expect(fetcher).toHaveBeenCalledTimes(2);
});
it("reports unavailable GitHub without claiming a confirmed file", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockRejectedValue(Error("Network unavailable")),
  );
  const response = await publishDemand(request(record()), env);
  expect(response.status).toBe(502);
  expect(await response.json()).not.toHaveProperty("url");
});
