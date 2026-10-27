import { test, expect } from "@playwright/test";
import { demo } from "../src/demo";
import { restingPose } from "../src/cinematics";
import { clickScenePoint } from "./stagePoint";
function fixture() {
  const p = demo();
  p.title = "Cinematics test";
  p.scenes = p.scenes.slice(0, 2);
  const scene = p.scenes[0];
  scene.effects.rain = false;
  scene.nodes = [
    {
      id: "one",
      speaker: "Narrator",
      text: "First pose",
      choices: [],
      next: "two",
    },
    {
      id: "two",
      speaker: "Narrator",
      text: "Second pose",
      choices: [
        {
          id: "phone",
          text: "Open phone",
          target: p.scenes[1].id,
          actions: [],
          note: "",
        },
      ],
    },
  ];
  scene.joints = [
    {
      id: "finger",
      name: "Finger",
      enabled: true,
      pivotX: 300,
      pivotY: 200,
      region: {
        id: "r",
        name: "Finger",
        enabled: true,
        points: [
          { x: 200, y: 200 },
          { x: 400, y: 200 },
          { x: 350, y: 300 },
        ],
      },
      transition: { style: "smooth", seconds: 0.2 },
      poses: [restingPose("one"), { ...restingPose("two"), angle: 35, x: 20 }],
    },
  ];
  const phone = p.scenes[1];
  phone.effects.rain = false;
  phone.transition = { style: "fade", seconds: 0.4 };
  phone.phone = {
    enabled: true,
    device: "phone",
    contact: "Maria",
    title: "Nearside",
    avatar: null,
    x: 65,
    y: 50,
    width: 44,
    entrance: { style: "slide", seconds: 0.2 },
    typingSeconds: 0.2,
    keyboard: true,
  };
  phone.nodes = [
    {
      id: "hello",
      speaker: "Maria",
      text: "Hello there.",
      choices: [
        { id: "hi", text: "Hi Maria.", target: "reply", actions: [], note: "" },
      ],
    },
    {
      id: "reply",
      speaker: "Maria",
      text: "Good to hear from you.",
      choices: [],
      next: "end",
    },
    { id: "end", speaker: "Narrator", text: "Done", choices: [] },
  ];
  return p;
}
test("hinge editing, pivot selection, live phone replies, fullscreen and self-reply work", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1500, height: 1100 });
  await page.goto("/");
  await page
    .locator('input[type=file][accept=".json"]')
    .setInputFiles({
      name: "cinematic.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(fixture())),
    });
  await page
    .getByRole("group", { name: "Effect panels" })
    .getByRole("button", { name: "Cinematics", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Place hinge pivot", exact: true })
    .click();
  const stage = page.getByRole("img", { name: "Another evening live stage" });
  await clickScenePoint(stage, 0.3, 0.4);
  await expect(page.getByLabel("Finger pivotY")).toHaveValue("225");
  await page.getByRole("button", { name: "Finish zone editing" }).click();
  await expect(
    page.getByText("Saved on this device", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Finger pivotY")).toHaveValue("225");
  await page.getByRole("button", { name: "Play story", exact: true }).click();
  await page
    .locator(".dialogue-overlay")
    .getByRole("button", { name: "Self-reply", exact: true })
    .click();
  await page.getByLabel("Custom dialogue response").fill("I can write here");
  await page
    .getByRole("button", { name: "Send response", exact: true })
    .click();
  await expect
    .poll(async () =>
      Number(
        await page
          .locator('[data-joint-layer="finger"]')
          .getAttribute("data-joint-angle"),
      ),
    )
    .toBe(35);
  await page.getByRole("button", { name: "Open phone", exact: true }).click();
  await expect(
    page.getByRole("region", { name: "Phone conversation" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Hi Maria.", exact: true }).click();
  await expect(page.locator(".message-you")).toHaveText(/Hi Maria/);
  await expect(page.locator(".message-contact").last()).toContainText(
    "Good to hear from you.",
  );
  await page.getByRole("button", { name: "Self-reply", exact: true }).click();
  await page.getByLabel("Custom dialogue response").fill("My custom message");
  await page
    .getByRole("button", { name: "Send response", exact: true })
    .click();
  await expect(page.locator(".message-you").last()).toContainText(
    "My custom message",
  );
  await page.getByRole("button", { name: "Fullscreen", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Exit fullscreen", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Exit fullscreen", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Fullscreen", exact: true }),
  ).toBeVisible();
});
