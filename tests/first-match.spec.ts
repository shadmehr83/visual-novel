import { test, expect } from "@playwright/test";

test("the authored opening plays through the cafe with embedded placeholders and keeps the cafe photograph", async ({
  page,
}) => {
  test.setTimeout(180000);
  await page.setViewportSize({ width: 1500, height: 1100 });
  await page.goto("/?snapshot=github");
  await expect(page.getByLabel("Project title")).toHaveValue("The First Match");
  const cafeImage = await page
    .locator(".scene-in .stage svg image")
    .first()
    .getAttribute("href");
  await page.getByRole("button", { name: "Play story", exact: true }).click();
  const dialogue = page.locator(".scene-in .dialogue-overlay");
  await expect(dialogue).toContainText("For a few seconds");
  const bedroomImage = await page
    .locator(".scene-in .stage svg image")
    .first()
    .getAttribute("href");
  expect(bedroomImage).toMatch(/^data:image\/png;base64,/);
  expect(bedroomImage).not.toBe(cafeImage);
  const seen = new Set<string>();
  let completed = false;
  for (let i = 0; i < 180; i++) {
    const phone = page
      .locator(".scene-in")
      .getByRole("region", { name: "Phone conversation" });
    const active = (await phone.isVisible()) ? phone : dialogue;
    const text = await active.innerText();
    seen.add(text);
    if (i % 15 === 0) console.log("Story step", i, text.slice(0, 90));
    if (text.includes("END OF DEMO")) {
      completed = true;
      break;
    }
    if (await phone.isVisible())
      await active
        .locator(
          ".device-actions .device-replies button, .device-actions .device-continue",
        )
        .first()
        .waitFor();
    const choices = active.locator(
      ".play-choices button, .device-replies button",
    );
    if (await choices.count()) {
      const checkPhone = choices.filter({ hasText: "Check the phone" });
      await ((await checkPhone.count()) ? checkPhone : choices.first()).click();
    } else {
      await active
        .getByRole("button", { name: "Continue", exact: true })
        .click();
    }
  }
  expect(completed).toBe(true);
  expect([...seen].some((t) => t.includes("orange peel"))).toBe(true);
  expect([...seen].some((t) => t.includes("almost cancelled"))).toBe(true);
  await expect(
    page.locator(".scene-in .stage svg image").first(),
  ).toHaveAttribute("href", cafeImage!);
  await page
    .getByRole("button", { name: "Back to editor", exact: true })
    .click();
  await expect(page.getByLabel("Rain zone name")).toHaveCount(2);
});
