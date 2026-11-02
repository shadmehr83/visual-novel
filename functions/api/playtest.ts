// Playtest tracking and access control for shared games (by Claude).
// Testers are recognised by a random ID their browser keeps, never an account. Events (opening the game,
// story steps and choices, AI conversations, endings) are stored in a Cloudflare D1 database bound as
// PLAYTEST_DB, and the admin page (/admin, password ADMIN_PASSWORD) lists them and can block a tester.
type Statement = { bind(...values: unknown[]): Statement; run(): Promise<unknown>; all<T>(): Promise<{ results: T[] }>; first<T>(): Promise<T | null> };
export type D1 = { prepare(query: string): Statement; batch(statements: Statement[]): Promise<unknown> };
export type PlaytestEnv = { PLAYTEST_DB?: D1; PLAYTEST_TOKEN?: string; ADMIN_PASSWORD?: string };
export type PlayerRow = {
  id: string; name: string; nickname: string | null; country: string | null; device: string | null;
  first_seen: number; last_seen: number; visits: number; steps: number; ai_replies: number;
  last_scene: string | null; last_line: string | null; finished: number; blocked: number;
};

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Allow-Methods": "GET, POST, OPTIONS" };
const json = (body: unknown, status = 200, headers: Record<string, string> = cors) => Response.json(body, { status, headers });
const id = (v: unknown) => (typeof v === "string" && /^[a-z0-9-]{8,64}$/i.test(v) ? v : null);
const clip = (v: unknown, n: number) => (typeof v === "string" ? v.slice(0, n) : null);

let ready: Promise<unknown> | null = null;
function schema(db: D1) {
  ready ??= db.batch([
    db.prepare("CREATE TABLE IF NOT EXISTS players (id TEXT PRIMARY KEY, name TEXT, nickname TEXT, country TEXT, device TEXT, first_seen INTEGER, last_seen INTEGER, visits INTEGER DEFAULT 0, steps INTEGER DEFAULT 0, ai_replies INTEGER DEFAULT 0, last_scene TEXT, last_line TEXT, finished INTEGER DEFAULT 0, blocked INTEGER DEFAULT 0)"),
    db.prepare("CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY AUTOINCREMENT, player TEXT, time INTEGER, kind TEXT, scene TEXT, detail TEXT)"),
    db.prepare("CREATE INDEX IF NOT EXISTS events_player ON events (player, time)"),
  ]).catch((e) => { ready = null; throw e; });
  return ready;
}

// "Chrome · Windows · desktop" from the browser's user-agent string; nothing finer-grained is kept.
export function deviceSummary(ua: string) {
  const browser = /Edg\//.test(ua) ? "Edge" : /OPR\//.test(ua) ? "Opera" : /Firefox\//.test(ua) ? "Firefox" : /Chrome\//.test(ua) ? "Chrome" : /Safari\//.test(ua) ? "Safari" : "Other browser";
  const os = /iPhone|iPad/.test(ua) ? "iOS" : /Android/.test(ua) ? "Android" : /Windows/.test(ua) ? "Windows" : /Mac OS X/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "Other OS";
  const kind = /Mobi|iPhone|Android.+Mobile/.test(ua) ? "phone" : /iPad|Tablet/.test(ua) ? "tablet" : "desktop";
  return `${browser} · ${os} · ${kind}`;
}
// A friendly, stable name from the random ID, so testers need no username.
export function playerName(playerId: string) {
  let h = 0;
  for (const c of playerId) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const a = ["Amber", "Quiet", "Rainy", "Velvet", "Lantern", "Misty", "Copper", "Night", "Paper", "Willow", "Ember", "Silver"];
  const b = ["Fox", "Moth", "Heron", "Otter", "Wren", "Hare", "Lynx", "Finch", "Badger", "Crow", "Seal", "Owl"];
  return `${a[h % a.length]} ${b[(h >>> 4) % b.length]} ${String(h % 97).padStart(2, "0")}`;
}

export async function isBlocked(env: PlaytestEnv, player: string | null) {
  if (!env.PLAYTEST_DB || !player) return false;
  await schema(env.PLAYTEST_DB);
  return !!(await env.PLAYTEST_DB.prepare("SELECT blocked FROM players WHERE id = ?").bind(player).first<{ blocked: number }>())?.blocked;
}

// /api/playtest — called by shared games. Simple requests only (no custom headers), so beacons work.
export async function onPlaytest(request: Request, env: PlaytestEnv) {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  const url = new URL(request.url);
  if (request.method === "GET") {
    const player = id(url.searchParams.get("player"));
    if (!env.PLAYTEST_TOKEN || url.searchParams.get("code") !== env.PLAYTEST_TOKEN) return json({ allowed: false, reason: "This playtest link has expired." }, 401);
    return json({ allowed: !(await isBlocked(env, player)), tracking: !!env.PLAYTEST_DB });
  }
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  let body: { code?: string; player?: string; nickname?: string; events?: { kind?: string; time?: number; scene?: string; detail?: unknown }[] };
  try {
    const text = await request.text();
    if (text.length > 60000) return json({ error: "Too large" }, 413);
    body = JSON.parse(text);
  } catch {
    return json({ error: "Send JSON" }, 400);
  }
  if (!env.PLAYTEST_TOKEN || body.code !== env.PLAYTEST_TOKEN) return json({ error: "This playtest link has expired." }, 401);
  const player = id(body.player);
  if (!player) return json({ error: "Missing player" }, 400);
  if (!env.PLAYTEST_DB) return json({ allowed: true, tracking: false });
  const db = env.PLAYTEST_DB;
  await schema(db);
  const now = Date.now();
  const events = (body.events || []).slice(0, 60).map((e) => ({
    kind: ["open", "step", "ai", "end"].includes(String(e.kind)) ? String(e.kind) : "note",
    time: Number.isFinite(e.time) ? Math.min(Number(e.time), now) : now,
    scene: clip(e.scene, 150),
    detail: clip(typeof e.detail === "string" ? e.detail : JSON.stringify(e.detail ?? ""), 2400),
  }));
  const country = ((request as unknown as { cf?: { country?: string } }).cf?.country) || null;
  const last = [...events].reverse().find((e) => e.kind === "step");
  const count = (k: string) => events.filter((e) => e.kind === k).length;
  await db.batch([
    db.prepare("INSERT INTO players (id, name, nickname, country, device, first_seen, last_seen) VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING")
      .bind(player, playerName(player), clip(body.nickname, 40) || null, country, deviceSummary(request.headers.get("user-agent") || ""), now, now),
    db.prepare("UPDATE players SET last_seen = ?, nickname = COALESCE(?, nickname), country = COALESCE(?, country), visits = visits + ?, steps = steps + ?, ai_replies = ai_replies + ?, last_scene = COALESCE(?, last_scene), last_line = COALESCE(?, last_line), finished = MAX(finished, ?) WHERE id = ?")
      .bind(now, clip(body.nickname, 40) || null, country, count("open"), count("step"), count("ai"), last?.scene ?? null, last ? clip(last.detail, 300) : null, count("end") ? 1 : 0, player),
    ...events.map((e) => db.prepare("INSERT INTO events (player, time, kind, scene, detail) VALUES (?, ?, ?, ?, ?)").bind(player, e.time, e.kind, e.scene, e.detail)),
  ]);
  return json({ allowed: !(await isBlocked(env, player)), tracking: true });
}

// /api/admin/* — the admin page. Same-origin, password in the Authorization header.
export async function onAdmin(request: Request, env: PlaytestEnv) {
  const url = new URL(request.url);
  const plain = { "Cache-Control": "no-store" };
  if (url.pathname === "/api/admin/status") return json({ database: !!env.PLAYTEST_DB, password: !!env.ADMIN_PASSWORD, code: !!env.PLAYTEST_TOKEN }, 200, plain);
  // Stray spaces from typing or pasting the password are ignored on both sides.
  const given = (request.headers.get("authorization") || "").replace(/^Bearer\s+/, "").trim();
  if (!env.ADMIN_PASSWORD || given !== env.ADMIN_PASSWORD.trim())
    return json({ error: env.ADMIN_PASSWORD ? "Wrong admin password." : "Add an ADMIN_PASSWORD secret in Cloudflare first." }, 401, plain);
  if (request.headers.get("origin") && request.headers.get("origin") !== url.origin) return json({ error: "Same-origin only." }, 403, plain);
  if (!env.PLAYTEST_DB) return json({ error: "Add the PLAYTEST_DB database binding in Cloudflare first." }, 503, plain);
  const db = env.PLAYTEST_DB;
  await schema(db);
  if (url.pathname === "/api/admin/players" && request.method === "GET")
    return json({ players: (await db.prepare("SELECT * FROM players ORDER BY last_seen DESC LIMIT 500").all<PlayerRow>()).results }, 200, plain);
  if (url.pathname === "/api/admin/events" && request.method === "GET") {
    const player = id(url.searchParams.get("player"));
    if (!player) return json({ error: "Missing player" }, 400, plain);
    return json({ events: (await db.prepare("SELECT time, kind, scene, detail FROM events WHERE player = ? ORDER BY time, id LIMIT 3000").bind(player).all()).results }, 200, plain);
  }
  if (url.pathname === "/api/admin/block" && request.method === "POST") {
    const body = await request.json().catch(() => ({})) as { player?: string; blocked?: boolean };
    const player = id(body.player);
    if (!player) return json({ error: "Missing player" }, 400, plain);
    await db.prepare("UPDATE players SET blocked = ? WHERE id = ?").bind(body.blocked ? 1 : 0, player).run();
    return json({ ok: true }, 200, plain);
  }
  if (url.pathname === "/api/admin/forget" && request.method === "POST") {
    const body = await request.json().catch(() => ({})) as { player?: string };
    const player = id(body.player);
    if (!player) return json({ error: "Missing player" }, 400, plain);
    await db.batch([db.prepare("DELETE FROM events WHERE player = ?").bind(player), db.prepare("DELETE FROM players WHERE id = ?").bind(player)]);
    return json({ ok: true }, 200, plain);
  }
  return json({ error: "Unknown admin action." }, 404, plain);
}
