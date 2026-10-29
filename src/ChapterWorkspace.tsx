import { useState } from "react";
import { validateProject, type Project } from "./model";
import type { Chapter, ChapterCondition } from "./chapterSchema";
import {
  addChapter,
  addChapterScene,
  assignChapterScene,
  ensureChapters,
} from "./chapters";
import { chapterForScene, resolveChapterStart } from "./chapterRuntime";
export function ChapterBadge({
  project,
  scene,
}: {
  project: Project;
  scene: string;
}) {
  const c = chapterForScene(project, scene);
  return c ? (
    <span className="chapter-badge">
      Chapter {project.chapters!.indexOf(c) + 1} · {c.title}
    </span>
  ) : null;
}
export function ChapterWorkspace({
  project,
  sceneId,
  edit,
  onSelect,
  onOriginal,
}: {
  project: Project;
  sceneId: string;
  edit: (fn: (p: Project) => void) => void;
  onSelect: (scene: string, node?: string) => void;
  onOriginal: (scene: string, node?: string) => void;
}) {
  const [selected, setSelected] = useState(""),
    [error, setError] = useState(""),
    [preview, setPreview] = useState<Project["variables"]>({});
  const chapters = project.chapters || [],
    chapter =
      chapters.find((c) => c.id === selected) ||
      chapterForScene(project, sceneId) ||
      chapters[0];
  const commit = (fn: (p: Project) => void) => {
    try {
      const next = structuredClone(project);
      fn(next);
      validateProject(next);
      edit((p) => Object.assign(p, next));
      setError("");
    } catch (e) {
      setError(String(e));
    }
  };
  const update = (fn: (c: Chapter) => void) =>
    commit((p) => fn(p.chapters!.find((c) => c.id === chapter.id)!));
  const nodeLabel = (sid: string, nid: string) => {
    const s = project.scenes.find((s) => s.id === sid)!;
    const i = s.nodes.findIndex((n) => n.id === nid);
    return `${s.title} · Dialogue ${i + 1}: ${s.nodes[i]?.text.slice(0, 65)}`;
  };
  const sceneOptions = chapter?.scenes.map((id) => {
    const s = project.scenes.find((s) => s.id === id)!;
    return (
      <option key={id} value={id}>
        {s.title}
      </option>
    );
  });
  const previewResult =
    chapter &&
    resolveChapterStart(chapter, { ...project.variables, ...preview });
  return (
    <main
      className="chapter-workspace"
      aria-label="Chapters advanced workspace"
    >
      <header>
        <div>
          <span className="eyebrow">CHAPTER → SCENE → DIALOGUE</span>
          <h1>Chapters advanced</h1>
          <p>
            Group scenes into chapters. Choose a default opening, then add
            ordered rules using the previous chapter’s saved choices and
            variables.
          </p>
        </div>
        <button onClick={() => onOriginal(sceneId)}>Back to editor</button>
      </header>
      {!chapters.length ? (
        <button
          onClick={() =>
            commit((p) => {
              ensureChapters(p);
            })
          }
        >
          Organise existing scenes into chapter one
        </button>
      ) : (
        <>
          <nav aria-label="Story chapters">
            {chapters.map((c, i) => (
              <button
                key={c.id}
                aria-pressed={chapter.id === c.id}
                onClick={() => {
                  setSelected(c.id);
                  setPreview({});
                }}
              >
                {i + 1}. {c.title}
                <small>{c.scenes.length} scenes</small>
              </button>
            ))}
            <button
              disabled={chapters.length >= 40 || project.scenes.length >= 100}
              onClick={() =>
                commit((p) => {
                  const c = addChapter(p);
                  setSelected(c.id);
                  onSelect(c.startScene);
                })
              }
            >
              Add chapter
            </button>
          </nav>
          <div className="chapter-columns">
            <section className="chapter-settings">
              <h2>Chapter {chapters.indexOf(chapter) + 1} settings</h2>
              <label>
                Chapter title
                <input
                  aria-label="Chapter title"
                  maxLength={120}
                  value={chapter.title}
                  onChange={(e) =>
                    update((c) => {
                      c.title = e.target.value || "Untitled chapter";
                    })
                  }
                />
              </label>
              <label>
                Author notes
                <textarea
                  aria-label="Chapter author notes"
                  maxLength={5000}
                  value={chapter.notes}
                  onChange={(e) =>
                    update((c) => {
                      c.notes = e.target.value;
                    })
                  }
                />
              </label>
              <label data-help="Used when no conditional opening matches. The player enters its first dialogue with their existing story variables intact.">
                Default starting scene
                <select
                  aria-label="Default chapter starting scene"
                  value={chapter.startScene}
                  onChange={(e) =>
                    update((c) => {
                      c.startScene = e.target.value;
                    })
                  }
                >
                  {sceneOptions}
                </select>
              </label>
              <label data-help="Choose the chapter entered when the player continues past a marked ending dialogue. Leave blank to end this draft here.">
                Next chapter
                <select
                  aria-label="Next chapter"
                  value={chapter.next || ""}
                  onChange={(e) =>
                    update((c) => {
                      c.next = e.target.value || undefined;
                    })
                  }
                >
                  <option value="">End here · no next chapter</option>
                  {chapters
                    .filter((c) => c.id !== chapter.id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                </select>
              </label>
              <h3>Ending dialogues</h3>
              <p>
                Check the endings that complete this chapter. Continuing from
                one enters the next chapter using the state at that moment.
                Unchecked endings stop the story. An ending with a later added
                connection follows that connection instead.
              </p>
              {chapter.scenes.flatMap((id) => {
                const s = project.scenes.find((s) => s.id === id)!;
                return s.nodes
                  .filter((n) => !n.next && !n.choices.length && !n.qte)
                  .map((n) => (
                    <label className="chapter-exit" key={s.id + ":" + n.id}>
                      <input
                        type="checkbox"
                        aria-label={"Complete chapter at " + s.id + ":" + n.id}
                        checked={chapter.exits.some(
                          (e) => e.scene === s.id && e.node === n.id,
                        )}
                        onChange={(e) =>
                          update((c) => {
                            c.exits = c.exits.filter(
                              (v) => v.scene !== s.id || v.node !== n.id,
                            );
                            if (e.target.checked)
                              c.exits.push({ scene: s.id, node: n.id });
                          })
                        }
                      />
                      {nodeLabel(s.id, n.id)}
                    </label>
                  ));
              })}
              <h3>Scenes in this chapter</h3>
              {chapter.scenes.map((id, i) => {
                const s = project.scenes.find((s) => s.id === id)!;
                return (
                  <div className="chapter-scene" key={id}>
                    <b>
                      {i + 1}. {s.title}
                    </b>
                    <small>{s.nodes.length} dialogues</small>
                    <button onClick={() => onOriginal(id)}>
                      Edit scene & dialogues
                    </button>
                    <label>
                      Move to chapter
                      <select
                        aria-label={"Chapter for " + id}
                        value={chapter.id}
                        onChange={(e) =>
                          commit((p) =>
                            assignChapterScene(p, id, e.target.value),
                          )
                        }
                      >
                        {chapters.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.title}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                );
              })}
              {project.scenes
                .filter((s) => !chapters.some((c) => c.scenes.includes(s.id)))
                .map((s) => (
                  <button
                    key={s.id}
                    onClick={() =>
                      commit((p) => assignChapterScene(p, s.id, chapter.id))
                    }
                  >
                    Add unassigned scene: {s.title}
                  </button>
                ))}
              <button
                disabled={project.scenes.length >= 100}
                onClick={() =>
                  commit((p) => {
                    const id = addChapterScene(p, chapter.id);
                    onSelect(id);
                  })
                }
              >
                Add opening or scene to this chapter
              </button>
            </section>
            <section className="chapter-starts">
              <h2>Conditional starting scenarios</h2>
              <p>
                Rules run from top to bottom once on chapter entry. The first
                match wins. No match uses the default scene. Conditions read
                saved story state, not guesses about the player.
              </p>
              {chapter.starts.map((rule, i) => (
                <section className="chapter-rule" key={rule.id}>
                  <h3>Priority {i + 1}</h3>
                  <label>
                    Scenario name
                    <input
                      aria-label={"Scenario name " + (i + 1)}
                      maxLength={120}
                      value={rule.label}
                      onChange={(e) =>
                        update((c) => {
                          c.starts[i].label =
                            e.target.value || "Opening scenario";
                        })
                      }
                    />
                  </label>
                  <label>
                    Start in scene
                    <select
                      aria-label={"Scenario starting scene " + (i + 1)}
                      value={rule.scene}
                      onChange={(e) =>
                        update((c) => {
                          c.starts[i].scene = e.target.value;
                        })
                      }
                    >
                      {sceneOptions}
                    </select>
                  </label>
                  <label>
                    Match conditions
                    <select
                      aria-label={"Match scenario " + (i + 1)}
                      value={rule.match}
                      onChange={(e) =>
                        update((c) => {
                          c.starts[i].match = e.target.value as "all" | "any";
                        })
                      }
                    >
                      <option value="all">All conditions</option>
                      <option value="any">Any condition</option>
                    </select>
                  </label>
                  {rule.conditions.map((condition, j) => (
                    <div className="chapter-condition" key={j}>
                      <label>
                        Variable
                        <select
                          aria-label={`Scenario ${i + 1} condition ${j + 1} variable`}
                          value={condition.key}
                          onChange={(e) =>
                            update((c) => {
                              c.starts[i].conditions[j] = {
                                key: e.target.value,
                                op: "eq",
                                value: project.variables[e.target.value],
                              };
                            })
                          }
                        >
                          {Object.keys(project.variables).map((key) => (
                            <option key={key}>{key}</option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Comparison
                        <select
                          aria-label={`Scenario ${i + 1} condition ${j + 1} comparison`}
                          value={condition.op}
                          onChange={(e) =>
                            update((c) => {
                              c.starts[i].conditions[j].op = e.target
                                .value as ChapterCondition["op"];
                            })
                          }
                        >
                          {[
                            ["eq", "equals"],
                            ["ne", "does not equal"],
                            ...(typeof condition.value === "number"
                              ? [
                                  ["gt", "greater than"],
                                  ["gte", "at least"],
                                  ["lt", "less than"],
                                  ["lte", "at most"],
                                ]
                              : []),
                          ].map(([id, title]) => (
                            <option key={id} value={id}>
                              {title}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Value
                        {typeof condition.value === "boolean" ? (
                          <select
                            aria-label={`Scenario ${i + 1} condition ${j + 1} value`}
                            value={String(condition.value)}
                            onChange={(e) =>
                              update((c) => {
                                c.starts[i].conditions[j].value =
                                  e.target.value === "true";
                              })
                            }
                          >
                            <option>true</option>
                            <option>false</option>
                          </select>
                        ) : (
                          <input
                            aria-label={`Scenario ${i + 1} condition ${j + 1} value`}
                            type={
                              typeof condition.value === "number"
                                ? "number"
                                : "text"
                            }
                            value={String(condition.value)}
                            onChange={(e) =>
                              update((c) => {
                                c.starts[i].conditions[j].value =
                                  typeof condition.value === "number"
                                    ? +e.target.value
                                    : e.target.value;
                              })
                            }
                          />
                        )}
                      </label>
                      <button
                        onClick={() =>
                          update((c) => {
                            c.starts[i].conditions.splice(j, 1);
                          })
                        }
                      >
                        Remove condition
                      </button>
                    </div>
                  ))}
                  {!rule.conditions.length && (
                    <p>
                      Add a condition to activate this rule. Empty rules never
                      override the default opening.
                    </p>
                  )}
                  <div className="chapter-rule-actions">
                    <button
                      disabled={!Object.keys(project.variables).length}
                      onClick={() =>
                        update((c) => {
                          const key = Object.keys(project.variables)[0];
                          c.starts[i].conditions.push({
                            key,
                            op: "eq",
                            value: project.variables[key],
                          });
                        })
                      }
                    >
                      Add condition
                    </button>
                    <button
                      disabled={i === 0}
                      onClick={() =>
                        update((c) => {
                          [c.starts[i - 1], c.starts[i]] = [
                            c.starts[i],
                            c.starts[i - 1],
                          ];
                        })
                      }
                    >
                      Higher priority
                    </button>
                    <button
                      disabled={i === chapter.starts.length - 1}
                      onClick={() =>
                        update((c) => {
                          [c.starts[i + 1], c.starts[i]] = [
                            c.starts[i],
                            c.starts[i + 1],
                          ];
                        })
                      }
                    >
                      Lower priority
                    </button>
                    <button
                      onClick={() =>
                        update((c) => {
                          c.starts.splice(i, 1);
                        })
                      }
                    >
                      Remove scenario
                    </button>
                  </div>
                </section>
              ))}
              <button
                disabled={chapter.starts.length >= 40}
                onClick={() =>
                  update((c) => {
                    c.starts.push({
                      id: crypto.randomUUID(),
                      label: "New opening scenario",
                      scene: c.startScene,
                      match: "all",
                      conditions: [],
                    });
                  })
                }
              >
                Add starting scenario
              </button>
              <details className="chapter-preview">
                <summary>Test a previous chapter’s state</summary>
                <p>
                  These values are a sandbox. They do not change the project’s
                  starting variables or the current playthrough.
                </p>
                {[
                  ...new Set(
                    chapter.starts.flatMap((r) =>
                      r.conditions.map((c) => c.key),
                    ),
                  ),
                ].map((key) => (
                  <label key={key}>
                    {key}
                    {typeof project.variables[key] === "boolean" ? (
                      <select
                        aria-label={"Preview " + key}
                        value={String(preview[key] ?? project.variables[key])}
                        onChange={(e) =>
                          setPreview((v) => ({
                            ...v,
                            [key]: e.target.value === "true",
                          }))
                        }
                      >
                        <option>true</option>
                        <option>false</option>
                      </select>
                    ) : (
                      <input
                        aria-label={"Preview " + key}
                        type={
                          typeof project.variables[key] === "number"
                            ? "number"
                            : "text"
                        }
                        value={String(preview[key] ?? project.variables[key])}
                        onChange={(e) =>
                          setPreview((v) => ({
                            ...v,
                            [key]:
                              typeof project.variables[key] === "number"
                                ? +e.target.value
                                : e.target.value,
                          }))
                        }
                      />
                    )}
                  </label>
                ))}
                <p role="status">
                  Selected opening:{" "}
                  {
                    project.scenes.find((s) => s.id === previewResult?.scene)
                      ?.title
                  }{" "}
                  · {previewResult?.rule}
                </p>
                <button onClick={() => setPreview({})}>
                  Reset test values
                </button>
              </details>
            </section>
          </div>
        </>
      )}
      {error && <p role="alert">{error}</p>}
    </main>
  );
}
