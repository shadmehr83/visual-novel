// Run after npm run build, with npm run preview -- --port 4173 running.
import { chromium } from "playwright";
import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
const base = process.env.PRODUCTION_URL || "http://127.0.0.1:4173";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  headless: true,
});
try {
  const context = await browser.newContext({ serviceWorkers: "block" });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(base);
  await page.getByText("Saved on this device").waitFor();
  const editorDownload = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download local editor", exact: true })
    .click();
  const editor = await editorDownload;
  assert.equal(editor.suggestedFilename(), "stillframe-studio.html");
  const html = await readFile(await editor.path(), "utf8");
  assert.ok(html.includes('data-stillframe-standalone="true"'));
  const networkAssets = [];
  page.on("request", (r) => {
    if (
      ["script", "stylesheet", "image", "font"].includes(r.resourceType()) &&
      !r.url().startsWith("data:")
    )
      networkAssets.push(r.url());
  });
  // Serve only the captured single-file document. All other networking is offline.
  // This environment disallows file:// navigation; an isolated HTTP origin lets us
  // exercise IndexedDB without altering that browser policy.
  await page.route("**/offline-editor", (route) =>
    route.fulfill({ contentType: "text/html", body: html }),
  );
  await context.setOffline(true);
  await page.goto(base + "/offline-editor");
  await page.getByRole("button", { name: "Play story", exact: true }).waitFor();
  await page
    .getByRole("button", { name: /Another evening.*dialogue nodes/ })
    .click();
  await page.getByLabel("Project title").fill("My offline novel");
  await page
    .getByLabel("Dialogue text")
    .fill("Authored inside the single-file editor.");
  await page
    .locator("input[type=file]")
    .first()
    .setInputFiles({
      name: "local.png",
      mimeType: "image/png",
      buffer: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aY9sAAAAASUVORK5CYII=",
        "base64",
      ),
    });
  await page.getByText("local.png", { exact: true }).waitFor();
  await page.getByRole("button", { name: "Assistant", exact: true }).click();
  await page.getByLabel("Assistant request").fill("Dim this scene");
  await page
    .getByRole("button", { name: "Preview offline rain / dim preset" })
    .click();
  await page.getByRole("button", { name: "Apply approved changes" }).click();
  assert.equal(
    await page.getByLabel("Brightness", { exact: true }).inputValue(),
    "0.85",
  );
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  assert.equal(
    await page.getByLabel("Brightness", { exact: true }).inputValue(),
    "1",
  );
  await page.getByText("Saved on this device").waitFor();
  await page.reload();
  await page
    .getByRole("heading", { name: "Another evening", exact: true })
    .waitFor();
  assert.equal(
    await page.getByLabel("Project title").inputValue(),
    "My offline novel",
  );
  assert.equal(
    await page.getByLabel("Dialogue text").inputValue(),
    "Authored inside the single-file editor.",
  );
  assert.match(
    await page.locator(".stage svg image").first().getAttribute("href"),
    /^data:image\/png;base64,/,
  );
  const playerDownload = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export playable HTML", exact: true })
    .click();
  const player = await playerDownload;
  const playerHtml = await readFile(await player.path(), "utf8");
  await page.route("**/offline-player", (route) =>
    route.fulfill({ contentType: "text/html", body: playerHtml }),
  );
  await page.goto(base + "/offline-player");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByRole("button", { name: "Open the message", exact: true })
    .click();
  await page
    .getByRole("button", { name: "I have a ranked list.", exact: false })
    .waitFor();
  assert.deepEqual(networkAssets, []);
  assert.deepEqual(errors, []);
  console.log(
    "PASS: single-file download; offline editor, imported art, dialogue editing, IndexedDB reload, preset approval/undo, and embedded player export/playback; no external assets or page errors.",
  );
} finally {
  await browser.close();
}
