import { useEffect, useState } from "react";
import type { Project } from "./model";
import type { Demand } from "./demandSchema";
import {
  makeDemand,
  demandHandoff,
  demandMarkdown,
  demandPath,
  githubDemandDraft,
  chatDestination,
  downloadText,
  REPO,
} from "./demands";
import { useDictation } from "./useDictation";
import { sydneyTimestamp } from "./time";
export function DemandExport({
  project,
  sceneId,
  nodeId,
  edit,
}: {
  project: Project;
  sceneId: string;
  nodeId: string;
  edit: (fn: (p: Project) => void) => void;
}) {
  const draftKey = "stillframe-demand-draft:" + project.id;
  const [draft, setDraft] = useState(() => {
    try {
      return localStorage.getItem(draftKey) || "";
    } catch {
      return "";
    }
  });
  const [chat, setChat] = useState(() => {
    try {
      return localStorage.getItem("stillframe-demand-chat") || "";
    } catch {
      return "";
    }
  });
  const [selected, setSelected] = useState(""),
    [status, setStatus] = useState(""),
    [manual, setManual] = useState("");
  const [configured, setConfigured] = useState(false),
    [password, setPassword] = useState(""),
    [busy, setBusy] = useState(false);
  const voice = useDictation((text) =>
    setDraft((v) => (v + (v ? "\n" : "") + text).slice(0, 8000)),
  );
  const records = project.demands || [],
    record = records.find((d) => d.id === selected) || records[0];
  useEffect(() => {
    try {
      localStorage.setItem(draftKey, draft);
    } catch {
      setStatus("Draft storage is full. Save or export this request.");
    }
  }, [draftKey, draft]);
  useEffect(() => {
    if (location.protocol === "file:") return;
    let live = true;
    fetch("/api/demands")
      .then((r) => r.json())
      .then((v) => {
        if (live) setConfigured(v.configured === true);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);
  const save = (): Demand => {
    if (!draft.trim()) {
      if (record) return record;
      throw Error("Write or dictate a request first.");
    }
    if (records.length >= 500)
      throw Error(
        "The request log is full. Export it and remove a completed local entry before adding more.",
      );
    const d = makeDemand(project, sceneId, nodeId, draft);
    edit((p) => {
      (p.demands ??= []).unshift(d);
    });
    setSelected(d.id);
    setDraft("");
    setManual("");
    return d;
  };
  const trySave = () => {
    try {
      const d = save();
      setStatus(
        "Request " +
          d.id.slice(0, 8) +
          " saved in this project. It has not been sent or implemented.",
      );
    } catch (e) {
      setStatus(String(e));
    }
  };
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      setManual(text);
      return false;
    }
  };
  const openChat = () => {
    try {
      const d = save(),
        text = demandHandoff(d),
        url = chatDestination(text, chat);
      // Open during the user gesture; clipboard access is attempted before focus leaves.
      const copied = copy(text);
      window.open(url, "_blank", "noopener,noreferrer");
      void copied.then((ok) =>
        setStatus(
          ok
            ? "Request copied. ChatGPT is opened in a new tab; review, paste if needed, and press Send. This studio cannot submit into an existing chat or run it automatically."
            : "Copy the handoff shown below, then paste and send it in ChatGPT. Nothing has been submitted automatically.",
        ),
      );
    } catch (e) {
      setStatus(String(e));
    }
  };
  const github = () => {
    try {
      const d = save();
      if (d.githubUrl) {
        window.open(d.githubUrl, "_blank", "noopener,noreferrer");
        setStatus("This request already has a confirmed GitHub file.");
        return;
      }
      const url = githubDemandDraft(d);
      if (url) {
        window.open(url, "_blank", "noopener,noreferrer");
        setStatus(
          "GitHub is opened with the request filled in. Click Commit changes there to save it. No GitHub save has been confirmed by this studio.",
        );
      } else {
        downloadText(demandMarkdown(d), demandPath(d).split("/").pop()!);
        window.open(
          REPO + "/upload/main/demands/inbox",
          "_blank",
          "noopener,noreferrer",
        );
        setStatus(
          "Request file download started and GitHub upload is opened. Upload the Markdown file and Commit changes there to finish.",
        );
      }
    } catch (e) {
      setStatus(String(e));
    }
  };
  const publish = async () => {
    setBusy(true);
    try {
      const d = save();
      const response = await fetch("/api/demands", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + password,
        },
        body: JSON.stringify(d),
      });
      const data = await response.json();
      if (!response.ok) throw Error(data.error || "GitHub save failed.");
      edit((p) => {
        const saved = p.demands?.find((x) => x.id === d.id);
        if (saved) saved.githubUrl = data.url;
      });
      setStatus(
        "GitHub confirmed request saved. This does not notify or start this chat; use Copy + open ChatGPT to hand it over.",
      );
    } catch (e) {
      setStatus(
        String(e) +
          " Your local request remains saved. You can use Save request in GitHub instead.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="demand-export" aria-label="AI Demand Export">
      <h3>AI Demand Export</h3>
      <p className="small muted">
        Dictate changes for your coding chat. Save a request with scene context,
        then hand it over. No OpenAI API key needed.
      </p>
      <label>
        Requested change
        <textarea
          aria-label="AI demand request"
          data-help="Describe a software or project change. Saving adds the current scene, dialogue, engine version and timestamp to your request log."
          value={draft}
          maxLength={8000}
          rows={7}
          onChange={(e) => setDraft(e.target.value)}
        />
      </label>
      <small>{draft.length}/8000 characters</small>
      <button
        className="wide"
        data-help="Start or stop browser speech dictation into this request. Review the transcript before sharing. Audio is not stored in the project."
        onClick={voice.toggle}
      >
        {voice.listening ? "Stop demand dictation" : "Speak a demand"}
      </button>
      {voice.interim && (
        <p className="small" aria-live="polite">
          Hearing: {voice.interim}
        </p>
      )}
      {voice.error && <p role="status">{voice.error}</p>}
      <small className="muted">
        Dictation uses your browser’s speech service.
      </small>
      <button
        className="wide"
        disabled={!draft.trim() || busy || voice.listening}
        onClick={trySave}
        data-help="Save this request and its context inside the editable project. It is included in complete project exports; this does not post to GitHub or start an AI task."
      >
        Save request
      </button>
      <button
        className="wide primary"
        disabled={(!draft.trim() && !record) || busy || voice.listening}
        onClick={openChat}
        data-help="Save the draft, copy its handoff and open ChatGPT. Review it and press Send there. An existing chat cannot be posted to automatically from this website."
      >
        Copy + open ChatGPT
      </button>
      <button
        className="wide"
        disabled={(!draft.trim() && !record) || busy || voice.listening}
        onClick={github}
        data-help="Open GitHub with a new request file filled in. Commit changes on GitHub to finish saving. Long requests download as Markdown for upload instead."
      >
        Save request in GitHub
      </button>
      <a
        href={REPO + "/tree/main/demands/inbox"}
        target="_blank"
        rel="noreferrer"
        data-help="Browse requests already committed to GitHub. A local save or an opened GitHub draft appears here only after it is committed."
      >
        Open GitHub request inbox
      </a>
      <details>
        <summary data-help="Optionally enter the link to your existing ChatGPT conversation. The handoff is copied before opening it; you still paste and send there.">
          Use my existing ChatGPT conversation
        </summary>
        <label>
          ChatGPT conversation link
          <input
            type="url"
            aria-label="Demand ChatGPT conversation link"
            placeholder="https://chatgpt.com/c/…"
            value={chat}
            onChange={(e) => {
              const value = e.target.value;
              setChat(value);
              try {
                localStorage.setItem("stillframe-demand-chat", value);
              } catch {}
            }}
            data-help="A browser preference for opening your existing chat. Leave blank to open a new ChatGPT chat with a prefilled request when supported."
          />
        </label>
      </details>
      {configured && (
        <details>
          <summary data-help="Use the existing server-side GitHub publisher to save the request directly. Only your studio password is entered here; no OpenAI API key is used.">
            Direct GitHub save
          </summary>
          <label>
            Studio publish password
            <input
              type="password"
              aria-label="Demand publish password"
              autoComplete="off"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button
            className="wide"
            disabled={
              !password || busy || (!draft.trim() && !record) || voice.listening
            }
            onClick={() => void publish()}
            data-help="Write this request to demands/inbox using the configured GitHub publisher. A confirmed save records its GitHub link; it does not execute the request."
          >
            {busy ? "Saving to GitHub…" : "Confirm direct GitHub save"}
          </button>
        </details>
      )}
      <p role="status" className="demand-status">
        {status}
      </p>
      {manual && (
        <label>
          Copy this handoff
          <textarea
            aria-label="Manual demand handoff"
            readOnly
            value={manual}
            onFocus={(e) => e.target.select()}
            rows={8}
          />
        </label>
      )}
      <details className="demand-log" open>
        <summary data-help="Requests saved in this project, newest first. Open means pending; Done is an author-managed label, not automatic proof that code was changed.">
          Request log · {records.length}
        </summary>
        {records.map((d) => (
          <button
            key={d.id}
            className="demand-log-entry"
            aria-pressed={record?.id === d.id}
            data-help="Select this saved request for copying, downloading or GitHub handoff. It keeps the scene and dialogue captured when it was written."
            onClick={() => {
              setSelected(d.id);
              setStatus("");
              setManual("");
            }}
          >
            <b>{d.text.slice(0, 75)}</b>
            <small>
              {sydneyTimestamp(d.createdAt)} · {d.status} · {d.id.slice(0, 8)}
            </small>
          </button>
        ))}
        {!records.length && <p className="small">No saved requests yet.</p>}
      </details>
      {record && (
        <article className="demand-record" aria-label="Selected saved demand">
          <h4>Selected request · {record.id.slice(0, 8)}</h4>
          <time dateTime={record.createdAt}>
            {sydneyTimestamp(record.createdAt)}
          </time>
          <p className="small">
            {record.context.sceneTitle} · Dialogue {record.context.nodeId} · v
            {record.engineVersion}
          </p>
          <p className="demand-request-text">{record.text}</p>
          {record.githubUrl && (
            <a href={record.githubUrl} target="_blank" rel="noreferrer">
              Confirmed GitHub file
            </a>
          )}
          <button
            className="wide"
            onClick={() =>
              void copy(demandHandoff(record)).then((ok) =>
                setStatus(
                  ok
                    ? "Handoff copied. Paste it into your chat and press Send."
                    : "Select and copy the handoff below.",
                ),
              )
            }
            data-help="Copy this saved request and its original context without opening another tab."
          >
            Copy selected request
          </button>
          <button
            className="wide"
            onClick={() =>
              downloadText(
                demandMarkdown(record),
                demandPath(record).split("/").pop()!,
              )
            }
            data-help="Download this request as a small Markdown file, including its timestamp and scene context. Artwork and credentials are excluded."
          >
            Download selected request
          </button>
          <button
            className="wide"
            onClick={() =>
              edit((p) => {
                p.demands!.find((x) => x.id === record.id)!.status =
                  record.status === "open" ? "done" : "open";
              })
            }
            data-help="Change this local request’s tracking label. Mark Done only after checking the result. This does not run code or update its GitHub file."
          >
            {record.status === "open" ? "Mark request done" : "Reopen request"}
          </button>
          <button
            className="wide"
            onClick={() =>
              edit((p) => {
                p.demands = p.demands!.filter((d) => d.id !== record.id);
              })
            }
            data-help="Remove this entry from the local project log. Undo can restore it. An already committed GitHub file is kept."
          >
            Remove local request
          </button>
        </article>
      )}
      {!!records.length && (
        <button
          className="wide"
          onClick={() =>
            downloadText(
              JSON.stringify(
                { format: "stillframe-demand-log", requests: records },
                null,
                2,
              ),
              "stillframe-demand-log.json",
              "application/json",
            )
          }
          data-help="Download all saved requests as a compact JSON log. Complete project exports also contain these records."
        >
          Export request log
        </button>
      )}
      <p className="small muted">
        Drafts stay in this browser. Saved requests travel with complete project
        files. Copy/open actions do not confirm delivery or execution; requests
        need to be sent in ChatGPT, and GitHub drafts need a commit.
      </p>
    </section>
  );
}
