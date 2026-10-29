import { useState } from "react";
import type { Project } from "./model";
import type { FeedPost, InstaFeed } from "./feedSchema";
import { defaultInstaFeed, getInstaFeed, readFeedVideo } from "./feedLibrary";
export function InstaFeedControls({
  project,
  edit,
}: {
  project: Project;
  edit: (fn: (p: Project) => void) => void;
}) {
  const config = getInstaFeed(project);
  const [status, setStatus] = useState(""),
    [busy, setBusy] = useState(false);
  const set = (fn: (f: InstaFeed) => void) =>
    edit((p) => {
      p.instaFeed ??= structuredClone(defaultInstaFeed);
      fn(p.instaFeed);
    });
  const changePost = (id: string, fn: (p: FeedPost) => void) =>
    set((f) => {
      const p = f.posts.find((p) => p.id === id);
      if (p) fn(p);
    });
  return (
    <section
      className="property-section insta-authoring"
      aria-label="Insta feed settings"
    >
      <h2>Insta feed · videos & comments</h2>
      <p>
        This library is shared across the phone and computer in every scene.
        Uploading and editing feed posts leaves Ember messages, phone timing,
        icons and scene artwork intact.
      </p>
      <fieldset disabled={busy}>
        <label data-help="Play the mostly visible video as you scroll. Other clips pause. Reduced-motion preferences start clips paused.">
          <input
            type="checkbox"
            checked={config.autoplay}
            onChange={(e) =>
              set((f) => {
                f.autoplay = e.target.checked;
              })
            }
          />
          Autoplay visible video
        </label>
        <label data-help="Show a Keep scrolling button after the last post so the player can watch the feed again without advancing story dialogue.">
          <input
            type="checkbox"
            checked={config.repeat}
            onChange={(e) =>
              set((f) => {
                f.repeat = e.target.checked;
              })
            }
          />
          Allow replaying the feed
        </label>
        <label data-help="Allow the player to open comments and add local replies. Authored comments remain saved in your project even when this is off.">
          <input
            type="checkbox"
            checked={config.comments}
            onChange={(e) =>
              set((f) => {
                f.comments = e.target.checked;
              })
            }
          />
          Show comments
        </label>
        <label data-help="Volume of video sound relative to the story master volume. Clips start muted; the player can unmute from each video.">
          Feed audio volume (%)
          <input
            aria-label="Feed audio volume (%)"
            type="number"
            min={0}
            max={100}
            value={Math.round(config.volume * 100)}
            onChange={(e) =>
              set((f) => {
                f.volume = Math.max(0, Math.min(100, +e.target.value)) / 100;
              })
            }
          />
        </label>
        <label
          className="insta-upload"
          data-help="Add MP4, WebM or Ogg clips to the feed. Videos are embedded in your project backup, not uploaded to Instagram. Use H.264/AAC MP4 for broad browser support; up to 10 MB and 3 minutes per clip, 20 MB of uploaded video in total."
        >
          Upload more feed videos
          <input
            aria-label="Upload more feed videos"
            type="file"
            accept="video/mp4,video/webm,video/ogg"
            multiple
            onChange={async (e) => {
              const files = Array.from(e.target.files || []);
              e.target.value = "";
              if (!files.length) return;
              setBusy(true);
              setStatus("Reading videos…");
              try {
                if (config.posts.length + files.length > 40)
                  throw Error(
                    "The feed holds up to 40 distinct posts. Remove an old post first.",
                  );
                const bytes =
                  config.posts.reduce(
                    (sum, p) =>
                      sum +
                      (p.video.startsWith("data:") ? p.video.length * 0.75 : 0),
                    0,
                  ) + files.reduce((sum, f) => sum + f.size, 0);
                if (bytes > 20 * 1024 * 1024)
                  throw Error(
                    "Uploaded feed videos exceed 20 MB in total. Remove an older upload or use a smaller export.",
                  );
                const posts: FeedPost[] = [];
                for (const file of files)
                  posts.push({
                    id: crypto.randomUUID(),
                    author: "your_handle",
                    title:
                      file.name.replace(/\.[^.]+$/, "").slice(0, 120) ||
                      "New video",
                    caption: "",
                    likes: 0,
                    comments: [],
                    ...(await readFeedVideo(file)),
                  });
                set((f) => {
                  f.posts.push(...posts);
                });
                setStatus(
                  `Added ${posts.length} video${posts.length === 1 ? "" : "s"}. Saved with your project; export a complete project file to move uploads to another device.`,
                );
              } catch (error) {
                setStatus(String(error));
              } finally {
                setBusy(false);
              }
            }}
          />
        </label>
        <p>
          {config.posts.length} posts · four original 24-second illustrated
          videos are included. Player likes and replies stay on their browser;
          the videos, captions, order and authored comments travel in a complete
          project export.
        </p>
        {config.posts.map((p, i) => (
          <details key={p.id} className="insta-post-settings">
            <summary>
              {i + 1}. {p.title} · {Math.round(p.seconds)}s
            </summary>
            <label>
              Account name
              <input
                aria-label={"Account for " + p.id}
                maxLength={60}
                value={p.author}
                onChange={(e) =>
                  changePost(p.id, (p) => {
                    p.author = e.target.value || "your_handle";
                  })
                }
              />
            </label>
            <label>
              Video title
              <input
                aria-label={"Title for " + p.id}
                maxLength={120}
                value={p.title}
                onChange={(e) =>
                  changePost(p.id, (p) => {
                    p.title = e.target.value || "Untitled video";
                  })
                }
              />
            </label>
            <label>
              Caption
              <textarea
                maxLength={600}
                value={p.caption}
                onChange={(e) =>
                  changePost(p.id, (p) => {
                    p.caption = e.target.value;
                  })
                }
              />
            </label>
            <label data-help="The fictional starting like count. Each player can add one like, or remove their own like; they cannot change this base count.">
              Starting likes
              <input
                type="number"
                min={0}
                max={100000000}
                value={p.likes}
                onChange={(e) =>
                  changePost(p.id, (p) => {
                    p.likes = Math.max(
                      0,
                      Math.min(100000000, Math.round(+e.target.value)),
                    );
                  })
                }
              />
            </label>
            <div className="insta-post-order">
              <button
                disabled={i === 0}
                onClick={() =>
                  set((f) => {
                    [f.posts[i - 1], f.posts[i]] = [f.posts[i], f.posts[i - 1]];
                  })
                }
              >
                Move earlier
              </button>
              <button
                disabled={i === config.posts.length - 1}
                onClick={() =>
                  set((f) => {
                    [f.posts[i + 1], f.posts[i]] = [f.posts[i], f.posts[i + 1]];
                  })
                }
              >
                Move later
              </button>
            </div>
            <h4>Authored comments</h4>
            <p>
              Write fictional reactions, jokes, criticism or spam as story
              texture. They are plain text; links and scam offers never open.
            </p>
            {p.comments.map((c) => (
              <div key={c.id} className="insta-comment-editor">
                <label>
                  Comment author
                  <input
                    maxLength={60}
                    value={c.author}
                    onChange={(e) =>
                      changePost(p.id, (p) => {
                        p.comments.find((row) => row.id === c.id)!.author =
                          e.target.value || "anonymous";
                      })
                    }
                  />
                </label>
                <label>
                  Comment text
                  <textarea
                    maxLength={400}
                    value={c.text}
                    onChange={(e) =>
                      changePost(p.id, (p) => {
                        p.comments.find((row) => row.id === c.id)!.text =
                          e.target.value || " ";
                      })
                    }
                  />
                </label>
                <button
                  onClick={() =>
                    changePost(p.id, (p) => {
                      p.comments = p.comments.filter((row) => row.id !== c.id);
                    })
                  }
                >
                  Remove comment
                </button>
              </div>
            ))}
            <button
              disabled={p.comments.length >= 40}
              onClick={() =>
                changePost(p.id, (p) => {
                  p.comments.push({
                    id: crypto.randomUUID(),
                    author: "new_commenter",
                    text: "Write a comment here.",
                  });
                })
              }
            >
              Add authored comment
            </button>
            <button
              className="danger"
              data-help="Remove this post from the shared feed. This leaves chat, story dialogue and your original uploaded file untouched. Use editor Undo to restore a removed post."
              onClick={() =>
                set((f) => {
                  f.posts = f.posts.filter((row) => row.id !== p.id);
                })
              }
            >
              Remove video from feed
            </button>
          </details>
        ))}
        <button
          data-help="Add any of the four original clips missing from this feed. Existing posts, uploads and edited captions are preserved."
          onClick={() =>
            set((f) => {
              for (const p of defaultInstaFeed.posts)
                if (
                  !f.posts.some((row) => row.id === p.id) &&
                  f.posts.length < 40
                )
                  f.posts.push(structuredClone(p));
            })
          }
        >
          Restore missing original videos
        </button>
      </fieldset>
      <p role="status">{status}</p>
    </section>
  );
}
