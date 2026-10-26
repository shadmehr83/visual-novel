import { test, expect } from "@playwright/test";

test("cafe light moves over the person and plant and respects reduced effects", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /stillframe/i }).click();
  await page.getByRole("button", { name: "Load opening demo", exact: true }).click();
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


test("editable lighting loop runs without rain, persists and can be stopped", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("checkbox", { name: "Falling rain", exact: true }).uncheck();
  await page.getByLabel("Seconds per step", { exact: true }).fill("0.5");
  const sequence = page.getByLabel("Intensity sequence", { exact: true });
  await sequence.fill("0, 9");
  await page.getByRole("button", { name: "Apply light sequence" }).click();
  await expect(page.getByRole("alert")).toContainText("from 0 to 2");
  await sequence.fill("0, 2, 1");
  await page.getByRole("button", { name: "Apply light sequence" }).click();
  const stage = page.getByRole("img", { name: "A table by the window live stage" });
  await expect.poll(async () => Number(await stage.getAttribute("data-light-level")), { intervals: [50] }).toBeGreaterThan(1.5);
  await expect.poll(async () => Number(await stage.getAttribute("data-light-level")), { intervals: [50] }).toBeLessThan(.3);
  await expect(page.getByText("Saved on this device", { exact: true })).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: /A table by the window.*dialogue nodes/ }).click();
  await expect(sequence).toHaveValue("0, 2, 1");
  await expect(page.getByLabel("Seconds per step", { exact: true })).toHaveValue("0.5");
  await expect(page.getByRole("checkbox", { name: "Falling rain", exact: true })).not.toBeChecked();
  await page.getByRole("checkbox", { name: "Loop lighting", exact: true }).uncheck();
  await expect(stage).toHaveAttribute("data-light-level", "1");
  await expect(page.locator(".cafe-person-shade")).toHaveCount(0);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(page.getByRole("checkbox", { name: "Loop lighting", exact: true })).toBeChecked();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(stage).toHaveAttribute("data-light-level", "1");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect.poll(async () => Number(await stage.getAttribute("data-light-level")), { intervals: [50] }).toBeGreaterThan(1.5);
  await page.getByRole("checkbox", { name: "Reduced effects", exact: true }).check();
  await expect(stage).toHaveAttribute("data-light-level", "1");
  await page.getByRole("button", { name: "Disable all effects", exact: true }).click();
  await expect(page.getByRole("checkbox", { name: "Loop lighting", exact: true })).not.toBeChecked();
});
