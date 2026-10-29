import { useEffect, useRef, useState } from "react";
import {
  Heart,
  MessageCircle,
  Volume2,
  VolumeX,
  Play,
  Pause,
} from "lucide-react";
import type { Project } from "./model";
import type { FeedPost, InstaFeed as FeedConfig } from "./feedSchema";
import { feedSource, getInstaFeed } from "./feedLibrary";
import { usePaused } from "./PlaySession";
import { useSound } from "./Sound";
import { createPortal } from "react-dom";
import { InstaComments } from "./InstaComments";
type Reactions = Record<
  string,
  { liked: boolean; comments: { id: string; author: string; text: string }[] }
>;
export function loadFeedReactions(key: string): Reactions {
  try {
    const rows = JSON.parse(localStorage.getItem(key) || "{}");
    return Object.fromEntries(
      Object.entries(rows)
        .slice(-100)
        .filter(([, row]) => row && typeof row === "object")
        .map(([id, row]) => {
          const r = row as Reactions[string];
          return [
            id,
            {
              liked: r.liked === true,
              comments: Array.isArray(r.comments)
                ? r.comments
                    .filter(
                      (c) =>
                        c &&
                        typeof c.id === "string" &&
                        typeof c.author === "string" &&
                        typeof c.text === "string",
                    )
                    .slice(-20)
                    .map((c) => ({ ...c, text: c.text.slice(0, 400) }))
                : [],
            },
          ];
        }),
    );
  } catch {
    return {};
  }
}
export function InstaFeed({
  project,
  profile,
}: {
  project: Project;
  profile?: string;
}) {
  const config = getInstaFeed(project),
    root = useRef<HTMLDivElement>(null);
  const key = "stillframe-insta:" + project.id;
  const [reactions, setReactions] = useState(() => loadFeedReactions(key));
  const [notice, setNotice] = useState("");
  const [cycles, setCycles] = useState(1);
  const [muted, setMuted] = useState(true);
  useEffect(() => {
    setReactions(loadFeedReactions(key));
    setCycles(1);
  }, [key]);
  const change = (
    id: string,
    transform: (row: Reactions[string]) => Reactions[string],
  ) => {
    setReactions((old) => {
      const next = {
        ...old,
        [id]: transform(old[id] || { liked: false, comments: [] }),
      };
      try {
        localStorage.setItem(key, JSON.stringify(next));
        setNotice("");
      } catch {
        setNotice(
          "Browser storage is unavailable. Likes and comments will last until you close this feed.",
        );
      }
      return next;
    });
  };
  return (
    <div
      className="loop-feed insta-feed"
      ref={root}
      data-no-advance
      aria-label="Insta scrolling feed"
    >
      {profile && (
        <header className="phone-feed-profile">
          <img
            className="device-profile-picture"
            src={profile}
            alt="Your Insta profile"
          />
          <b>Your Insta feed</b>
        </header>
      )}
      {!config.posts.length && (
        <p className="insta-empty">
          No posts yet. Add videos in Advanced devices → Insta feed.
        </p>
      )}
      {Array.from({ length: cycles }, (_, cycle) =>
        config.posts.map((post) => (
          <FeedCard
            key={cycle + ":" + post.id}
            post={post}
            config={config}
            root={root}
            muted={muted}
            onMute={() => setMuted((v) => !v)}
            reaction={reactions[post.id] || { liked: false, comments: [] }}
            onLike={() => change(post.id, (r) => ({ ...r, liked: !r.liked }))}
            onComment={(text) =>
              change(post.id, (r) => ({
                ...r,
                comments: [
                  ...r.comments,
                  { id: crypto.randomUUID(), author: "You", text },
                ].slice(-20),
              }))
            }
          />
        )),
      )}
      {config.repeat && config.posts.length > 0 && (
        <div className="insta-feed-end">
          <p>You caught up. Stay a little longer?</p>
          <button
            onClick={() => {
              if (cycles < 10) setCycles((n) => n + 1);
              else {
                setCycles(1);
                root.current?.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
          >
            Keep scrolling · watch again
          </button>
        </div>
      )}
      {notice && <p role="status">{notice}</p>}
    </div>
  );
}
function FeedCard({
  post,
  config,
  root,
  reaction,
  onLike,
  onComment,
  muted,
  onMute,
}: {
  post: FeedPost;
  config: FeedConfig;
  root: React.RefObject<HTMLDivElement | null>;
  reaction: Reactions[string];
  onLike: () => void;
  onComment: (text: string) => void;
  muted: boolean;
  onMute: () => void;
}) {
  const card = useRef<HTMLElement>(null),
    video = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false),
    [visible, setVisible] = useState(!document.hidden);
  const [comments, setComments] = useState(false),
    [draft, setDraft] = useState("");
  const [userPaused, setUserPaused] = useState(!config.autoplay),
    [blocked, setBlocked] = useState(false),
    [failed, setFailed] = useState(false);
  const sound = useSound(),
    paused = usePaused();
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const actuallyMuted = muted || !sound.enabled;
  useEffect(() => {
    const listener = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", listener);
    // At very small phone sizes a card's visible fraction can sit below the
    // observer's thresholds. Recheck actual geometry on scroll as well.
    const update = () => {
      const bounds = root.current?.getBoundingClientRect(),
        rect = card.current?.getBoundingClientRect();
      if (!bounds || !rect) return;
      const visibleHeight = Math.max(
        0,
        Math.min(bounds.bottom, rect.bottom) - Math.max(bounds.top, rect.top),
      );
      setActive(
        bounds.height > 0 &&
          visibleHeight >= Math.min(rect.height, bounds.height) * 0.55 &&
          visibleHeight > 0,
      );
    };
    const observer = new IntersectionObserver(update, {
      root: root.current,
      threshold: [0, 0.001, 0.1, 0.25, 0.5, 0.55, 0.75, 1],
    });
    if (card.current) observer.observe(card.current);
    const container = root.current,
      resize = new ResizeObserver(update);
    container?.addEventListener("scroll", update, { passive: true });
    if (container) resize.observe(container);
    update();
    return () => {
      observer.disconnect();
      resize.disconnect();
      container?.removeEventListener("scroll", update);
      document.removeEventListener("visibilitychange", listener);
    };
  }, [root]);
  useEffect(
    () => setUserPaused(!config.autoplay || reduced),
    [config.autoplay, reduced],
  );
  useEffect(() => {
    const el = video.current;
    if (!el) return;
    el.volume = sound.volume * config.volume;
    el.muted = actuallyMuted;
    if (
      active &&
      visible &&
      !paused &&
      !userPaused &&
      !comments &&
      !card.current?.closest(".scene-out,[inert]")
    ) {
      void el
        .play()
        .then(() => setBlocked(false))
        .catch(() => setBlocked(true));
    } else el.pause();
  }, [
    active,
    visible,
    paused,
    userPaused,
    comments,
    actuallyMuted,
    sound.volume,
    config.volume,
  ]);
  useEffect(() => {
    const element = video.current;
    return () => element?.pause();
  }, []);
  useEffect(() => {
    if (!config.comments) setComments(false);
  }, [config.comments]);
  useEffect(() => {
    if (!comments || !root.current) return;
    const container = root.current,
      old = container.style.overflowY;
    container.style.overflowY = "hidden";
    return () => {
      container.style.overflowY = old;
    };
  }, [comments, root]);
  return (
    <article ref={card} className="insta-card" aria-label={post.title}>
      <video
        ref={video}
        src={feedSource(post.video)}
        poster={feedSource(post.poster)}
        preload="metadata"
        loop
        playsInline
        muted={actuallyMuted}
        aria-label={post.title + " video"}
        onError={() => setFailed(true)}
      />
      <div className="insta-shade" />
      <div className="insta-video-controls">
        <button
          aria-label={(userPaused || blocked ? "Play " : "Pause ") + post.title}
          onClick={() => {
            setUserPaused((v) => (blocked ? false : !v));
            if (blocked && video.current)
              void video.current
                .play()
                .then(() => setBlocked(false))
                .catch(() => setBlocked(true));
          }}
          data-help="Pause or play this clip. Scrolling away, opening comments, hiding the tab or pausing the story stops it automatically."
        >
          {userPaused || blocked ? <Play size={16} /> : <Pause size={16} />}
        </button>
        <span>{Math.round(post.seconds)}s</span>
        <button
          aria-label={muted ? "Unmute feed videos" : "Mute feed videos"}
          aria-pressed={!muted}
          onClick={onMute}
          data-help="Toggle audio for the feed. The story’s master sound switch and volume still apply; videos begin muted to respect browser autoplay rules."
        >
          {actuallyMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      </div>
      {failed && (
        <p className="insta-media-error" role="status">
          This video could not be played. Check its format in Advanced devices →
          Insta feed.
        </p>
      )}
      <div className="insta-caption">
        <b>@{post.author}</b>
        <h3>{post.title}</h3>
        <p>{post.caption}</p>
      </div>
      <aside className="insta-actions">
        <button
          aria-label={(reaction.liked ? "Unlike " : "Like ") + post.title}
          aria-pressed={reaction.liked}
          onClick={onLike}
          data-help="Like or unlike this fictional post. Your like and the adjusted count stay saved on this browser and do not change the story route."
        >
          <Heart size={22} fill={reaction.liked ? "currentColor" : "none"} />
          <small>{post.likes + (reaction.liked ? 1 : 0)}</small>
        </button>
        {config.comments && (
          <button
            aria-label={"Comments on " + post.title}
            aria-expanded={comments}
            onClick={() => setComments(true)}
            data-help="Read fictional comments or leave a local reply. This never posts to Instagram or any real account."
          >
            <MessageCircle size={22} />
            <small>{post.comments.length + reaction.comments.length}</small>
          </button>
        )}
      </aside>
      {comments &&
        card.current?.closest(".device-shell") &&
        createPortal(
          <InstaComments
            title={post.title}
            rows={[...post.comments, ...reaction.comments]}
            draft={draft}
            onDraft={setDraft}
            onPost={() => {
              onComment(draft.trim());
              setDraft("");
            }}
            onClose={() => setComments(false)}
          />,
          card.current.closest(".device-shell")!,
        )}
    </article>
  );
}
