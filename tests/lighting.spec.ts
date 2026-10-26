import { test, expect } from "@playwright/test";

test("cafe light moves over the person and plant and respects reduced effects", async ({ page }) => {
  await page.goto("/");
  const person = page.locator(".cafe-person-shade");
  const plant = page.locator(".cafe-plant-shade");
  await expect(person).toBeVisible();
  await expect(plant).toBeVisible();
  const sample = async (progress: number) => page.evaluate((fraction) => {
    for (const animation of document.getAnimations()) {
      animation.pause();
      const duration = Number(animation.effect!.getTiming().duration);
      animation.currentTime = duration * fraction;
    }
    return [".cafe-person-shade", ".cafe-plant-shade"].map(selector =>
      getComputedStyle(document.querySelector(selector)!).transform);
  }, progress);
  const start = await sample(0);
  const middle = await sample(.5);
  expect(start[0]).not.toBe(middle[0]);
  expect(start[1]).not.toBe(middle[1]);
  await expect(person.locator("..")).toHaveAttribute("clip-path", "url(#cafePersonShade)");
  await expect(plant.locator("..")).toHaveAttribute("clip-path", "url(#cafePlantShade)");
  await page.screenshot({ path: "../cafe-light-preview.png", fullPage: true });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(person).toBeHidden();
  await expect(page.locator(".cafe-lamp-glow")).toHaveCSS("animation-name", "none");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.getByRole("checkbox", { name: "Reduced effects", exact: true }).check();
  await expect(person).toHaveCount(0);
  await expect(page.locator(".cafe-lamp-glow")).toHaveCSS("animation-name", "none");
});
