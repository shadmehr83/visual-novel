import { useState } from "react";
import { ENGINE_VERSION, releases } from "./releases";
export function ReleaseHistory({
  onNavigate,
}: {
  onNavigate: (action: string) => void;
}) {
  const [query, setQuery] = useState("");
  const matches = releases.filter((r) =>
    (
      r.version +
      " " +
      r.name +
      " " +
      r.features
        .map((f) => f.name + " " + f.description + " " + f.steps.join(" "))
        .join(" ")
    )
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <main className="release-workspace">
      <div className="release-heading">
        <span className="eyebrow">STILLFRAME STUDIO</span>
        <h1>Update history</h1>
        <p>
          Current engine: <b>v{ENGINE_VERSION}</b>. Your novel is a separate
          project; engine upgrades keep its artwork and story.
        </p>
        <label>
          Find a feature or version
          <input
            aria-label="Search update history"
            value={query}
            placeholder="Brush, phone, 1.8, lighting…"
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>
      <p className="release-provenance">
        Versions before 2.0 were named retrospectively from the repository’s
        recorded milestones. Dates use Sydney time. Feature directions point to
        their current location in this release. This history is separate from
        the playthrough event log.
      </p>
      <div className="release-list">
        {matches.map((r, index) => (
          <details
            className="release-entry"
            key={r.version + ":" + (query ? "search" : "all")}
            open={!!query || index === 0}
          >
            <summary>
              <span className="release-version">v{r.version}</span>
              <span>
                <b>{r.name}</b>
                <small>
                  {new Intl.DateTimeFormat("en-AU", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    timeZone: "Australia/Sydney",
                  }).format(new Date(r.date + "T00:00:00+11:00"))}{" "}
                  · {r.features.length} updates
                </small>
              </span>
              {r.version === ENGINE_VERSION && (
                <span className="badge">CURRENT</span>
              )}
            </summary>
            <div className="release-content">
              {r.commit && (
                <a
                  className="release-source"
                  href={
                    "https://github.com/shadmehr83/visual-novel/commit/" +
                    r.commit
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  Recorded milestone · {r.commit}
                </a>
              )}
              {r.features.map((feature) => (
                <article className="release-feature" key={feature.name}>
                  <h3>{feature.name}</h3>
                  <p>{feature.description}</p>
                  <ol aria-label={"How to find " + feature.name}>
                    {feature.steps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                  {feature.action && (
                    <button onClick={() => onNavigate(feature.action!)}>
                      Open feature location
                      <span className="sr-only"> · {feature.name}</span>
                    </button>
                  )}
                </article>
              ))}
            </div>
          </details>
        ))}
        {!matches.length && (
          <p>
            No matching feature. Try a shorter name such as light, phone or
            dialogue.
          </p>
        )}
      </div>
    </main>
  );
}
