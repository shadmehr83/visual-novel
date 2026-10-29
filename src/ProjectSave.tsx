import { useState } from "react";
import { validateProject, type Project } from "./model";
import { exportProject } from "./storage";
import { portableFeedProject } from "./feedLibrary";
let fileHandle: any = null;
let fileProjectId = "";
export function ProjectSave({ project }: { project: Project }) {
  const [status, setStatus] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  async function file() {
    try {
      validateProject(project);
      if ("showSaveFilePicker" in window) {
        if (fileProjectId !== project.id) fileHandle = null;
        fileHandle ??= await (window as any).showSaveFilePicker({
          suggestedName: "published.stillframe.json",
          types: [
            {
              description:
                "Complete studio project (includes backgrounds and audio)",
              accept: { "application/json": [".json"] },
            },
          ],
        });
        fileProjectId = project.id;
        const stream = await fileHandle.createWritable();
        await stream.write(JSON.stringify(await portableFeedProject(project), null, 2));
        await stream.close();
        setStatus(
          "Project file saved, including original images, audio, feed videos, zones and dialogue.",
        );
      } else {
        await exportProject(project, "published.stillframe.json");
        setStatus(
          "Project download requested. Keep the JSON file; it contains the artwork and effects.",
        );
      }
    } catch (e) {
      if ((e as Error).name === "AbortError")
        setStatus("File save cancelled. Browser work is unchanged.");
      else {
        fileHandle = null;
        setStatus("File save failed: " + String(e));
      }
    }
  }
  async function publish() {
    setBusy(true);
    try {
      const result = await fetch("/api/project", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + password,
        },
        body: JSON.stringify(validateProject(project)),
      });
      const data = await result.json();
      if (!result.ok) throw Error(data.error || "Publish failed");
      setStatus(
        "Published project commit " +
          data.commit +
          ". Cloudflare will rebuild; wait for its successful deployment before opening another device.",
      );
    } catch (e) {
      setStatus(
        String(e) +
          " You can still save a project file and upload it to projects/published.stillframe.json in GitHub.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="property-section" data-effect-panel="Save">
      <h3>Save & move your project</h3>
      <p className="small muted">
        Browser autosave stays on this device. A project file includes
        backgrounds, audio, regions, lighting and dialogue. An image or player
        export is not an editable project backup.
      </p>
      <button className="wide primary" onClick={file}>
        Save complete project file
      </button>
      <button
        className="wide"
        onClick={() => {
          fileHandle = null;
          void file();
        }}
      >
        Save project file as…
      </button>
      <p className="small muted">
        To share across devices, upload this JSON to{" "}
        <a
          href="https://github.com/shadmehr83/visual-novel/tree/main/projects"
          target="_blank"
          rel="noreferrer"
        >
          projects/published.stillframe.json in GitHub
        </a>
        . Engine files stay separate. A deployment publishes that snapshot.
      </p>
      <details>
        <summary>Publish directly to GitHub</summary>
        <p className="small muted">
          Requires a server-side GITHUB_PROJECT_TOKEN with Contents write access
          to this repository, plus STUDIO_ACCESS_TOKEN. No GitHub token goes
          into this panel.
        </p>
        <label>
          Studio publish password
          <input
            type="password"
            autoComplete="off"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button className="wide" disabled={!password || busy} onClick={publish}>
          {busy ? "Publishing…" : "Publish project to GitHub"}
        </button>
      </details>
      <p role="status" className="small">
        {status}
      </p>
    </section>
  );
}
