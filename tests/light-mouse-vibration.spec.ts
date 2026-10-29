import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { demo } from "../src/demo";

test("an existing lamp moves once by mouse, keeps its settings and can be undone", async ({ page }) => {
  const p = demo();
  p.title = "Mouse light placement test";
  p.scenes[0].effects.lights = [{ id: "test-lamp", name: "Test lamp", enabled: true, kind: "local", intensity: .7, color: "#ffbb88", x: 500, y: 280, radius: 180, spread: .4, cycle: { enabled: true, values: [.5, 1, .5], stepSeconds: 1 } }];
  await page.goto("/");
  await page.locator('input[accept=".json"]').setInputFiles({ name: "lamp.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(p)) });
  await expect(page.getByLabel("Project title")).toHaveValue(p.title);
  await page.getByRole("button", { name: /Another evening.*dialogue nodes/ }).click();
  await page.getByRole("button", { name: "Lighting", exact: true }).click();
  const lamp = page.locator('[data-zone-id="test-lamp"]');
  await lamp.getByRole("button", { name: "Move light with mouse", exact: true }).click();
  const point = await page.getByRole("img", { name: "Another evening live stage" }).evaluate(el => {
    const p = new DOMPoint(300, 225).matrixTransform((el as SVGSVGElement).getScreenCTM()!);
    return { x: p.x, y: p.y };
  });
  await page.mouse.click(point.x, point.y);
  // Browser pointer coordinates round to screen pixels; the resized preview
  // can map one screen pixel to several scene units.
  await expect.poll(async () => Math.abs(Number(await lamp.getByLabel("Test lamp x exact value", { exact: true }).inputValue()) - 300)).toBeLessThanOrEqual(2);
  await expect.poll(async () => Math.abs(Number(await lamp.getByLabel("Test lamp y exact value", { exact: true }).inputValue()) - 225)).toBeLessThanOrEqual(2);
  await expect(lamp.getByRole("button", { name: "Move light with mouse", exact: true })).toHaveAttribute("aria-pressed", "false");
  await expect(lamp.getByLabel("Test lamp radius exact value", { exact: true })).toHaveValue("180");
  await expect(lamp.getByLabel("Test lamp intensity exact value", { exact: true })).toHaveValue("0.7");
  await expect(page.locator('[data-effect-panel="Lighting"] [data-zone-id]')).toHaveCount(1);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(lamp.getByLabel("Test lamp x exact value", { exact: true })).toHaveValue("500");
  await expect(lamp.getByLabel("Test lamp y exact value", { exact: true })).toHaveValue("280");
  await lamp.getByRole("button", { name: "Move light with mouse", exact: true }).click();
  await lamp.getByRole("button", { name: "Cancel light move", exact: true }).click();
  await expect(lamp.getByLabel("Test lamp x exact value", { exact: true })).toHaveValue("500");
});

test("second bedroom dialogue plays its embedded vibration sound once", async ({ page }) => {
  const p = JSON.parse(readFileSync(new URL("../projects/published.stillframe.json", import.meta.url), "utf8"));
  const sound = p.audioAssets.find((a: { id: string }) => a.id === "studio-phone-vibration");
  // Real decode catches invalid generated audio; playback spy verifies dialogue timing.
  await page.addInitScript(() => {
    (window as any).playedSounds = [];
    HTMLMediaElement.prototype.play = function () { (window as any).playedSounds.push(this.src); return Promise.resolve(); };
    HTMLMediaElement.prototype.pause = function () {};
  });
  await page.goto("/?snapshot=github");
  const duration = await page.evaluate(async data => {
    const ctx = new AudioContext();
    try { return (await ctx.decodeAudioData(await (await fetch(data)).arrayBuffer())).duration; }
    finally { await ctx.close(); }
  }, sound.data);
  expect(duration).toBeCloseTo(.95, 2);
  await page.getByRole("button", { name: "Play story", exact: true }).click();
  const count = () => page.evaluate(data => (window as any).playedSounds.filter((s: string) => s === data).length, sound.data);
  await expect.poll(count).toBe(0);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.locator(".scene-in")).toContainText("Then my phone vibrates");
  await expect.poll(count).toBe(1);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.locator(".scene-in")).toContainText("The room is familiar");
  expect(await count()).toBe(1);
});
