import { test, expect } from "@playwright/test";
import { demo } from "../src/demo";
import { type Project } from "../src/model";
test.use({ viewport: { width: 1700, height: 1100 } });
function fixture(): Project {
  const p = demo();
  p.id = "chapters-resize-fixture";
  p.title = "Chapter studio";
  p.scenes = p.scenes.slice(0, 1);
  const a = p.scenes[0];
  a.id = "one";
  a.effects.rain = false;
  a.nodes = [
    {
      id: "pick",
      speaker: "Narrator",
      text: "Will you meet again?",
      choices: [
        {
          id: "yes",
          text: "Yes, another meeting.",
          target: "end",
          actions: [{ key: "trust", op: "set", value: 4 }],
          note: "",
        },
        {
          id: "no",
          text: "No, I would rather leave.",
          target: "end",
          actions: [{ key: "trust", op: "set", value: 0 }],
          note: "",
        },
      ],
    },
    {
      id: "end",
      speaker: "Narrator",
      text: "End of chapter one.",
      choices: [],
    },
  ];
  const b = structuredClone(a);
  b.id = "warm";
  b.title = "A warm morning";
  b.nodes = [
    {
      id: "start",
      speaker: "Narrator",
      text: "The conversation continues warmly.",
      choices: [],
    },
  ];
  const c = structuredClone(b);
  c.id = "quiet";
  c.title = "An independent morning";
  c.nodes = [
    {
      id: "start",
      speaker: "Narrator",
      text: "The morning is yours.",
      choices: [],
    },
  ];
  p.scenes.push(b, c);
  p.chapters = [
    {
      id: "chapter-one",
      title: "First evening",
      notes: "",
      scenes: ["one"],
      startScene: "one",
      starts: [],
      exits: [{ scene: "one", node: "end" }],
      next: "chapter-two",
    },
    {
      id: "chapter-two",
      title: "Next morning",
      notes: "",
      scenes: ["warm", "quiet"],
      startScene: "quiet",
      starts: [
        {
          id: "warm-rule",
          label: "Warm follow-up",
          scene: "warm",
          match: "all",
          conditions: [{ key: "trust", op: "gte", value: 3 }],
        },
      ],
      exits: [],
    },
  ];
  return p;
}
async function load(page: any) {
  await page.goto("/");
  await page
    .locator('input[accept=".json"]')
    .setInputFiles({
      name: "chapters.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(fixture())),
    });
  await expect(page.getByLabel("Project title")).toHaveValue("Chapter studio");
}
async function drag(page: any, locator: any, dx: number, dy: number) {
  const r = await locator.boundingBox();
  await page.mouse.move(r.x + r.width / 2, r.y + r.height / 2);
  await page.mouse.down();
  await page.mouse.move(r.x + r.width / 2 + dx, r.y + r.height / 2 + dy, {
    steps: 12,
  });
  await page.mouse.up();
}
test("docked dividers resize without detaching; only dragging the grip moves a window", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await load(page);
  const panel = page.locator(".bottom-panel");
  const h = (await panel.boundingBox())!.height;
  await drag(
    page,
    page.getByRole("separator", { name: "Resize dialogue panel", exact: true }),
    0,
    -100,
  );
  await expect
    .poll(async () => (await panel.boundingBox())!.height)
    .toBeGreaterThan(h + 60);
  await expect(page.locator("[data-floating-panel]")).toHaveCount(0);
  const width = (await page.locator(".inspector").boundingBox())!.width;
  await drag(
    page,
    page.getByRole("separator", {
      name: "Resize effects and interactions",
      exact: true,
    }),
    -90,
    0,
  );
  await expect
    .poll(async () => (await page.locator(".inspector").boundingBox())!.width)
    .toBeGreaterThan(width + 60);
  await page
    .getByLabel("Separate controls and properties docks", { exact: true })
    .check();
  const fxWidth = (await page.locator(".effects-dock").boundingBox())!.width;
  await drag(
    page,
    page.getByRole("separator", {
      name: "Resize effects and properties split",
      exact: true,
    }),
    60,
    0,
  );
  await expect
    .poll(
      async () => (await page.locator(".effects-dock").boundingBox())!.width,
    )
    .toBeGreaterThan(fxWidth + 35);
  await page
    .getByLabel("Separate controls and properties docks", { exact: true })
    .uncheck();
  await page
    .getByLabel("Dialogue editor window title bar", { exact: true })
    .click({ position: { x: 150, y: 12 } });
  await page
    .getByRole("button", { name: "Drag Dialogue editor window", exact: true })
    .click();
  await expect(page.locator("[data-floating-panel]")).toHaveCount(0);
  await drag(
    page,
    page.getByRole("button", {
      name: "Drag Dialogue editor window",
      exact: true,
    }),
    180,
    -160,
  );
  const floating = page.locator('[data-floating-panel="dialogue"]');
  await expect(floating).toBeVisible();
  const before = (await floating.boundingBox())!.width;
  await drag(
    page,
    page.getByRole("separator", {
      name: "Resize Dialogue editor e edge",
      exact: true,
    }),
    80,
    0,
  );
  await expect
    .poll(async () => (await floating.boundingBox())!.width)
    .toBeGreaterThan(before + 50);
  await page
    .getByRole("button", { name: "Restore Dialogue editor", exact: true })
    .click();
  await expect(floating).toHaveCount(0);
  await page.reload();
  await expect
    .poll(
      async () => (await page.locator(".bottom-panel").boundingBox())!.height,
    )
    .toBeGreaterThan(h + 60);
  expect(errors).toEqual([]);
});
test("chapter authoring groups scenes, previews conditional starts, and playback preserves the chosen state", async ({
  page,
}) => {
  await load(page);
  await page
    .getByRole("tab", { name: "Chapters advanced", exact: true })
    .click();
  await page
    .getByRole("navigation", { name: "Story chapters", exact: true })
    .getByRole("button", { name: /Next morning/ })
    .click();
  await expect(page.getByLabel("Chapter title", { exact: true })).toHaveValue(
    "Next morning",
  );
  await page
    .getByText("Test a previous chapter’s state", { exact: true })
    .click();
  await page.getByLabel("Preview trust", { exact: true }).fill("4");
  await expect(page.locator(".chapter-preview [role=status]")).toContainText(
    "A warm morning",
  );
  await page.getByLabel("Preview trust", { exact: true }).fill("0");
  await expect(page.locator(".chapter-preview [role=status]")).toContainText(
    "An independent morning",
  );
  await page
    .getByRole("button", { name: "Add starting scenario", exact: true })
    .click();
  await expect(page.locator(".chapter-rule")).toHaveCount(2);
  await page
    .getByRole("button", { name: "Remove scenario", exact: true })
    .last()
    .click();
  await page
    .getByRole("button", { name: "Back to editor", exact: true })
    .click();
  await expect(page.getByLabel("Story chapter", { exact: true })).toHaveValue(
    "chapter-one",
  );
  await page.getByRole("button", { name: "Play story", exact: true }).click();
  await page
    .getByRole("button", { name: "Yes, another meeting.", exact: true })
    .click();
  await page
    .locator(".scene-in")
    .getByRole("button", { name: "Continue", exact: true })
    .click();
  await expect(page.locator(".scene-in .dialogue-overlay")).toContainText(
    "The conversation continues warmly.",
  );
  await expect(page.locator(".chapter-badge")).toContainText("Next morning");
});
