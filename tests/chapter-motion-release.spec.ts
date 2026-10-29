import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { demo } from "../src/demo";
import { restingPose } from "../src/cinematics";
import { type Project } from "../src/model";
test.use({ viewport: { width: 1700, height: 1100 } });
async function load(page: any, p: Project) {
  await page.goto("/");
  await page.locator('input[accept=".json"]').setInputFiles({
    name: "motion.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(p)),
  });
  await expect(page.getByLabel("Project title")).toHaveValue(p.title);
}
test("Add chapter and Add scene commit before navigation and persist after reload", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/?snapshot=github");
  await page
    .getByRole("tab", { name: "Chapters advanced", exact: true })
    .click();
  await expect(
    page
      .getByRole("navigation", { name: "Story chapters" })
      .getByRole("button"),
  ).toHaveCount(3);
  await page.getByRole("button", { name: "Add chapter", exact: true }).click();
  await expect(page.getByLabel("Chapter title", { exact: true })).toHaveValue(
    "New chapter",
  );
  await expect(page.locator(".chapter-scene")).toHaveCount(1);
  await page
    .getByLabel("Chapter title", { exact: true })
    .fill("My next chapter");
  await page
    .getByRole("button", {
      name: "Add opening or scene to this chapter",
      exact: true,
    })
    .click();
  await expect(page.locator(".chapter-scene")).toHaveCount(2);
  await expect(
    page.getByText("Saved on this device", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await page
    .getByRole("tab", { name: "Chapters advanced", exact: true })
    .click();
  await page
    .getByRole("navigation", { name: "Story chapters" })
    .getByRole("button", { name: /My next chapter/ })
    .click();
  await expect(page.locator(".chapter-scene")).toHaveCount(2);
  expect(errors).toEqual([]);
});
test("masked character snippet, loop and mouse pose survive export without editing the background", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  const image = await page.evaluate(() => {
    const c = document.createElement("canvas");
    c.width = 1000;
    c.height = 563;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#bba090";
    ctx.fillRect(0, 0, 1000, 563);
    return c.toDataURL();
  });
  const p = demo();
  p.title = "Character mask test";
  p.assets = [
    {
      id: "test-picture",
      name: "Test picture",
      mime: "image/png",
      width: 1000,
      height: 563,
      data: image,
      folder: "Background scenes",
      tags: "",
      notes: "",
      approved: false,
      reference: false,
    },
  ];
  const s = p.scenes[0];
  s.background = "test-picture";
  s.effects.rain = false;
  s.joints = [
    {
      id: "head",
      name: "Test head",
      enabled: true,
      pivotX: 400,
      pivotY: 250,
      region: {
        id: "head",
        name: "Eye area",
        enabled: true,
        points: [
          { x: 300, y: 200 },
          { x: 500, y: 200 },
          { x: 500, y: 300 },
          { x: 300, y: 300 },
        ],
      },
      transition: { style: "smooth", seconds: 0.2 },
      poses: [restingPose(s.nodes[0].id)],
      loop: { enabled: true, kind: "sway", seconds: 2, amount: 1 },
    },
  ];
  await load(page, p);
  await page.getByRole("button", { name: "Cinematics", exact: true }).click();
  await page
    .getByRole("button", {
      name: "Save selected snippet to gallery",
      exact: true,
    })
    .click();
  const source = page.getByLabel("Test head source image", { exact: true });
  await expect(source.locator("option:checked")).toHaveText(
    "Test head · masked snippet.png",
  );
  await page
    .getByLabel("Test head loop style", { exact: true })
    .selectOption("blink");
  await page.getByLabel("Test head loop seconds", { exact: true }).fill("4");
  await page
    .getByRole("button", { name: "Drag selected patch on scene", exact: true })
    .click();
  const stage = page.getByRole("img", { name: s.title + " live stage" });
  const positions = await stage.evaluate((el) => {
    const matrix = (el as SVGSVGElement).getScreenCTM()!;
    const a = new DOMPoint(400, 250).matrixTransform(matrix),
      b = new DOMPoint(420, 260).matrixTransform(matrix);
    return { a: { x: a.x, y: a.y }, b: { x: b.x, y: b.y } };
  });
  await page.mouse.move(positions.a.x, positions.a.y);
  await page.mouse.down();
  await page.mouse.move(positions.b.x, positions.b.y, { steps: 5 });
  await page.mouse.up();
  await expect
    .poll(
      async () =>
        +(await page
          .getByLabel("Test head pose x exact value", { exact: true })
          .inputValue()),
    )
    .toBeGreaterThan(15);
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export project", exact: true })
    .click();
  const exported = JSON.parse(
    readFileSync((await (await download).path())!, "utf8"),
  );
  const a = exported.assets.find((a: any) => a.folder === "Character snippets");
  expect(a).toBeTruthy();
  expect(exported.assets.find((a: any) => a.id === "test-picture").data).toBe(
    image,
  );
  expect(exported.scenes[0].joints[0].source).toBe(a.id);
  expect(exported.scenes[0].joints[0].loop.kind).toBe("blink");
  const alpha = await page.evaluate(async (data: string) => {
    const i = new Image();
    i.src = data;
    await i.decode();
    const c = document.createElement("canvas");
    c.width = i.width;
    c.height = i.height;
    const ctx = c.getContext("2d")!;
    ctx.drawImage(i, 0, 0);
    return [
      ctx.getImageData(0, 0, 1, 1).data[3],
      ctx.getImageData(400, 250, 1, 1).data[3],
    ];
  }, a.data);
  expect(alpha).toEqual([0, 255]);
  expect(errors).toEqual([]);
});
test("published outdoor scenes render masked impact ripples and layer rain plus splashes", async ({
  page,
}) => {
  await page.goto("/?snapshot=github");
  await page
    .getByRole("button", { name: /The Lantern Room.*dialogue nodes/ })
    .click();
  await expect(page.locator("[data-puddle-zone]")).toHaveCount(2);
  await page.getByRole("button", { name: "Sound", exact: true }).click();
  await expect(
    page.getByLabel("Ambience volume 0 exact value", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByLabel("Ambience volume 1 exact value", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: /After the café.*dialogue nodes/ })
    .click();
  await expect(page.locator("[data-puddle-zone]")).toHaveCount(2);
  await page.getByRole("button", { name: "Play story", exact: true }).click();
  await page
    .getByRole("button", { name: /After the café.*dialogue nodes/ })
    .click();
  await expect(page.locator(".scene-in .device-overlay")).toHaveCount(0);
});

test("new rain and walking assets decode, and both outdoor ambience layers play together", async ({
  page,
}) => {
  const p = JSON.parse(
    readFileSync("projects/published.stillframe.json", "utf8"),
  );
  await page.addInitScript(() => {
    (window as any).played = [];
    HTMLMediaElement.prototype.play = function () {
      (window as any).played.push(this.src);
      return Promise.resolve();
    };
    HTMLMediaElement.prototype.pause = function () {};
  });
  await page.goto("/?snapshot=github");
  const assets = [
    "studio-rain-puddle-impacts",
    "studio-walking-wet-detailed",
  ].map((id) => p.audioAssets.find((a: any) => a.id === id));
  const lengths = await page.evaluate(async (rows: any[]) => {
    const ctx = new AudioContext();
    try {
      return await Promise.all(
        rows.map(
          async (a) =>
            (
              await ctx.decodeAudioData(
                await (await fetch(a.data)).arrayBuffer(),
              )
            ).duration,
        ),
      );
    } finally {
      await ctx.close();
    }
  }, assets);
  expect(lengths[0]).toBeGreaterThan(11);
  expect(lengths[1]).toBeGreaterThan(0.5);
  await page.getByRole("button", { name: "Play story", exact: true }).click();
  await page
    .getByRole("button", { name: /After the café.*dialogue nodes/ })
    .click();
  const outside = p.audioAssets.find(
    (a: any) => a.id === "studio-rain-outside",
  ).data;
  await expect
    .poll(() =>
      page.evaluate(
        ([rain, splash]) =>
          [rain, splash].every((a) => (window as any).played.includes(a)),
        [outside, assets[0].data],
      ),
    )
    .toBe(true);
});
