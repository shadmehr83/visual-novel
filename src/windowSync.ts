import { useEffect, useRef, useState } from "react";
import type { Project } from "./model";
// Linked windows (by Claude): studio windows open at the same address (for example the main
// studio on one screen and a control window on another) share every edit and the selected
// dialogue live, through a BroadcastChannel in this browser. Only artwork and sound that changed
// are sent with an edit. The window that made a change saves it; the others only show it.
// Different addresses (localhost:5173 and :5174) are separate studios with separate storage.

type Media = [key: string, data: string][];
type Message =
  | { type: "hello"; from: string }
  | { type: "bye"; from: string }
  | { type: "here"; from: string }
  | { type: "project"; from: string; project: Project; media: Media; full: boolean }
  | { type: "select"; from: string; sceneId: string; nodeId: string };

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

export function useWindowSync({ loaded, project, setProject, sceneId, nodeId, onSelect }: {
  loaded: boolean;
  project: Project;
  setProject: (p: Project) => void;
  sceneId: string;
  nodeId: string;
  onSelect: (sceneId: string, nodeId: string) => void;
}) {
  // This window's id, so it ignores its own messages.
  const [me] = useState(() => Math.random().toString(36).slice(2));
  const channel = useRef<BroadcastChannel | null>(null);
  // The last project that came from another window: it is shown but not sent back or saved here.
  const remote = useRef<Project | null>(null);
  const sent = useRef(new Map<string, string>());
  const lastSelect = useRef("");
  const latest = useRef({ project, sceneId, nodeId, setProject, onSelect });
  latest.current = { project, sceneId, nodeId, setProject, onSelect };
  const [peers, setPeers] = useState<string[]>([]);

  const post = (msg: Message) => channel.current?.postMessage(msg);
  const sendProject = (p: Project, full: boolean) => {
    const media: Media = [];
    for (const [k, v] of mediaOf(p)) if (full || sent.current.get(k) !== v) { media.push([k, v]); sent.current.set(k, v); }
    post({ type: "project", from: me, project: strip(p), media, full });
  };

  useEffect(() => {
    if (!loaded || typeof BroadcastChannel === "undefined") return;
    const ch = new BroadcastChannel("stillframe-studio-windows");
    channel.current = ch;
    ch.onmessage = ({ data: msg }: MessageEvent<Message>) => {
      if (!msg || msg.from === me) return;
      if (msg.type === "hello" || msg.type === "here")
        setPeers((p) => (p.includes(msg.from) ? p : [...p, msg.from]));
      if (msg.type === "hello") {
        // A window just opened: greet it and hand over this window's current project.
        post({ type: "here", from: me });
        sendProject(latest.current.project, true);
        post({ type: "select", from: me, sceneId: latest.current.sceneId, nodeId: latest.current.nodeId });
      }
      if (msg.type === "bye") setPeers((p) => p.filter((x) => x !== msg.from));
      if (msg.type === "project") {
        const next = rebuild(msg, latest.current.project);
        if (!next) return post({ type: "hello", from: me });
        for (const [k, v] of mediaOf(next)) sent.current.set(k, v);
        remote.current = next;
        latest.current.setProject(next);
      }
      if (msg.type === "select") {
        lastSelect.current = msg.sceneId + "/" + msg.nodeId;
        latest.current.onSelect(msg.sceneId, msg.nodeId);
      }
    };
    post({ type: "hello", from: me });
    const leave = () => post({ type: "bye", from: me });
    window.addEventListener("pagehide", leave);
    return () => {
      leave();
      window.removeEventListener("pagehide", leave);
      ch.close();
      channel.current = null;
    };
  }, [loaded]);

  // Local edits are grouped for a moment so typing stays smooth. A timer, not an animation
  // frame: frames pause in a hidden or covered window, and the edit must still go out.
  useEffect(() => {
    if (!loaded || !peers.length || project === remote.current) return;
    const timer = setTimeout(() => sendProject(project, false), 30);
    return () => clearTimeout(timer);
  }, [project, loaded, peers.length]);
  useEffect(() => {
    const key = sceneId + "/" + nodeId;
    if (!loaded || !peers.length || key === lastSelect.current) return;
    lastSelect.current = key;
    post({ type: "select", from: me, sceneId, nodeId });
  }, [sceneId, nodeId, loaded, peers.length]);

  return { remote, linked: peers.length };
}

// Opens a linked control window, on another screen when the browser can tell where it is.
export async function openControlWindow() {
  const url = location.origin + location.pathname + "?screen=controls";
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
  return window.open(url, "stillframe-controls", features);
}
