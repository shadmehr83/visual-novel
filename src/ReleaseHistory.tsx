import { sydneyTimestamp } from "./time";
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
        recorded milestones. Dates and times use Sydney time; past times come
        from recorded Git commits. Feature directions point to their current
        location in this release. This history is separate from the playthrough
        event log.
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
                  {r.timestamp ? (
                    <time
                      dateTime={r.timestamp}
                      data-help="Recorded update time in Sydney. Historical times come from Git commits; this is not the exact time a Cloudflare deployment finished."
                    >
                      {sydneyTimestamp(r.timestamp)}
                    </time>
                  ) : (
                    r.date + " · time not recorded"
                  )}{" "}
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
                  <h3>{feature.action ? <button onClick={()=>onNavigate(feature.action!)} data-help={feature.description}>{feature.name}</button> : feature.name}</h3>
                  <p>{feature.description}</p>
                  <ol aria-label={"How to find " + feature.name}>
                    {feature.steps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                  <div className="feature-destinations">{[
                    [/phone|device|app/i,"devices","Phone & device settings"],
                    [/chapter/i,"chapters","Chapter rules"],
                    [/dialogue/i,"dialogues","Dialogue editor"],
                    [/light|rain|motion|effect/i,"effect:All","Effect controls"],
                    [/window|panel|workspace|dock/i,"windows","Windows & docking"],
                    [/request|demand|provider|assistant/i,"assistant","Assistant"]
                  ].filter(([pattern])=>(pattern as RegExp).test(feature.name+" "+feature.description)).map(([,action,label])=><button key={String(action)} data-help={"Open "+label+" for this part of the update."} onClick={()=>onNavigate(String(action))}>{String(label)}</button>)}</div>
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
