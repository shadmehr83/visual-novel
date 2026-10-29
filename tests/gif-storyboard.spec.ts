import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { validateProject } from "../src/model";
test("GIF background import and visual sequence expose thumbnails, transitions and dialogue cues", async ({
  page,
}) => {
  await page.goto("/?snapshot=github");
  await page.getByRole("tab", { name: "Scenes advanced", exact: true }).click();
  await expect(page.locator(".background-storyboard")).toBeVisible();
  await expect(
    page.locator(".background-storyboard .background-shot"),
  ).toHaveCount(4);
  await expect(
    page.getByLabel("Cake arrives · animated table visual transition", {
      exact: true,
    }),
  ).toHaveValue("smooth");
  await page.getByRole("tab", { name: "Editor", exact: true }).click();
  await page
    .locator('input[hidden][accept*="image/gif"]')
    .setInputFiles("artwork/cafe-animation/cafe-idle.gif");
  await expect(page.locator(".scene-in svg[role=img]")).not.toHaveAttribute(
    "data-background-asset",
    "cafe-idle-gif",
  );
  await expect(
    page.locator(".scene-in canvas.controlled-gif").first(),
  ).toHaveCount(1);
  const wait = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export project", exact: true })
    .click();
  const p = JSON.parse(readFileSync((await (await wait).path())!, "utf8"));
  expect(
    p.assets.some(
      (a: any) => a.mime === "image/gif" && a.name === "cafe-idle.gif",
    ),
  ).toBe(true);
});
test("cake dialogue changes to its matched animated view during playback", async ({
  page,
}) => {
  const p = JSON.parse(
    readFileSync("projects/published.stillframe.json", "utf8"),
  );
  delete p.chapters;
  p.id = "gif-cue-test";
  p.title = "GIF dialogue cue";
  p.scenes[0].nodes = [
    {
      id: "start",
      speaker: "Narrator",
      text: "Visit the café",
      choices: [
        {
          id: "visit",
          text: "Visit café",
          target: "cafe",
          actions: [],
          note: "",
        },
      ],
    },
  ];
  const c = p.scenes.find((s: any) => s.id === "cafe");
  c.nodes = [
    {
      id: "before",
      speaker: "Maria",
      text: "Before the cake.",
      next: "cake",
      choices: [],
    },
    {
      id: "cake",
      speaker: "Maria",
      text: "Cake arrives.",
      view: "cake-arrives",
      choices: [],
    },
  ];
  delete p.scenes[0].phone;
  p.scenes[0].joints = [];
  validateProject(p);
  await page.goto("/");
  await page.locator('input[accept=".json"]').setInputFiles({
    name: "cue.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(p)),
  });
  await expect(page.getByLabel("Project title")).toHaveValue(p.title);
  await page.getByRole("button", { name: "Play story", exact: true }).click();
  await page.getByRole("button", { name: "Visit café", exact: true }).click();
  await expect(page.locator(".scene-in svg[role=img]")).toHaveAttribute(
    "data-background-asset",
    "cafe-idle-gif",
  );
  await page
    .locator(".scene-in")
    .getByRole("button", { name: "Continue", exact: true })
    .click();
  await expect(page.locator(".scene-in svg[role=img]")).toHaveAttribute(
    "data-background-asset",
    "cafe-cake-gif",
  );
});
