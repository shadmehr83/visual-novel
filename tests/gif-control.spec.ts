import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { demo } from "../src/demo";
import { validateProject } from "../src/model";
function fixture() {
  const p = demo();
  p.id = "gif-control-test";
  p.title = "GIF control fixture";
  const s = p.scenes[0];
  p.scenes = [s];
  s.background = "timing-gif";
  s.joints = [];
  s.camera = undefined;
  s.phone = undefined;
  s.effects.rain = false;
  s.effects.glass = false;
  s.effects.light = 0;
  s.effects.tintOpacity = 0;
  s.effects.vignette = false;
  s.gif = { mode: "paused", speed: 1, startTime: 0, pauseAt: 0.25 };
  s.transition = { style: "cut", seconds: 0.1 };
  s.returnTransition = { style: "smooth", seconds: 0.8 };
  s.subscenes = [
    {
      id: "close",
      title: "Animated close-up",
      background: "timing-gif",
      transition: { style: "fade", seconds: 1.25 },
      gif: { mode: "paused", speed: 1, startTime: 0 },
    },
  ];
  s.nodes = [
    {
      id: "before",
      speaker: "Narrator",
      text: "Hold green before animation.",
      next: "cycle",
      choices: [],
    },
    {
      id: "cycle",
      speaker: "Narrator",
      text: "One cycle then green.",
      next: "pause",
      choices: [],
      gifCue: { action: "once", time: 0, pauseAt: 0.25 },
    },
    {
      id: "pause",
      speaker: "Narrator",
      text: "Pause blue.",
      next: "keep",
      choices: [],
      gifCue: { action: "pause", time: 0.6 },
    },
    {
      id: "keep",
      speaker: "Narrator",
      text: "Keep blue without a new cue.",
      viewTransition: { style: "smooth", seconds: 0.15 },
      next: "close",
      choices: [],
    },
    {
      id: "close",
      speaker: "Narrator",
      text: "Separate view, red frame.",
      view: "close",
      next: "return",
      choices: [],
    },
    { id: "return", speaker: "Narrator", text: "Back to green.", choices: [] },
  ];
  p.assets = [
    {
      id: "timing-gif",
      name: "timing.gif",
      mime: "image/gif",
      data:
        "data:image/gif;base64," +
        readFileSync("tests/fixtures/timing.gif").toString("base64"),
      width: 64,
      height: 36,
      tags: "",
      notes: "",
      approved: true,
      reference: false,
    },
  ];
  return validateProject(p);
}
async function open(page: Page) {
  await page.goto("/");
  await page.locator('input[accept=".json"]').setInputFiles({
    name: "gif-test.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(fixture())),
  });
  await expect(page.getByLabel("Project title")).toHaveValue(
    "GIF control fixture",
  );
}
const gif = (page: Page) => page.locator(".scene-in canvas.controlled-gif");
async function color(page: Page) {
  return gif(page).evaluate((c) =>
    [
      ...(c as HTMLCanvasElement).getContext("2d")!.getImageData(10, 10, 1, 1)
        .data,
    ].slice(0, 3),
  );
}
test("GIF editor saves exact speed, pause cues and transitions; panel widens and reloads", async ({
  page,
}) => {
  test.setTimeout(60000);
  await open(page);
  await page.getByRole("tab", { name: "Scenes advanced", exact: true }).click();
  const width = page.getByLabel("Advanced panel width");
  await page
    .getByRole("button", { name: "Edit main background timing", exact: true })
    .click();
  await expect(width).toHaveValue("720");
  const film = page.locator(".gif-timeline");
  await expect(film.locator("canvas.controlled-gif")).toHaveAttribute(
    "data-gif-frame",
    "1",
  );
  await film.getByLabel("GIF speed multiplier", { exact: true }).fill("0.01");
  await film.getByLabel("GIF speed multiplier", { exact: true }).blur();
  await expect(
    film.getByText("One full cycle at this speed: 90.00 seconds.", {
      exact: true,
    }),
  ).toBeVisible();
  await film
    .getByLabel("GIF preview time (seconds)", { exact: true })
    .fill("0.6");
  await film.getByLabel("GIF preview time (seconds)", { exact: true }).blur();
  await expect(film.locator("canvas.controlled-gif")).toHaveAttribute(
    "data-gif-frame",
    "2",
  );
  await film
    .getByLabel("GIF cue dialogue", { exact: true })
    .selectOption("before");
  await film
    .getByRole("button", { name: "Pause here at dialogue", exact: true })
    .click();
  await expect(
    film.getByLabel("GIF cue time (seconds)", { exact: true }),
  ).toHaveValue("0.6");
  await page
    .getByLabel("Scene entrance duration (seconds)", { exact: true })
    .fill("2.35");
  await page
    .getByLabel("Scene entrance duration (seconds)", { exact: true })
    .blur();
  await page
    .getByLabel("Animated close-up visual duration (seconds)", { exact: true })
    .fill("4.75");
  await page
    .getByLabel("Animated close-up visual duration (seconds)", { exact: true })
    .blur();
  await film
    .getByLabel("Selected dialogue transition", { exact: true })
    .selectOption("fade");
  await film
    .getByLabel("Selected dialogue duration (seconds)", { exact: true })
    .fill("1.15");
  await film
    .getByLabel("Selected dialogue duration (seconds)", { exact: true })
    .blur();
  const divider = page.getByRole("separator", {
    name: "Resize advanced scene panel",
  });
  await divider.focus();
  await page.keyboard.press("ArrowLeft");
  await expect(width).toHaveValue("760");
  await page.getByRole("tab", { name: "Editor", exact: true }).click();
  const wait = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export project", exact: true })
    .click();
  const exported = JSON.parse(
    readFileSync((await (await wait).path())!, "utf8"),
  );
  const scene = exported.scenes[0];
  expect(scene.gif.speed).toBe(0.01);
  expect(scene.nodes[0].gifCue).toMatchObject({ action: "pause", time: 0.6 });
  expect(scene.transition.seconds).toBe(2.35);
  expect(scene.subscenes[0].transition.seconds).toBe(4.75);
  expect(scene.nodes[0].viewTransition.seconds).toBe(1.15);
  await expect(
    page.getByText("Saved on this device", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await page.getByRole("tab", { name: "Scenes advanced", exact: true }).click();
  await expect(page.getByLabel("Advanced panel width")).toHaveValue("760");
  await page
    .getByRole("button", { name: "Edit main background timing", exact: true })
    .click();
  await expect(
    page
      .locator(".gif-timeline")
      .getByLabel("GIF speed multiplier", { exact: true }),
  ).toHaveValue("0.01");
});
test("single-cycle and pause dialogue cues control the actual stage; return transition uses its duration", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await open(page);
  await page.getByRole("button", { name: "Play story", exact: true }).click();
  await expect(gif(page)).toHaveAttribute("data-gif-state", "paused");
  await expect.poll(() => color(page)).toEqual([30, 220, 30]);
  const next = () =>
    page
      .locator(".scene-in")
      .getByRole("button", { name: "Continue", exact: true })
      .click();
  await next();
  await expect(gif(page)).toHaveAttribute("data-gif-state", "playing");
  await page.getByRole("button", { name: "Pause menu", exact: true }).click();
  await expect(gif(page)).toHaveAttribute("data-gif-state", "paused");
  const time = await gif(page).getAttribute("data-gif-time");
  await page.waitForTimeout(200);
  expect(await gif(page).getAttribute("data-gif-time")).toBe(time);
  await page.getByRole("button", { name: "Resume story", exact: true }).click();
  await expect(gif(page)).toHaveAttribute("data-gif-state", "paused", {
    timeout: 3000,
  });
  await expect.poll(() => color(page)).toEqual([30, 220, 30]);
  await page.waitForTimeout(250);
  await expect.poll(() => color(page)).toEqual([30, 220, 30]);
  await next();
  await expect.poll(() => color(page)).toEqual([30, 30, 220]);
  await next();
  await expect.poll(() => color(page)).toEqual([30, 30, 220]);
  await next();
  await expect(page.locator(".scene-transition")).toHaveAttribute(
    "data-transition-seconds",
    "1.25",
  );
  await expect.poll(() => color(page)).toEqual([220, 30, 30]);
  await expect(page.locator(".scene-out")).toHaveCount(1);
  await expect(page.locator(".scene-out")).toHaveCount(0, { timeout: 2500 });
  await next();
  await expect(page.locator(".scene-transition")).toHaveAttribute(
    "data-transition-seconds",
    "0.8",
  );
  await expect.poll(() => color(page)).toEqual([30, 220, 30]);
  expect(errors).toEqual([]);
});
