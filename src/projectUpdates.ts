import { cloneData as structuredClone } from "./cloneData";
import {
  validateProject,
  type Project,
  type Runtime,
  type Scene,
} from "./model";
export type ProjectUpdate = {
  project: Project;
  changed: boolean;
  moved: string[];
};
const departureAnchor = (s: Scene) =>
  ["goodbye", "contact", "after-message"].every((id) =>
    s.nodes.some((n) => n.id === id),
  );
/** Add the authored departure without replacing the user's project or its artwork. */
export function integrateDeparture(
  local: Project,
  published: Project,
  force = false,
): ProjectUpdate {
  const cafe = local.scenes.find((s) => s.id === "cafe"),
    source = published.scenes.find((s) => s.id === "departure");
  if (
    !cafe ||
    !source ||
    local.scenes.some((s) => s.id === "departure") ||
    local.scenes.length >= 100
  )
    return { project: local, changed: false, moved: [] };
  const familiar =
    departureAnchor(cafe) ||
    cafe.nodes.some((n) =>
      ["reflect-neutral", "reflect-warm", "reflect-guarded"].includes(n.id),
    );
  const compatible =
    (local.id === published.id && familiar) ||
    (departureAnchor(cafe) &&
      cafe.background ===
        published.scenes.find((s) => s.id === "cafe")?.background);
  if (!force && !compatible)
    return { project: local, changed: false, moved: [] };
  const p = structuredClone(local),
    target = p.scenes.find((s) => s.id === "cafe")!,
    departure = structuredClone(source),
    sourceCafe = published.scenes.find((s) => s.id === "cafe")!;
  const knownDeparture = new Set(
    source.nodes.map((n) => n.id).filter((id) => id !== "leaving-cafe"),
  );
  const originalCafeIds = new Set(sourceCafe.nodes.map((n) => n.id));
  let safeToMove = departureAnchor(target);
  const moved = new Set<string>();
  if (safeToMove) {
    const queue = [...knownDeparture].filter((id) =>
      target.nodes.some((n) => n.id === id),
    );
    for (let i = 0; i < queue.length; i++) {
      const id = queue[i];
      if (moved.has(id)) continue;
      moved.add(id);
      const n = target.nodes.find((n) => n.id === id)!;
      const refs = [
        n.next,
        ...n.choices.map((c) => c.target),
        n.qte?.success,
        n.qte?.timeout,
      ].filter((v): v is string => !!v);
      for (const ref of refs)
        if (target.nodes.some((n) => n.id === ref) && !moved.has(ref)) {
          if (originalCafeIds.has(ref)) {
            safeToMove = false;
            break;
          }
          queue.push(ref);
        }
      if (!safeToMove) break;
    }
    for (const n of target.nodes.filter((n) => !moved.has(n.id))) {
      for (const ref of [
        n.next,
        ...n.choices.map((c) => c.target),
        n.qte?.success,
        n.qte?.timeout,
      ])
        if (ref && moved.has(ref) && (ref !== "goodbye" || !!n.qte))
          safeToMove = false;
    }
  }
  if (safeToMove) {
    const edits = new Map(
      target.nodes
        .filter((n) => moved.has(n.id))
        .map((n) => [n.id, structuredClone(n)]),
    );
    departure.nodes = departure.nodes.map((n) => edits.get(n.id) || n);
    departure.nodes.push(
      ...[...edits.values()].filter(
        (n) => !departure.nodes.some((d) => d.id === n.id),
      ),
    );
    const again = departure.nodes.find((n) => n.id === "again");
    if (
      again?.text ===
      "At the door, there is still a little time to say what I mean."
    )
      again.text = source.nodes.find((n) => n.id === "again")!.text;
    const message = departure.nodes.find((n) => n.id === "after-message");
    if (message) {
      if (message.speaker === "Maria · message")
        message.speaker = departure.phone!.contact;
      const ids = new Set<string>();
      message.choices.forEach((c, i) => {
        if (ids.has(c.id)) c.id += "-departure-" + i;
        ids.add(c.id);
        if (c.text === "Leave the message unanswered for now.")
          c.sendAsMessage = false;
      });
    }
    for (const c of departure.nodes.find((n) => n.id === "contact")?.choices ||
      [])
      c.sendAsMessage = false;
    const end = departure.nodes.find((n) => n.id === "end");
    if (end) end.deviceScreen = "off";
    target.nodes = target.nodes.filter((n) => !moved.has(n.id));
    for (const n of target.nodes) {
      if (n.next === "goodbye") {
        delete n.next;
        n.choices.push({
          id: "leave-cafe-" + n.id,
          text: "Step outside",
          target: departure.id,
          actions: [],
          note: "Continue into the rainy departure scene.",
          routeLabel: "Leave the café",
          sendAsMessage: false,
        });
      }
      for (const c of n.choices)
        if (c.target === "goodbye") c.target = departure.id;
    }
  } else {
    // Custom loops or destinations stay intact. Add an optional exit, never discard those paths.
    for (const id of ["reflect-neutral", "reflect-warm", "reflect-guarded"]) {
      const n = target.nodes.find((n) => n.id === id);
      if (!n) continue;
      if (n.next) {
        n.choices.push({
          id: "keep-local-" + id,
          text: "Continue current route",
          target: n.next,
          actions: [],
          note: "Preserved local route",
        });
        delete n.next;
      }
      if (!n.choices.some((c) => c.target === departure.id))
        n.choices.push({
          id: "leave-cafe-" + id,
          text: "Step outside",
          target: departure.id,
          actions: [],
          note: "Continue into the rainy departure scene.",
          routeLabel: "Leave the café",
          sendAsMessage: false,
        });
    }
    moved.clear();
  }
  if (
    !target.nodes.some((n) => n.choices.some((c) => c.target === departure.id))
  ) {
    const end = [...target.nodes]
      .reverse()
      .find((n) => !n.next && !n.choices.length && !n.qte);
    if (end)
      end.choices.push({
        id: "leave-cafe-" + end.id,
        text: "Step outside",
        target: departure.id,
        actions: [],
        note: "Continue into the rainy departure scene.",
        sendAsMessage: false,
      });
  }
  for (const n of departure.nodes)
    for (const c of n.choices)
      for (const key of [
        ...c.actions.map((a) => a.key),
        ...(c.condition ? [c.condition.key] : []),
      ])
        if (!(key in p.variables) && key in published.variables)
          p.variables[key] = published.variables[key];
  const phone = departure.phone,
    required = new Set<string>(
      [
        departure.background,
        phone?.avatar,
        phone?.appearance?.wallpaper,
        ...Object.values(phone?.appearance?.icons || {}),
        ...(phone?.appearance?.apps || []).map((a) => a.icon),
      ].filter((v): v is string => !!v),
    );
  for (const id of required) {
    if (p.assets.some((a) => a.id === id)) continue;
    const a = published.assets.find((a) => a.id === id);
    if (a) p.assets.push(structuredClone(a));
  }
  const audio = new Set([
    ...(departure.audio || []).map(t => t.id),
    departure.camera?.footstepAsset,
    departure.phone?.notificationSound?.asset,
    ...departure.nodes.flatMap(n => [n.sound?.asset, ...n.choices.map(c => c.sound?.asset)]),
  ].filter((id): id is string => !!id));
  for (const id of audio) {
    const asset = published.audioAssets?.find(a => a.id === id);
    if (asset && !p.audioAssets?.some(a => a.id === id)) (p.audioAssets ??= []).push(structuredClone(asset));
  }
  if (
    phone?.schedule &&
    !departure.nodes.some((n) => n.id === phone.schedule!.end)
  )
    phone.schedule.end = departure.nodes.at(-1)!.id;
  p.scenes.splice(p.scenes.indexOf(target) + 1, 0, departure);
  return { project: validateProject(p), changed: true, moved: [...moved] };
}
export function updateDepartureRuntime(
  runtime: Runtime | null,
  update: ProjectUpdate,
): Runtime | null {
  if (!runtime || !update.changed) return runtime;
  const moved = new Set(update.moved),
    row = <T extends { scene: string; node: string }>(v: T): T =>
      v.scene === "cafe" && moved.has(v.node)
        ? { ...v, scene: "departure" }
        : v;
  const r = {
    ...runtime,
    values: { ...update.project.variables, ...runtime.values },
    ...row({ scene: runtime.scene, node: runtime.node }),
    nodeVisits: runtime.nodeVisits?.map(row),
    responses: runtime.responses?.map(row),
    phoneMessages: runtime.phoneMessages?.map(row),
    memories: runtime.memories?.map(row),
  };
  if (r.scene === "departure") {
    const first = update.project.scenes.find((s) => s.id === "departure")!
      .nodes[0].id;
    if (
      !r.nodeVisits?.some((v) => v.scene === "departure" && v.node === first)
    ) {
      const visits = [...(r.nodeVisits || [])],
        at = visits.findIndex((v) => v.scene === "departure");
      visits.splice(at < 0 ? visits.length : at, 0, {
        scene: "departure",
        node: first,
      });
      r.nodeVisits = visits;
    }

    if (!r.visited.includes("departure"))
      r.visited = [...r.visited, "departure"];
    const s = update.project.scenes.find((s) => s.id === "departure")!,
      n = s.nodes.find((n) => n.id === r.node);
    if (
      n &&
      [s.phone?.contact, "You"].includes(n.speaker) &&
      !r.phoneMessages?.some((m) => m.scene === s.id && m.node === n.id)
    )
      r.phoneMessages = [
        ...(r.phoneMessages || []),
        { scene: s.id, node: n.id, sender: n.speaker, text: n.text },
      ];
  }
  return r;
}
