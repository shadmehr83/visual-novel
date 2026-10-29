import { z } from "zod";
export const demandSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().datetime({ offset: true }),
  engineVersion: z.string().regex(/^\d+\.\d+\.\d+$/),
  text: z.string().trim().min(1).max(8000),
  status: z.enum(["open", "done"]),
  context: z.object({
    projectId: z.string().max(200),
    projectTitle: z.string().max(150),
    sceneId: z.string().max(200),
    sceneTitle: z.string().max(150),
    nodeId: z.string().max(200),
    dialogue: z.string().max(500),
  }),
  githubUrl: z
    .string()
    .url()
    .refine((url) =>
      /^https:\/\/github\.com\/shadmehr83\/visual-novel\/blob\/main\/demands\/inbox\/[0-9A-Za-z_.-]+\.md$/.test(
        url,
      ),
    )
    .optional(),
});
export type Demand = z.infer<typeof demandSchema>;
