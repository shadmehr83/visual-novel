import { test, expect } from "@playwright/test";
import { demo } from "../src/demo";
import { makeDevice } from "../src/deviceFrame";
import { defaultInstaFeed } from "../src/feedLibrary";
test.use({ viewport: { width: 1500, height: 1000 } });
test("comments use a compact composer, expand to the phone top and drag-scroll without moving the story", async ({
  page,
}) => {
  const p = demo();
  p.scenes = p.scenes.slice(0, 1);
  const s = p.scenes[0];
  s.effects.rain = false;
  s.nodes = [
    {
      id: "browse",
      speaker: "Narrator",
      text: "Keep scrolling.",
      deviceScreen: "feed",
      choices: [],
    },
  ];
  s.phone = makeDevice(s);
  delete s.phone.schedule;
  Object.assign(s.phone, {
    frameWidth: 30,
    frameHeight: 96,
    x: 60,
    y: 2,
    anchor: "top-left",
    entrance: { style: "cut", seconds: 0.1 },
  });
  p.instaFeed = structuredClone(defaultInstaFeed);
  p.instaFeed.posts = p.instaFeed.posts.slice(0, 1);
  p.instaFeed.posts[0].comments = Array.from({ length: 20 }, (_, i) => ({
    id: "c" + i,
    author: "reader_" + i,
    text:
      "Comment " +
      (i + 1) +
      ": a little rain, a long walk, and nowhere urgent to be.",
  }));
  await page.goto("/");
  await page
    .locator('input[accept=".json"]')
    .setInputFiles({
      name: "comments.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(p)),
    });
  await expect(page.getByLabel("Project title")).toHaveValue(p.title);
  await page.getByRole("button", { name: "Play story", exact: true }).click();
  await page
    .getByRole("button", {
      name: "Comments on Took the long way home",
      exact: true,
    })
    .click();
  const sheet = page.getByRole("dialog", {
      name: "Comments on Took the long way home",
      exact: true,
    }),
    handle = sheet.getByRole("slider", {
      name: "Comments sheet height",
      exact: true,
    });
  await expect(sheet).toBeVisible();
  expect(
    (await sheet.locator(".insta-comments-handle").boundingBox())!.height,
  ).toBeLessThanOrEqual(35);
  expect(
    (await sheet.getByLabel("Your Insta comment").boundingBox())!.height,
  ).toBeLessThanOrEqual(30);
  const before = await sheet.boundingBox(),
    r = await handle.boundingBox();
  await page.mouse.move(r!.x + r!.width / 2, r!.y + 15);
  await page.mouse.down();
  await page.mouse.move(r!.x + r!.width / 2, r!.y - 240, { steps: 15 });
  await page.mouse.up();
  await expect(handle).toHaveAttribute("aria-valuenow", "100");
  await expect
    .poll(async () => (await sheet.boundingBox())!.height)
    .toBeGreaterThan(before!.height * 1.25);
  const phone = await page.locator(".device-shell").boundingBox();
  expect(Math.abs((await sheet.boundingBox())!.y - phone!.y)).toBeLessThan(12);
  const list = sheet.getByLabel("Comment list", { exact: true });
  const b = await list.boundingBox();
  await page.mouse.move(b!.x + b!.width / 2, b!.y + b!.height - 25);
  await page.mouse.down();
  await page.mouse.move(b!.x + b!.width / 2, b!.y + 20, { steps: 15 });
  await page.mouse.up();
  await expect
    .poll(() => list.evaluate((e) => e.scrollTop))
    .toBeGreaterThan(60);
  await handle.focus();
  await page.keyboard.press("End");
  await expect(handle).toHaveAttribute("aria-valuenow", "38");
  await page.keyboard.press("Home");
  await expect(handle).toHaveAttribute("aria-valuenow", "100");
  await sheet
    .getByLabel("Your Insta comment")
    .fill("Saved with a compact composer.");
  await sheet
    .getByRole("button", { name: "Post locally", exact: true })
    .click();
  await expect(list).toContainText("Saved with a compact composer.");
  await sheet.getByLabel("Close comments", { exact: true }).click();
  await expect(sheet).toHaveCount(0);
  await expect(page.locator(".device-story-progress")).toContainText(
    "Keep scrolling.",
  );
});
