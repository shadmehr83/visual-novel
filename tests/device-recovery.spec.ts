import { test, expect, type Page } from "@playwright/test";
import { demo } from "../src/demo";
import { deviceAppearanceSchema } from "../src/model";
function fixture() {
  const p = demo();
  p.scenes = p.scenes.slice(0, 2);
  p.scenes[0].nodes = [
    {
      id: "intro",
      speaker: "Narrator",
      text: "First scene",
      choices: [
        {
          id: "device",
          text: "Enter device",
          target: p.scenes[1].id,
          actions: [],
          note: "",
        },
      ],
    },
  ];
  p.scenes[0].exitTransition = { style: "slide", seconds: 0.2 };
  const s = p.scenes[1];
  s.title = "Device test";
  s.effects.rain = false;
  s.transition = { style: "cut", seconds: 0.1 };
  s.phone = {
    enabled: true,
    mode: "phone-system",
    defaultScreen: "feed",
    device: "phone",
    contact: "Maria",
    title: "Ember",
    avatar: null,
    x: 65,
    y: 50,
    width: 44,
    entrance: { style: "cut", seconds: 0.1 },
    typingSeconds: 0,
    keyboard: false,
    appearance: deviceAppearanceSchema.parse({}),
  };
  p.scenes[0].phone = structuredClone(s.phone);
  p.scenes[0].nodes[0].deviceScreen = "off";
  s.nodes = [
    {
      id: "feed1",
      speaker: "Narrator",
      text: "Browsing one",
      next: "feed2",
      deviceScreen: "feed",
      choices: [],
    },
    {
      id: "feed2",
      speaker: "Maria",
      text: "A message arrives",
      deviceScreen: "feed",
      next: "timed",
      choices: [],
      allowCustomResponse: false,
      allowPhoneCustomResponse: true,
    },
    {
      id: "timed",
      speaker: "Narrator",
      text: "Wait for it",
      choices: [],
      qte: {
        prompt: "Do not time out while paused",
        seconds: 2,
        success: "end",
        timeout: "end",
      },
    },
    { id: "end", speaker: "Narrator", text: "Finished", choices: [] },
  ];
  return p;
}
async function load(page: Page, p = fixture()) {
  await page.goto("/");
  await page.locator('input[accept=".json"]').setInputFiles({
    name: "devices.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(p)),
  });
  await expect(page.getByLabel("Project title")).toHaveValue(p.title);
  await expect(page.getByRole("alert")).toHaveCount(0);
}
test("second-scene playback, app browsing, device settings, pause and Escape remain recoverable", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await load(page);
  await page.getByRole("button", { name: "Play story", exact: true }).click();
  await page
    .locator(".dialogue-overlay")
    .getByRole("button", { name: "Enter device", exact: true })
    .click();
  await expect(page.getByLabel("Insta scrolling feed")).toBeVisible();
  await expect(page.locator(".scene-in")).toHaveClass(/scene-in-slide/);
  await page.getByLabel("Back to phone home", { exact: true }).click();
  await page
    .locator(".phone-app-grid")
    .getByRole("button", { name: /Ember/ })
    .click();
  await expect(page.locator(".device-feed")).toBeVisible();
  await page
    .locator(".device-actions")
    .getByRole("button", { name: "Continue", exact: true })
    .click();
  await expect(page.locator(".device-feed")).toBeVisible();
  await expect(page.getByLabel("Insta scrolling feed")).toHaveCount(0);
  await page.getByLabel("Back to phone home", { exact: true }).click();
  await page
    .locator(".phone-app-grid")
    .getByRole("button", { name: /Settings/ })
    .click();
  await expect(page.locator(".phone-settings-screen")).toBeVisible();
  await page
    .locator(".phone-settings-screen")
    .getByLabel("Device text size", { exact: true })
    .fill("17");
  await expect(page.locator(".device-overlay")).toHaveCSS(
    "--device-size",
    "17px",
  );
  await page.getByRole("button", { name: "Pause menu", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Pause menu" })).toBeVisible();
  await page.getByRole("button", { name: "Resume story", exact: true }).click();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Play story", exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("item creation without pre-existing choices opens direct upload and split docks scroll independently", async ({
  page,
}) => {
  const p = fixture();
  p.scenes[0].nodes[0].choices = [];
  await load(page, p);
  await page
    .getByRole("button", { name: "Outfits & Items", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Add item picker", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Add item for current dialogue", exact: true })
    .click();
  const file = page.getByLabel("Upload image for New item");
  await expect(file).toBeVisible();
  await file.setInputFiles({
    name: "item.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jh1sAAAAASUVORK5CYII=",
      "base64",
    ),
  });
  await expect(page.locator(".item-author-thumbnail")).toBeVisible();
  await expect(page.getByRole("alert")).toHaveCount(0);
  await page.getByLabel("Separate controls and properties docks").check();
  await expect(page.locator(".workspace")).toHaveClass(/split-docks/);
  const boxes = await page
    .locator(".inspector > :is(.effects-dock,.properties-dock)")
    .evaluateAll((els) =>
      els.map((el) => ({
        left: el.getBoundingClientRect().left,
        overflow: getComputedStyle(el).overflowY,
      })),
    );
  expect(boxes[0].left).toBeLessThan(boxes[1].left);
  expect(boxes.map((b) => b.overflow)).toEqual(["auto", "auto"]);
  await page.getByLabel("Separate controls and properties docks").uncheck();
  await page.getByRole("button",{name:"Active",exact:true}).click();
  await expect(page.getByLabel("Enable Device UI",{exact:true})).toBeVisible();
  await page.getByLabel("Enable Device UI",{exact:true}).uncheck();
  await expect(page.getByLabel("Enable Device UI",{exact:true})).not.toBeChecked();
});
test("pause freezes timed choices until resumed", async ({ page }) => {
  const p = fixture();
  p.scenes = [p.scenes[1]];
  p.scenes[0].nodes = p.scenes[0].nodes.slice(2);
  await load(page, p);
  await page.getByRole("button", { name: "Play story", exact: true }).click();
  await page.getByRole("button", { name: "Pause menu", exact: true }).click();
  const before = await page.locator(".qte progress").getAttribute("value");
  await page.waitForTimeout(2300);
  expect(await page.locator(".qte progress").getAttribute("value")).toBe(
    before,
  );
  await page.getByRole("button", { name: "Resume story", exact: true }).click();
  await expect(page.locator(".device-actions")).toContainText("Finished", {
    timeout: 4000,
  });
});
