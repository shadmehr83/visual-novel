import { clickScenePoint } from "./stagePoint";
import { test, expect } from "@playwright/test";
test("author, import, mask, undo, persist, export and play opening", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "A table by the window" }),
  ).toBeVisible();
  await page.getByLabel("Brightness", { exact: true }).fill("0.8");
  await expect(page.getByLabel("Brightness", { exact: true })).toHaveValue(
    "0.8",
  );
  await page.getByRole("button", { name: "Edit polygon mask" }).click();
  await page.getByRole("button", { name: "Clear", exact: true }).click();
  const stage = page.getByRole("img", {
    name: "A table by the window live stage",
  });
  await clickScenePoint(stage, 0.075, 0.0888889);
  await clickScenePoint(stage, 0.4, 0.0888889);
  await clickScenePoint(stage, 0.4, 0.444444);
  await expect(page.getByText("MASKED", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Finish region" }).click();
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(page.getByText("FULL STAGE", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await expect(page.getByText("MASKED", { exact: true })).toBeVisible();
  await page
    .getByLabel("Dialogue text")
    .fill("A line authored in the browser.");
  await page
    .locator("input[type=file]")
    .first()
    .setInputFiles({
      name: "test.png",
      mimeType: "image/png",
      buffer: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aY9sAAAAASUVORK5CYII=",
        "base64",
      ),
    });
  await expect(page.getByText("test.png", { exact: true })).toBeVisible();
  await expect(page.getByText("Saved on this device")).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Scenes", exact: true }).click();
  await page
    .getByRole("button", { name: /A table by the window.*dialogue nodes/ })
    .click();
  await expect(page.getByLabel("Dialogue text")).toHaveValue(
    "A line authored in the browser.",
  );
  await expect(page.getByLabel("Brightness", { exact: true })).toHaveValue(
    "0.8",
  );
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export project", exact: true })
    .click();
  const bundle = await download;
  await expect(bundle.suggestedFilename()).toContain(".stillframe.json");
  const bundlePath = await bundle.path();
  await page.locator("input[type=file]").nth(1).setInputFiles(bundlePath!);
  await page
    .getByRole("button", { name: /A table by the window.*dialogue nodes/ })
    .click();
  await expect(page.getByLabel("Dialogue text")).toHaveValue(
    "A line authored in the browser.",
  );
  await expect(page.locator(".stage svg image")).toHaveAttribute(
    "href",
    /^data:image\/png;base64,/,
  );
  await page.getByRole("button", { name: "Play from beginning" }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByRole("button", { name: "Keep scrolling for a minute" })
    .click();
  await page.getByRole("button", { name: "Okay. Open it." }).click();
  await page
    .getByRole("button", { name: "I have a ranked list.", exact: false })
    .click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByRole("button", { name: "Six thirty. I’ll be there." })
    .click();
  await page.getByRole("button", { name: "The soft, familiar jumper" }).click();
  await page.getByRole("button", { name: "Bring the book" }).click();
  await page.getByRole("button", { name: "Only for the top three." }).click();
  await page
    .getByRole("button", { name: "You planned a second stop?" })
    .click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(
    page.getByRole("button", { name: /End of opening chapter/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "State & clues" }).click();
  await expect(page.getByText("Observation: Mara looked up")).toBeVisible();
  await expect(page.getByText("Saved on this device")).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Play story" }).click();
  await expect(
    page.getByRole("button", { name: /End of opening chapter/ }),
  ).toBeVisible();
});
test("corrupt project import reports useful error", async ({ page }) => {
  await page.goto("/");
  await page
    .locator("input[type=file]")
    .nth(1)
    .setInputFiles({
      name: "bad.json",
      mimeType: "application/json",
      buffer: Buffer.from('{"schemaVersion":99}'),
    });
  await expect(page.getByRole("alert")).toContainText("Import failed");
});
