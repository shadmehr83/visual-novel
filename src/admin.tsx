// Playtest admin website (by Claude): /admin on the hosted site. Lists testers of the shared Claude
// versions, shows each run's steps, choices and AI conversations, and can block or forget a tester.
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import type { PlayerRow } from "../functions/api/playtest";

type Ev = { time: number; kind: string; scene: string | null; detail: string | null };
const ago = (t: number) => {
  const s = Math.round((Date.now() - t) / 1000);
  return s < 60 ? "just now" : s < 3600 ? `${Math.round(s / 60)} min ago` : s < 86400 ? `${Math.round(s / 3600)} h ago` : new Date(t).toLocaleDateString();
};
const when = (t: number) => new Date(t).toLocaleString();
const parse = (d: string | null) => { try { return d ? JSON.parse(d) : {}; } catch { return { text: d }; } };

function Admin() {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<{ database: boolean; password: boolean; code: boolean } | null>(null);
  const [players, setPlayers] = useState<PlayerRow[] | null>(null);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<PlayerRow | null>(null);
  const [events, setEvents] = useState<Ev[]>([]);
  const api = async (path: string, init?: RequestInit) => {
    const r = await fetch(path, { ...init, headers: { ...(init?.headers || {}), Authorization: "Bearer " + password.trim(), "Content-Type": "application/json" } });
    const body = await r.json().catch(() => ({}));
    if (!r.ok) throw Error(body.error || "Request failed");
    return body;
  };
  const load = async () => {
    try {
      setPlayers((await api("/api/admin/players")).players);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  };
  const open = async (p: PlayerRow) => {
    setSelected(p);
    try { setEvents((await api("/api/admin/events?player=" + p.id)).events); } catch (e) { setError((e as Error).message); }
  };
  const block = async (p: PlayerRow, blocked: boolean) => {
    if (blocked && !confirm(`Block ${p.nickname || p.name}? They will see “no longer available” and get no AI replies on this device.`)) return;
    await api("/api/admin/block", { method: "POST", body: JSON.stringify({ player: p.id, blocked }) }).catch((e) => setError(e.message));
    await load();
    setSelected((s) => (s && s.id === p.id ? { ...s, blocked: blocked ? 1 : 0 } : s));
  };
  const forget = async (p: PlayerRow) => {
    if (!confirm(`Delete all records of ${p.nickname || p.name}? This cannot be undone.`)) return;
    await api("/api/admin/forget", { method: "POST", body: JSON.stringify({ player: p.id }) }).catch((e) => setError(e.message));
    setSelected(null);
    await load();
  };
  useEffect(() => { void fetch("/api/admin/status").then((r) => r.json()).then(setStatus).catch(() => setStatus(null)); }, []);
  useEffect(() => {
    if (!players) return;
    const t = setInterval(() => { void load(); if (selected) void open(selected); }, 30000);
    return () => clearInterval(t);
  }, [players, selected, password]);

  if (!players)
    return (
      <main>
        <h1>Playtest admin</h1>
        <p className="muted">See who opens your shared game, follow their runs and block access. Testers need no account.</p>
        {status && (!status.database || !status.password) && (
          <div className="notice">
            Setup needed on Cloudflare (Preview environment):{" "}
            {!status.database && <>add a <b>D1 database binding</b> named <code>PLAYTEST_DB</code>; </>}
            {!status.password && <>add a secret named <code>ADMIN_PASSWORD</code>.</>} Then redeploy.
          </div>
        )}
        <form className="bar" onSubmit={(e) => { e.preventDefault(); void load(); }}>
          <input type="password" autoComplete="current-password" placeholder="Admin password" value={password} onChange={(e) => setPassword(e.target.value)} aria-label="Admin password" />
          <button disabled={!password}>Open</button>
        </form>
        {error && <p style={{ color: "var(--bad)" }} role="alert">{error}</p>}
      </main>
    );

  const active = players.filter((p) => Date.now() - p.last_seen < 15 * 60 * 1000).length;
  return (
    <main>
      <h1>Playtest admin</h1>
      <div className="bar">
        <button onClick={() => void load()}>Refresh</button>
        <span className="muted small">Updates every 30 seconds.</span>
        {error && <span style={{ color: "var(--bad)" }} role="alert">{error}</span>}
      </div>
      <div className="cards">
        <div className="card"><span className="muted small">Testers</span><b>{players.length}</b></div>
        <div className="card"><span className="muted small">Active (15 min)</span><b>{active}</b></div>
        <div className="card"><span className="muted small">Finished a run</span><b>{players.filter((p) => p.finished).length}</b></div>
        <div className="card"><span className="muted small">AI replies used</span><b>{players.reduce((a, p) => a + p.ai_replies, 0)}</b></div>
        <div className="card"><span className="muted small">Blocked</span><b>{players.filter((p) => p.blocked).length}</b></div>
      </div>
      <div className="table">
        <table>
          <thead><tr><th>Tester</th><th>Device</th><th>Country</th><th>First seen</th><th>Last seen</th><th>Visits</th><th>Steps</th><th>AI replies</th><th>Where they are</th><th>Access</th></tr></thead>
          <tbody>
            {players.map((p) => (
              <tr key={p.id} className={"row" + (selected?.id === p.id ? " sel" : "")} onClick={() => void open(p)}>
                <td><b>{p.nickname || p.name}</b>{p.nickname && <div className="muted small">{p.name}</div>}</td>
                <td className="small">{p.device}</td>
                <td>{p.country || "–"}</td>
                <td className="small" title={when(p.first_seen)}>{ago(p.first_seen)}</td>
                <td className="small" title={when(p.last_seen)}>{ago(p.last_seen)}</td>
                <td>{p.visits}</td>
                <td>{p.steps}</td>
                <td>{p.ai_replies}</td>
                <td className="small">{p.last_scene || "–"}{p.finished ? " · finished" : ""}</td>
                <td>{p.blocked ? <span className="tag bad">Blocked</span> : <span className="tag ok">Allowed</span>}</td>
              </tr>
            ))}
            {!players.length && <tr><td colSpan={10} className="muted">No testers yet. Share the play link and they will appear here.</td></tr>}
          </tbody>
        </table>
      </div>
      {selected && (
        <section>
          <h2>{selected.nickname || selected.name}</h2>
          <div className="bar">
            {selected.blocked
              ? <button className="good" onClick={() => void block(selected, false)}>Allow again</button>
              : <button className="danger" onClick={() => void block(selected, true)}>Block access</button>}
            <button onClick={() => void forget(selected)}>Delete their records</button>
            <span className="muted small">ID {selected.id} · {selected.device} · {selected.country || "unknown country"}</span>
          </div>
          <div className="timeline">
            {events.map((e, i) => {
              const d = parse(e.detail);
              return (
                <div key={i} className={"ev " + e.kind}>
                  <span className="k">{e.kind === "ai" ? "AI conversation" : e.kind === "open" ? "Opened the game" : e.kind === "end" ? "Reached an ending" : "Story"}</span>{" "}
                  <span className="muted small">{when(e.time)}{e.scene ? " · " + e.scene : ""}{d.at ? " · " + d.at : ""}</span>
                  {e.kind === "step" && <div>{d.choice && <div className="choice">Chose: {d.choice}</div>}{d.typed && <div className="choice">Typed: {d.typed}</div>}<div>{d.line}</div></div>}
                  {e.kind === "ai" && <div><div><b>Tester:</b> {d.player}</div>{d.answer && <div><b>Character:</b> {d.answer}</div>}{d.error && <div style={{ color: "var(--bad)" }}>Error: {d.error}</div>}<div className="muted small">Turn {d.turn}{d.chosenPath ? ` · chosen path: ${d.chosenPath}` : ""}{d.advance ? " · story moved on" : ""}{d.ms ? ` · ${(d.ms / 1000).toFixed(1)} s` : ""}</div></div>}
                  {e.kind === "open" && <div className="small">{d.start} · {d.layout}</div>}
                </div>
              );
            })}
            {!events.length && <p className="muted">No events recorded yet.</p>}
          </div>
        </section>
      )}
      <p className="muted small" style={{ marginTop: 28 }}>
        Recorded per tester: a random ID their browser keeps, an automatic name (or the name they type), browser · system · device type,
        approximate country from Cloudflare, visit times, story steps and choices, typed messages and the characters' answers. No IP address, email or account.
      </p>
    </main>
  );
}
createRoot(document.getElementById("root")!).render(<Admin />);
