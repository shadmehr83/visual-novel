import { test, expect } from "@playwright/test";
import { demo } from "../src/demo";
function fixture() {
  const p = demo();
  p.title = "Author live editing test";
  p.scenes[0].nodes = [
    {
      id: "start",
      speaker: "Narrator",
      text: "First line",
      next: "decision",
      choices: [],
    },
    {
      id: "decision",
      speaker: "Narrator",
      text: "Make a choice",
      choices: [
        {
          id: "go",
          text: "Go onward",
          target: p.scenes[1].id,
          actions: [],
          note: "",
        },
      ],
    },
  ];
  p.scenes[1].nodes = [
    {
      id: "arrival",
      speaker: "Narrator",
      text: "Second scene line",
      choices: [],
    },
  ];
  return p;
}
test("author play follows the route, edits live, saves and supports Undo while normal play stays locked", async ({
  page,
}) => {
  await page.goto("/");
  const p = fixture();
  await page
    .locator('input[accept=".json"]')
    .setInputFiles({
      name: "author.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(p)),
    });
  await expect(page.getByLabel("Project title")).toHaveValue(p.title);
  await page.getByRole("button", { name: "Play story", exact: true }).click();
  const text = page.getByLabel("Dialogue text", { exact: true });
  await expect(text).toBeDisabled();
  await page
    .getByRole("button", { name: "Author’s playthrough", exact: true })
    .click();
  await expect(text).toBeEnabled();
  await page
    .getByRole("button", { name: "Edit current dialogue", exact: true })
    .click();
  await expect(text).toBeFocused();
  await text.fill("The corrected opening line");
  await expect(page.locator(".scene-in")).toContainText(
    "The corrected opening line",
  );
  await expect(
    page.getByText("Story timers held while typing", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(text).toHaveValue("Make a choice");
  await page
    .getByLabel("Choice 1", { exact: true })
    .fill("Take the next scene");
  await expect(
    page.getByLabel("Choice 1 target", { exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Delete dialogue node", exact: true }),
  ).toBeDisabled();
  await page
    .locator(".scene-in")
    .getByRole("button", { name: "Take the next scene", exact: true })
    .click();
  await expect(text).toHaveValue("Second scene line");
  await text.fill("Edited after changing scenes");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(text).toHaveValue("Second scene line");
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await expect(text).toHaveValue("Edited after changing scenes");
  await page
    .getByRole("button", { name: "Author’s playthrough", exact: true })
    .click();
  await expect(text).toBeDisabled();
  await page
    .getByRole("button", { name: "Author’s playthrough", exact: true })
    .click();
  await expect(text).toHaveValue("Edited after changing scenes");
  await expect(text).toBeEnabled();
  await page.getByRole("button", { name: "Lighting", exact: true }).click();
  await page
    .getByRole("button", { name: "Add local light", exact: true })
    .click();
  await page
    .getByLabel("Advance story", { exact: true })
    .selectOption("screen");
  await page
    .getByRole("button", { name: "Move light with mouse", exact: true })
    .click();
  const stage = page.getByRole("img", {
    name: p.scenes[1].title + " live stage",
  });
  const point = await stage.evaluate((el) => {
    const p = new DOMPoint(300, 225).matrixTransform(
      (el as SVGSVGElement).getScreenCTM()!,
    );
    return { x: p.x, y: p.y };
  });
  await page.mouse.click(point.x, point.y);
  await expect(
    page.getByRole("button", { name: "Continue", exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Local candle light x exact value", { exact: true })).not.toHaveValue("500");
  await expect(
    page.getByLabel("Local candle light x exact value", { exact: true }),
  ).toBeEnabled();
  await page
    .getByLabel("Local candle light x exact value", { exact: true })
    .fill("222");
  await expect(
    page.getByText("Saved on this device", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Back to editor", exact: true })
    .click();
  await expect(text).toHaveValue("Edited after changing scenes");
  await page.reload();
  await page
    .getByRole("button", {
      name: new RegExp(p.scenes[1].title + ".*dialogue nodes"),
    })
    .click();
  await expect(text).toHaveValue("Edited after changing scenes");
  await page.getByRole("button", { name: "Lighting", exact: true }).click();
  await expect(
    page.getByLabel("Local candle light x exact value", { exact: true }),
  ).toHaveValue("222");
});
test("author text focus holds automatic dialogue progression until typing finishes", async ({
  page,
}) => {
  const p = fixture();
  p.scenes[0].nodes[0].autoAdvance = 1;
  await page.goto("/");
  await page
    .locator('input[accept=".json"]')
    .setInputFiles({
      name: "timed.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(p)),
    });
  await expect(page.getByLabel("Project title")).toHaveValue(p.title);
  await page
    .getByRole("button", { name: "Author’s playthrough", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Edit current dialogue", exact: true })
    .click();
  const text = page.getByLabel("Dialogue text", { exact: true });
  await text.fill("Taking time to fix this line");
  await page.waitForTimeout(1300);
  await expect(text).toHaveValue("Taking time to fix this line");
  await text.blur();
  await expect(text).toHaveValue("Make a choice", { timeout: 3000 });
});
