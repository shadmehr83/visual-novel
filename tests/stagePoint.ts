import type { Locator } from "@playwright/test";
// The user can resize the stage. Choose image-relative points instead of pixel
// offsets that can land outside the SVG in a smaller pinned workspace.
export async function clickScenePoint(stage: Locator, x: number, y: number) {
  const bounds = await stage.boundingBox();
  if (!bounds) throw Error("Stage is not visible");
  await stage.click({
    position: { x: bounds.width * x, y: bounds.height * y },
  });
}
