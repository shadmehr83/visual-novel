// Stillframe 3 (by Claude): the redesigned studio. index.html marks the page with data-sf3, and with
// data-ui="v3" unless this tab was switched to the classic design; the same components then render
// the Stillframe 3 shell and styles.
const root = typeof document !== "undefined" ? document.documentElement : undefined;
export const STILLFRAME3 = !!root?.hasAttribute("data-sf3");
export const V3 = root?.dataset.ui === "v3";

export type Design = "v3" | "classic";
// The classic design lasts for this browser tab only, so every new start opens Stillframe 3.
export function chooseDesign(design: Design) {
  try {
    if (design === "classic") sessionStorage.setItem("stillframe3-design", "classic");
    else sessionStorage.removeItem("stillframe3-design");
  } catch {
    /* without storage the page keeps its current design */
  }
  location.reload();
}

export type Palette = "light" | "dark";
export function savedPalette(): Palette {
  return root?.dataset.palette === "dark" ? "dark" : "light";
}
export function choosePalette(palette: Palette) {
  if (palette === "dark") root?.setAttribute("data-palette", "dark");
  else root?.removeAttribute("data-palette");
  try {
    localStorage.setItem("stillframe3-palette", palette);
  } catch {
    /* kept for this page only */
  }
}
