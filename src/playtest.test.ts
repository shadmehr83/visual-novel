import { expect, it, vi } from "vitest";
import { deviceSummary, isBlocked, onAdmin, onPlaytest, playerName, type D1 } from "../functions/api/playtest";
import { onReplyPost } from "../functions/api/reply";

// A tiny stand-in for Cloudflare D1 that answers the blocked lookup and records writes.
function fakeDb(blocked: number) {
  const writes: string[] = [];
  const stmt = (q: string) => {
    const s = { bind: () => s, run: async () => { writes.push(q); return {}; }, all: async () => ({ results: [] }), first: async () => (q.startsWith("SELECT blocked") ? { blocked } : null) };
    return s;
  };
  const db: D1 = { prepare: stmt as unknown as D1["prepare"], batch: async (list) => { writes.push(...list.map(() => "batch")); return []; } };
  return { db, writes };
}
const player = "0f8a1c2e-1111-4a5b-9c3d-123456789abc";

it("summarises devices without keeping the raw user agent and names testers without accounts", () => {
  expect(deviceSummary("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit Version/17.0 Mobile Safari/604.1")).toBe("Safari · iOS · phone");
  expect(deviceSummary("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0 Safari/537.36")).toBe("Chrome · Windows · desktop");
  expect(playerName(player)).toBe(playerName(player));
  expect(playerName(player)).toMatch(/^[A-Z][a-z]+ [A-Z][a-z]+ \d\d$/);
});

it("accepts playtest events only with the playtest code and reports blocked testers", async () => {
  const post = (code: string) => new Request("https://site.test/api/playtest", { method: "POST", body: JSON.stringify({ code, player, events: [{ kind: "open", detail: {} }, { kind: "step", scene: "Café", detail: { line: "Hi" } }] }) });
  expect((await onPlaytest(post("wrong"), { PLAYTEST_TOKEN: "t" })).status).toBe(401);
  expect(await (await onPlaytest(post("t"), { PLAYTEST_TOKEN: "t" })).json()).toEqual({ allowed: true, tracking: false });
  const allowed = fakeDb(0);
  expect(await (await onPlaytest(post("t"), { PLAYTEST_TOKEN: "t", PLAYTEST_DB: allowed.db })).json()).toEqual({ allowed: true, tracking: true });
  expect(allowed.writes.length).toBeGreaterThan(0);
  const blocked = fakeDb(1);
  expect(await isBlocked({ PLAYTEST_DB: blocked.db }, player)).toBe(true);
  const check = await onPlaytest(new Request(`https://site.test/api/playtest?player=${player}&code=t`), { PLAYTEST_TOKEN: "t", PLAYTEST_DB: blocked.db });
  expect((await check.json()).allowed).toBe(false);
});

it("refuses AI replies to blocked testers", async () => {
  const f = vi.fn();
  vi.stubGlobal("fetch", f);
  const res = await onReplyPost({
    request: new Request("https://site.test/api/reply", { method: "POST", headers: { "x-playtest-token": "t", "x-player-id": player }, body: "{}" }),
    env: { ANTHROPIC_API_KEY: "k", PLAYTEST_TOKEN: "t", PLAYTEST_DB: fakeDb(1).db },
  });
  expect(res.status).toBe(403);
  expect(f).not.toHaveBeenCalled();
  vi.unstubAllGlobals();
});

it("keeps the admin API behind the admin password", async () => {
  const req = (path: string, auth?: string) => new Request("https://site.test" + path, { headers: auth ? { authorization: "Bearer " + auth } : {} });
  expect(await (await onAdmin(req("/api/admin/status"), {})).json()).toEqual({ database: false, password: false, code: false });
  expect((await onAdmin(req("/api/admin/players"), { ADMIN_PASSWORD: "secret" })).status).toBe(401);
  expect((await onAdmin(req("/api/admin/players", "wrong"), { ADMIN_PASSWORD: "secret" })).status).toBe(401);
  expect((await onAdmin(req("/api/admin/players", "secret"), { ADMIN_PASSWORD: "secret" })).status).toBe(503);
  expect((await onAdmin(req("/api/admin/players", "secret"), { ADMIN_PASSWORD: "secret", PLAYTEST_DB: fakeDb(0).db })).status).toBe(200);
});
