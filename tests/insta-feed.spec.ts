import { test, expect, type Page } from "@playwright/test";
import { demo } from "../src/demo";
import { makeDevice } from "../src/deviceFrame";
import { defaultInstaFeed } from "../src/feedLibrary";
async function fixture(page: Page) {
  const p = demo();
  p.scenes = p.scenes.slice(0, 1);
  p.scenes[0].effects.rain = false;
  const s = p.scenes[0];
  s.nodes = [
    {
      id: "start",
      speaker: "Narrator",
      text: "Keep scrolling if you like.",
      deviceScreen: "feed",
      choices: [],
    },
  ];
  s.phone = makeDevice(s);
  s.phone.mode = "phone-system";
  s.phone.defaultScreen = "feed";
  delete s.phone.schedule;
  s.phone.typingSeconds = 0;
  s.phone.entrance = { style: "cut", seconds: 0.1 };
  s.phone.frameWidth = 30;
  s.phone.frameHeight = 94;
  s.phone.x = 65;
  s.phone.y = 2;
  s.phone.anchor = "top-left";
  s.phone.lockAspect = true;
  s.phone.frameRatio = 9 / 19;
  p.instaFeed = structuredClone(defaultInstaFeed);
  await page.goto("/");
  await page.locator('input[accept=".json"]').setInputFiles({
    name: "feed.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(p)),
  });
  await expect(page.getByLabel("Project title")).toHaveValue(p.title);
  return p;
}
test("plays real clips, persists likes, opens fictional comments and retains phone navigation and pause", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await fixture(page);
  await page.getByRole("button", { name: "Play story", exact: true }).click();
  const feed = page.getByLabel("Insta scrolling feed"),
    first = feed.locator(".insta-card").first(),
    video = first.locator("video");
  await expect(video).toHaveJSProperty("duration", 24);
  await expect
    .poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime))
    .toBeGreaterThan(0.1);
  const like = first.getByRole("button", {
    name: "Like Took the long way home",
    exact: true,
  });
  await like.click();
  await expect(
    first.getByRole("button", {
      name: "Unlike Took the long way home",
      exact: true,
    }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(first.locator(".insta-actions")).toContainText("285");
  await first
    .getByRole("button", {
      name: "Comments on Took the long way home",
      exact: true,
    })
    .click();
  await expect(first.locator(".insta-comments")).toContainText(
    "pavement declined an interview",
  );
  await expect(video).toHaveJSProperty("paused", true);
  await first.getByLabel("Your Insta comment").fill("The rain sounds lovely.");
  await first
    .getByRole("button", { name: "Post locally", exact: true })
    .click();
  await expect(first.locator(".insta-comments")).toContainText(
    "The rain sounds lovely.",
  );
  await first.getByLabel("Close comments", { exact: true }).click();
  await page.getByLabel("Back to phone home", { exact: true }).click();
  await expect(page.locator(".phone-home-screen")).toBeVisible();
  await page
    .locator(".phone-app-grid")
    .getByRole("button", { name: /Insta/ })
    .click();
  await expect(
    feed.getByRole("button", {
      name: "Unlike Took the long way home",
      exact: true,
    }),
  ).toBeVisible();
  await feed
    .getByRole("button", { name: "Unlike Took the long way home", exact: true })
    .click();
  await expect(first.locator(".insta-actions")).toContainText("284");
  await feed
    .locator(".insta-card")
    .nth(1)
    .evaluate((e) => e.scrollIntoView({ block: "start" }));
  const second = feed.locator(".insta-card").nth(1).locator("video");
  await expect
    .poll(() => second.evaluate((v: HTMLVideoElement) => v.currentTime))
    .toBeGreaterThan(0.1);
  await expect(video).toHaveJSProperty("paused", true);
  await page.getByRole("button", { name: "Pause menu", exact: true }).click();
  await expect(second).toHaveJSProperty("paused", true);
  await page.getByRole("button", { name: "Resume story", exact: true }).click();
  await expect
    .poll(() => second.evaluate((v: HTMLVideoElement) => v.paused))
    .toBe(false);
  expect(errors).toEqual([]);
});
test("advanced Insta settings import videos and export a portable project without altering chat", async ({
  page,
}) => {
  const p = await fixture(page);
  await page
    .getByRole("tab", { name: "Advanced devices", exact: true })
    .click();
  await page.getByRole("button", { name: "Insta feed", exact: true }).click();
  const settings = page.getByRole("region", { name: "Insta feed settings" });
  await expect(settings).toContainText("4 posts");
  await settings
    .getByLabel("Upload more feed videos", { exact: true })
    .setInputFiles("public/media/insta/rain-walk.mp4");
  await expect(settings.getByRole("status")).toContainText("Added 1 video");
  await expect(settings).toContainText("5 posts");
  const uploaded = settings.locator("details").last();
  await uploaded.locator("summary").click();
  await uploaded.getByLabel(/^Title for/).fill("My rainy walk");
  await uploaded
    .getByRole("button", { name: "Move earlier", exact: true })
    .click();
  await expect(settings.locator("summary").nth(3)).toContainText(
    "My rainy walk",
  );
  // Existing apps still open from the device preview.
  await page
    .locator(".device-preview-apps")
    .getByRole("button", { name: "Ember", exact: true })
    .click();
  await expect(page.locator(".device-overlay")).toHaveAttribute(
    "data-device-screen",
    "chat",
  );
  await page
    .getByRole("button", { name: "Back to dialogue editor", exact: true })
    .click();
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export project", exact: true })
    .click();
  const file = await download;
  const data = JSON.parse(
    await (
      await import("node:fs/promises")
    ).readFile((await file.path())!, "utf8"),
  );
  expect(data.instaFeed.posts).toHaveLength(5);
  expect(
    data.instaFeed.posts.every((row: any) =>
      row.video.startsWith("data:video/"),
    ),
  ).toBe(true);
  expect(data.scenes[0].phone).toEqual(p.scenes[0].phone);
});
