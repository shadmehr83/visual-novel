// Stillframe 3 (by Claude): the redesigned studio. Every studio can show it: index.html adds
// data-ui="v3" when the Stillframe 3 design is chosen, and the same components then render the
// Stillframe 3 shell and styles. The local Stillframe 3 build also marks the page with data-sf3.
const root = typeof document !== "undefined" ? document.documentElement : undefined;
// The local Stillframe 3 studio (localhost:5174), as opposed to the hosted studio and dev server.
export const STILLFRAME3 = !!root?.hasAttribute("data-sf3");
export const V3 = root?.dataset.ui === "v3";

export type Design = "v3" | "classic";
// Local Stillframe 3 opens the new design on every start; choosing classic lasts for this tab.
// Elsewhere the classic design opens unless this browser chose Stillframe 3, which is remembered.
export function chooseDesign(design: Design) {
  try {
    if (STILLFRAME3) {
      if (design === "classic") sessionStorage.setItem("stillframe3-design", "classic");
      else sessionStorage.removeItem("stillframe3-design");
    } else if (design === "v3") localStorage.setItem("stillframe-design", "v3");
    else localStorage.removeItem("stillframe-design");
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
