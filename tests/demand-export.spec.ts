import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { demo } from "../src/demo";
test("dictated demands save context, hand off without provider calls and survive export and reopening", async ({
  page,
}) => {
  test.setTimeout(60000);
  const aiCalls: string[] = [];
  page.on("request", (r) => {
    if (r.url().includes("/api/assistant")) aiCalls.push(r.method());
  });
  await page.route("**/api/demands", (r) =>
    r.fulfill({ json: { configured: false } }),
  );
  await page.addInitScript(() => {
    (window as any).__opened = [];
    (window as any).__copied = "";
    window.open = ((url: any) => {
      (window as any).__opened.push(String(url));
      return null;
    }) as any;
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: async (text: string) => {
          (window as any).__copied = text;
        },
      },
      configurable: true,
    });
    (window as any).SpeechRecognition = class {
      onresult: any;
      onend: any;
      onerror: any;
      constructor() {
        (window as any).__dictation = this;
      }
      start() {}
      stop() {
        this.onend?.();
      }
      abort() {}
    };
  });
  const p = demo();
  p.id = "demand-fixture";
  p.title = "Demand export fixture";
  await page.goto("/");
  await page
    .locator('input[accept=".json"]')
    .setInputFiles({
      name: "demands.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(p)),
    });
  await page.getByRole("button", { name: "Assistant", exact: true }).click();
  await expect(
    page.getByRole("tab", { name: "AI Demand Export", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await page
    .getByRole("button", { name: "Speak a demand", exact: true })
    .click();
  await page.evaluate(() => {
    const result: any = [{ transcript: "Add a warmer candle to this scene." }];
    result.isFinal = true;
    (window as any).__dictation.onresult({ resultIndex: 0, results: [result] });
  });
  await expect(
    page.getByLabel("AI demand request", { exact: true }),
  ).toHaveValue("Add a warmer candle to this scene.");
  await page
    .getByRole("button", { name: "Stop demand dictation", exact: true })
    .click();
  await page.getByRole("button", { name: "Save request", exact: true }).click();
  await expect(
    page.getByRole("article", { name: "Selected saved demand" }),
  ).toContainText("Add a warmer candle");
  await page
    .getByRole("button", { name: "Copy + open ChatGPT", exact: true })
    .click();
  await expect
    .poll(() => page.evaluate(() => (window as any).__copied))
    .toContain("Dialogue: room");
  await expect
    .poll(() => page.evaluate(() => (window as any).__opened[0]))
    .toContain("https://chatgpt.com/?q=");
  await expect(page.locator(".demand-status")).toContainText("press Send");
  await page
    .getByRole("button", { name: "Save request in GitHub", exact: true })
    .click();
  const url = new URL(
    await page.evaluate(() => (window as any).__opened.at(-1)),
  );
  expect(url.pathname).toBe("/shadmehr83/visual-novel/new/main");
  expect(url.searchParams.get("value")).toContain("Add a warmer candle");
  expect(url.searchParams.get("filename")).toMatch(/^demands\/inbox\//);
  await expect(page.locator(".demand-status")).toContainText("Commit changes");
  await expect(
    page.getByRole("link", { name: "Confirmed GitHub file" }),
  ).toHaveCount(0);
  const wait = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export request log", exact: true })
    .click();
  const log = JSON.parse(readFileSync((await (await wait).path())!, "utf8"));
  expect(log.requests).toHaveLength(1);
  expect(log.requests[0].context.nodeId).toBe("room");
  expect(log.requests[0]).not.toHaveProperty("githubUrl");
  await page
    .getByRole("button", { name: "Mark request done", exact: true })
    .click();
  await expect(
    page.getByText("Saved on this device", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Assistant", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Reopen request", exact: true }),
  ).toBeVisible();
  expect(aiCalls).toEqual([]);
});
test("version badge is concise, update records include times and chapter help explains individual rules", async ({
  page,
}) => {
  await page.goto("/?snapshot=github");
  await expect(page.locator(".engine-version")).toHaveText("v2.17.0");
  await page.locator(".engine-version").click();
  await expect(
    page.locator(".release-entry").first().locator("time"),
  ).toHaveText(/\d{2}:\d{2}:\d{2}/);
  await expect(
    page.getByRole("heading", { name: "AI Demand Export", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("tab", { name: "Chapters advanced", exact: true })
    .click();
  await page.getByLabel("Chapter title", { exact: true }).hover();
  await expect(page.getByRole("tooltip")).toContainText("chapter badge");
  await page
    .getByRole("button", { name: "Add starting scenario", exact: true })
    .click();
  const rules = page.locator(".chapter-rule"),
    last = rules.last();
  await last
    .getByRole("button", { name: "Add condition", exact: true })
    .click();
  await last.getByLabel(/comparison$/).hover();
  await expect(page.getByRole("tooltip")).toContainText("numeric threshold");
  await last
    .getByRole("button", { name: "Higher priority", exact: true })
    .hover();
  await expect(page.getByRole("tooltip")).toContainText("earlier");
});
test("clipboard fallback and a failed direct GitHub save preserve the local request", async ({
  page,
}) => {
  await page.route("**/api/demands", (r) =>
    r.request().method() === "GET"
      ? r.fulfill({ json: { configured: true } })
      : r.fulfill({ status: 502, json: { error: "GitHub unavailable" } }),
  );
  await page.addInitScript(() => {
    window.open = (() => null) as any;
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: async () => {
          throw Error("Clipboard blocked");
        },
      },
      configurable: true,
    });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Assistant", exact: true }).click();
  await page
    .getByLabel("AI demand request", { exact: true })
    .fill("Keep this request when sharing fails.");
  await page
    .getByRole("button", { name: "Copy + open ChatGPT", exact: true })
    .click();
  await expect(page.getByLabel("Manual demand handoff")).toContainText(
    "Keep this request when sharing fails.",
  );
  await page.getByText("Direct GitHub save", { exact: true }).click();
  await page
    .getByLabel("Demand publish password")
    .fill("test-publish-password");
  await page
    .getByRole("button", { name: "Confirm direct GitHub save", exact: true })
    .click();
  await expect(page.locator(".demand-status")).toContainText(
    "local request remains saved",
  );
  await expect(
    page.getByRole("link", { name: "Confirmed GitHub file" }),
  ).toHaveCount(0);
  const wait = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export request log", exact: true })
    .click();
  const log = readFileSync((await (await wait).path())!, "utf8");
  expect(log).toContain("Keep this request when sharing fails.");
  expect(log).not.toContain("test-publish-password");
});
