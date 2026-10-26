import { test, expect } from "@playwright/test";

test("new laptops open the GitHub snapshot and existing local work can restore or undo it", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByLabel("Brightness", { exact: true })).toHaveValue("0.78");
  await page.getByText("Light position", { exact: true }).click();
  await expect(page.getByLabel("Light X", { exact: true })).toHaveValue("53");
  await expect(page.getByLabel("Light Y", { exact: true })).toHaveValue("77");
  await expect(page.locator(".stage svg image")).toHaveAttribute("href", /^data:image\/png;base64,/);
  await page.getByLabel("Brightness", { exact: true }).fill("0.66");
  await expect(page.getByText("Saved on this device", { exact: true })).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: /A table by the window.*dialogue nodes/ }).click();
  await expect(page.getByLabel("Brightness", { exact: true })).toHaveValue("0.66");
  await page.getByRole("button", { name: "Load GitHub snapshot", exact: true }).click();
  await expect(page.getByLabel("Brightness", { exact: true })).toHaveValue("0.78");
  await expect(page.getByLabel("Intensity sequence", { exact: true })).toHaveValue("0, 1, 1.5, 0, 1, 0, 1.5, 1");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(page.getByLabel("Brightness", { exact: true })).toHaveValue("0.66");
});
