import { test, expect } from "@playwright/test";

test("the complete story leaves the preserved café for rainy pavement and Maria's phone chat", async ({
  page,
}) => {
  test.setTimeout(300000);
  await page.setViewportSize({ width: 1500, height: 1100 });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/?snapshot=github");
  await expect(page.getByLabel("Project title")).toHaveValue("The First Match");
  const background = page.locator(".scene-in .stage svg image").first();
  const cafeImage = await background.getAttribute("href");
  await page.getByRole("button", { name: "Play story", exact: true }).click();
  const dialogue = page.locator(".scene-in .dialogue-overlay");
  await expect(dialogue).toContainText("For a few seconds");
  const bedroomImage = await background.getAttribute("href");
  expect(bedroomImage).toMatch(/^data:image\/png;base64,/);
  expect(bedroomImage).not.toBe(cafeImage);
  const seen = new Set<string>(),
    scenes = new Set<string>();
  let completed = false,
    phoneDeparture = false,
    followup = false;
  for (let i = 0; i < 200; i++) {
    const title = (await page.locator(".preview-header h1").innerText()).trim();
    scenes.add(title);
    const items = page.locator(".scene-in .item-overlay");
    if (await items.isVisible()) {
      if (await items.locator(".item-grid button").count())
        await items.locator(".item-grid button").first().click();
      await items.locator(".item-detail button").first().click();
      continue;
    }
    const phone = page
      .locator(".scene-in")
      .getByRole("region", { name: "Phone conversation" });
    const inPhone = await phone.isVisible();
    const story = page.locator(".scene-in .device-story-progress");
    const outside = await story.isVisible();
    const active = outside ? story : inPhone ? phone : dialogue;
    if (inPhone && !outside)
      await active
        .locator(
          ".device-actions .device-replies button, .device-actions .device-continue",
        )
        .first()
        .waitFor();
    const text = await active.innerText();
    seen.add(text);
    if (title === "A table by the window")
      await expect(background).toHaveAttribute("href", cafeImage!);
    if (title === "After the café") {
      await expect(background).toHaveAttribute(
        "href",
        /^data:image\/webp;base64,/,
      );
      if (inPhone) phoneDeparture = true;
      if (text.includes("ten minutes complaining about cake")) {
        followup = true;
        await expect(
          phone
            .locator(".message-contact")
            .filter({ hasText: "ten minutes complaining about cake" }),
        ).toBeVisible();
      }
    }
    if (text.includes("END OF DEMO")) {
      completed = true;
      break;
    }
    const choices = outside
      ? story.locator("button:not(.device-story-continue)")
      : active.locator(
          ".play-choices button, .device-replies button, .device-story-progress button:not(.device-story-continue)",
        );
    if (await choices.count()) {
      const checkPhone = choices.filter({ hasText: "Check the phone" });
      await ((await checkPhone.count()) ? checkPhone : choices.first()).click();
    } else
      await active
        .getByRole("button", {
          name: outside ? "Continue story" : "Continue",
          exact: true,
        })
        .click();
  }
  expect(completed).toBe(true);
  expect(phoneDeparture).toBe(true);
  expect(followup).toBe(true);
  expect(scenes).toEqual(
    new Set([
      "Another evening",
      "A small possibility",
      "An invitation",
      "Getting ready",
      "The Lantern Room",
      "A table by the window",
      "After the café",
    ]),
  );
  expect([...seen].some((t) => t.includes("orange peel"))).toBe(true);
  expect([...seen].some((t) => t.includes("almost cancelled"))).toBe(true);
  await page
    .getByRole("button", { name: "Back to editor", exact: true })
    .click();
  await page
    .getByRole("button", { name: /A table by the window.*dialogue nodes/ })
    .click();
  await expect(background).toHaveAttribute("href", cafeImage!);
  expect(errors).toEqual([]);
});
