import { test, expect } from "@playwright/test";
test("AI proposal is reviewed, applied, undone, and dictated without automatically editing", async ({
  page,
}) => {
  await page.route("**/api/assistant", async (route) => {
    if (route.request().method() === "GET")
      return route.fulfill({ json: { configured: true } });
    return route.fulfill({
      json: {
        explanation: "Dim the café.",
        assumptions: ["Keep original artwork."],
        operations: [
          { type: "effects", scene: "cafe", values: { brightness: 0.6 } },
        ],
      },
    });
  });
  await page.addInitScript(() => {
    (window as any).SpeechRecognition = class {
      onresult: any;
      onend: any;
      start() {
        this.onresult({
          results: [[{ transcript: "Make the scene gentler" }]],
        });
        this.onend();
      }
      abort() {}
      stop() {}
    };
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Assistant", exact: true }).click();
  await expect(page.getByText("SERVER AI", { exact: true })).toBeVisible();
  await page.getByLabel("Studio access password").fill("test");
  await page.getByLabel(/Share this request/).check();
  await page.getByRole("button", { name: "Ask AI", exact: true }).click();
  await expect(page.getByText("Dim the café.", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Brightness", { exact: true })).toHaveValue("1");
  await page.getByRole("button", { name: "Apply approved changes" }).click();
  await expect(page.getByLabel("Brightness", { exact: true })).toHaveValue(
    "0.6",
  );
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(page.getByLabel("Brightness", { exact: true })).toHaveValue("1");
  page.on("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Speak your request" }).click();
  await expect(page.getByLabel("Assistant request")).toHaveValue(
    /Make the scene gentler/,
  );
  await expect(page.getByLabel("Brightness", { exact: true })).toHaveValue("1");
});
test("sprite and audio import, QTE authoring and play", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: /Another evening.*dialogue nodes/ })
    .click();
  await page
    .locator("input[type=file]")
    .first()
    .setInputFiles({
      name: "sprite.png",
      mimeType: "image/png",
      buffer: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aY9sAAAAASUVORK5CYII=",
        "base64",
      ),
    });
  await page.getByRole("button", { name: "Tools", exact: true }).click();
  await page.getByRole("button", { name: "Add sprite layer" }).click();
  await expect(page.getByLabel("Sprite x")).toHaveValue("500");
  await page.getByLabel("Sprite x").fill("700");
  await expect(page.locator(".stage svg image").last()).toHaveAttribute(
    "transform",
    /translate\(700/,
  );
  await page.getByRole("button", { name: "Audio", exact: true }).click();
  const wav = Buffer.alloc(1644);
  wav.write("RIFF");
  wav.writeUInt32LE(1636, 4);
  wav.write("WAVEfmt ", 8);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(8000, 24);
  wav.writeUInt32LE(16000, 28);
  wav.writeUInt16LE(2, 32);
  wav.writeUInt16LE(16, 34);
  wav.write("data", 36);
  wav.writeUInt32LE(1600, 40);
  await page
    .getByLabel("Import audio")
    .setInputFiles({ name: "tone.wav", mimeType: "audio/wav", buffer: wav });
  await expect(
    page.getByText("tone.wav", { exact: true }).first(),
  ).toBeVisible();
  await page.getByRole("button", { name: "QTE", exact: true }).click();
  await page.getByRole("button", { name: "Add QTE to this dialogue" }).click();
  await page.getByRole("button", { name: "Play from beginning" }).click();
  await expect(
    page.getByRole("button", { name: "Act · Space / tap" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Act · Space / tap" }).click();
  await expect(
    page.getByRole("button", { name: "Open the message", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Enable scene sound" }),
  ).toBeVisible();
});
