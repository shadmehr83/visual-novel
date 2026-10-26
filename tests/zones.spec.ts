import { clickScenePoint } from "./stagePoint";
import { test, expect } from "@playwright/test";
test("multiple rain masks, local wand selection, animated dedicated light and complete saving", async ({
  page,
}) => {
  await page.addInitScript(() => {
    (window as any).showSaveFilePicker = async () => ({
      createWritable: async () => ({
        write: async (text: string) => {
          (window as any).savedFile = text;
        },
        close: async () => {},
      }),
    });
  });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Hide dialogue", exact: true })
    .click();
  await expect(page.locator(".dialogue-overlay")).toHaveClass(
    /dialogue-hidden/,
  );
  await page
    .getByRole("button", { name: "Show dialogue", exact: true })
    .click();
  await expect(page.locator(".dialogue-overlay")).not.toHaveClass(
    /dialogue-hidden/,
  );
  await page
    .getByRole("button", { name: "Add rain zone", exact: true })
    .click();
  const stage = page.getByRole("img", {
    name: "A table by the window live stage",
  });
  await clickScenePoint(stage, 0.25, 0.222222);
  await clickScenePoint(stage, 0.45, 0.222222);
  await clickScenePoint(stage, 0.45, 0.622222);
  await page.getByRole("button", { name: "Finish zone editing" }).click();
  await expect(page.getByLabel("Rain zone name")).toHaveCount(2);
  await page
    .getByRole("button", { name: "Add rain zone", exact: true })
    .click();
  await page.getByRole("button", { name: "Finish zone editing" }).click();
  await expect(page.getByLabel("Rain zone name")).toHaveCount(3);
  const latest = page
    .locator(".zone-tools .clue")
    .filter({ has: page.getByLabel("Rain zone name") })
    .last();
  await latest.getByRole("button", { name: "Magic wand", exact: true }).click();
  await clickScenePoint(stage, 0.5, 0.488889);
  await expect(
    latest.getByText("Auto-selected region", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Finish zone editing" }).click();
  await expect(page.locator("#rainMask path")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Add local light", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Add global light", exact: true })
    .click();
  const local = page
    .locator(".zone-tools .clue")
    .filter({ has: page.getByLabel("Local candle light intensity") });
  await local.getByLabel("Local candle light intensity").fill("1.2");
  await local
    .getByRole("checkbox", { name: "Loop lighting", exact: true })
    .check();
  const radius = page.locator('mask[id^="zone-radius-"] ellipse');
  const firstRadius = await radius.getAttribute("rx");
  await expect.poll(() => radius.getAttribute("rx")).not.toBe(firstRadius);
  await page
    .getByLabel("Global illumination intensity", { exact: true })
    .fill("0.55");
  await expect(stage).toHaveAttribute("data-global-light-level", "0.55");
  await local
    .getByRole("button", { name: "Add dedicated affected area" })
    .click();
  await local.getByRole("button", { name: "Draw region", exact: true }).click();
  await clickScenePoint(stage, 0.5, 0.444444);
  await clickScenePoint(stage, 0.65, 0.444444);
  await clickScenePoint(stage, 0.65, 0.8);
  await page.getByRole("button", { name: "Finish zone editing" }).click();
  await expect(page.locator("[data-light-zone]")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Save project file", exact: true })
    .click();
  await page
    .getByRole("dialog", { name: "Save project" })
    .getByRole("button", { name: "Save complete project file", exact: true })
    .click();
  const saved = await page.evaluate(() =>
    JSON.parse((window as any).savedFile),
  );
  const cafe = saved.scenes.find((s: any) => s.id === "cafe");
  expect(saved.assets.find((a: any) => a.id === cafe.background).data).toMatch(
    /^data:image\/png;base64,/,
  );
  expect(cafe.effects.rainZones).toHaveLength(3);
  expect(cafe.effects.rainZones[2].path).toContain("M");
  expect(cafe.effects.lights).toHaveLength(2);
  expect(cafe.effects.lights[0].region.points).toHaveLength(3);
  await page.getByRole("button", { name: "Close dialog" }).click();
  await expect(
    page.getByText("Saved on this device", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Rain zone name")).toHaveCount(3);
  await expect(page.getByLabel("Local candle light intensity")).toHaveValue(
    "1.2",
  );
});
test("free responses are available only outside authored choices and continue the story", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Play from beginning" }).click();
  await page
    .getByLabel("Custom dialogue response")
    .fill("Maybe I will check my phone.");
  await page
    .getByRole("button", { name: "Send response", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Open the message", exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Custom dialogue response")).toHaveCount(0);
  await page.getByRole("button", { name: "Event log", exact: true }).click();
  await expect(
    page.getByText("Custom reply: Maybe I will check my phone.", {
      exact: false,
    }),
  ).toBeVisible();
});
