import { useEffect } from "react";
// Stillframe 3.1 (by Claude): shared studio behaviour for the redesign.
// Groups of controls in the inspector and the map details panel fold
// like components in a game-engine inspector. Each tab remembers which groups are open; the
// "All" effects view starts folded, so it reads as a short list of what the scene has.
const KEY = "stillframe3-folds";
const SECTIONS = ":is(.inspector, .flow-details) .property-section";
let saved: Record<string, boolean> = {};
try {
  saved = JSON.parse(localStorage.getItem(KEY) || "{}");
} catch {
  /* folds then reset on reload */
}
const headingOf = (section: Element) =>
  section.querySelector<HTMLElement>(":scope > :is(h2, h3)");
const nameOf = (heading: HTMLElement) =>
  (heading.firstChild?.textContent?.trim() || heading.textContent || "").replace(/\s+/g, " ").trim().slice(0, 60);
function viewOf(section: Element) {
  const host = section.closest<HTMLElement>("[data-inspector]");
  return host ? host.dataset.inspector + "/" + host.dataset.panel : "map";
}
function setOpen(section: HTMLElement, open: boolean) {
  section.dataset.v3Fold = open ? "open" : "closed";
  headingOf(section)?.setAttribute("aria-expanded", String(open));
}
function prepare() {
  document.querySelectorAll<HTMLElement>(SECTIONS).forEach((section) => {
    const heading = headingOf(section);
    if (!heading) return;
    const view = viewOf(section);
    const key = view + "|" + nameOf(heading);
    if (section.dataset.v3Key === key) return;
    section.dataset.v3Key = key;
    heading.setAttribute("role", "button");
    heading.tabIndex = 0;
    heading.dataset.help ||= "Fold or unfold " + nameOf(heading) + ". Stillframe 3 remembers this for the current tab.";
    setOpen(section, saved[key] ?? view !== "Atmosphere/All");
  });
}
function toggle(heading: HTMLElement) {
  const section = heading.parentElement!;
  const open = section.dataset.v3Fold !== "open";
  setOpen(section, open);
  saved[section.dataset.v3Key!] = open;
  try {
    localStorage.setItem(KEY, JSON.stringify(saved));
  } catch {
    /* kept for this page only */
  }
}
// Opens every folded group around a control, e.g. one found with Search features.
export function unfoldAround(element: Element) {
  for (let p = element.parentElement; p; p = p.parentElement)
    if (p.dataset.v3Fold === "closed") setOpen(p, true);
}
const headingTarget = (event: Event) => {
  const target = event.target as Element;
  if (target.closest?.("input, button, select, label, a, textarea")) return null;
  const heading = target.closest?.<HTMLElement>(":is(h2, h3)[role=button]");
  return heading?.parentElement?.matches(SECTIONS) ? heading : null;
};
export function useFolds(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(prepare);
    };
    schedule();
    // Changes inside the playing scene never add control groups, so they are skipped.
    const observer = new MutationObserver((records) => {
      if (records.some((r) => !(r.target as HTMLElement).closest?.(".stage-frame"))) schedule();
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-panel", "data-inspector"] });
    // Popover menus (V3Popover) close on an outside click, on Escape, or after one of their buttons runs.
    const closeMenus = (keep?: Element) =>
      document.querySelectorAll("details[data-v3-popover][open]").forEach((menu) => {
        if (!keep || !menu.contains(keep)) menu.removeAttribute("open");
      });
    const click = (event: MouseEvent) => {
      const heading = headingTarget(event);
      if (heading) toggle(heading);
      const target = event.target as Element;
      const menu = target.closest?.("details[data-v3-popover]");
      if (menu && target.closest(".v3-popover-menu button")) menu.removeAttribute("open");
    };
    const press = (event: PointerEvent) => closeMenus(event.target as Element);
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenus();
      if (event.key !== "Enter" && event.key !== " ") return;
      const heading = headingTarget(event);
      if (!heading || event.target !== heading) return;
      event.preventDefault();
      toggle(heading);
    };
    document.addEventListener("click", click);
    document.addEventListener("pointerdown", press);
    document.addEventListener("keydown", key);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener("click", click);
      document.removeEventListener("pointerdown", press);
      document.removeEventListener("keydown", key);
    };
  }, [enabled]);
}
