import type { Project } from "./model";
import type { FeedPost, InstaFeed } from "./feedSchema";
const post = (
  id: string,
  author: string,
  title: string,
  caption: string,
  likes: number,
  rows: [string, string][],
): FeedPost => ({
  id,
  author,
  title,
  caption,
  likes,
  seconds: 24,
  video: `/media/insta/${id}.mp4`,
  poster: `/media/insta/${id}.jpg`,
  comments: rows.map(([author, text], i) => ({
    id: id + "-" + i,
    author,
    text,
  })),
});
export const defaultInstaFeed: InstaFeed = {
  autoplay: true,
  repeat: true,
  comments: true,
  volume: 0.55,
  posts: [
    post(
      "rain-walk",
      "nightwalks",
      "Took the long way home",
      "No productivity tips. Just wet shoes and one good streetlamp.",
      284,
      [
        [
          "coatweather",
          "This is what my brain thinks walking home looks like. In reality I step in a drain.",
        ],
        ["softstatic", "That amber reflection. Could stay here a while."],
        ["busstopcritic", "Twenty-four seconds of pavement. Groundbreaking."],
        ["nightwalks", "The pavement declined an interview, unfortunately."],
      ],
    ),
    post(
      "tea-and-pages",
      "margin_notes",
      "Reading the same page again",
      "Finished my tea. Did not finish this paragraph. Still counts as an afternoon.",
      617,
      [
        ["dogeared", "Bought a book for the plot. Stayed for the chair."],
        [
          "quiet_hours",
          "The sound of that cup is better than my entire playlist.",
        ],
        [
          "instant_winner_084",
          "You have been selected for a free reading tablet!! DM your payment details to claim.",
        ],
        [
          "margin_notes",
          "That last comment is a scam. Please keep your payment details and your tablet-shaped hopes.",
        ],
      ],
    ),
    post(
      "midnight-monitor",
      "softstatic",
      "One more before I sleep",
      "The task: go to bed. The side quest: absolutely everything else.",
      1203,
      [
        [
          "four_percent",
          "Watching this while ignoring my own bedtime. We are a support group with no solutions.",
        ],
        ["nearly_asleep", "The hoodie has more screen time than I do."],
        ["daylight_person", "Maybe just turn the computer off?"],
        [
          "softstatic",
          "An interesting theory. I will investigate after this one.",
        ],
      ],
    ),
    post(
      "last-tram",
      "last_service",
      "A seat by the window",
      "The city keeps going. You can sit still for a minute.",
      392,
      [
        [
          "paper_ticket",
          "Last tram home after a shift. This is a very specific kind of peace.",
        ],
        [
          "raincheck",
          "Until you realise you missed your stop three minutes ago.",
        ],
        [
          "platform_two",
          "Why does everything need to be romanticised? It is a tram.",
        ],
        ["last_service", "A tram with surprisingly good lighting, to be fair."],
      ],
    ),
  ],
};
export const getInstaFeed = (p: Project): InstaFeed =>
  p.instaFeed || defaultInstaFeed;
declare global {
  interface Window {
    __stillframeFeedMedia?: Record<string, string>;
  }
}
export function feedSource(path?: string) {
  return path
    ? (typeof window !== "undefined" && window.__stillframeFeedMedia?.[path]) ||
        (path.startsWith('/media/insta/') && path.endsWith('.mp4') ? path+'?v=2.12.0' : path)
    : undefined;
}
async function embed(path: string) {
  const source = feedSource(path)!;
  if (source.startsWith("data:")) return source;
  const response = await fetch(source);
  if (!response.ok)
    throw Error(
      "Could not include feed media in your backup. Please retry while online.",
    );
  const blob = await response.blob();
  if (!blob.type.startsWith(path.endsWith(".mp4") ? "video/" : "image/"))
    throw Error("Feed media download returned an unexpected file.");
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(Error("Could not read feed media."));
    reader.readAsDataURL(blob);
  });
}
/** Built-in clips are separate web assets; backups embed them just like uploads. */
export async function portableFeedProject(project: Project): Promise<Project> {
  if (!project.scenes.some((s) => s.phone) && !project.instaFeed)
    return project;
  const config = getInstaFeed(project);
  const posts = await Promise.all(
    config.posts.map(async (p) => ({
      ...p,
      video: await embed(p.video),
      poster: p.poster ? await embed(p.poster) : undefined,
    })),
  );
  return { ...project, instaFeed: { ...config, posts } };
}
export async function readFeedVideo(
  file: File,
): Promise<Pick<FeedPost, "video" | "seconds">> {
  const mime =
    file.type ||
    (file.name.toLowerCase().endsWith(".mp4")
      ? "video/mp4"
      : file.name.toLowerCase().endsWith(".webm")
        ? "video/webm"
        : "");
  if (!["video/mp4", "video/webm", "video/ogg"].includes(mime))
    throw Error("Choose an MP4 (H.264/AAC recommended), WebM or Ogg video.");
  if (file.size > 10 * 1024 * 1024)
    throw Error("This video exceeds 10 MB. Export a smaller copy first.");
  const url = URL.createObjectURL(file),
    video = document.createElement("video");
  video.preload = "metadata";
  try {
    const seconds = await new Promise<number>((resolve, reject) => {
      const timer = setTimeout(
        () => reject(Error("Video metadata timed out. Try an H.264 MP4.")),
        12000,
      );
      video.onloadedmetadata = () => {
        clearTimeout(timer);
        Number.isFinite(video.duration) && video.duration > 0
          ? resolve(video.duration)
          : reject(Error("Video duration could not be read."));
      };
      video.onerror = () => {
        clearTimeout(timer);
        reject(Error("This browser cannot read that video. Try an H.264 MP4."));
      };
      video.src = url;
    });
    if (seconds > 180)
      throw Error("Keep each uploaded clip under three minutes.");
    const data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () =>
        resolve(String(reader.result).replace(/^data:[^;]+;/, `data:${mime};`));
      reader.onerror = () => reject(Error("Could not read video."));
      reader.readAsDataURL(file);
    });
    return { video: data, seconds };
  } finally {
    video.removeAttribute("src");
    video.load();
    URL.revokeObjectURL(url);
  }
}
