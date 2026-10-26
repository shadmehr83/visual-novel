import { test, expect } from "@playwright/test";
import { clickScenePoint } from "./stagePoint";
test("shared brush, erase and boundary clipping save correctly and selection targets switch", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1500, height: 1100 });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Add rain zone", exact: true })
    .click();
  const stage = page.getByRole("img", {
    name: "A table by the window live stage",
  });
  await clickScenePoint(stage, 0.3, 0.3);
  await clickScenePoint(stage, 0.7, 0.3);
  await clickScenePoint(stage, 0.7, 0.7);
  await clickScenePoint(stage, 0.3, 0.7);
  const tools = page.getByRole("group", { name: "Selection tools" });
  await tools
    .getByRole("button", {
      name: "Lock selection as outer boundary",
      exact: true,
    })
    .click();
  await tools
    .getByRole("button", { name: "Start empty inside boundary", exact: true })
    .click();
  await tools.getByRole("button", { name: "Paint brush", exact: true }).click();
  await tools.getByLabel("Brush radius").fill("100");
  await clickScenePoint(stage, 0.5, 0.5);
  await expect(page.locator("#rainMask path")).toHaveCount(1);
  const painted = await page.locator("#rainMask path").getAttribute("d");
  await tools.getByRole("button", { name: "Eraser", exact: true }).click();
  await tools.getByLabel("Brush radius").fill("20");
  await clickScenePoint(stage, 0.5, 0.5);
  const erased = await page.locator("#rainMask path").getAttribute("d");
  expect(erased).not.toBe(painted);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(page.locator("#rainMask path")).toHaveAttribute("d", painted!);
  await tools.getByRole("button", { name: "Paint brush", exact: true }).click();
  await clickScenePoint(stage, 0.95, 0.95);
  await expect(page.locator("#rainMask path")).toHaveAttribute("d", painted!);
  await tools
    .getByRole("button", { name: "Snap to edges", exact: true })
    .click();
  await clickScenePoint(stage, 0.5, 0.5);
  await expect(page.locator("#rainMask path")).toHaveCount(1);
  await tools
    .getByRole("button", { name: "Finish zone editing", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Add local light", exact: true })
    .click();
  await page.getByLabel("Local candle light coverage").selectOption("region");
  const local = page
    .locator(".zone-tools .clue")
    .filter({ has: page.getByLabel("Local candle light coverage") });
  await local
    .getByRole("button", { name: "Edit selection / brush", exact: true })
    .click();
  await tools
    .getByLabel("Selection target")
    .selectOption({ label: "rain: Rain zone 2" });
  await expect(tools.getByLabel("Selection target")).toHaveValue("1");
  await tools
    .getByRole("button", { name: "Finish zone editing", exact: true })
    .click();
  await expect(
    page.getByText("Saved on this device", { exact: true }),
  ).toBeVisible();
  await page.reload();
  const stored = await page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve) => {
      const r = indexedDB.open("stillframe-studio");
      r.onsuccess = () => resolve(r.result);
    });
    return new Promise<any>((resolve) => {
      const r = db
        .transaction("projects")
        .objectStore("projects")
        .get("current");
      r.onsuccess = () => {
        db.close();
        resolve(
          r.result.project.scenes.find((s: any) => s.id === "cafe").effects
            .rainZones[1],
        );
      };
    });
  });
  expect(stored.boundary.points).toHaveLength(4);
  expect(stored.path).toContain("M");
});
