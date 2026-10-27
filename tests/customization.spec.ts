import { test, expect } from "@playwright/test";
test("story collapses, dividers resize, layout modes restore page scrolling and appearance persists", async ({
  page,
}) => {
  test.setTimeout(60000); // Multiple layout modes, artwork reloads and playback in one integration check.
  await page.setViewportSize({ width: 1600, height: 1100 });
  await page.goto("/");
  const main = page.locator(".workspace>main");
  const initial = await main.boundingBox();
  await page.getByRole("button", { name: "Collapse story library" }).click();
  await expect(page.locator(".library")).toBeHidden();
  expect((await main.boundingBox())!.width).toBeGreaterThan(
    initial!.width + 150,
  );
  await page.getByRole("button", { name: "Expand story library" }).click();
  const resize = page.getByRole("separator", { name: "Resize story library" });
  const box = await resize.boundingBox();
  await page.mouse.move(box!.x + 3, box!.y + 30);
  await page.mouse.down();
  await page.mouse.move(box!.x + 70, box!.y + 30);
  await page.mouse.up();
  expect((await page.locator(".library").boundingBox())!.width).toBeGreaterThan(
    280,
  );
  const vertical = page.getByRole("separator", {
    name: "Resize dialogue panel",
  });
  await vertical.focus();
  await vertical.press("ArrowUp");
  await expect(vertical).toHaveAttribute("aria-valuenow", "210");
  await page.getByRole("button", { name: "Layout", exact: true }).click();
  const inspector = page.locator(".inspector");
  const preview = page.locator(".stage");
  const fitted = (await preview.boundingBox())!.width;
  await inspector
    .getByLabel("Editor preview zoom", { exact: true })
    .fill("1.5");
  await expect
    .poll(async () => (await preview.boundingBox())!.width)
    .toBeGreaterThan(fitted * 1.3);
  await expect(page.locator("[data-camera-transform]")).toHaveAttribute(
    "data-camera-transform",
    "none",
  );
  await inspector.getByLabel("Editor preview zoom", { exact: true }).fill("1");
  await page.getByRole('button',{name:'Collapse dialogue editor',exact:true}).click();
  await inspector.getByLabel("Dialogue layout").selectOption("page");
  await expect(page.locator('.node-fields')).toBeVisible();
  await expect(page.locator(".app")).toHaveClass(/page-layout/);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollHeight > innerHeight,
    ),
  ).toBe(true);
  await inspector.getByLabel("Dialogue layout").selectOption("hidden");
  await expect(page.locator(".bottom-panel")).toBeHidden();
  await inspector.getByLabel("Dialogue layout").selectOption("pinned");
  await expect(page.locator(".bottom-panel")).toBeVisible();
  await page
    .locator(".workspace-toolbar")
    .getByRole("button", { name: "Appearance", exact: true })
    .click();
  await inspector.getByLabel("Interface theme").selectOption("light");
  await expect(page.locator(".app")).toHaveAttribute("data-theme", "light");
  await inspector.getByLabel("inspector background colour").fill("#ffffff");
  expect(
    await inspector.evaluate((el) => getComputedStyle(el).backgroundColor),
  ).toBe("rgb(255, 255, 255)");
  await page.reload();
  await expect(page.locator(".app")).toHaveAttribute("data-theme", "light");
  await page
    .locator(".workspace-toolbar")
    .getByRole("button", { name: "Appearance", exact: true })
    .click();
  await expect(inspector.getByLabel("inspector background colour")).toHaveValue(
    "#ffffff",
  );
  await page.getByRole("button", { name: "Play story", exact: true }).click();
  await page.getByRole("button", { name: "Layout", exact: true }).click();
  await inspector.getByLabel("Dialogue layout").selectOption("hidden");
  await expect(page.locator(".bottom-panel")).toBeHidden();
});
test("camera zoom, walking audio, hover help and enabled effect count work", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const Native = window.AudioContext;
    (window as any).stepSounds = 0;
    (window as any).AudioContext = class extends Native {
      createBufferSource() {
        (window as any).stepSounds++;
        return super.createBufferSource();
      }
    };
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  const panels = page.getByRole("group", { name: "Effect panels" });
  await panels.getByRole("button", { name: "Camera", exact: true }).click();
  await page
    .getByRole("button", { name: "Enable camera", exact: true })
    .click();
  await page.getByLabel("Camera duration", { exact: true }).fill("1");
  await page.getByLabel("Camera zoom", { exact: true }).fill("1.8");
  await page.getByLabel("Camera bob", { exact: true }).fill("5");
  await page
    .getByRole("checkbox", { name: "Generated footsteps", exact: true })
    .check();
  await page.getByLabel("Camera zoom", { exact: true }).hover();
  await expect(page.getByRole("tooltip")).toContainText(
    "Zoom crops the existing artwork",
  );
  await page.keyboard.press("Escape");
  await expect(page.getByRole("tooltip")).toHaveCount(0);
  const camera = page.locator("[data-camera-transform]");
  await expect.poll(() => camera.getAttribute("transform")).toContain("1.8");
  await expect(
    page.getByText("Saved on this device", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await panels.getByRole("button", { name: "Camera", exact: true }).click();
  await expect(page.getByLabel("Camera zoom", { exact: true })).toHaveValue(
    "1.8",
  );
  await page
    .getByRole("button", { name: "Enabled effects", exact: true })
    .click();
  await expect(
    page.getByText("Camera approach", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Walking bob / sway", { exact: true }),
  ).toBeVisible();
  expect(await page.evaluate(() => (window as any).stepSounds)).toBe(0);
  await page.getByRole("button", { name: "Play from beginning" }).click();
  await page
    .getByRole("button", { name: /A table by the window.*dialogue nodes/ })
    .click();
  await page
    .getByRole("button", { name: "Enable scene sound", exact: true })
    .click();
  await expect
    .poll(() => page.evaluate(() => (window as any).stepSounds))
    .toBeGreaterThan(0);
});
