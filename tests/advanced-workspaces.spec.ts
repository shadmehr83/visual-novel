import { test, expect, type Page } from "@playwright/test";
import { demo } from "../src/demo";
function fixture() {
  const p = demo();
  p.title = "Advanced route fixture";
  p.scenes = p.scenes.slice(0, 2);
  const a = p.scenes[0],
    b = p.scenes[1];
  a.title = "Beginning";
  b.title = "Hostile encounter";
  a.effects.rain = false;
  b.effects.rain = false;
  a.nodes = [
    {
      id: "greet",
      speaker: "You",
      text: "A greeting",
      choices: [
        {
          id: "kind",
          text: "Hello warmly",
          routeLabel: "Friendly route",
          target: "friend",
          actions: [{ key: "trust", op: "add", value: 1 }],
          note: "",
        },
        {
          id: "leave",
          text: "Leave me alone",
          routeLabel: "Hostile route",
          target: b.id,
          actions: [],
          note: "",
        },
      ],
    },
    {
      id: "friend",
      speaker: "Maria",
      text: "A friendly answer",
      next: "bye",
      choices: [],
    },
    { id: "bye", speaker: "Narrator", text: "The end", choices: [] },
  ];
  b.nodes = [
    { id: "arrival", speaker: "Narrator", text: "A new scene", choices: [] },
  ];
  return p;
}
async function load(page: Page) {
  await page.goto("/");
  await page
    .locator('input[accept=".json"]')
    .setInputFiles({
      name: "advanced.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(fixture())),
    });
  await expect(page.getByLabel("Project title")).toHaveValue(
    "Advanced route fixture",
  );
}
async function exportProject(page: Page) {
  const download = page.waitForEvent("download");
  await page.locator(".studio-menu").getByText("File", { exact: true }).click();
  await page
    .getByRole("button", { name: "Export project JSON", exact: true })
    .click();
  const file = await download;
  const { readFile } = await import("node:fs/promises");
  return JSON.parse(await readFile((await file.path())!, "utf8"));
}
test("dialogue boxes drag, reconnect real routes, undo, and preserve coordinates through project export", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await load(page);
  await page
    .getByRole("tab", { name: "Dialogue advanced", exact: true })
    .click();
  await page.getByRole("button", { name: "Fit all", exact: true }).click();
  const card = page.locator('[data-flow-card="node:friend"]'),
    heading = card.getByRole("button", { name: "Move 2. Maria", exact: true });
  const before = await card.boundingBox();
  const handle = await heading.boundingBox();
  await page.mouse.move(handle!.x + 35, handle!.y + 18);
  await page.mouse.down();
  await page.mouse.move(handle!.x + 105, handle!.y + 55, { steps: 8 });
  await page.mouse.up();
  await expect
    .poll(async () => Math.round((await card.boundingBox())!.x))
    .toBeGreaterThan(Math.round(before!.x) + 40);
  await page.getByRole("button", { name: "Fit all", exact: true }).click();
  const output = page.getByLabel("Connect Friendly route from 1. You", {
      exact: true,
    }),
    input = page.getByLabel("Connect to 3. Narrator", { exact: true });
  const from = await output.boundingBox(),
    to = await input.boundingBox();
  await page.mouse.move(from!.x + from!.width / 2, from!.y + from!.height / 2);
  await page.mouse.down();
  await page.mouse.move(to!.x + to!.width / 2, to!.y + to!.height / 2, {
    steps: 10,
  });
  await page.mouse.up();
  await expect(
    page.getByRole("status").filter({ hasText: "Story connection updated" }),
  ).toBeVisible();
  let p = await exportProject(page);
  expect(p.scenes[0].nodes[0].choices[0].target).toBe("bye");
  expect(p.scenes[0].nodes[0].choices[0].actions[0].key).toBe("trust");
  expect(p.flowLayout.dialogues.bedroom["node:friend"]).toBeDefined();
  await page.getByLabel("Undo", { exact: true }).click();
  p = await exportProject(page);
  expect(p.scenes[0].nodes[0].choices[0].target).toBe("friend");
  await page.getByLabel("Find in flow map").fill("friendly answer");
  await page.locator(".flow-search-results button").first().click();
  await page.getByLabel("Map dialogue text").fill("Edited from the map");
  await page
    .getByRole("button", {
      name: "All dialogue settings in original editor",
      exact: true,
    })
    .click();
  await expect(page.getByLabel("Dialogue text", { exact: true })).toHaveValue(
    "Edited from the map",
  );
  expect(errors).toEqual([]);
});
test("scene branches have editable route names and drill into the corresponding dialogue map", async ({
  page,
}) => {
  await load(page);
  await page.getByRole("tab", { name: "Scenes advanced", exact: true }).click();
  await page.getByRole("button", { name: "Fit all", exact: true }).click();
  await expect(
    page
      .locator(".flow-route-label")
      .getByText("Hostile route", { exact: true }),
  ).toBeVisible();
  await page
    .locator(".flow-route-label")
    .getByText("Hostile route", { exact: true })
    .click();
  await page.getByLabel("Route name", { exact: true }).fill("Cold welcome");
  await expect(
    page
      .locator(".flow-route-label")
      .getByText("Cold welcome", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Back to box details", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Edit dialogue flow", exact: true })
    .click();
  await expect(
    page.getByRole("tab", { name: "Dialogue advanced", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(page.locator('[data-flow-card="node:greet"]')).toBeVisible();
});
test("history searches old releases and opens feature locations; top dock resizes and persists", async ({
  page,
}) => {
  await load(page);
  await page.getByRole("tab", { name: "Update history", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Update history", exact: true }),
  ).toBeVisible();
  await page.getByLabel("Search update history").fill("Wind and cloth");
  const feature = page
    .locator(".release-feature")
    .filter({
      has: page.getByRole("heading", {
        name: "Wind and cloth / foliage motion",
        exact: true,
      }),
    });
  await expect(feature).toContainText("Editor");
  await feature.getByRole("button", { name: /Open feature location/ }).click();
  await expect(page.locator(".inspector")).toHaveAttribute(
    "data-panel",
    "Motion",
  );
  await page.locator(".studio-menu").getByText("View", { exact: true }).click();
  await page
    .getByRole("button", { name: "Dock controls at top", exact: true })
    .click();
  await expect(page.getByLabel("Controls placement")).toHaveValue("top");
  const inspector = await page.locator(".inspector").boundingBox(),
    stage = await page.locator(".stage").boundingBox();
  expect(inspector!.y + inspector!.height).toBeLessThanOrEqual(stage!.y + 3);
  const divider = page.getByRole("separator", {
    name: "Resize top controls dock",
  });
  await divider.focus();
  await page.keyboard.press("ArrowUp");
  await expect(divider).toHaveAttribute("aria-valuenow", "230");
  await page.reload();
  await expect(page.getByLabel("Controls placement")).toHaveValue("top");
  await expect(
    page.getByRole("separator", { name: "Resize top controls dock" }),
  ).toHaveAttribute("aria-valuenow", "230");
});
