import { test, expect, type Page } from "@playwright/test";
import { demo } from "../src/demo";
function phoneFixture() {
  const p = demo();
  p.title = "Legacy phone navigation";
  p.scenes = p.scenes.slice(0, 2);
  p.scenes.forEach((s, i) => {
    s.effects.rain = false;
    s.transition = { style: "cut", seconds: 0.1 };
    s.phone = {
      enabled: true,
      mode: "chat-only",
      device: "phone",
      contact: "Maria",
      title: "Online",
      avatar: null,
      x: 65,
      y: 50,
      width: 44,
      entrance: { style: "cut", seconds: 0.1 },
      typingSeconds: 0,
      keyboard: true,
    };
    s.nodes = [
      {
        id: "chat-" + i,
        speaker: "Maria",
        text: "A message for scene " + (i + 2),
        choices: [
          {
            id: "reply-" + i,
            text: "My authored reply",
            target: "end-" + i,
            actions: [],
            note: "",
          },
        ],
      },
      { id: "end-" + i, speaker: "Narrator", text: "Done", choices: [] },
    ];
  });
  return p;
}
async function importFixture(page: Page, p = phoneFixture()) {
  await page.goto("/");
  await page
    .locator('input[accept=".json"]')
    .setInputFiles({
      name: "legacy-phone.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(p)),
    });
  await expect(page.getByLabel("Project title")).toHaveValue(p.title);
}
test("legacy phone scenes retain visible Home/back and show dialogue only inside chat", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const p = phoneFixture();
  await importFixture(page, p);
  await page.getByRole("button", { name: "Play story", exact: true }).click();
  for (const s of p.scenes) {
    await page
      .getByRole("button", { name: new RegExp(s.title + ".*dialogue nodes") })
      .click();
    const phone = page.locator(".scene-in .device-overlay");
    await expect(
      phone.getByLabel("Back to phone home", { exact: true }),
    ).toBeVisible();
    await expect(phone.locator(".device-replies")).toContainText(
      "My authored reply",
    );
    await phone.getByLabel("Back to phone home", { exact: true }).click();
    await expect(phone.locator(".phone-home-screen")).toBeVisible();
    await expect(
      phone.locator(
        ".device-actions,.device-narration,.device-replies,.device-keyboard",
      ),
    ).toHaveCount(0);
    await expect(phone.getByLabel("Phone home", { exact: true })).toBeVisible();
    await phone
      .locator(".phone-app-grid")
      .getByRole("button", { name: /Insta/ })
      .click();
    await expect(phone.getByLabel("Insta scrolling feed")).toBeVisible();
    await expect(
      phone.locator(".device-actions,.device-narration,.device-replies"),
    ).toHaveCount(0);
    await phone.getByLabel("Insta scrolling feed").evaluate((el) => {
      el.scrollTop = 180;
    });
    await expect
      .poll(() =>
        phone.getByLabel("Insta scrolling feed").evaluate((el) => el.scrollTop),
      )
      .toBeGreaterThan(0);
    await phone.getByLabel("Back to phone home", { exact: true }).click();
    await phone
      .locator(".phone-app-grid")
      .getByRole("button", { name: /Ember/ })
      .click();
    await expect(phone.locator(".device-replies")).toContainText(
      "My authored reply",
    );
  }
  expect(errors).toEqual([]);
});
test("advanced device Home preview has a single app area, even for a legacy chat-only configuration", async ({
  page,
}) => {
  await importFixture(page);
  await page
    .getByRole("tab", { name: "Advanced devices", exact: true })
    .click();
  const phone = page.locator(".device-live-preview .device-overlay");
  await expect(phone.locator(".phone-home-screen")).toBeVisible();
  await expect(
    phone.locator(".device-actions,.device-narration,.device-replies"),
  ).toHaveCount(0);
  await phone.getByLabel("Back to phone home", { exact: true }).click();
  await phone
    .locator(".phone-app-grid")
    .getByRole("button", { name: /Ember/ })
    .click();
  await expect(phone.locator(".device-actions")).toBeVisible();
  await phone.getByLabel("Phone home", { exact: true }).click();
  await expect(phone.locator(".device-actions")).toHaveCount(0);
});
function olderProject() {
  const p = demo();
  p.id = "97ac1ecf-8e93-4b10-a4e3-802021aa6cf2";
  p.title = "My locally edited First Match";
  const s = p.scenes.at(-1)!;
  p.scenes = [s];
  s.id = "cafe";
  s.title = "A table by the window";
  s.effects.brightness = 0.67;
  s.background = "my-photo";
  p.assets = [
    {
      id: "my-photo",
      name: "My own photo",
      mime: "image/png",
      width: 1,
      height: 1,
      data: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jh1sAAAAASUVORK5CYII=",
      tags: "",
      notes: "Keep my art",
      approved: true,
      reference: false,
    },
  ];
  s.nodes = [
    {
      id: "reflect-warm",
      speaker: "Narrator",
      text: "My saved reflection",
      next: "goodbye",
      choices: [],
    },
    {
      id: "goodbye",
      speaker: "Maria",
      text: "My edited goodbye",
      choices: [
        {
          id: "leave",
          text: "Leave the café",
          target: "contact",
          actions: [],
          note: "",
        },
      ],
    },
    {
      id: "contact",
      speaker: "Narrator",
      text: "My own walk outside",
      choices: [
        {
          id: "look",
          text: "Check the message",
          target: "after-message",
          actions: [],
          note: "",
        },
      ],
    },
    {
      id: "after-message",
      speaker: "Maria · message",
      text: "My edited follow-up",
      choices: [
        { id: "reply", text: "See you", target: "end", actions: [], note: "" },
      ],
    },
    { id: "end", speaker: "Narrator", text: "My saved ending", choices: [] },
  ];
  return p;
}
test("reloading an older saved project adds the rainy departure with phone UI and preserves local art and a recovery copy", async ({
  page,
}) => {
  const p = olderProject();
  await importFixture(page, p);
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          new Promise((resolve) => {
            const r = indexedDB.open("stillframe-studio");
            r.onsuccess = () => {
              const db = r.result,
                q = db
                  .transaction("projects")
                  .objectStore("projects")
                  .get("current");
              q.onsuccess = () => {
                resolve(q.result?.project.title);
                db.close();
              };
            };
          }),
      ),
    )
    .toBe(p.title);
  await page.reload();
  await expect(
    page.getByRole("button", { name: /After the café.*dialogue nodes/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "Restore previous local project",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.locator(".scene-in .stage svg image").first(),
  ).toHaveAttribute("href", p.assets[0].data);
  const backup = await page.evaluate(
    () =>
      new Promise<any>((resolve) => {
        const r = indexedDB.open("stillframe-studio");
        r.onsuccess = () => {
          const db = r.result,
            q = db
              .transaction("projects")
              .objectStore("projects")
              .get("before-studio-update");
          q.onsuccess = () => {
            resolve({
              scenes: q.result.project.scenes.length,
              text: q.result.project.scenes[0].nodes.find(
                (n: any) => n.id === "goodbye",
              ).text,
            });
            db.close();
          };
        };
      }),
  );
  expect(backup).toEqual({ scenes: 1, text: "My edited goodbye" });
  await page.getByRole("button", { name: "Play story", exact: true }).click();
  await page.getByRole("button", { name: "Step outside", exact: true }).click();
  await expect(page.locator(".preview-header h1")).toHaveText("After the café");
  await expect(
    page.locator(".scene-in .stage svg image").first(),
  ).toHaveAttribute("href", /^data:image\/webp;base64,/);
  await expect(page.locator(".scene-in .device-overlay")).toBeVisible();
  await expect(page.locator(".scene-in .device-overlay")).toHaveAttribute(
    "data-device-screen",
    "chat",
  );
});
