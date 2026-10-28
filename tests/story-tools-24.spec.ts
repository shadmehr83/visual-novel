import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { Project } from "../src/model";
import { demo } from "../src/demo";
const savedProject = () => JSON.parse(readFileSync(new URL("../projects/published.stillframe.json", import.meta.url), "utf8")) as Project;
const pixel = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jh1sAAAAASUVORK5CYII=", "base64");
async function mockAudio(page: Page) {
  await page.addInitScript(() => {
    (window as any).soundEvents = [];
    HTMLMediaElement.prototype.play = function () { (window as any).soundEvents.push({ bytes: this.src.length, volume: this.volume, loop: this.loop }); return Promise.resolve(); };
    HTMLMediaElement.prototype.pause = function () {};
  });
}
async function load(page: Page, p: ReturnType<typeof demo>) {
  await page.goto("/");
  await page.locator('input[accept=".json"]').setInputFiles({ name: "story.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(p)) });
  await expect(page.getByLabel("Project title")).toHaveValue(p.title);
}
test("saved outfit images remain visible after choosing, can be reconsidered, and play wardrobe cues", async ({ page }) => {
  test.setTimeout(60000);
  await mockAudio(page);
  await page.goto("/?snapshot=github");
  await page.getByRole("button", { name: "Play story", exact: true }).click();
  await page.getByRole("button", { name: /Getting ready.*dialogue nodes/ }).click();
  const items = page.locator(".scene-in .item-overlay");
  await expect(items.locator(".item-grid img")).toHaveCount(3);
  await items.getByRole("button", { name: /Comfortable knit/ }).click();
  await expect(items.locator(".item-detail img")).toBeVisible();
  await items.getByRole("button", { name: "Choose Comfortable knit", exact: true }).click();
  await expect(page.getByRole("region", { name: "Selected outfit", exact: true })).toBeVisible();
  await expect(items.getByAltText("Comfortable knit")).toBeVisible();
  await items.getByRole("button", { name: "See the other outfits", exact: true }).click();
  await expect(items.locator(".item-grid img")).toHaveCount(3);
  expect(await page.evaluate(() => (window as any).soundEvents.length)).toBeGreaterThanOrEqual(3);
  await expect(page.getByLabel("Story sound volume")).toBeVisible();
});
test("feed opens before a single notification chime, notification follows its route, keyboard and profiles work", async ({ page }) => {
  test.setTimeout(60000);
  await mockAudio(page);
  const source = savedProject(), p = demo();
  p.title = "Phone notifications and profiles";
  p.scenes = p.scenes.slice(0, 1);
  p.assets = source.assets.filter(a => a.id.startsWith("studio-icon-"));
  p.audioAssets = source.audioAssets!.filter(a => a.id === "studio-phone-notification");
  const s = p.scenes[0]; s.effects.rain = false;
  s.phone = { ...source.scenes[0].phone!, avatar: null, keyboard: true, entrance: { style: "cut", seconds: .1 }, typingSeconds: 0 };
  s.nodes = [
    { id: "browse", speaker: "Narrator", text: "Keep scrolling", deviceScreen: "feed", autoAdvance: .7, next: "notice", choices: [] },
    { id: "notice", speaker: "Phone", text: "Ember — New message", phoneNotice: "Ember — New message", deviceScreen: "feed", next: "decision", choices: [] },
    { id: "decision", speaker: "Narrator", text: "Open?", phoneNotice: "Ember — New message", deviceScreen: "feed", choices: [{ id: "open", text: "Open the message", target: "chat", actions: [], note: "" }] },
    { id: "chat", speaker: "Maria", text: "Hello from Maria", deviceScreen: "chat", choices: [{ id: "yes", text: "Hello!", target: "end", actions: [], note: "" }] },
    { id: "end", speaker: "Narrator", text: "Done", choices: [], deviceScreen: "off" },
  ];
  await load(page, p);
  await page.getByRole("button", { name: "Play story", exact: true }).click();
  const phone = page.locator(".scene-in .device-overlay");
  await expect(phone.getByLabel("Insta scrolling feed")).toBeVisible();
  await expect(phone.locator(".phone-notification")).toContainText("New message");
  await expect.poll(() => page.evaluate(() => (window as any).soundEvents.length)).toBe(1);
  await phone.locator(".phone-notification").click();
  await expect(phone.locator(".message-contact")).toContainText("Hello from Maria");
  await expect(phone.locator(".device-keyboard")).toBeVisible();
  await phone.getByLabel("Toggle phone keyboard").click();
  await expect(phone.locator(".device-keyboard")).toHaveCount(0);
  await phone.getByLabel("Back to phone home", { exact: true }).click();
  await expect(phone.locator(".phone-app-grid button>span>img")).toHaveCount(3);
  await phone.getByRole("button", { name: /Settings Device appearance/ }).click();
  await phone.getByLabel("Upload Insta profile image").setInputFiles({ name: "profile.png", mimeType: "image/png", buffer: pixel });
  await phone.getByLabel("Back to phone home", { exact: true }).click();
  await phone.locator(".phone-app-grid").getByRole("button", { name: /Insta/ }).click();
  await expect(phone.getByAltText("Your Insta profile")).toBeVisible();
  await page.getByRole("button", { name: "Back to editor", exact: true }).click();
  await page.getByRole("tab", { name: "Advanced devices", exact: true }).click();
  await page.getByRole("button", { name: "Apps", exact: true }).click();
  await expect(page.getByLabel("feed profile image", { exact: true })).not.toHaveValue("");
  await page.getByLabel("Upload Ember profile image").setInputFiles({ name: "ember-profile.png", mimeType: "image/png", buffer: pixel });
  await expect(page.getByLabel("chat profile image", { exact: true })).not.toHaveValue("");
});
test("monitor sub-scene fades back without adding scenes; new Sound and graph controls are accessible", async ({ page }) => {
  test.setTimeout(60000);
  await mockAudio(page);
  const p = savedProject();
  p.title = "Monitor view test";
  const s = p.scenes[0]; p.scenes = [s];
  s.nodes = s.nodes.filter(n => ["room", "monitor"].includes(n.id));
  s.nodes.find(n => n.id === "room")!.choices = [{ id: "inspect", text: "Look at the monitor", target: "monitor", actions: [], note: "", sound: { asset: "studio-closet-open", volume: .4 } }];
  await load(page, p);
  await page.getByRole("button", { name: "Sound", exact: true }).click();
  await expect(page.getByLabel("Add background ambience")).toBeVisible();
  await page.getByRole("button", { name: "Play story", exact: true }).click();
  const image = page.locator(".scene-in .stage svg image").first();
  const original = await image.getAttribute("href");
  await page.locator(".scene-in").getByRole("button", { name: "Look at the monitor", exact: true }).click();
  await expect(image).toHaveAttribute("href", /^data:image\/webp;base64,/);
  await expect(page.locator(".scene-in")).toHaveClass(/scene-in-fade/);
  const cueBytes = p.audioAssets!.find(a => a.id === "studio-closet-open")!.data.length;
  await expect.poll(() => page.evaluate(bytes => (window as any).soundEvents.filter((e: any) => e.bytes === bytes).length, cueBytes)).toBe(1);
  await page.locator(".scene-in").getByRole("button", { name: "Continue", exact: true }).click();
  await expect(image).toHaveAttribute("href", original!);
  expect(await page.evaluate(bytes => (window as any).soundEvents.filter((e: any) => e.bytes === bytes).length, cueBytes)).toBe(1);
  await expect(page.locator(".scene-in")).toHaveClass(/scene-in-fade/);
  await page.getByRole("button", { name: "Back to editor", exact: true }).click();
  await page.getByRole("tab", { name: "Dialogue advanced", exact: true }).click();
  const cards = page.locator('[data-flow-card^="node:"]');
  await expect(cards).toHaveCount(2);
  await page.locator('[data-flow-card="node:monitor"]').getByRole("button", { name: /Add connected dialogue after/ }).click();
  await expect(cards).toHaveCount(3);
  await expect(page.getByLabel("Map next dialogue")).toHaveValue("room");
  await page.locator('[data-flow-card="node:monitor"]').getByRole("button", { name: /Add reply route from/ }).click();
  await expect(cards).toHaveCount(4);
  await expect(page.getByLabel("New dialogue incoming")).toBeVisible();
});
