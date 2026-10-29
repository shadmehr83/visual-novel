import { useEffect, useState } from "react";
export function FullscreenButton() {
  const [full, setFull] = useState(false);
  useEffect(() => {
    const changed = () =>
      setFull(
        !!document.fullscreenElement ||
          !!document.querySelector(".presentation"),
      );
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        document
          .querySelector(".presentation")
          ?.classList.remove("presentation");
        changed();
      }
    };
    changed();
    document.addEventListener("fullscreenchange", changed);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("fullscreenchange", changed);
      document.removeEventListener("keydown", escape);
    };
  }, []);
  return (
    <button
      type="button"
      data-help="Fill the screen with the game, or return to the normal browser view. Open Pause menu again to exit fullscreen; browser and system exit gestures also work."
      onClick={async (e) => {
        const area = e.currentTarget.closest<HTMLElement>(
          ".preview-area, .standalone-experience",
        );
        if (!area) return;
        if (document.fullscreenElement) {
          await document.exitFullscreen();
          return;
        }
        if (area.classList.contains("presentation")) {
          area.classList.remove("presentation");
          setFull(false);
          return;
        }
        try {
          await area.requestFullscreen();
        } catch {
          area.classList.add("presentation");
          setFull(true);
        }
      }}
    >
      {full ? "Exit fullscreen" : "Fullscreen"}
    </button>
  );
}
