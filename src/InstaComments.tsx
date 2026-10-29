import { useEffect, useRef, useState } from "react";
import { Send, X } from "lucide-react";
type Comment = { id: string; author: string; text: string };
export const commentSheetHeight = (
  start: number,
  delta: number,
  parentHeight: number,
) =>
  Math.max(
    38,
    Math.min(100, start - (delta / Math.max(1, parentHeight)) * 100),
  );
export function InstaComments({
  title,
  rows,
  draft,
  onDraft,
  onPost,
  onClose,
}: {
  title: string;
  rows: Comment[];
  draft: string;
  onDraft: (text: string) => void;
  onPost: () => void;
  onClose: () => void;
}) {
  const sheet = useRef<HTMLElement>(null),
    list = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(70),
    [dragging, setDragging] = useState(false);
  const resize = useRef<{
    start: number;
    y: number;
    parentHeight: number;
  } | null>(null);
  const scroll = useRef<{ y: number; top: number; active: boolean } | null>(
    null,
  );
  const lastRows = useRef(rows.length);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    sheet.current
      ?.querySelector<HTMLElement>("[role=slider]")
      ?.focus({ preventScroll: true });
    return () => {
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, []);
  useEffect(() => {
    if (rows.length > lastRows.current)
      list.current?.scrollTo({
        top: list.current.scrollHeight,
        behavior: "smooth",
      });
    lastRows.current = rows.length;
  }, [rows.length]);
  useEffect(() => {
    if (!draft) {
      const input = sheet.current?.querySelector("textarea");
      if (input) input.style.height = "28px";
    }
  }, [draft]);
  return (
    <section
      ref={sheet}
      className={"insta-comments" + (dragging ? " comments-dragging" : "")}
      role="dialog"
      aria-modal="true"
      aria-label={"Comments on " + title}
      data-no-advance
      style={{ height: height + "%" }}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          onClose();
        }
        if (e.key === "Tab") {
          const items = [
              ...sheet.current!.querySelectorAll<HTMLElement>(
                'button:not(:disabled),textarea,[tabindex="0"]',
              ),
            ],
            first = items[0],
            last = items.at(-1);
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }
      }}
    >
      <div
        className="insta-comments-handle"
        role="slider"
        tabIndex={0}
        aria-label="Comments sheet height"
        aria-orientation="vertical"
        aria-valuemin={38}
        aria-valuemax={100}
        aria-valuenow={Math.round(height)}
        aria-valuetext={Math.round(height) + " percent of phone height"}
        data-help="Drag up to expand comments to the top of the phone, or down to shrink them. Arrow Up/Down adjusts the height; Home expands fully. Drag inside the comment list to scroll it like a finger."
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          e.preventDefault();
          e.currentTarget.setPointerCapture(e.pointerId);
          resize.current = {
            start: height,
            y: e.clientY,
            parentHeight:
              sheet.current!.parentElement!.getBoundingClientRect().height,
          };
          setDragging(true);
        }}
        onPointerMove={(e) => {
          const r = resize.current;
          if (r)
            setHeight(
              commentSheetHeight(r.start, e.clientY - r.y, r.parentHeight),
            );
        }}
        onPointerUp={() => {
          resize.current = null;
          setDragging(false);
        }}
        onPointerCancel={() => {
          resize.current = null;
          setDragging(false);
        }}
        onKeyDown={(e) => {
          if (["ArrowUp", "ArrowDown", "Home", "End"].includes(e.key)) {
            e.preventDefault();
            setHeight((h) =>
              e.key === "Home"
                ? 100
                : e.key === "End"
                  ? 38
                  : Math.max(
                      38,
                      Math.min(100, h + (e.key === "ArrowUp" ? 5 : -5)),
                    ),
            );
          }
        }}
      >
        <span />
        <div className="insta-comments-title">
          <b>
            Comments <small>{rows.length}</small>
          </b>
        </div>
      </div>
      <button
        className="insta-comments-close"
        aria-label="Close comments"
        onClick={onClose}
      >
        <X size={14} />
      </button>
      <p className="insta-fiction">Fictional · replies stay on this device</p>
      <div
        ref={list}
        className="insta-comment-list"
        aria-label="Comment list"
        tabIndex={0}
        onPointerDown={(e) => {
          if (e.pointerType !== "mouse" || e.button !== 0) return;
          scroll.current = {
            y: e.clientY,
            top: e.currentTarget.scrollTop,
            active: false,
          };
        }}
        onPointerMove={(e) => {
          const r = scroll.current;
          if (!r) return;
          const dy = e.clientY - r.y;
          if (!r.active && Math.abs(dy) > 4) {
            r.active = true;
            e.currentTarget.setPointerCapture(e.pointerId);
          }
          if (r.active) {
            e.preventDefault();
            e.currentTarget.scrollTop = r.top - dy;
          }
        }}
        onPointerUp={() => {
          scroll.current = null;
        }}
        onPointerCancel={() => {
          scroll.current = null;
        }}
      >
        {rows.map((c) => (
          <div className="insta-comment" key={c.id}>
            <b>@{c.author}</b>
            <p>{c.text}</p>
          </div>
        ))}
      </div>
      <form
        className="insta-comment-composer"
        onSubmit={(e) => {
          e.preventDefault();
          if (draft.trim()) onPost();
        }}
      >
        <textarea
          rows={1}
          aria-label="Your Insta comment"
          placeholder="Add a comment…"
          maxLength={400}
          value={draft}
          onChange={(e) => onDraft(e.target.value)}
          onInput={(e) => {
            e.currentTarget.style.height = "28px";
            e.currentTarget.style.height =
              Math.min(56, e.currentTarget.scrollHeight) + "px";
          }}
        />
        <button
          type="submit"
          aria-label="Post locally"
          title="Post locally"
          disabled={!draft.trim()}
        >
          <Send size={14} />
        </button>
      </form>
    </section>
  );
}
