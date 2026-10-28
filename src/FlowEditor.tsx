import { useState } from "react";
import { validateProject, type Project, type Scene } from "./model";
import { removeDialogue } from "./authoring";
import { FlowCanvas } from "./FlowCanvas";
import {
  addFlowChoice,
  addConnectedDialogue,
  connectFlow,
  createFlowScene,
  flowGraph,
  removeFlowLink,
  storeFlowPositions,
  type LinkRef,
} from "./flow";
export function FlowEditor({
  project,
  mode,
  sceneId,
  nodeId,
  edit,
  onSelect,
  onDrill,
  onOriginal,
}: {
  project: Project;
  mode: "scenes" | "dialogues";
  sceneId: string;
  nodeId: string;
  edit: (f: (p: Project) => void) => void;
  onSelect: (scene: string, node?: string) => void;
  onDrill: (scene: string) => void;
  onOriginal: (scene: string, node?: string) => void;
}) {
  const scene =
      project.scenes.find((s) => s.id === sceneId) || project.scenes[0],
    node = scene.nodes.find((n) => n.id === nodeId) || scene.nodes[0];
  const [selectedLink, setSelectedLink] = useState<LinkRef | null>(null),
    [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [reply, setReply] = useState("New reply"),
    [route, setRoute] = useState(""),
    [target, setTarget] = useState("");
  const [incoming, setIncoming] = useState(""), [linkKind, setLinkKind] = useState<"continue" | "reply">("continue"), [outgoing, setOutgoing] = useState("");
  const graph = flowGraph(project, mode, scene.id),
    selected = mode === "scenes" ? "scene:" + scene.id : "node:" + node.id;
  const source = selectedLink
      ? project.scenes.find((s) => s.id === selectedLink.scene)
      : undefined,
    sourceNode = source?.nodes.find((n) => n.id === selectedLink?.node),
    choice = sourceNode?.choices.find((c) => c.id === selectedLink?.choice);
  const saved =
    mode === "scenes"
      ? project.flowLayout?.scenes
      : project.flowLayout?.dialogues[scene.id];
  const commit = (
    fn: (p: Project) => void,
    notice = "Saved to this project. Undo is available.",
  ) => {
    try {
      const next = structuredClone(project);
      fn(next);
      validateProject(next);
      edit((p) => Object.assign(p, next));
      setError("");
      setMessage(notice);
      return true;
    } catch (e) {
      setError(String(e));
      return false;
    }
  };
  const updateScene = (fn: (s: Scene) => void) =>
    commit((p) => fn(p.scenes.find((s) => s.id === scene.id)!));
  const targets = (
    <>
      <optgroup label="Dialogues in this scene">
        {scene.nodes.map((n, i) => (
          <option key={n.id} value={"node:" + n.id}>
            {i + 1}. {n.speaker}: {n.text.slice(0, 35)}
          </option>
        ))}
      </optgroup>
      <optgroup label="Scenes">
        {project.scenes.map((s, i) => (
          <option key={s.id} value={"scene:" + s.id}>
            Scene {i + 1} · {s.title}
          </option>
        ))}
      </optgroup>
    </>
  );
  const selectCard = (id: string) => {
    setSelectedLink(null);
    const card = graph.cards.find((c) => c.id === id);
    if (card && card.kind !== "destination") onSelect(card.scene, card.node);
    else if (card) onDrill(card.scene);
  };
  const openCard = (id: string) => {
    const card = graph.cards.find((c) => c.id === id);
    if (!card) return;
    if (card.kind === "dialogue") onOriginal(card.scene, card.node);
    else onDrill(card.scene);
  };
  const selectRoute = (ref: LinkRef) => {
    onSelect(ref.scene, ref.node);
    setSelectedLink(ref);
  };
  const editChoice = (fn: (c: NonNullable<typeof choice>) => void) => {
    if (selectedLink)
      commit((p) => {
        const c = p.scenes
          .find((s) => s.id === selectedLink.scene)!
          .nodes.find((n) => n.id === selectedLink.node)!
          .choices.find((c) => c.id === selectedLink.choice)!;
        fn(c);
      });
  };
  const quickAdd = (from?: string, kind: "continue" | "reply" = "continue", to?: string) => {
    let id = "";
    if (commit(p => { id = addConnectedDialogue(p, scene.id, from, kind, to); }, "Dialogue and its connections added. Edit the text here, or drag its input/output dots.")) {
      setSelectedLink(null);
      onSelect(scene.id, id);
    }
  };
  return (
    <section
      className="flow-workspace"
      aria-label={
        mode === "scenes"
          ? "Scenes advanced workspace"
          : "Dialogue advanced workspace"
      }
    >
      <div className="flow-heading">
        <div>
          <span className="eyebrow">ADVANCED STORY MAP</span>
          <h1>{mode === "scenes" ? "Scenes advanced" : "Dialogue advanced"}</h1>
        </div>
        <p>
          One story, two ways to edit. Connections below are the actual authored
          routes.
        </p>
        <button onClick={() => onOriginal(scene.id, node.id)}>
          Open original editor
        </button>
      </div>
      <div className="flow-toolbar">
        <label>
          Scene
          <select
            aria-label="Advanced map scene"
            value={scene.id}
            onChange={(e) => {
              onSelect(e.target.value);
              setSelectedLink(null);
            }}
          >
            {project.scenes.map((s, i) => (
              <option key={s.id} value={s.id}>
                Scene {i + 1} · {s.title}
              </option>
            ))}
          </select>
        </label>
        {mode === "scenes" ? (
          <>
            <button
              disabled={project.scenes.length >= 100}
              onClick={() => {
                const s = createFlowScene(scene);
                if (
                  commit((p) => {
                    p.scenes.push(s);
                  }, "New scene added. Connect its input to a route when ready.")
                )
                  onSelect(s.id, s.nodes[0].id);
              }}
            >
              Add scene box
            </button>
            <button onClick={() => onDrill(scene.id)}>
              Open selected scene’s dialogue map
            </button>
          </>
        ) : (
          <button
            onClick={() => {
              const id = crypto.randomUUID();
              if (
                commit((p) => {
                  p.scenes
                    .find((s) => s.id === scene.id)!
                    .nodes.push({
                      id,
                      speaker: "Narrator",
                      text: "A new line of dialogue.",
                      choices: [],
                    });
                }, "Dialogue added. Drag an output to its input to connect it.")
              )
                onSelect(scene.id, id);
            }}
          >
            Add dialogue box
          </button>
        )}
        <span className="small muted">
          Scene boxes open their dialogue map; double-click dialogue boxes for
          the original editor.
        </span>
      </div>
      <div className="flow-body">
        <FlowCanvas
          graph={graph}
          onAdd={mode === "dialogues" ? (from, kind) => quickAdd(from, kind) : undefined}
          saved={saved || {}}
          selected={selected}
          onSelect={selectCard}
          onOpen={openCard}
          onRoute={selectRoute}
          onMove={(id, point) =>
            commit(
              (p) => storeFlowPositions(p, mode, scene.id, { [id]: point }),
              "Box position saved; story links are unchanged.",
            )
          }
          onArrange={(positions) =>
            commit(
              (p) => storeFlowPositions(p, mode, scene.id, positions),
              "Map arranged. Story links are unchanged.",
            )
          }
          onConnect={(ref, id) =>
            commit(
              (p) => connectFlow(p, ref, id),
              "Story connection updated. Undo restores the previous destination.",
            )
          }
        />
        <aside
          className="flow-details ui-pane"
          aria-label="Flow selection details"
        >
          {mode === "dialogues" && <section className="property-section">
            <h3>Quick connected dialogue</h3>
            <label>Incoming dialogue<select aria-label="New dialogue incoming" value={incoming} onChange={e => setIncoming(e.target.value)}><option value="">Unconnected box</option>{scene.nodes.filter(n => !n.qte).map((n, i) => <option key={n.id} value={n.id}>{i + 1}. {n.speaker}: {n.text.slice(0, 35)}</option>)}</select></label>
            <button onClick={() => setIncoming(node.id)}>Use selected box as incoming</button>
            <label>Connection type<select aria-label="New dialogue connection type" value={linkKind} onChange={e => setLinkKind(e.target.value as typeof linkKind)}><option value="continue">Continue · no reply required</option><option value="reply">New reply route</option></select></label>
            <label>Outgoing dialogue<select aria-label="New dialogue outgoing" value={outgoing} onChange={e => setOutgoing(e.target.value)}><option value="">Keep previous Continue, or end here</option>{scene.nodes.map((n, i) => <option key={n.id} value={n.id}>{i + 1}. {n.speaker}: {n.text.slice(0, 35)}</option>)}</select></label>
            <button onClick={() => quickAdd(incoming || undefined, linkKind, outgoing || undefined)}>Add connected dialogue</button>
            <p>Use + Dialogue or + Reply directly on a box. Existing routes remain connected; drag the dots to change destinations.</p>
          </section>}
          {error && (
            <p className="flow-error" role="alert">
              {error}
              <button onClick={() => setError("")}>Dismiss</button>
            </p>
          )}
          {selectedLink &&
          sourceNode &&
          (selectedLink.kind !== "choice" || choice) ? (
            <section className="property-section">
              <h2>Route connection</h2>
              <p>
                {source?.title} · {sourceNode.speaker}:{" "}
                {sourceNode.text.slice(0, 100)}
              </p>
              {choice ? (
                <>
                  <label>
                    Route name
                    <input
                      aria-label="Route name"
                      placeholder="Friendly route / Hostile route…"
                      maxLength={120}
                      value={choice.routeLabel || ""}
                      onChange={(e) =>
                        editChoice((c) => {
                          c.routeLabel = e.target.value || undefined;
                        })
                      }
                    />
                  </label>
                  <label>
                    Reply shown to player
                    <input
                      aria-label="Route reply text"
                      value={choice.text}
                      onChange={(e) =>
                        editChoice((c) => {
                          c.text = e.target.value;
                        })
                      }
                    />
                  </label>
                  <label>
                    Destination
                    <select
                      aria-label="Route destination"
                      value={
                        (project.scenes.some((s) => s.id === choice.target)
                          ? "scene:"
                          : "node:") + choice.target
                      }
                      onChange={(e) =>
                        commit((p) =>
                          connectFlow(p, selectedLink, e.target.value),
                        )
                      }
                    >
                      {targets}
                    </select>
                  </label>
                  <p className="small muted">
                    Route names are author labels on the map. Reply text is what
                    the player sees.
                  </p>
                  <details>
                    <summary>State changes & condition</summary>
                    <p>
                      {choice.actions.length} actions ·{" "}
                      {choice.condition
                        ? `Only when ${choice.condition.key} = ${choice.condition.equals}`
                        : "Always available"}
                      . Reconnecting preserves both.
                    </p>
                    <button
                      onClick={() => onOriginal(source!.id, sourceNode.id)}
                    >
                      Edit state actions in original editor
                    </button>
                  </details>
                </>
              ) : (
                <p>
                  {selectedLink.kind === "next"
                    ? "Continue to the next dialogue. Drag its output to change where it goes."
                    : "A timed action needs a valid success and timeout dialogue. Reconnect the output to change this destination."}
                </p>
              )}
              {(selectedLink.kind === "choice" ||
                selectedLink.kind === "next") && (
                <button
                  className="danger"
                  onClick={() => {
                    if (
                      commit(
                        (p) => removeFlowLink(p, selectedLink),
                        "Connection removed. Undo restores it.",
                      )
                    )
                      setSelectedLink(null);
                  }}
                >
                  Remove this connection
                </button>
              )}
              <button onClick={() => setSelectedLink(null)}>
                Back to box details
              </button>
            </section>
          ) : (
            <>
              <section className="property-section">
                <h2>
                  {mode === "scenes" ? "Selected scene" : "Selected dialogue"}
                </h2>
                {mode === "scenes" ? (
                  <>
                    <label>
                      Scene name
                      <input
                        aria-label="Map scene name"
                        value={scene.title}
                        onChange={(e) =>
                          updateScene((s) => {
                            s.title = e.target.value;
                          })
                        }
                      />
                    </label>
                    <p>
                      {scene.nodes.length} dialogue boxes. First dialogue:{" "}
                      {scene.nodes[0].text.slice(0, 80)}
                    </p>
                    <button onClick={() => onDrill(scene.id)}>
                      Edit dialogue flow
                    </button>
                    <button onClick={() => onOriginal(scene.id)}>
                      Edit background & effects
                    </button>
                  </>
                ) : (
                  <>
                    <label>
                      Speaker
                      <input
                        aria-label="Map dialogue speaker"
                        list="flow-speakers"
                        value={node.speaker}
                        onChange={(e) =>
                          updateScene((s) => {
                            s.nodes.find((n) => n.id === node.id)!.speaker =
                              e.target.value;
                          })
                        }
                      />
                      <datalist id="flow-speakers">
                        {[
                          "Narrator",
                          "You",
                          ...project.characters.map((c) => c.name),
                        ].map((n) => (
                          <option key={n}>{n}</option>
                        ))}
                      </datalist>
                    </label>
                    <label>
                      Dialogue text
                      <textarea
                        aria-label="Map dialogue text"
                        value={node.text}
                        onChange={(e) =>
                          updateScene((s) => {
                            s.nodes.find((n) => n.id === node.id)!.text =
                              e.target.value;
                          })
                        }
                      />
                    </label>
                    <label>
                      Author note
                      <textarea
                        aria-label="Map author note"
                        value={node.notes || ""}
                        onChange={(e) =>
                          updateScene((s) => {
                            s.nodes.find((n) => n.id === node.id)!.notes =
                              e.target.value;
                          })
                        }
                      />
                    </label>
                    {!node.qte && !node.choices.length && (
                      <label>
                        Continue to
                        <select
                          aria-label="Map next dialogue"
                          value={node.next || ""}
                          onChange={(e) =>
                            updateScene((s) => {
                              s.nodes.find((n) => n.id === node.id)!.next =
                                e.target.value || undefined;
                            })
                          }
                        >
                          <option value="">End story here</option>
                          {scene.nodes.map((n, i) => (
                            <option key={n.id} value={n.id}>
                              {i + 1}. {n.speaker}: {n.text.slice(0, 35)}
                            </option>
                          ))}
                        </select>
                      </label>
                    )}
                    <button onClick={() => onOriginal(scene.id, node.id)}>
                      All dialogue settings in original editor
                    </button>
                    <button
                      className="danger"
                      disabled={scene.nodes.length <= 1}
                      onClick={() => {
                        let next = "";
                        if (
                          updateScene((s) => {
                            next = removeDialogue(s, node.id);
                            if (project.flowLayout?.dialogues[s.id]) {
                              /* stale layout positions are harmless and ignored */
                            }
                          })
                        )
                          onSelect(scene.id, next);
                      }}
                    >
                      Delete selected dialogue
                    </button>
                  </>
                )}
              </section>
              <section className="property-section">
                <h3>
                  {mode === "scenes"
                    ? "Add a scene branch"
                    : "Add a reply branch"}
                </h3>
                <label>
                  From dialogue
                  <select
                    aria-label="Branch source dialogue"
                    value={node.id}
                    onChange={(e) => onSelect(scene.id, e.target.value)}
                  >
                    {scene.nodes.map((n, i) => (
                      <option key={n.id} value={n.id}>
                        {i + 1}. {n.speaker}: {n.text.slice(0, 32)}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Reply text
                  <input
                    aria-label="New branch reply"
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                  />
                </label>
                <label>
                  Route label
                  <input
                    aria-label="New branch route label"
                    maxLength={120}
                    placeholder="Friendly route, Hostile route…"
                    value={route}
                    onChange={(e) => setRoute(e.target.value)}
                  />
                </label>
                <label>
                  Branch destination
                  <select
                    aria-label="New branch destination"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                  >
                    <option value="">Choose destination</option>
                    {mode === "scenes"
                      ? project.scenes.map((s, i) => (
                          <option key={s.id} value={"scene:" + s.id}>
                            Scene {i + 1} · {s.title}
                          </option>
                        ))
                      : targets}
                  </select>
                </label>
                <button
                  disabled={!target || !reply.trim() || !!node.qte}
                  onClick={() => {
                    commit(
                      (p) =>
                        addFlowChoice(
                          p,
                          scene.id,
                          node.id,
                          target.slice(target.indexOf(":") + 1),
                          reply,
                          route,
                        ),
                      "Branch added. Existing state and Continue paths are preserved.",
                    );
                  }}
                >
                  Add branch connection
                </button>
                {node.qte && (
                  <p>
                    A timed action uses its success/timeout outputs instead of
                    reply branches.
                  </p>
                )}
              </section>
              <section className="property-section">
                <h3>Connected routes</h3>
                {graph.edges
                  .filter((e) =>
                    mode === "scenes"
                      ? e.from === "scene:" + scene.id
                      : e.from === "node:" + node.id,
                  )
                  .map((e) => (
                    <button
                      className="flow-link-list"
                      key={e.id}
                      onClick={() => selectRoute(e.ref)}
                    >
                      {e.label} →{" "}
                      {graph.cards.find((c) => c.id === e.to)?.title}
                    </button>
                  ))}
                <p className="small muted">
                  Cards without incoming lines may be unreachable. No link is
                  added just by moving a card.
                </p>
              </section>
            </>
          )}
          {message && (
            <p className="flow-notice" role="status">
              {message}
            </p>
          )}
        </aside>
      </div>
    </section>
  );
}
