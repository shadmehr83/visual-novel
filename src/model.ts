import { deviceScreen, deviceDialogue, allowsReply } from "./interactions";
import { instaFeedSchema } from "./feedSchema";
import { chapterSchema } from "./chapterSchema";
import { chapterForScene, resolveChapterStart } from "./chapterRuntime";
import { canPutAway, returnDestination } from "./deviceReturn";
import { z } from "zod";
export const soundCueSchema = z.object({
  asset: z.string(),
  volume: z.number().min(0).max(1).default(0.5),
});
const action = z.object({
  key: z.string(),
  op: z.enum(["set", "add"]),
  value: z.union([z.string(), z.number(), z.boolean()]),
});
const choice = z.object({
  sound: soundCueSchema.optional(),
  routeLabel: z.string().max(120).optional(),
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
  sendAsMessage: z.boolean().optional(),
});
export const qteSchema = z.object({
  prompt: z.string().max(500),
  seconds: z.number().min(1).max(120),
  success: z.string(),
  timeout: z.string(),
});
export const transitionSchema = z.object({
  style: z.enum(["cut", "snappy", "smooth", "slide", "fade"]),
  seconds: z.number().min(0.05).max(10),
});
export const poseSchema = z.object({
  node: z.string(),
  x: z.number().min(-1000).max(1000),
  y: z.number().min(-563).max(563),
  angle: z.number().min(-180).max(180),
  scaleX: z.number().min(0.05).max(4),
  scaleY: z.number().min(0.05).max(4),
  opacity: z.number().min(0).max(1),
  asset: z.string().optional(),
});
const node = z.object({
  deviceReturn: z.boolean().optional(),
  deviceDialogue: z.boolean().optional(),
  deviceVisible: z.boolean().optional(),
  deviceKind: z.enum(["phone", "desktop"]).optional(),
  autoAdvance: z.number().min(0.5).max(30).optional(),
  view: z.string().optional(),
  sound: soundCueSchema.optional(),
  deviceScreen: z.enum(["off", "home", "feed", "chat"]).optional(),
  phoneNotice: z.string().max(300).optional(),
  notes: z.string().max(10000).optional(),
  qte: qteSchema.optional(),
  allowCustomResponse: z.boolean().optional(),
  allowPhoneCustomResponse: z.boolean().optional(),
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
  mode: z.enum(["sway", "puddle"]).optional(),
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
export const jointSchema = z.object({
  loop: z.object({ enabled: z.boolean(), kind: z.enum(["sway", "gaze", "blink"]), seconds: z.number().min(0.5).max(30), amount: z.number().min(0).max(20), eyelidColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional() }).optional(),
  cleanPlate: z.string().optional(),
  range: z
    .object({
      start: z.string(),
      end: z.string(),
      after: z.enum(["hide", "hold"]),
    })
    .optional(),
  id: z.string(),
  name: z.string(),
  enabled: z.boolean(),
  region: regionSchema,
  pivotX: z.number().min(0).max(1000),
  pivotY: z.number().min(0).max(563),
  transition: transitionSchema,
  poses: z.array(poseSchema).max(200),
  coverColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
  source: z.string().optional(),
});
export type Joint = z.infer<typeof jointSchema>;
export type Pose = z.infer<typeof poseSchema>;
export const deviceAppearanceSchema = z.object({
  profiles: z.record(z.string()).default({}),
  background: z
    .string()
    .regex(/^#[a-fA-F0-9]{6}$/)
    .default("#211e29"),
  wallpaper: z.string().nullable().default(null),
  textColor: z
    .string()
    .regex(/^#[a-fA-F0-9]{6}$/)
    .default("#eee1e9"),
  fontSize: z.number().min(10).max(22).default(14),
  font: z
    .enum(["Arial", "Verdana", "Trebuchet MS", "Georgia", "monospace"])
    .default("Arial"),
  icons: z.record(z.string()).default({}),
  apps: z
    .array(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(40),
        icon: z.string().nullable(),
        screen: z.enum(["home", "feed", "chat", "settings"]),
      }),
    )
    .max(12)
    .default([]),
});
export const deviceSchema = z.object({
  independentAppearance: z.boolean().optional(),
  returnControl: z.object({ enabled: z.boolean(), start: z.string(), end: z.string(), target: z.string().optional() }).optional(),
  dialogueRange: z.object({enabled: z.boolean(), start: z.string(), end: z.string()}).optional(),
  notificationSound: soundCueSchema.optional(),
  frameWidth: z.number().min(5).max(95).optional(),
  frameHeight: z.number().min(20).max(98).optional(),
  anchor: z.enum(["center", "top-left"]).optional(),
  lockAspect: z.boolean().optional(),
  frameRatio: z.number().positive().max(10).optional(),
  schedule: z
    .object({
      start: z.string(),
      end: z.string(),
      screen: z.enum(["home", "feed", "chat"]),
      advanced: z.boolean().default(false),
    })
    .optional(),
  appearance: deviceAppearanceSchema.optional(),
  mode: z.enum(["chat-only", "phone-system"]).optional(),
  defaultScreen: z.enum(["home", "feed", "chat"]).optional(),
  enabled: z.boolean(),
  device: z.enum(["phone", "desktop"]),
  contact: z.string().max(100),
  title: z.string().max(100),
  avatar: z.string().nullable(),
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  width: z.number().min(20).max(90),
  entrance: transitionSchema,
  typingSeconds: z.number().min(0).max(5),
  keyboard: z.boolean(),
});
const scene = z.object({
  subscenes: z.array(z.object({
    id: z.string(),
    title: z.string().min(1).max(100),
    background: z.string().nullable(),
    transition: transitionSchema,
    effects: effectsSchema.optional(),
    audio: z.array(z.object({ id: z.string(), volume: z.number().min(0).max(1), loop: z.boolean() })).optional(),
  })).max(40).optional(),
  effectBackup: z.record(z.number()).optional(),
  keyframesEnabled: z.boolean().optional(),
  items: z
    .object({
      enabled: z.boolean(),
      title: z.string(),
      blur: z.number().min(0).max(15),
      showSelected: z.boolean().optional(),
      inspectSound: soundCueSchema.optional(),
      chooseSound: soundCueSchema.optional(),
      options: z
        .array(
          z.object({
            id: z.string(),
            label: z.string(),
            description: z.string(),
            asset: z.string().nullable(),
            choice: z.string(),
          }),
        )
        .max(40),
    })
    .optional(),
  joints: z.array(jointSchema).max(20).optional(),
  transition: transitionSchema.optional(),
  exitTransition: transitionSchema.optional(),
  phone: deviceSchema.optional(),
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
  poster: z.string().optional(),
  folder: z.string().min(1).max(80).optional(),
  id: z.string(),
  name: z.string(),
  mime: z.enum(["image/png", "image/jpeg", "image/webp", "image/gif"]),
  width: z.number().positive(),
  height: z.number().positive(),
  data: z.string().regex(/^data:image\/(png|jpeg|webp|gif);base64,/),
  tags: z.string(),
  notes: z.string(),
  approved: z.boolean(),
  reference: z.boolean(),
});
export const projectSchema = z.object({
  chapters: z.array(chapterSchema).min(1).max(40).optional(),
  instaFeed: instaFeedSchema.optional(),
  deviceDefaults: z.object({ appearance: deviceAppearanceSchema.optional(), avatar: z.string().nullable().optional() }).optional(),
  flowLayout: z
    .object({
      scenes: z
        .record(z.object({ x: z.number().finite(), y: z.number().finite() }))
        .default({}),
      dialogues: z
        .record(
          z.record(
            z.object({ x: z.number().finite(), y: z.number().finite() }),
          ),
        )
        .default({}),
    })
    .optional(),
  schemaVersion: z.literal(1),
  contentUpdates: z.array(z.string()).optional(),
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
      color: z
        .string()
        .regex(/^#[0-9a-fA-F]{6}$/)
        .optional(),
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
  presets: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        kind: z.enum(["rain", "lighting", "motion", "all"]),
        effects: effectsSchema,
      }),
    )
    .max(100)
    .optional(),
  lightPresets: z
    .array(
      z.object({ id: z.string(), name: z.string(), light: zoneLightSchema }),
    )
    .max(100)
    .optional(),
  settings: z.object({
    progression: z.enum(["continue", "enter", "screen"]).optional(),
    dialogueFont: z
      .enum(["Georgia", "Arial", "Verdana", "Trebuchet MS", "monospace"])
      .optional(),
    dialogueSize: z.number().min(10).max(30).optional(),
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
  completedChapters?: string[];
  deviceBookmark?: { scene: string; node: string; entry: string; path: string[] };
  scene: string;
  node: string;
  values: Project["variables"];
  visited: string[];
  history: string[];
  choices: string[];
  ended: boolean;
  nodeVisits?: { scene: string; node: string }[];
  phoneMessages?: {
    scene: string;
    node: string;
    sender: string;
    text: string;
  }[];
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
  const chapterIds=new Set<string>(), chapterScenes=new Set<string>();
  for(const chapter of p.chapters||[]) {
    if(chapterIds.has(chapter.id)||p.scenes.some(s=>s.id===chapter.id))throw Error('Chapter IDs must be unique and distinct from scene IDs.');
    chapterIds.add(chapter.id);
    for(const id of chapter.scenes){
      if(!p.scenes.some(s=>s.id===id)||chapterScenes.has(id))throw Error('Each chapter scene must exist and belong to only one chapter.');
      chapterScenes.add(id);
    }
    if(!chapter.scenes.includes(chapter.startScene)||chapter.starts.some(r=>!chapter.scenes.includes(r.scene)))throw Error('A chapter opening must be one of its own scenes.');
    if(chapter.next && (chapter.next===chapter.id||!p.chapters!.some(c=>c.id===chapter.next)))throw Error('Choose another existing chapter as the destination.');
    if(new Set(chapter.starts.map(r=>r.id)).size!==chapter.starts.length)throw Error('Chapter start rule IDs must be unique.');
    for(const rule of chapter.starts)for(const c of rule.conditions){
      if(!(c.key in p.variables)||typeof p.variables[c.key]!==typeof c.value)throw Error('Chapter condition must use an existing variable with a matching value type.');
      if(!['eq','ne'].includes(c.op)&&typeof c.value!=='number')throw Error('Ordered chapter comparisons require a number.');
    }
    for(const exit of chapter.exits){
      const node=p.scenes.find(s=>s.id===exit.scene)?.nodes.find(n=>n.id===exit.node);
      if(!chapter.scenes.includes(exit.scene)||!node)throw Error('A chapter exit must be an ending dialogue in one of its scenes.');
    }
  }
  const defaults = p.deviceDefaults;
  for (const id of [defaults?.avatar, defaults?.appearance?.wallpaper,
    ...Object.values(defaults?.appearance?.icons || {}),
    ...Object.values(defaults?.appearance?.profiles || {}),
    ...(defaults?.appearance?.apps || []).map(a => a.icon)])
    if (id && !p.assets.some(a => a.id === id)) throw Error("Missing shared device image");
  const ids = new Set<string>();
  for (const s of p.scenes) {
    if (ids.has(s.id)) throw Error("Duplicate scene id: " + s.id);
    ids.add(s.id);
    const nodes = new Set(s.nodes.map((n) => n.id));
    if (s.phone?.returnControl) {
      const r = s.phone.returnControl;
      if (![r.start, r.end, ...(r.target ? [r.target] : [])].every(id => nodes.has(id)))
        throw Error("Missing device return dialogue");
    }
    const checkSound = (cue?: z.infer<typeof soundCueSchema>) => {
      if (cue && !p.audioAssets?.some((a) => a.id === cue.asset))
        throw Error("Missing sound cue asset");
    };
    checkSound(s.phone?.notificationSound);
    checkSound(s.items?.inspectSound);
    checkSound(s.items?.chooseSound);
    if (new Set(s.subscenes?.map((v) => v.id)).size !== (s.subscenes?.length || 0))
      throw Error("Duplicate sub-scene id");
    for (const view of s.subscenes || [])
      if (view.background && !p.assets.some((a) => a.id === view.background))
        throw Error("Missing sub-scene background");
    for (const n of s.nodes) {
      if (n.view && !s.subscenes?.some((v) => v.id === n.view))
        throw Error("Missing dialogue sub-scene");
      checkSound(n.sound);
      for (const c of n.choices) checkSound(c.sound);
    }
    if (nodes.size !== s.nodes.length)
      throw Error("Duplicate dialogue node in " + s.title);
    for (const frame of s.keyframes || [])
      if (!s.sprites?.some((x) => x.id === frame.sprite))
        throw Error("Missing keyframe sprite");
    for (const sprite of s.sprites || [])
      if (!p.assets.some((a) => a.id === sprite.asset))
        throw Error("Missing sprite asset");
    for (const view of s.subscenes || [])
      for (const track of view.audio || [])
        if (!p.audioAssets?.some(a => a.id === track.id)) throw Error("Missing sub-scene audio asset");
    for (const joint of s.joints || [])
      if (joint.cleanPlate && !p.assets.some(a => a.id === joint.cleanPlate)) throw Error("Missing clean plate image");
    for (const track of s.audio || [])
      if (!p.audioAssets?.some((a) => a.id === track.id))
        throw Error("Missing audio asset");
    if (
      s.camera?.footstepAsset &&
      !p.audioAssets?.some((a) => a.id === s.camera!.footstepAsset)
    )
      throw Error("Missing footstep audio");
    for (const item of s.items?.options || []) {
      if (item.asset && !p.assets.some((a) => a.id === item.asset))
        throw Error("Missing item image");
      if (!s.nodes.some((n) => n.choices.some((c) => c.id === item.choice)))
        throw Error("Missing item choice");
    }
    if (
      s.phone?.schedule &&
      (!s.nodes.some((n) => n.id === s.phone!.schedule!.start) ||
        !s.nodes.some((n) => n.id === s.phone!.schedule!.end))
    )
      throw Error("Missing phone schedule dialogue");
    const appearance = s.phone?.appearance;
    for (const id of [
      appearance?.wallpaper,
      ...Object.values(appearance?.profiles || {}),
      ...Object.values(appearance?.icons || {}),
      ...(appearance?.apps || []).map((a) => a.icon),
    ])
      if (id && !p.assets.some((a) => a.id === id))
        throw Error("Missing device appearance image");
    if (s.phone?.avatar && !p.assets.some((a) => a.id === s.phone!.avatar))
      throw Error("Missing device avatar");
    for (const joint of s.joints || []) {
      if (
        joint.range &&
        (!nodes.has(joint.range.start) || !nodes.has(joint.range.end))
      )
        throw Error("Missing hinge range dialogue");
      if (joint.source && !p.assets.some((a) => a.id === joint.source))
        throw Error("Missing joint source image");
      if (new Set(joint.poses.map((x) => x.node)).size !== joint.poses.length)
        throw Error("Duplicate joint pose for dialogue");
      for (const pose of joint.poses) {
        if (!nodes.has(pose.node)) throw Error("Missing joint pose dialogue");
        if (pose.asset && !p.assets.some((a) => a.id === pose.asset))
          throw Error("Missing expression image");
      }
    }
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
  return recordPhone(
    p,
    enter(
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
      p.chapters?.length ? resolveChapterStart(p.chapters[0],p.variables).scene : p.scenes[0].id,
    ),
  );
}
/** Leave an interaction without committing a dialogue response or replaying state actions. */
export function putAwayDevice(p: Project, r: Runtime): Runtime {
  const scene = p.scenes.find(s => s.id === r.scene)!, node = scene.nodes.find(n => n.id === r.node)!;
  const visits = r.nodeVisits?.filter(v => v.scene === scene.id).map(v => v.node) || [node.id];
  if (!canPutAway(scene, node, visits) || node.qte || r.ended) return r;
  const target = returnDestination(scene, node, r);
  if (!target || target === node.id) return r;
  const at = visits.lastIndexOf(target), path = at >= 0 ? visits.slice(at + 1) : [node.id];
  return recordPhone(p, { ...r, node: target, ended: false,
    deviceBookmark: { scene: scene.id, node: node.id, entry: path[0] || node.id, path },
    history: [...r.history, "Put device away"].slice(-200) });
}
function advanceCore(p: Project, r: Runtime, choiceId?: string): Runtime {
  if (r.ended) return r;
  const s = p.scenes.find((s) => s.id === r.scene)!;
  const n = s.nodes.find((n) => n.id === r.node);
  if (!n) throw Error("Dialogue not found");
  if (choiceId) {
    const c = n.choices.find((c) => c.id === choiceId);
    if (!c || (c.condition && r.values[c.condition.key] !== c.condition.equals))
      throw Error("Choice unavailable");
    const bookmark = r.deviceBookmark;
    if (bookmark?.scene === s.id && c.target === bookmark.entry && s.nodes.some(n => n.id === bookmark.node))
      return { ...r, node: bookmark.node, ended: false, deviceBookmark: undefined,
        nodeVisits: [...(r.nodeVisits || []), ...bookmark.path.map(node => ({ scene: s.id, node }))].slice(-1000) };
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
  if(n.next)return {...r,node:n.next};
  const chapter=chapterForScene(p,s.id);
  if(chapter?.exits.some(e=>e.scene===s.id&&e.node===n.id)) {
    const completedChapters=[...new Set([...(r.completedChapters||[]),chapter.id])];
    const next=p.chapters?.find(c=>c.id===chapter.next);
    if(next){
      const opening=resolveChapterStart(next,r.values);
      return enter(p,{...r,completedChapters,history:[...r.history,`Completed ${chapter.title}`,`Starting ${next.title}: ${opening.rule}`].slice(-200)},opening.scene);
    }
    return {...r,completedChapters,ended:true,history:[...r.history,`Completed ${chapter.title}`].slice(-200)};
  }
  return { ...r, ended: true, history: [...r.history, "Story complete"] };
}

function recordPhone(p: Project, r: Runtime): Runtime {
  const visits = r.nodeVisits || [],
    lastVisit = visits[visits.length - 1];
  if (lastVisit?.scene !== r.scene || lastVisit?.node !== r.node)
    r = {
      ...r,
      nodeVisits: [...visits, { scene: r.scene, node: r.node }].slice(-1000),
    };
  const s = p.scenes.find((s) => s.id === r.scene)!;
  const n = s.nodes.find((n) => n.id === r.node)!;
  if (
    !s.phone || !deviceDialogue(s, n, r.nodeVisits?.filter(v => v.scene === s.id).map(v => v.node)) ||
    ![s.phone.contact, "You", "Mara", "Maria"].includes(n.speaker)
  )
    return r;
  const rows = r.phoneMessages || [];
  const last = rows[rows.length - 1];
  if (last?.scene === s.id && last.node === n.id && last.text === n.text)
    return r;
  return {
    ...r,
    phoneMessages: [
      ...rows,
      { scene: s.id, node: n.id, sender: n.speaker, text: n.text },
    ].slice(-100),
  };
}
export function advance(p: Project, r: Runtime, choiceId?: string): Runtime {
  let next = advanceCore(p, r, choiceId);
  if (next === r) return r;
  const s = p.scenes.find((s) => s.id === r.scene)!;
  const c = s.nodes
    .find((n) => n.id === r.node)
    ?.choices.find((c) => c.id === choiceId);
  const sourceNode = s.nodes.find(n => n.id === r.node)!;
  if (s.phone && c && c.sendAsMessage !== false && deviceDialogue(s, sourceNode, r.nodeVisits?.filter(v => v.scene === s.id).map(v => v.node)))
    next = {
      ...next,
      phoneMessages: [
        ...(r.phoneMessages || []),
        { scene: s.id, node: r.node, sender: "You", text: c.text },
      ].slice(-100),
    };
  return recordPhone(p, next);
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
  return recordPhone(
    p,
    p.scenes.some((s) => s.id === target)
      ? enter(p, next, target)
      : { ...next, node: target },
  );
}

export function respond(
  p: Project,
  r: Runtime,
  text: string,
  choiceId?: string,
): Runtime {
  const node = p.scenes
    .find((s) => s.id === r.scene)
    ?.nodes.find((n) => n.id === r.node);
  if (
    !node ||
    (node.choices.length > 0 && !choiceId) ||
    node.qte ||
    !allowsReply(
      p.scenes.find((s) => s.id === r.scene)!,
      node,
      deviceScreen(
        p.scenes.find((s) => s.id === r.scene)!,
        node,
        r.nodeVisits?.filter((v) => v.scene === r.scene).map((v) => v.node),
      ) !== "off",
    ) ||
    r.ended
  )
    throw Error("Custom reply unavailable here");
  const reply = text.trim();
  if (!reply || reply.length > 1000)
    throw Error("Enter a reply of 1–1000 characters");
  const next = advance(p, r, choiceId);
  return {
    ...next,
    ...(deviceDialogue(p.scenes.find(s => s.id === r.scene)!, node, r.nodeVisits?.filter(v => v.scene === r.scene).map(v => v.node))
      ? {
          phoneMessages: [
            ...(r.phoneMessages || []),
            { scene: r.scene, node: r.node, sender: "You", text: reply },
            ...(next.phoneMessages || []).slice(
              (r.phoneMessages || []).length +
                (choiceId &&
                node.choices.find((c) => c.id === choiceId)?.sendAsMessage !==
                  false
                  ? 1
                  : 0),
            ),
          ],
        }
      : {}),
    responses: [
      ...(r.responses || []),
      { scene: r.scene, node: r.node, text: reply },
    ],
    history: [...next.history, `Custom reply: ${reply}`].slice(-200),
  };
}
