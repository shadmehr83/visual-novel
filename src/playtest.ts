// Playtest tracking in shared games (by Claude). A tester is a random ID this browser keeps (no account,
// no username); events are batched to the hosted site's /api/playtest so the admin page can follow runs.
// Only Claude versions (the play link with ?code= and Claude edition exports) report anything.
type Event = { kind: "open" | "step" | "ai" | "end"; time: number; scene?: string; detail: unknown };

const idKey = "stillframe-player-id", nickKey = "stillframe-player-nickname";
let sessionId = "";
export function playerId() {
  try {
    let v = localStorage.getItem(idKey);
    if (!v) localStorage.setItem(idKey, (v = crypto.randomUUID()));
    return v;
  } catch {
    return (sessionId ||= crypto.randomUUID());
  }
}
export function nickname() {
  try { return localStorage.getItem(nickKey) || ""; } catch { return ""; }
}
export function setNickname(v: string) {
  try { localStorage.setItem(nickKey, v.trim().slice(0, 40)); } catch { /* kept for this visit only */ }
}

let target: { url: string; code: string } | null = null;
let queue: Event[] = [];
let timer: ReturnType<typeof setInterval> | null = null;
function flush() {
  if (!target || !queue.length) return;
  const events = queue.splice(0, 60);
  // text/plain keeps this a simple request, so it also works while the page is closing.
  void fetch(target.url, {
    method: "POST",
    keepalive: true,
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify({ code: target.code, player: playerId(), nickname: nickname() || undefined, events }),
  }).catch(() => { queue = [...events, ...queue].slice(0, 300); });
}
export const playtest = {
  // Starts reporting to the site behind a Claude version's reply endpoint.
  start(endpoint: string, code: string) {
    target = { url: new URL(endpoint, location.href).origin + "/api/playtest", code };
    timer ??= setInterval(flush, 12000);
    addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") flush(); });
    addEventListener("pagehide", flush);
  },
  record(kind: Event["kind"], scene: string | undefined, detail: unknown) {
    if (!target) return;
    queue.push({ kind, time: Date.now(), scene, detail });
    if (kind !== "step" || queue.length >= 20) flush();
  },
  // Whether this tester may play (the author can block testers on the admin page).
  async allowed(endpoint: string, code: string) {
    try {
      const url = new URL(endpoint, location.href).origin + `/api/playtest?player=${encodeURIComponent(playerId())}&code=${encodeURIComponent(code)}`;
      const r = await (await fetch(url)).json();
      return r.allowed !== false;
    } catch {
      return true; // Offline or unreachable: the written story still plays.
    }
  },
};
