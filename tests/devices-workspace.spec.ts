import { test, expect, type Page } from "@playwright/test";
import { demo } from "../src/demo";
import { makeDevice } from "../src/deviceFrame";
async function load(page: Page) {
  const p = demo();
  p.scenes = p.scenes.slice(0, 1);
  const s = p.scenes[0];
  s.nodes = [
    { id: "start", speaker: "Narrator", text: "A quiet room", choices: [] },
  ];
  s.effects.rain = false;
  s.phone = makeDevice(s);
  s.phone.entrance = { style: "cut", seconds: 0.1 };
  s.phone.typingSeconds = 0;
  await page.goto("/");
  await page.locator('input[accept=".json"]').setInputFiles({
    name: "devices.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(p)),
  });
  await expect(page.getByLabel("Project title")).toHaveValue(p.title);
  await expect(page.locator(".scene-in .stage")).toBeVisible();
}
test("advanced device controls resize one edge, retain Home and scrolling Insta, and support computers", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await load(page);
  await page
    .getByRole("tab", { name: "Advanced devices", exact: true })
    .click();
  const device = page.locator(".device-live-preview .device-overlay");
  let a = await device.boundingBox();
  await page.getByLabel("Device width exact value", { exact: true }).fill("35");
  let b = await device.boundingBox();
  expect(Math.abs(a!.x - b!.x)).toBeLessThan(1);
  expect(Math.abs(a!.y - b!.y)).toBeLessThan(1);
  expect(Math.abs(a!.height - b!.height)).toBeLessThan(1);
  expect(b!.width).toBeGreaterThan(a!.width);
  await page
    .locator(".device-preview-apps")
    .getByRole("button", { name: "Insta", exact: true })
    .click();
  const feed = page.getByLabel("Insta scrolling feed");
  await expect(feed).toBeVisible();
  await feed.evaluate((e) => {
    e.scrollTop = 200;
  });
  await expect.poll(() => feed.evaluate((e) => e.scrollTop)).toBeGreaterThan(0);
  await page.getByLabel("Back to phone home", { exact: true }).click();
  await expect(page.locator(".phone-app-grid")).toContainText("Ember");
  await page
    .locator(".phone-app-grid")
    .getByRole("button", { name: /Settings/ })
    .click();
  await expect(page.locator(".phone-settings-screen")).toBeVisible();
  await page
    .getByLabel("Device shape", { exact: true })
    .selectOption("desktop");
  await expect(device).toHaveClass(/device-desktop/);
  await page.getByRole("button", { name: "Apps", exact: true }).click();
  await page
    .getByRole("button", { name: "Add app shortcut", exact: true })
    .click();
  await page.getByLabel("App name", { exact: true }).fill("My gallery");
  await page.getByLabel("Back to phone home", { exact: true }).click();
  await expect(page.locator(".phone-app-grid")).toContainText("My gallery");
  expect(errors).toEqual([]);
});
test("the preview window unlocks, expands the actual stage, locks and retains its layout", async ({
  page,
}) => {
  await load(page);
  const pane = page.locator(".preview-area"),
    stage = page.locator(".scene-in .stage");
  const before = await stage.boundingBox();
  await page.getByLabel("Unlock game preview window", { exact: true }).click();
  await expect(
    page.getByLabel("Resize game preview window", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Fill preview space", exact: true })
    .click();
  await expect
    .poll(async () => Math.round((await stage.boundingBox())!.width))
    .toBeGreaterThan(Math.round(before!.width) + 40);
  const box = await pane.boundingBox();
  await page.getByLabel("Lock game preview window", { exact: true }).click();
  await expect(
    page.getByLabel("Resize game preview window", { exact: true }),
  ).toHaveCount(0);
  await page.reload();
  await expect(
    page.getByLabel("Unlock game preview window", { exact: true }),
  ).toBeVisible();
  expect(
    Math.abs((await pane.boundingBox())!.height - box!.height),
  ).toBeLessThan(3);
  await page
    .getByRole("button", { name: "Reset preview window", exact: true })
    .click();
  await expect(page.locator(".workspace")).not.toHaveClass(/preview-custom/);
});
test("the saved three-outfit picker still inspects and confirms a real outfit, with editing in the dialogue panel", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1500, height: 1000 });
  await page.goto("/?snapshot=github");
  await page
    .getByRole("button", { name: /Getting ready.*dialogue nodes/ })
    .click();
  await page
    .locator(".bottom-tabs")
    .getByRole("button", { name: "Items & outfits", exact: true })
    .click();
  await expect(page.locator(".item-author-cards button")).toHaveCount(3);
  await expect(page.locator(".item-grid button")).toHaveCount(3);
  await page.getByRole("button", { name: "Play story", exact: true }).click();
  await page
    .getByRole("button", { name: /Getting ready.*dialogue nodes/ })
    .click();
  await page
    .getByRole("region", { name: "Item selection" })
    .getByRole("button", { name: /Familiar hoodie/ })
    .click();
  await expect(page.locator(".item-detail")).toContainText("hoodie, jeans");
  await page
    .getByRole("button", { name: "See other options", exact: true })
    .click();
  await page
    .getByRole("region", { name: "Item selection" })
    .getByRole("button", { name: /Comfortable knit/ })
    .click();
  await page
    .getByRole("button", { name: "Choose Comfortable knit", exact: true })
    .click();
  await expect(
    page.getByRole("region", { name: "Item selection" }),
  ).toHaveCount(0);
  await expect(page.locator(".dialogue-overlay")).toBeVisible();
  await page.keyboard.press("Escape");
  await page
    .locator(".bottom-tabs")
    .getByRole("button", { name: "Dialogue", exact: true })
    .click();
  await expect(page.getByLabel("Dialogue text", { exact: true })).toBeVisible();
});
