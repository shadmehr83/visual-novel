import { z } from "zod";
import {
  defaultEffects,
  spriteSchema,
  qteSchema,
  cameraSchema,
  jointSchema,
  transitionSchema,
  deviceSchema,
  validateProject,
  type Project,
} from "./model";
export const proposalSchema = z
  .object({
    explanation: z.string().max(4000),
    assumptions: z.array(z.string()).max(10),
    operations: z
      .array(
        z.discriminatedUnion("type", [
          z
            .object({
              type: z.literal("joint"),
              scene: z.string(),
              joint: jointSchema,
            })
            .strict(),
          z
            .object({
              type: z.literal("transition"),
              scene: z.string(),
              transition: transitionSchema,
            })
            .strict(),
          z
            .object({
              type: z.literal("device"),
              scene: z.string(),
              device: deviceSchema,
            })
            .strict(),
          z
            .object({
              type: z.literal("camera"),
              scene: z.string(),
              camera: cameraSchema,
            })
            .strict(),
          z
            .object({
              type: z.literal("sprite"),
              scene: z.string(),
              sprite: spriteSchema,
            })
            .strict(),
          z
            .object({
              type: z.literal("qte"),
              scene: z.string(),
              node: z.string(),
              qte: qteSchema,
            })
            .strict(),
          z
            .object({
              type: z.literal("audio"),
              scene: z.string(),
              id: z.string(),
              volume: z.number().min(0).max(1),
              loop: z.boolean(),
            })
            .strict(),
          z
            .object({
              type: z.literal("addScene"),
              id: z.string(),
              title: z.string().min(1).max(100),
              text: z.string().max(6000),
            })
            .strict(),
          z
            .object({
              type: z.literal("addChoice"),
              scene: z.string(),
              node: z.string(),
              text: z.string().max(500),
              target: z.string(),
            })
            .strict(),
          z
            .object({
              type: z.literal("effects"),
              scene: z.string(),
              values: z.record(z.unknown()),
            })
            .strict(),
          z
            .object({
              type: z.literal("dialogue"),
              scene: z.string(),
              node: z.string(),
              text: z.string().max(6000),
              speaker: z.string().max(100),
            })
            .strict(),
          z
            .object({
              type: z.literal("renameScene"),
              scene: z.string(),
              title: z.string().min(1).max(100),
            })
            .strict(),
        ]),
      )
      .max(30),
  })
  .strict();
export type Proposal = z.infer<typeof proposalSchema>;
export function applyProposal(project: Project, input: unknown): Project {
  const proposal = proposalSchema.parse(input);
  const next = structuredClone(project);
  for (const op of proposal.operations) {
    if (op.type === "addScene") {
      next.scenes.push({
        id: op.id,
        title: op.title,
        subtitle: "NEW SCENE",
        art: "bedroom",
        background: null,
        fit: "cover",
        x: 0,
        y: 0,
        scale: 1,
        effects: defaultEffects(),
        entry: [],
        nodes: [
          { id: "opening", speaker: "Narrator", text: op.text, choices: [] },
        ],
      });
      continue;
    }
    const scene = next.scenes.find((s) => s.id === op.scene);
    if (!scene) throw Error("Unknown target scene");
    if (op.type === "camera") scene.camera = op.camera;
    if (op.type === "transition") scene.transition = op.transition;
    if (op.type === "device") scene.phone = op.device;
    if (op.type === "joint") {
      const index = scene.joints?.findIndex((j) => j.id === op.joint.id) ?? -1;
      if (index < 0) (scene.joints ??= []).push(op.joint);
      else scene.joints![index] = op.joint;
    }
    if (op.type === "sprite") {
      const index =
        scene.sprites?.findIndex((s) => s.id === op.sprite.id) ?? -1;
      if (index < 0) (scene.sprites ??= []).push(op.sprite);
      else scene.sprites![index] = op.sprite;
    }
    if (op.type === "audio") {
      const track = scene.audio?.find((t) => t.id === op.id);
      if (track) Object.assign(track, { volume: op.volume, loop: op.loop });
      else
        (scene.audio ??= []).push({
          id: op.id,
          volume: op.volume,
          loop: op.loop,
        });
    }
    if (op.type === "qte") {
      const n = scene.nodes.find((n) => n.id === op.node);
      if (!n) throw Error("Unknown node");
      n.qte = op.qte;
    }
    if (op.type === "addChoice") {
      const node = scene.nodes.find((n) => n.id === op.node);
      if (!node) throw Error("Unknown dialogue target");
      node.next = undefined;
      node.choices.push({
        id: crypto.randomUUID(),
        text: op.text,
        target: op.target,
        actions: [],
        note: "",
      });
    }
    if (op.type === "effects") {
      for (const key of Object.keys(op.values))
        if (!Object.hasOwn(scene.effects, key))
          throw Error("Unsupported effect property");
      Object.assign(scene.effects, op.values);
    }
    if (op.type === "renameScene") scene.title = op.title;
    if (op.type === "dialogue") {
      const node = scene.nodes.find((n) => n.id === op.node);
      if (!node) throw Error("Unknown dialogue target");
      node.text = op.text;
      node.speaker = op.speaker;
    }
  }
  return validateProject(next);
}
export function aiContext(p: Project) {
  return {
    assets: p.assets.map(({ id, name, tags, reference }) => ({
      id,
      name,
      tags,
      reference,
    })),
    audioAssets: p.audioAssets?.map(({ id, name }) => ({ id, name })),
    title: p.title,
    characters: p.characters.map(({ id, name, notes }) => ({
      id,
      name,
      notes,
    })),
    scenes: p.scenes.map(
      ({
        id,
        title,
        effects,
        nodes,
        sprites,
        audio,
        camera,
        joints,
        phone,
        transition,
      }) => ({
        id,
        title,
        effects,
        joints,
        phone,
        transition,
        camera,
        sprites,
        audio,
        nodes: nodes.map(({ id, speaker, text }) => ({ id, speaker, text })),
      }),
    ),
  };
}
