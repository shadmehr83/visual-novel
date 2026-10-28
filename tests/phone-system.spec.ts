import { test, expect } from "@playwright/test";
import { demo } from "../src/demo";
import { restingPose } from "../src/cinematics";
import { clickScenePoint } from "./stagePoint";
function fixture() {
  const p = demo();
  p.scenes = p.scenes.slice(0, 1);
  const s = p.scenes[0];
  s.effects.rain = false;
  s.phone = {
    enabled: true,
    mode: "phone-system",
    defaultScreen: "home",
    device: "phone",
    contact: "Maria",
    title: "Online",
    avatar: null,
    x: 65,
    y: 50,
    width: 44,
    entrance: { style: "cut", seconds: 0.1 },
    typingSeconds: 0,
    keyboard: false,
  };
  s.nodes = [
    {
      id: "a",
      speaker: "Narrator",
      text: "Before phone",
      deviceScreen: "off",
      next: "b",
      choices: [],
    },
    {
      id: "b",
      speaker: "Narrator",
      text: "Browsing Loop",
      deviceScreen: "feed",
      next: "c",
      choices: [],
    },
    {
      id: "c",
      speaker: "Maria",
      text: "Hello from Maria",
      deviceScreen: "chat",
      next: "d",
      choices: [],
    },
    {
      id: "d",
      speaker: "Narrator",
      text: "Phone put away",
      deviceScreen: "off",
      next: "e",
      choices: [],
    },
    {
      id: "e",
      speaker: "Narrator",
      text: "Choose a path",
      choices: [
        { id: "again", text: "Again", target: "a", actions: [], note: "" },
      ],
    },
  ];
  s.joints = [
    {
      id: "hand",
      name: "Hand",
      enabled: true,
      range: { start: "b", end: "c", after: "hide" },
      pivotX: 300,
      pivotY: 200,
      region: {
        id: "r",
        name: "hand",
        enabled: true,
        points: [
          { x: 200, y: 200 },
          { x: 400, y: 200 },
          { x: 350, y: 300 },
        ],
      },
      transition: { style: "cut", seconds: 0.1 },
      poses: [restingPose("b"), { ...restingPose("c"), angle: 20 }],
    },
  ];
  return p;
}
test("scheduled phone screens, home and feed, hinge ranges and non-choice shortcuts work", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator('input[accept=".json"]').setInputFiles({
    name: "phone-system.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(fixture())),
  });
  await page.getByRole("button", { name: "Play story", exact: true }).click();
  await expect(page.locator('[data-joint-layer="hand"]')).toHaveCount(0);
  await page.getByLabel("Advance story", { exact: true }).selectOption("enter");
  await page.keyboard.press("Enter");
  await expect(page.getByLabel("Insta scrolling feed")).toBeVisible();
  await expect(page.locator('[data-joint-layer="hand"]')).toHaveCount(1);
  await page
    .getByRole("button", { name: "Back to phone home", exact: true })
    .click();
  await expect(page.locator(".phone-home-screen")).toBeVisible();
  await page
    .locator(".phone-app-grid")
    .getByRole("button", { name: /Insta/ })
    .click();
  await expect(page.getByLabel("Insta scrolling feed")).toBeVisible();
  await page
    .getByLabel("Advance story", { exact: true })
    .selectOption("screen");
  await page
    .getByLabel("Insta scrolling feed")
    .click({ position: { x: 30, y: 30 } });
  await expect(
    page
      .locator(".device-narration")
      .getByText("Browsing Loop", { exact: true }),
  ).toBeVisible();
  const stage = page.getByRole("img", { name: "Another evening live stage" });
  await clickScenePoint(stage, 0.1, 0.1);
  await expect(page.locator(".message-contact")).toContainText(
    "Hello from Maria",
  );
  await clickScenePoint(stage, 0.1, 0.1);
  await expect(
    page.getByRole("region", { name: "Phone conversation" }),
  ).toHaveCount(0);
  await expect(page.locator('[data-joint-layer="hand"]')).toHaveCount(0);
  await clickScenePoint(stage, 0.1, 0.1);
  await expect(page.locator(".play-choices")).toBeVisible();
  await clickScenePoint(stage, 0.1, 0.1);
  await expect(page.locator(".dialogue-overlay")).toContainText(
    "Choose a path",
  );
});
test("light stamping and individual favourites are available under Light Library", async ({
  page,
}) => {
  await page.goto("/");
  const p = fixture();
  delete p.scenes[0].phone;
  delete p.scenes[0].joints;
  await page.locator('input[accept=".json"]').setInputFiles({
    name: "lights.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(p)),
  });
  await page
    .getByRole("button", { name: "Light Library", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Place lights on scene", exact: true })
    .click();
  await clickScenePoint(
    page.getByRole("img", { name: "Another evening live stage" }),
    0.3,
    0.4,
  );
  await page
    .getByRole("button", { name: "Stop placing lights", exact: true })
    .click();
  await page.getByLabel("Light favourite name").fill("Tea lamp");
  await page
    .getByRole("button", {
      name: "Save individual light favourite",
      exact: true,
    })
    .click();
  await expect(page.getByLabel("Placement preset")).toContainText("Tea lamp");
  await page
    .getByRole("button", { name: "Outfits & Items", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Outfits & Items · inspect and choose" }),
  ).toBeVisible();
});
