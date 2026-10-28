import type { Project, Scene, Node, Choice } from "./model";
export type Point = { x: number; y: number };
export type LinkRef = {
  scene: string;
  node: string;
  kind: "next" | "choice" | "success" | "timeout" | "new-route";
  choice?: string;
};
export type FlowPort = {
  id: string;
  label: string;
  ref: LinkRef;
  target?: string;
  detail?: string;
};
export type FlowCard = {
  id: string;
  title: string;
  text: string;
  scene: string;
  node?: string;
  kind: "scene" | "dialogue" | "destination";
  ports: FlowPort[];
  entry?: boolean;
};
export type FlowGraph = {
  cards: FlowCard[];
  edges: {
    id: string;
    from: string;
    to: string;
    port: number;
    label: string;
    ref: LinkRef;
    detail?: string;
  }[];
};
export const CARD_WIDTH = 270;
export const portY = (index: number) => 112 + index * 34;
export const cardHeight = (card: FlowCard) =>
  Math.max(146, 112 + card.ports.length * 34 + (card.kind === "dialogue" ? 44 : 12));
export function addConnectedDialogue(p: Project, sceneId: string, from: string | undefined, kind: "continue" | "reply", outgoing?: string) {
  const s = p.scenes.find(s => s.id === sceneId)!;
  const source = s.nodes.find(n => n.id === from);
  if (source?.qte) throw Error("Connect a timed action outcome first, then add a dialogue there.");
  const id = crypto.randomUUID();
  const n: Node = { id, speaker: "Narrator", text: "A new line of dialogue.", choices: [], next: outgoing || (kind === "continue" ? source?.next : undefined) };
  s.nodes.push(n);
  if (source) {
    if (kind === "continue" && !source.choices.length) source.next = id;
    else addFlowChoice(p, s.id, source.id, id, "New reply", "");
  }
  const positions = p.flowLayout?.dialogues[s.id];
  const old = positions?.["node:" + from];
  if (old) storeFlowPositions(p, "dialogues", s.id, { ["node:" + id]: { x: old.x + 410, y: old.y + source!.choices.length * 65 } });
  return id;
}
const label = (c: Choice) => c.routeLabel?.trim() || c.text;
export function flowGraph(
  p: Project,
  mode: "scenes" | "dialogues",
  sceneId: string,
): FlowGraph {
  const current = p.scenes.find((s) => s.id === sceneId) || p.scenes[0];
  const cards: FlowCard[] =
    mode === "scenes"
      ? p.scenes.map((s, i) => {
          const ports: FlowPort[] = s.nodes.flatMap((n) =>
            n.choices
              .filter((c) => p.scenes.some((s) => s.id === c.target))
              .map((c) => ({
                id: c.id,
                label: label(c),
                detail: `${n.speaker}: ${n.text}\nReply: ${c.text}${c.condition ? " · Conditional" : ""}`,
                ref: {
                  scene: s.id,
                  node: n.id,
                  kind: "choice" as const,
                  choice: c.id,
                },
                target: "scene:" + c.target,
              })),
          );
          const terminal =
            [...s.nodes]
              .reverse()
              .find((n) => !n.next && !n.choices.length && !n.qte) ||
            [...s.nodes].reverse().find((n) => !n.qte) ||
            s.nodes[0];
          ports.push({
            id: "new-route",
            label: "+ New scene route",
            ref: { scene: s.id, node: terminal.id, kind: "new-route" },
          });
          return {
            id: "scene:" + s.id,
            title: `Scene ${i + 1} · ${s.title}`,
            text: `${s.nodes.length} dialogues · ${ports.length - 1} exits`,
            scene: s.id,
            kind: "scene",
            ports,
            entry: i === 0,
          };
        })
      : current.nodes.map((n, i) => {
          const ref = { scene: current.id, node: n.id };
          const ports: FlowPort[] = n.qte
            ? (["success", "timeout"] as const).map((kind) => ({
                id: kind,
                label:
                  kind === "success"
                    ? "Timed action · success"
                    : "Timed action · timeout",
                ref: { ...ref, kind },
                target: "node:" + n.qte![kind],
              }))
            : n.choices.length
              ? n.choices.map((c) => ({
                  id: c.id,
                  label: label(c),
                  detail: `Reply: ${c.text}${c.condition ? " · Conditional" : ""}`,
                  ref: { ...ref, kind: "choice" as const, choice: c.id },
                  target:
                    (p.scenes.some((s) => s.id === c.target)
                      ? "scene:"
                      : "node:") + c.target,
                }))
              : [
                  {
                    id: "next",
                    label: n.next ? "Continue" : "End · drag to connect",
                    ref: { ...ref, kind: "next" },
                    target: n.next ? "node:" + n.next : undefined,
                  },
                ];
          return {
            id: "node:" + n.id,
            title: `${i + 1}. ${n.speaker}`,
            text: n.text,
            scene: current.id,
            node: n.id,
            kind: "dialogue",
            ports,
            entry: i === 0,
          };
        });
  if (mode === "dialogues")
    for (const s of p.scenes)
      cards.push({
        id: "scene:" + s.id,
        title: `Go to Scene ${p.scenes.indexOf(s) + 1}`,
        text: s.title,
        scene: s.id,
        kind: "destination",
        ports: [],
      });
  const edges = cards.flatMap((c) =>
    c.ports.flatMap((port, index) =>
      port.target
        ? [
            {
              id: c.id + ":" + port.id,
              from: c.id,
              to: port.target,
              port: index,
              label: port.label,
              ref: port.ref,
              detail: port.detail,
            },
          ]
        : [],
    ),
  );
  return { cards, edges };
}
export function autoFlowPositions(graph: FlowGraph): Record<string, Point> {
  const depths = new Map<string, number>();
  const root = graph.cards.find((c) => c.entry) || graph.cards[0];
  if (root) {
    depths.set(root.id, 0);
    const queue = [root.id];
    for (let at = 0; at < queue.length; at++)
      for (const e of graph.edges.filter((e) => e.from === queue[at]))
        if (!depths.has(e.to)) {
          depths.set(e.to, depths.get(e.from)! + 1);
          queue.push(e.to);
        }
  }
  const columns = new Map<number, number>();
  const positions: Record<string, Point> = {};
  const max = Math.max(0, ...depths.values());
  for (const c of graph.cards) {
    const col = depths.get(c.id) ?? (c.kind === "destination" ? max + 1 : 0);
    const y = columns.get(col) || 40;
    positions[c.id] = { x: 40 + col * 410, y };
    columns.set(col, y + cardHeight(c) + 100);
  }
  return positions;
}
export function connectFlow(p: Project, ref: LinkRef, targetId: string) {
  const s = p.scenes.find((s) => s.id === ref.scene);
  const n = s?.nodes.find((n) => n.id === ref.node);
  if (!s || !n) throw Error("The source dialogue no longer exists.");
  const isScene = targetId.startsWith("scene:"),
    target = targetId.slice(targetId.indexOf(":") + 1);
  if (
    isScene
      ? !p.scenes.some((s) => s.id === target)
      : !s.nodes.some((n) => n.id === target)
  )
    throw Error("Choose a scene or a dialogue in the current scene.");
  if (ref.kind === "choice") {
    const c = n.choices.find((c) => c.id === ref.choice);
    if (!c) throw Error("The reply no longer exists.");
    c.target = target;
    return;
  }
  if (ref.kind === "success" || ref.kind === "timeout") {
    if (isScene)
      throw Error(
        "A timed action connects to a dialogue in its own scene. Add a scene choice on that dialogue to leave the scene.",
      );
    if (!n.qte) throw Error("The timed action no longer exists.");
    n.qte[ref.kind] = target;
    return;
  }
  if (n.qte)
    throw Error("Choose a dialogue without a timed action for this route.");
  if (ref.kind === "new-route") {
    addFlowChoice(p, s.id, n.id, target, "Continue", "");
    return;
  }
  if (n.choices.length)
    throw Error(
      "Connect a specific reply rather than Continue on a choice dialogue.",
    );
  if (isScene) {
    delete n.next;
    n.choices.push({
      id: crypto.randomUUID(),
      text: "Continue",
      target,
      actions: [],
      note: "",
    });
  } else n.next = target;
}
export function addFlowChoice(
  p: Project,
  sceneId: string,
  nodeId: string,
  target: string,
  text: string,
  routeLabel: string,
) {
  const s = p.scenes.find((s) => s.id === sceneId)!,
    n = s.nodes.find((n) => n.id === nodeId)!;
  if (n.qte)
    throw Error(
      "Timed actions have success and timeout paths. Add a reply on another dialogue.",
    );
  if (
    !s.nodes.some((n) => n.id === target) &&
    !p.scenes.some((s) => s.id === target)
  )
    throw Error("Choose an existing destination.");
  // Preserve an authored Continue path when adding its first alternative.
  if (n.next && !n.choices.length)
    n.choices.push({
      id: crypto.randomUUID(),
      text: "Continue",
      target: n.next,
      actions: [],
      note: "",
    });
  delete n.next;
  const choice: Choice = {
    id: crypto.randomUUID(),
    text: text.trim() || "New reply",
    routeLabel: routeLabel.trim().slice(0, 120) || undefined,
    target,
    actions: [],
    note: "",
  };
  n.choices.push(choice);
  return choice.id;
}
export function removeFlowLink(p: Project, ref: LinkRef) {
  const s = p.scenes.find((s) => s.id === ref.scene)!,
    n = s.nodes.find((n) => n.id === ref.node)!;
  if (ref.kind === "choice") {
    n.choices = n.choices.filter((c) => c.id !== ref.choice);
    if (s.items)
      s.items.options = s.items.options.filter((i) => i.choice !== ref.choice);
  } else if (ref.kind === "next") delete n.next;
  else
    throw Error(
      "Timed actions need both destinations. Reconnect this path instead.",
    );
}
export function createFlowScene(template: Scene): Scene {
  const s = structuredClone(template);
  s.id = crypto.randomUUID();
  s.title = "Untitled scene";
  s.subtitle = "A new moment";
  s.nodes = [
    {
      id: crypto.randomUUID(),
      speaker: "Narrator",
      text: "A new moment.",
      choices: [],
    },
  ];
  s.entry = [];
  delete s.phone;
  delete s.items;
  s.joints = [];
  return s;
}
export function storeFlowPositions(
  p: Project,
  mode: "scenes" | "dialogues",
  sceneId: string,
  positions: Record<string, Point>,
) {
  const layout = (p.flowLayout ??= { scenes: {}, dialogues: {} });
  if (mode === "scenes") layout.scenes = { ...layout.scenes, ...positions };
  else
    layout.dialogues[sceneId] = { ...layout.dialogues[sceneId], ...positions };
}
