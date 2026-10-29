import { z } from "zod";
export const chapterConditionSchema = z.object({
  key: z.string(),
  op: z.enum(["eq", "ne", "gt", "gte", "lt", "lte"]),
  value: z.union([z.string(), z.number(), z.boolean()]),
});
export const chapterSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(120),
  notes: z.string().max(5000).default(""),
  scenes: z.array(z.string()).min(1).max(100),
  startScene: z.string(),
  starts: z
    .array(
      z.object({
        id: z.string(),
        label: z.string().min(1).max(120),
        scene: z.string(),
        match: z.enum(["all", "any"]),
        conditions: z.array(chapterConditionSchema).max(20),
      }),
    )
    .max(40)
    .default([]),
  exits: z
    .array(z.object({ scene: z.string(), node: z.string() }))
    .max(100)
    .default([]),
  next: z.string().optional(),
});
export type Chapter = z.infer<typeof chapterSchema>;
export type ChapterCondition = z.infer<typeof chapterConditionSchema>;
