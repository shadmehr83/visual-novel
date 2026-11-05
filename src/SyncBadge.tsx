import { useEffect, useState } from "react";

// Linked windows status (by Claude): which window this is, how many studio windows are linked,
// and a flash each time an edit goes out or comes in, with how long ago that was.
export function SyncBadge({ sync, screen }: {
  sync: { linked: number; activity: { at: number; way: "sent" | "received" } | null; outdated?: { self: boolean; others: number } };
  screen: "controls" | "preview" | null;
}) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!sync.linked) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [sync.linked]);
  const role = screen === "controls" ? "Control window" : screen === "preview" ? "Preview window" : "";
  // Windows on another version never link: say which one needs reloading.
  if (sync.outdated?.self)
    return (
      <span className="linked-windows not-linked" role="alert"
        data-help="Another studio window runs a newer Stillframe. This window was opened before the update, so it is not linked. Reload it to get the update and link it again; your work is kept.">
        {role ? role + " · " : ""}Out of date, not linked
        <button className="reload-window" onClick={() => location.reload()}>Reload this window</button>
      </span>
    );
  const stale = sync.outdated?.others
    ? <small className="stale-windows" role="alert" data-help="A studio window opened before the last update is still open. It is not linked, so its changes and tool choices do not reach this window. Press Ctrl+R in it, or close it.">
        · {sync.outdated.others} older window{sync.outdated.others > 1 ? "s" : ""} not linked, reload {sync.outdated.others > 1 ? "them" : "it"}
      </small>
    : null;
  if (!sync.linked && stale)
    return <span className="linked-windows not-linked" role="status">{role ? role + " · " : ""}Not linked {stale}</span>;
  if (!sync.linked)
    return role ? (
      <span
        className="linked-windows not-linked"
        role="status"
        data-help="No other studio window is linked yet. Open the main studio at this same address in a normal Chrome window. Incognito or guest windows cannot link with normal ones, and their edits are not kept."
      >
        {role} · not linked
      </span>
    ) : null;
  const seconds = sync.activity ? Math.max(0, Math.round((now - sync.activity.at) / 1000)) : -1;
  const when = seconds < 0 ? "in step" : seconds < 3 ? "synced just now" : seconds < 60 ? `synced ${seconds}s ago` : `synced ${Math.round(seconds / 60)} min ago`;
  return (
    <span
      className="linked-windows"
      role="status"
      data-help={
        "Linked with " + sync.linked + " other studio window" + (sync.linked > 1 ? "s" : "") +
        " at this address. Every edit and the selected dialogue show in all of them within a moment. The dot flashes each time a change is sent (↑) or received (↓)."
      }
    >
      <i key={sync.activity?.at ?? 0} className={"sync-dot" + (sync.activity ? " sync-flash" : "")} />
      {role ? role + " · " : ""}Linked · {sync.linked + 1} windows
      <small>
        {sync.activity && seconds < 60 ? (sync.activity.way === "sent" ? "↑ " : "↓ ") : ""}
        {when}
      </small>
      {stale}
    </span>
  );
}
