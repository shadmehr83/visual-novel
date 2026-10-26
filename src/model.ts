import { z } from "zod";
const action = z.object({
  key: z.string(),
  op: z.enum(["set", "add"]),
  value: z.union([z.string(), z.number(), z.boolean()]),
});
const choice = z.object({
  id: z.string(),
  text: z.string(),
  target: z.string(),
  actions: z.array(action).default([]),
  condition: z
    .object({
      key: z.string(),
      equals: z.union([z.string(), z.number(), z.boolean()]),
    })
    .optional(),
  note: z.string().default(""),
});
export const qteSchema = z.object({
  prompt: z.string().max(500),
  seconds: z.number().min(1).max(120),
  success: z.string(),
  timeout: z.string(),
});
const node = z.object({
  qte: qteSchema.optional(),
  allowCustomResponse: z.boolean().optional(),
  portrait: z.string().nullable().optional(),
  id: z.string(),
  speaker: z.string(),
  text: z.string(),
  next: z.string().optional(),
  choices: z.array(choice).default([]),
});
export const lightLoopSchema = z.object({
  enabled: z.boolean(),
  values: z.array(z.number().finite().min(0).max(2)).min(2).max(32),
  stepSeconds: z.number().finite().min(0.5).max(20),
});
const geometrySchema = z.object({
  points: z
    .array(
      z.object({
        x: z.number().min(0).max(1000),
        y: z.number().min(0).max(563),
      }),
    )
    .max(200),
  path: z
    .string()
    .max(200000)
    .regex(/^[MmLlHhVvZz0-9., +\-]*$/)
    .optional(),
});
export const regionSchema = z.object({
  boundary: geometrySchema.optional(),
  id: z.string(),
  name: z.string(),
  enabled: z.boolean(),
  points: z
    .array(
      z.object({
        x: z.number().min(0).max(1000),
        y: z.number().min(0).max(563),
      }),
    )
    .max(200),
  path: z
    .string()
    .max(200000)
    .regex(/^[MmLlHhVvZz0-9., +\-]*$/)
    .optional(),
});
export const zoneLightSchema = z.object({
  id: z.string(),
  name: z.string(),
  enabled: z.boolean(),
  kind: z.enum(["global", "local"]),
  shape: z.enum(["radial", "region"]).optional(),
  intensity: z.number().min(0).max(3),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  x: z.number().min(0).max(1000),
  y: z.number().min(0).max(563),
  radius: z.number().min(10).max(800),
  spread: z.number().min(0).max(1),
  cycle: lightLoopSchema,
  region: regionSchema.optional(),
});
export type Region = z.infer<typeof regionSchema>;
export type ZoneLight = z.infer<typeof zoneLightSchema>;
export const motionZoneSchema = z.object({
  id: z.string(),
  name: z.string(),
  enabled: z.boolean(),
  strength: z.number().min(0).max(20),
  seconds: z.number().min(0.5).max(12),
  direction: z.number().min(-180).max(180),
  distortion: z.number().min(0).max(15),
  region: regionSchema,
});
export type MotionZone = z.infer<typeof motionZoneSchema>;
export const effectsSchema = z.object({
  lightLoop: lightLoopSchema.optional(),
  rainZones: z.array(regionSchema).max(30).optional(),
  lights: z.array(zoneLightSchema).max(20).optional(),
  motionZones: z.array(motionZoneSchema).max(15).optional(),
  rain: z.boolean(),
  density: z.number().min(0).max(200),
  speed: z.number().min(0).max(3),
  angle: z.number().min(-50).max(50),
  length: z.number().min(2).max(45),
  opacity: z.number().min(0).max(1),
  color: z.string(),
  glass: z.boolean(),
  brightness: z.number().min(0.2).max(2),
  contrast: z.number().min(0.5).max(2),
  tint: z.string(),
  tintOpacity: z.number().min(0).max(0.7),
  light: z.number().min(0).max(1),
  lightX: z.number().min(0).max(100),
  lightY: z.number().min(0).max(100),
  mask: z
    .array(
      z.object({
        x: z.number().min(0).max(1000),
        y: z.number().min(0).max(563),
      }),
    )
    .max(100),
  invert: z.boolean(),
  vignette: z.boolean(),
});
export const defaultEffects = () =>
  effectsSchema.parse({
    rain: true,
    density: 70,
    speed: 1,
    angle: 12,
    length: 17,
    opacity: 0.3,
    color: "#b7d1dc",
    glass: false,
    brightness: 1,
    contrast: 1,
    tint: "#7c6689",
    tintOpacity: 0.08,
    light: 0.22,
    lightX: 68,
    lightY: 36,
    mask: [],
    invert: false,
    vignette: true,
  });
export const spriteSchema = z.object({
  id: z.string(),
  asset: z.string(),
  name: z.string(),
  x: z.number().min(0).max(1000),
  y: z.number().min(0).max(563),
  scale: z.number().min(0.1).max(3),
  opacity: z.number().min(0).max(1),
  flip: z.boolean(),
  expression: z.string(),
});
export const cameraSchema = z.object({
  enabled: z.boolean(),
  x: z.number().min(0).max(1000),
  y: z.number().min(0).max(563),
  zoom: z.number().min(1).max(3),
  duration: z.number().min(0.2).max(30),
  bob: z.number().min(0).max(15),
  shake: z.number().min(0).max(15),
  stepSeconds: z.number().min(0.2).max(2),
  footsteps: z.boolean(),
  footstepVolume: z.number().min(0).max(1),
  footstepAsset: z.string().optional(),
});
const scene = z.object({
  camera: cameraSchema.optional(),
  sprites: z.array(spriteSchema).max(30).optional(),
  keyframes: z
    .array(
      z.object({
        sprite: z.string(),
        time: z.number().min(0).max(120),
        x: z.number().min(0).max(1000),
        y: z.number().min(0).max(563),
        opacity: z.number().min(0).max(1),
      }),
    )
    .max(200)
    .optional(),
  audio: z
    .array(
      z.object({
        id: z.string(),
        volume: z.number().min(0).max(1),
        loop: z.boolean(),
      }),
    )
    .optional(),
  id: z.string(),
  title: z.string(),
  subtitle: z.string(),
  art: z.enum(["bedroom", "phone", "outfit", "cafe"]),
  background: z.string().nullable(),
  fit: z.enum(["cover", "contain", "stretch"]),
  x: z.number().min(-100).max(100),
  y: z.number().min(-100).max(100),
  scale: z.number().min(0.2).max(3),
  effects: effectsSchema,
  nodes: z.array(node).min(1),
  entry: z.array(action).default([]),
});
const asset = z.object({
  id: z.string(),
  name: z.string(),
  mime: z.enum(["image/png", "image/jpeg", "image/webp"]),
  width: z.number().positive(),
  height: z.number().positive(),
  data: z.string().regex(/^data:image\/(png|jpeg|webp);base64,/),
  tags: z.string(),
  notes: z.string(),
  approved: z.boolean(),
  reference: z.boolean(),
});
export const projectSchema = z.object({
  schemaVersion: z.literal(1),
  audioAssets: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        data: z
          .string()
          .regex(/^data:audio\/(mpeg|wav|ogg|mp4|x-wav|webm);base64,/),
      }),
    )
    .optional(),
  id: z.string(),
  title: z.string().min(1).max(150),
  scenes: z.array(scene).min(1).max(100),
  assets: z.array(asset).max(100),
  characters: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      notes: z.string(),
      portrait: z.string().nullable(),
      expressions: z.record(z.string()).optional(),
    }),
  ),
  variables: z.record(z.union([z.string(), z.number(), z.boolean()])),
  clues: z.array(
    z.object({
      id: z.string(),
      fact: z.string(),
      interpretations: z.array(z.string()),
      source: z.string(),
    }),
  ),
  settings: z.object({
    reducedEffects: z.boolean(),
    guides: z.boolean(),
    skipQte: z.boolean().optional(),
    timing: z.number().min(0.5).max(3).optional(),
  }),
  metadata: z.object({ created: z.string() }),
});
export type Project = z.infer<typeof projectSchema>;
export type Scene = Project["scenes"][number];
export type Node = Scene["nodes"][number];
export type Choice = Node["choices"][number];
export type Effects = Scene["effects"];
export type Runtime = {
  scene: string;
  node: string;
  values: Project["variables"];
  visited: string[];
  history: string[];
  choices: string[];
  ended: boolean;
  responses?: { scene: string; node: string; text: string }[];
  memories?: {
    scene: string;
    node: string;
    choice: string;
    knowledge: Project["variables"];
  }[];
};
export function validateProject(input: unknown): Project {
  const p = projectSchema.parse(input);
  const ids = new Set<string>();
  for (const s of p.scenes) {
    if (ids.has(s.id)) throw Error("Duplicate scene id: " + s.id);
    ids.add(s.id);
    const nodes = new Set(s.nodes.map((n) => n.id));
    if (nodes.size !== s.nodes.length)
      throw Error("Duplicate dialogue node in " + s.title);
    for (const frame of s.keyframes || [])
      if (!s.sprites?.some((x) => x.id === frame.sprite))
        throw Error("Missing keyframe sprite");
    for (const sprite of s.sprites || [])
      if (!p.assets.some((a) => a.id === sprite.asset))
        throw Error("Missing sprite asset");
    for (const track of s.audio || [])
      if (!p.audioAssets?.some((a) => a.id === track.id))
        throw Error("Missing audio asset");
    if (
      s.camera?.footstepAsset &&
      !p.audioAssets?.some((a) => a.id === s.camera!.footstepAsset)
    )
      throw Error("Missing footstep audio");
    for (const n of s.nodes) {
      if (n.portrait && !p.assets.some((a) => a.id === n.portrait))
        throw Error("Missing dialogue portrait");
      if (n.qte)
        for (const target of [n.qte.success, n.qte.timeout])
          if (!nodes.has(target) && !p.scenes.some((s) => s.id === target))
            throw Error("Missing QTE target");
      if (n.next && !nodes.has(n.next))
        throw Error("Missing next dialogue: " + n.next);
      for (const c of n.choices) {
        if (!nodes.has(c.target) && !p.scenes.some((x) => x.id === c.target))
          throw Error("Missing choice target: " + c.target);
        if (c.condition && !(c.condition.key in p.variables))
          throw Error("Unknown condition variable");
        for (const a of c.actions) checkAction(p, a);
      }
    }
    for (const a of s.entry) checkAction(p, a);
    if (s.background && !p.assets.some((a) => a.id === s.background))
      throw Error("Missing background in " + s.title);
  }
  return p;
}
function checkAction(p: Project, a: z.infer<typeof action>) {
  if (!(a.key in p.variables)) throw Error("Unknown state key: " + a.key);
  if (
    typeof p.variables[a.key] !== typeof a.value ||
    (a.op === "add" && typeof a.value !== "number")
  )
    throw Error("Invalid action type: " + a.key);
}
function actions(p: Project, r: Runtime, list: z.infer<typeof action>[]) {
  const values = { ...r.values };
  for (const a of list) {
    checkAction(p, a);
    values[a.key] =
      a.op === "add" ? Number(values[a.key]) + Number(a.value) : a.value;
  }
  return { ...r, values };
}
export function enter(p: Project, r: Runtime, id: string): Runtime {
  const s = p.scenes.find((s) => s.id === id);
  if (!s) throw Error("Scene not found");
  let n = { ...r, scene: id, node: s.nodes[0].id, ended: false };
  if (!r.visited.includes(id)) {
    n = actions(p, n, s.entry);
    n.visited = [...r.visited, id];
  }
  return { ...n, history: [...n.history, `Entered ${s.title}`].slice(-200) };
}
export function start(p: Project): Runtime {
  return enter(
    p,
    {
      scene: "",
      node: "",
      values: { ...p.variables },
      visited: [],
      history: [],
      choices: [],
      ended: false,
    },
    p.scenes[0].id,
  );
}
export function advance(p: Project, r: Runtime, choiceId?: string): Runtime {
  if (r.ended) return r;
  const s = p.scenes.find((s) => s.id === r.scene)!;
  const n = s.nodes.find((n) => n.id === r.node);
  if (!n) throw Error("Dialogue not found");
  if (choiceId) {
    const c = n.choices.find((c) => c.id === choiceId);
    if (!c || (c.condition && r.values[c.condition.key] !== c.condition.equals))
      throw Error("Choice unavailable");
    let next = actions(p, r, c.actions);
    next = {
      ...next,
      memories: [
        ...(r.memories || []),
        {
          scene: r.scene,
          node: r.node,
          choice: c.text,
          knowledge: { ...r.values },
        },
      ],
      choices: [...next.choices, c.id],
      history: [...next.history, `Choice: ${c.text}`].slice(-200),
    };
    return p.scenes.some((s) => s.id === c.target)
      ? enter(p, next, c.target)
      : { ...next, node: c.target };
  }
  if (n.choices.length) throw Error("Choose a reply first");
  return n.next
    ? { ...r, node: n.next }
    : { ...r, ended: true, history: [...r.history, "Demo complete"] };
}

export function resolveQte(
  p: Project,
  r: Runtime,
  outcome: "success" | "timeout",
): Runtime {
  const n = p.scenes
    .find((s) => s.id === r.scene)
    ?.nodes.find((n) => n.id === r.node);
  if (!n?.qte || r.ended) throw Error("No active QTE");
  const target = n.qte[outcome];
  const next = {
    ...r,
    history: [...r.history, `QTE ${outcome}: ${n.qte.prompt}`],
  };
  return p.scenes.some((s) => s.id === target)
    ? enter(p, next, target)
    : { ...next, node: target };
}

export function respond(p: Project, r: Runtime, text: string): Runtime {
  const node = p.scenes
    .find((s) => s.id === r.scene)
    ?.nodes.find((n) => n.id === r.node);
  if (
    !node ||
    node.choices.length ||
    node.qte ||
    node.allowCustomResponse === false ||
    r.ended
  )
    throw Error("Custom reply unavailable here");
  const reply = text.trim();
  if (!reply || reply.length > 1000)
    throw Error("Enter a reply of 1–1000 characters");
  const next = advance(p, r);
  return {
    ...next,
    responses: [
      ...(r.responses || []),
      { scene: r.scene, node: r.node, text: reply },
    ],
    history: [...next.history, `Custom reply: ${reply}`].slice(-200),
  };
}
