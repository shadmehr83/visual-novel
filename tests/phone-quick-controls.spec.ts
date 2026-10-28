import { test, expect, type Page } from "@playwright/test";
import { demo } from "../src/demo";
import { validateProject } from "../src/model";
import { makeDevice } from "../src/deviceFrame";
async function load(page: Page) {
  const p = demo();
  p.id = "phone-quick-fixture";
  p.title = "Phone quick controls";
  p.assets = [
    {
      id: "face",
      name: "Contact face",
      mime: "image/png",
      width: 1,
      height: 1,
      tags: "",
      notes: "",
      approved: true,
      reference: false,
      data: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aT1cAAAAASUVORK5CYII=",
    },
  ];
  p.scenes = p.scenes.slice(0, 1);
  const s = p.scenes[0];
  s.entry = [];
  s.nodes = [
    {
      id: "start",
      speaker: "Narrator",
      text: "Check the phone here.",
      choices: [],
      next: "end",
    },
    {
      id: "end",
      speaker: "Narrator",
      text: "Phone is away.",
      choices: [],
      deviceVisible: false,
    },
  ];
  s.phone = makeDevice(s);
  s.phone.enabled = false;
  s.phone.schedule = {
    start: "end",
    end: "end",
    screen: "home",
    advanced: false,
  };
  s.phone.entrance = { style: "cut", seconds: 0.1 };
  s.phone.typingSeconds = 0;
  s.phone.avatar = "face";
  const b = structuredClone(s);
  b.id = "other";
  b.title = "Second room";
  delete b.phone;
  p.scenes.push(b);
  validateProject(p);
  await page.goto("/");
  await page
    .locator('input[accept=".json"]')
    .setInputFiles({
      name: "quick.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(p)),
    });
  await expect(page.getByLabel("Project title")).toHaveValue(p.title);
}
test.use({ viewport: { width: 1800, height: 1150 } });
test("dialogue map quick switches override ranges, show separate or integrated dialogue and persist on reload", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await load(page);
  await page
    .getByRole("tab", { name: "Dialogue advanced", exact: true })
    .click();
  const quick = page.getByRole("region", {
    name: "Phone for selected dialogue",
  });
  await quick
    .getByLabel("Phone visible on this dialogue", { exact: true })
    .check();
  await quick
    .getByLabel("Dialogue separate from phone", { exact: true })
    .check();
  await quick
    .getByLabel("Quick phone app", { exact: true })
    .selectOption("feed");
  await page.getByRole("tab", { name: "Editor", exact: true }).click();
  await expect(
    page.locator(".scene-in").getByLabel("Insta scrolling feed"),
  ).toBeVisible();
  await expect(page.locator(".scene-in .device-story-progress")).toContainText(
    "Check the phone here.",
  );
  await page
    .locator(".effect-tabs")
    .getByRole("button", { name: "Phone", exact: true })
    .click();
  await expect(
    page
      .locator(".effect-tabs")
      .getByRole("button", { name: "Phone", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    page
      .locator(".inspector-tabs")
      .getByRole("button", { name: "Atmosphere", exact: true }),
  ).toHaveAttribute("aria-pressed", "false");
  const simple = page
    .locator(".specialized-controls")
    .getByRole("region", { name: "Phone for selected dialogue" });
  await simple
    .getByLabel("Dialogue separate from phone", { exact: true })
    .uncheck();
  await expect(page.locator(".scene-in .device-actions")).toBeVisible();
  await expect(page.locator(".scene-in .device-story-progress")).toHaveCount(0);
  await simple
    .getByLabel("Phone visible on this dialogue", { exact: true })
    .hover();
  await expect(page.getByRole("tooltip")).toContainText("outside the scene");
  const style = await simple
    .getByLabel("Phone visible on this dialogue", { exact: true })
    .evaluate((el) => ({
      width: el.getBoundingClientRect().width,
      border: getComputedStyle(el).borderWidth,
      text: getComputedStyle(el, "::after").content,
    }));
  expect(style.width).toBe(48);
  expect(style.border).toBe("2px");
  expect(style.text).toContain("ON");
  await page.waitForTimeout(900);
  await page.reload();
  await expect(page.locator(".scene-in .device-actions")).toBeVisible();
  await page.getByRole("button", { name: "Play story", exact: true }).click();
  await page
    .locator(".scene-in .device-actions")
    .getByRole("button", { name: "Continue", exact: true })
    .click();
  await expect(page.locator(".scene-in .device-overlay")).toHaveCount(0);
  expect(errors).toEqual([]);
});
test("shared contact and uploaded app icon carry into a new scene phone and survive export", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await load(page);
  await page
    .getByRole("tab", { name: "Advanced devices", exact: true })
    .click();
  const settings = page.getByRole("region", {
    name: "Advanced device settings",
    exact: true,
  });
  await page.getByRole("button", { name: "Apps", exact: true }).click();
  await settings
    .locator("input[type=file]")
    .first()
    .setInputFiles({
      name: "ember.png",
      mimeType: "image/png",
      buffer: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aT1cAAAAASUVORK5CYII=",
        "base64",
      ),
    });
  await expect(
    page.locator(".device-live-preview .phone-app-grid img").first(),
  ).toBeVisible();
  await page
    .getByLabel("Device workspace scene", { exact: true })
    .selectOption("other");
  await page
    .getByRole("button", { name: "Add phone or computer", exact: true })
    .click();
  await expect(
    page.locator(".device-live-preview .device-contact img"),
  ).toHaveAttribute("src", /^data:image/);
  await expect(
    page.locator(".device-live-preview .phone-app-grid img").first(),
  ).toBeVisible();
  await page
    .getByLabel("Use shared phone appearance", { exact: true })
    .uncheck();
  await page.waitForTimeout(900);
  await page.reload();
  await page
    .getByRole("tab", { name: "Advanced devices", exact: true })
    .click();
  await page
    .getByLabel("Device workspace scene", { exact: true })
    .selectOption("other");
  await expect(
    page.getByLabel("Use shared phone appearance", { exact: true }),
  ).not.toBeChecked();
  await expect(
    page.locator(".device-live-preview .phone-app-grid img").first(),
  ).toBeVisible();
  await page
    .locator(".studio-menu summary")
    .filter({ hasText: /^File$/ })
    .click();
  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export project JSON", exact: true })
    .click();
  const download = await downloadPromise;
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(chunk as Buffer);
  const exported = JSON.parse(Buffer.concat(chunks).toString());
  expect(exported.deviceDefaults.appearance.icons.chat).toBeTruthy();
  expect(
    exported.assets.some(
      (a: { id: string }) =>
        a.id === exported.deviceDefaults.appearance.icons.chat,
    ),
  ).toBe(true);
  expect(
    exported.scenes.find((s: { id: string }) => s.id === "other").phone
      .independentAppearance,
  ).toBe(true);
  expect(errors).toEqual([]);
});
