import { it, expect, vi, afterEach } from "vitest";
import { demo } from "./demo";
import { validateProject } from "./model";
import {
  defaultInstaFeed,
  getInstaFeed,
  portableFeedProject,
} from "./feedLibrary";
import { feedMedia } from "./feedSchema";
import { loadFeedReactions } from "./InstaFeed";
afterEach(() => {
  vi.unstubAllGlobals();
});
it("gives older projects four different 24-second video posts without changing their device or scene settings", () => {
  const p = demo(),
    before = JSON.stringify(p);
  const feed = getInstaFeed(p);
  expect(feed.posts).toHaveLength(4);
  expect(new Set(feed.posts.map((p) => p.video)).size).toBe(4);
  expect(
    feed.posts.every(
      (p) => p.seconds >= 20 && p.seconds <= 30 && p.comments.length >= 3,
    ),
  ).toBe(true);
  expect(JSON.stringify(p)).toBe(before);
  const roundtrip = validateProject({ ...p, instaFeed: structuredClone(feed) });
  expect(roundtrip.instaFeed).toEqual(feed);
});
it("accepts portable clips and rejects external tracking URLs and duplicate post IDs", () => {
  expect(feedMedia.safeParse("data:video/mp4;base64,AAAA").success).toBe(true);
  expect(feedMedia.safeParse("https://example.com/tracker.mp4").success).toBe(
    false,
  );
  const p = demo();
  p.instaFeed = structuredClone(defaultInstaFeed);
  p.instaFeed.posts.push(p.instaFeed.posts[0]);
  expect(() => validateProject(p)).toThrow(/unique ID/);
});
it("embeds video and poster bytes in complete backups while retaining the original object", async () => {
  const p = demo();
  p.instaFeed = {
    ...structuredClone(defaultInstaFeed),
    posts: [structuredClone(defaultInstaFeed.posts[0])],
  };
  vi.stubGlobal(
    "fetch",
    vi.fn(async (path: string) => ({
      ok: true,
      blob: async () =>
        new Blob(["original clip bytes"], {
          type: path.endsWith(".mp4") ? "video/mp4" : "image/jpeg",
        }),
    })),
  );
  const copy = await portableFeedProject(p);
  expect(copy.instaFeed!.posts[0].video).toMatch(/^data:video\/mp4;base64,/);
  expect(copy.instaFeed!.posts[0].poster).toMatch(/^data:image\/jpeg;base64,/);
  expect(p.instaFeed.posts[0].video).toMatch(/^\/media\//);
  expect(validateProject(copy).instaFeed).toEqual(copy.instaFeed);
});
it("does not silently export missing videos", async () => {
  const p = demo();
  p.instaFeed = structuredClone(defaultInstaFeed);
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response("", { status: 404 })),
  );
  await expect(portableFeedProject(p)).rejects.toThrow(/retry while online/);
});
it("handles corrupt browser reactions without failing the phone", () => {
  vi.stubGlobal("localStorage", { getItem: () => "{broken" });
  expect(loadFeedReactions("feed")).toEqual({});
  vi.stubGlobal("localStorage", {
    getItem: () =>
      JSON.stringify({
        one: {
          liked: true,
          comments: [null, { id: "a", author: "You", text: "nice" }],
        },
        bad: 42,
      }),
  });
  expect(loadFeedReactions("feed")).toEqual({
    one: { liked: true, comments: [{ id: "a", author: "You", text: "nice" }] },
  });
});
