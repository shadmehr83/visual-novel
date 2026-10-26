import { test, expect } from "@playwright/test";
test("inspector scroll stays independent, panels filter and dock, and floating window can move", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const stage = page.locator(".stage");
  const before = await stage.boundingBox();
  await page
    .getByRole("button", { name: "Add global light", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Add global light", exact: true })
    .click();
  await page.locator(".inspector").hover();
  await page.mouse.wheel(0, 1800);
  await expect
    .poll(() => page.locator(".inspector").evaluate((el) => el.scrollTop))
    .toBeGreaterThan(500);
  const after = await stage.boundingBox();
  expect(after!.y).toBeCloseTo(before!.y, 0);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  expect(after!.y + after!.height).toBeLessThan(900);
  await page
    .getByRole("group", { name: "Effect panels" })
    .getByRole("button", { name: "Rain", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Add rain zone", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Add local light", exact: true }),
  ).toBeHidden();
  await page.getByLabel("Controls placement").selectOption("left");
  const left = await page.locator(".inspector").boundingBox();
  const scene = await stage.boundingBox();
  expect(left!.x).toBeLessThan(scene!.x);
  await page.getByLabel("Controls placement").selectOption("float");
  const floating = await page.locator(".inspector").boundingBox();
  const handle = page.getByRole("button", { name: "Drag controls" });
  const box = await handle.boundingBox();
  await page.mouse.move(box!.x + 15, box!.y + 10);
  await page.mouse.down();
  await page.mouse.move(box!.x - 150, box!.y + 40);
  await page.mouse.up();
  const moved = await page.locator(".inspector").boundingBox();
  expect(moved!.x).toBeLessThan(floating!.x - 100);
  await page.getByRole("button", { name: "Reset panels" }).click();
  await expect(page.getByLabel("Controls placement")).toHaveValue("right");
});
test("light wand supports full selected-area coverage and motion zones animate, pause and reload", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  const panels = page.getByRole("group", { name: "Effect panels" });
  await panels.getByRole("button", { name: "Lighting", exact: true }).click();
  await page
    .getByRole("button", { name: "Add local light", exact: true })
    .click();
  await page
    .getByLabel("Local candle light coverage", { exact: true })
    .selectOption("region");
  const light = page
    .locator('[data-effect-panel="Lighting"] .clue')
    .filter({ has: page.getByLabel("Local candle light coverage") });
  await light.getByRole("button", { name: "Magic wand", exact: true }).click();
  const stage = page.getByRole("img", {
    name: "A table by the window live stage",
  });
  await stage.click({ position: { x: 150, y: 80 } });
  await expect(
    light.getByText("Auto-selected region", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Finish zone editing" }).click();
  await expect(page.locator('mask[id^="zone-radius-"] rect')).toHaveCount(1);
  await expect(page.locator('mask[id^="zone-radius-"] ellipse')).toHaveCount(0);
  await panels.getByRole("button", { name: "Motion", exact: true }).click();
  await page.getByRole("button", { name: "Add motion zone" }).click();
  const motion = page.locator('[data-effect-panel="Motion"] .clue');
  await motion.getByRole("button", { name: "Magic wand", exact: true }).click();
  await stage.click({ position: { x: 180, y: 100 } });
  await expect(
    motion.getByText("Auto-selected region", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Finish zone editing" }).click();
  const moving = page.locator("[data-motion-zone]");
  const offset = await moving.getAttribute("data-motion-offset");
  await expect
    .poll(() => moving.getAttribute("data-motion-offset"))
    .not.toBe(offset);
  await page
    .getByRole("checkbox", { name: "Reduced effects", exact: true })
    .check();
  await expect(moving).toHaveAttribute("data-motion-offset", "0");
  await expect(
    page.getByText("Saved on this device", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await panels.getByRole("button", { name: "Motion", exact: true }).click();
  await expect(
    page.getByLabel("Gentle sway strength", { exact: true }),
  ).toHaveValue("4");
  await expect(page.locator('mask[id^="motion-mask-"] path')).toHaveCount(1);
});
