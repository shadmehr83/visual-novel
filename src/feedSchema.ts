import { z } from "zod";
export const feedMedia = z
  .string()
  .max(14 * 1024 * 1024)
  .regex(
    /^(?:data:video\/(?:mp4|webm|ogg);base64,|\/media\/insta\/(?:rain-walk|tea-and-pages|midnight-monitor|last-tram)\.mp4$)/,
  );
export const feedCommentSchema = z.object({
  id: z.string(),
  author: z.string().min(1).max(60),
  text: z.string().min(1).max(400),
});
export const feedPostSchema = z.object({
  id: z.string(),
  author: z.string().min(1).max(60),
  title: z.string().min(1).max(120),
  caption: z.string().max(600),
  video: feedMedia,
  seconds: z.number().positive().max(180),
  poster: z
    .string()
    .regex(
      /^(?:data:image\/(?:jpeg|png|webp);base64,|\/media\/insta\/[a-z-]+\.jpg$)/,
    )
    .optional(),
  likes: z.number().int().min(0).max(100000000),
  comments: z.array(feedCommentSchema).max(40),
});
export const instaFeedSchema = z
  .object({
    autoplay: z.boolean(),
    repeat: z.boolean(),
    comments: z.boolean(),
    volume: z.number().min(0).max(1),
    posts: z.array(feedPostSchema).max(40),
  })
  .superRefine((feed, ctx) => {
    if (new Set(feed.posts.map((p) => p.id)).size !== feed.posts.length)
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Each feed post needs a unique ID.",
      });
    if (
      feed.posts.reduce(
        (n, p) => n + (p.video.startsWith("data:") ? p.video.length * 0.75 : 0),
        0,
      ) >
      20 * 1024 * 1024
    )
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Embedded feed videos exceed 20 MB in total.",
      });
  });
export type FeedPost = z.infer<typeof feedPostSchema>;
export type InstaFeed = z.infer<typeof instaFeedSchema>;
