import { useEffect, useRef, useState } from "react";
import type { Project } from "./model";
import { ENGINE_VERSION, releases } from "./releases";
// Linked windows (by Claude): studio windows open at the same address (for example the main
// studio on one screen and a control window on another) share every edit and the selected
// dialogue live, through a BroadcastChannel in this browser. Only artwork and sound that changed
// are sent with an edit. The window that made a change saves it; the others only show it.
// Different addresses (localhost:5173 and :5174) are separate studios with separate storage.

type Media = [key: string, data: string][];
// Every message carries the studio version. Windows only link with windows running the same
// version: a window left open from before an update would otherwise send messages in an older
// shape (for example tool changes without the sub-scene, which dropped the others back to the
// main scene). Such windows are reported instead, so they can be reloaded.
type Message = { v?: string } & (
  | { type: "hello"; from: string }
  | { type: "bye"; from: string }
  | { type: "here"; from: string }
  | { type: "beat"; from: string }
  | { type: "project"; from: string; project: Project; media: Media; full: boolean; at: number }
  | { type: "select"; from: string; sceneId: string; nodeId: string }
  | { type: "tools"; from: string; tools: unknown; at: number });
// A version this window does not know is newer than it; a known one other than its own is older.
const isNewer = (v: string | undefined) => !!v && v !== ENGINE_VERSION && !releases.some((r) => r.version === v);

const mediaOf = (p: Project): Media => [
  ...p.assets.map((a) => ["image:" + a.id, a.data] as [string, string]),
  ...(p.audioAssets || []).map((a) => ["audio:" + a.id, a.data] as [string, string]),
];
const strip = (p: Project): Project => ({
  ...p,
  assets: p.assets.map((a) => ({ ...a, data: "" })),
  ...(p.audioAssets ? { audioAssets: p.audioAssets.map((a) => ({ ...a, data: "" })) } : {}),
});
// Puts the artwork back: sent items first, then what this window already has.
function rebuild(msg: Extract<Message, { type: "project" }>, current: Project): Project | null {
  const known = new Map(mediaOf(current));
  for (const [k, v] of msg.media) known.set(k, v);
  let missing = false;
  const fill = (kind: string) => (a: { id: string; data: string }) => {
    const data = known.get(kind + a.id);
    if (data === undefined) missing = true;
    return { ...a, data: data ?? "" };
  };
  const p = msg.project;
  const next = { ...p, assets: p.assets.map(fill("image:")), ...(p.audioAssets ? { audioAssets: p.audioAssets.map(fill("audio:")) } : {}) } as Project;
  // Artwork this window has never seen means it fell behind; ask for everything again.
  return missing ? null : next;
}

export function useWindowSync<Tools = null>({ loaded, project, setProject, sceneId, nodeId, onSelect, tools = null as Tools, onTools }: {
  loaded: boolean;
  project: Project;
  setProject: (p: Project) => void;
  sceneId: string;
  nodeId: string;
  onSelect: (sceneId: string, nodeId: string) => void;
  // The scene tool in use (drawing an area, placing a light), so a region being drawn in one
  // window shows, and can be edited, in every linked window.
  tools?: Tools;
  onTools?: (tools: Tools) => void;
}) {
  // This window's id, so it ignores its own messages.
  const [me] = useState(() => Math.random().toString(36).slice(2));
  const channel = useRef<BroadcastChannel | null>(null);
  // The last project that came from another window: it is shown but not sent back or saved here.
  const remote = useRef<Project | null>(null);
  const sent = useRef(new Map<string, string>());
  const lastSelect = useRef("");
  const latest = useRef({ project, sceneId, nodeId, setProject, onSelect, tools, onTools });
  latest.current = { project, sceneId, nodeId, setProject, onSelect, tools, onTools };
  // The tool state last sent or taken, and when it was last chosen: an older choice never
  // replaces a newer one, so a window that just opened does not switch the others' tool off.
  const toolsKey = useRef(JSON.stringify(tools));
  const toolsAt = useRef(0);
  const remoteTools = useRef<Tools | null>(null);
  const [peers, setPeers] = useState<string[]>([]);
  // Windows running another version: not linked, listed so they can be reloaded.
  const [others, setOthers] = useState<Record<string, { v: string; at: number }>>({});
  // When an edit last went out or came in, and which way, for the "synced" signal.
  const [activity, setActivity] = useState<{ at: number; way: "sent" | "received" } | null>(null);
  // When this window last made a change (or took one): older changes never replace newer ones.
  const lastEdit = useRef(0);
  const seen = useRef(new Map<string, number>());
  const shown = useRef<Project | null>(null);
  const linked = useRef(0);
  linked.current = peers.length;

  const post = (msg: Message) => channel.current?.postMessage({ ...msg, v: ENGINE_VERSION });
  const sendProject = (p: Project, full: boolean) => {
    const media: Media = [];
    for (const [k, v] of mediaOf(p)) if (full || sent.current.get(k) !== v) { media.push([k, v]); sent.current.set(k, v); }
    post({ type: "project", from: me, project: strip(p), media, full, at: lastEdit.current });
    if (!full) setActivity({ at: Date.now(), way: "sent" });
  };

  useEffect(() => {
    if (!loaded || typeof BroadcastChannel === "undefined") return;
    const ch = new BroadcastChannel("stillframe-studio-windows");
    channel.current = ch;
    ch.onmessage = ({ data: msg }: MessageEvent<Message>) => {
      if (!msg || msg.from === me) return;
      if (msg.v !== ENGINE_VERSION) {
        // No version at all: a window from before versions were sent, so an older one.
        const v = msg.v || "";
        setOthers((o) => {
          if (msg.type === "bye") { const { [msg.from]: _gone, ...rest } = o; return rest; }
          return { ...o, [msg.from]: { v, at: Date.now() } };
        });
        return;
      }
      const known = seen.current.has(msg.from);
      seen.current.set(msg.from, Date.now());
      if (msg.type !== "bye") setPeers((p) => (p.includes(msg.from) ? p : [...p, msg.from]));
      // A window just opened, or came back after a long pause: greet it and hand over this
      // window's project. It keeps whichever of the two was changed last.
      if (msg.type === "hello" || (!known && msg.type !== "bye")) {
        // A window just opened: greet it and hand over this window's current project.
        post({ type: "here", from: me });
        sendProject(latest.current.project, true);
        post({ type: "select", from: me, sceneId: latest.current.sceneId, nodeId: latest.current.nodeId });
        if (toolsAt.current) post({ type: "tools", from: me, tools: latest.current.tools, at: toolsAt.current });
      }
      if (msg.type === "bye") {
        seen.current.delete(msg.from);
        setPeers((p) => p.filter((x) => x !== msg.from));
      }
      if (msg.type === "project") {
        if (msg.at < lastEdit.current) return;
        const next = rebuild(msg, latest.current.project);
        if (!next) return post({ type: "hello", from: me });
        for (const [k, v] of mediaOf(next)) sent.current.set(k, v);
        remote.current = next;
        lastEdit.current = msg.at;
        latest.current.setProject(next);
        setActivity({ at: Date.now(), way: "received" });
      }
      if (msg.type === "tools") {
        if (msg.at <= toolsAt.current) return;
        toolsAt.current = msg.at;
        toolsKey.current = JSON.stringify(msg.tools);
        remoteTools.current = msg.tools as Tools;
        latest.current.onTools?.(msg.tools as Tools);
      }
      if (msg.type === "select") {
        lastSelect.current = msg.sceneId + "/" + msg.nodeId;
        latest.current.onSelect(msg.sceneId, msg.nodeId);
      }
    };
    post({ type: "hello", from: me });
    const leave = () => post({ type: "bye", from: me });
    window.addEventListener("pagehide", leave);
    // A window closed without saying goodbye is dropped after a quiet spell. Minimised windows
    // may only tick once a minute, so the spell is long.
    const beat = setInterval(() => {
      post({ type: "beat", from: me });
      const quiet = Date.now() - 75000;
      const gone = [...seen.current].filter(([, at]) => at < quiet).map(([id]) => id);
      gone.forEach((id) => seen.current.delete(id));
      if (gone.length) setPeers((p) => p.filter((x) => !gone.includes(x)));
      setOthers((o) => {
        const kept = Object.entries(o).filter(([, w]) => w.at >= quiet);
        return kept.length === Object.keys(o).length ? o : Object.fromEntries(kept);
      });
    }, 5000);
    return () => {
      clearInterval(beat);
      leave();
      window.removeEventListener("pagehide", leave);
      ch.close();
      channel.current = null;
    };
  }, [loaded]);

  // Local edits are grouped for a moment so typing stays smooth. A timer, not an animation
  // frame: frames pause in a hidden or covered window, and the edit must still go out.
  useEffect(() => {
    if (!loaded) return;
    // The project this window opened with is not an edit, so it still takes a linked window's newer work.
    const first = shown.current === null, changed = project !== shown.current;
    shown.current = project;
    if (first || !changed || project === remote.current) return;
    lastEdit.current = Date.now();
    const timer = setTimeout(() => { if (linked.current) sendProject(project, false); }, 30);
    return () => clearTimeout(timer);
  }, [project, loaded]);
  useEffect(() => {
    const key = sceneId + "/" + nodeId;
    if (!loaded || !peers.length || key === lastSelect.current) return;
    lastSelect.current = key;
    post({ type: "select", from: me, sceneId, nodeId });
  }, [sceneId, nodeId, loaded, peers.length]);

  const nextToolsKey = JSON.stringify(tools);
  useEffect(() => {
    if (!loaded || nextToolsKey === toolsKey.current) return;
    toolsKey.current = nextToolsKey;
    toolsAt.current = Date.now();
    // After the edit that goes with it (an area that was just added), so the other window has it.
    const timer = setTimeout(() => post({ type: "tools", from: me, tools: latest.current.tools, at: toolsAt.current }), 60);
    return () => clearTimeout(timer);
  }, [nextToolsKey, loaded]);

  const versions = Object.values(others).map((w) => w.v);
  const outdated = { self: versions.some(isNewer), others: versions.filter((v) => !isNewer(v)).length };
  return { remote, linked: peers.length, activity, remoteTools, outdated };
}

// Opens a linked control window or preview-only window, on another screen when the browser can
// tell where it is. Each kind has its own window, so asking again brings the same one forward.
export async function openStudioWindow(screen: "controls" | "preview") {
  const url = location.origin + location.pathname + "?screen=" + screen;
  let features = "popup,width=1400,height=900";
  try {
    // Chrome and Edge ask once for permission to place windows on other displays.
    const w = window as unknown as { getScreenDetails?: () => Promise<{ screens: { availLeft: number; availTop: number; availWidth: number; availHeight: number }[]; currentScreen: unknown }> };
    if (w.getScreenDetails) {
      const details = await w.getScreenDetails();
      const other = details.screens.find((s) => s !== details.currentScreen);
      if (other) features = `popup,left=${other.availLeft},top=${other.availTop},width=${other.availWidth},height=${other.availHeight}`;
    }
  } catch {
    /* permission refused: open it here and drag it across */
  }
  return window.open(url, "stillframe-" + screen, features);
}
