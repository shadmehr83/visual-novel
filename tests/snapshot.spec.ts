import { test, expect } from "@playwright/test";

test("new laptops open the GitHub snapshot and existing local work can restore or undo it", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByLabel("Brightness", { exact: true })).toHaveValue(
    "1",
  );
  await page.getByText("Light position", { exact: true }).click();
  await expect(page.getByLabel("Light X", { exact: true })).toHaveValue("68");
  await expect(page.getByLabel("Light Y", { exact: true })).toHaveValue("85");
  await expect(page.locator(".stage svg image")).toHaveAttribute(
    "href",
    /^data:image\/png;base64,/,
  );
  await expect(page.getByLabel("Rain zone name")).toHaveCount(2);
  await expect(page.getByLabel("Rain zone name").first()).toHaveValue("right window");
  await page.getByLabel("Brightness", { exact: true }).fill("0.66");
  await expect(
    page.getByText("Saved on this device", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await page
    .getByRole("button", { name: /A table by the window.*dialogue nodes/ })
    .click();
  await expect(page.getByLabel("Brightness", { exact: true })).toHaveValue(
    "0.66",
  );
  await page
    .getByRole("button", { name: "Load GitHub snapshot", exact: true })
    .click();
  await expect(page.getByLabel("Brightness", { exact: true })).toHaveValue(
    "1",
  );
  await expect(
    page.locator(".lighting-loop-controls").last().getByLabel("Intensity sequence", { exact: true }),
  ).toHaveValue("0, 1, 1.5, 0, 1, 0, 1.75, 1");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(page.getByLabel("Brightness", { exact: true })).toHaveValue(
    "0.66",
  );
});

test("direct snapshot link loads the exported cafe over old local work and preserves recovery across reloads", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByLabel("Brightness", { exact: true })).toHaveValue(
    "1",
  );
  await page.getByLabel("Project title").fill("My older local project");
  await page.getByLabel("Brightness", { exact: true }).fill("0.66");
  await page.getByRole("button", { name: "Background", exact: true }).click();
  await page.getByLabel("Background source", { exact: true }).selectOption("");
  await page
    .getByRole("button", { name: /Another evening.*dialogue nodes/ })
    .click();
  await expect(
    page.getByText("Saved on this device", { exact: true }),
  ).toBeVisible();

  await page.goto("/?snapshot=github");
  await expect(
    page.getByRole("heading", { name: "A table by the window", exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Project title")).toHaveValue(
    "The space between us",
  );
  await expect(page.getByLabel("Brightness", { exact: true })).toHaveValue(
    "1",
  );
  await expect(page.locator(".stage svg image")).toHaveAttribute(
    "href",
    /^data:image\/png;base64,/,
  );
  await page.getByText("Light position", { exact: true }).click();
  await expect(page.getByLabel("Light X", { exact: true })).toHaveValue("68");
  await expect(page.getByLabel("Light Y", { exact: true })).toHaveValue("85");
  await expect(page).not.toHaveURL(/snapshot=github/);
  await expect(
    page.getByRole("button", { name: "Restore previous local project" }),
  ).toBeVisible();

  await page.getByLabel("Brightness", { exact: true }).fill("0.71");
  await expect(
    page.getByText("Saved on this device", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "A table by the window", exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Brightness", { exact: true })).toHaveValue(
    "0.71",
  );
  await page
    .getByRole("button", { name: "Restore previous local project" })
    .click();
  await expect(page.getByLabel("Project title")).toHaveValue(
    "My older local project",
  );
  await expect(page.getByLabel("Brightness", { exact: true })).toHaveValue(
    "0.66",
  );
  await expect(page.locator(".stage svg image")).toHaveCount(0);
});

test("selected scene survives reloading without replacing project data", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: /Another evening.*dialogue nodes/ })
    .click();
  await page.getByLabel("Dialogue text").fill("A local bedroom edit.");
  await expect(
    page.getByText("Saved on this device", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Another evening", exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Dialogue text")).toHaveValue(
    "A local bedroom edit.",
  );
});

test("a failed snapshot write leaves the original saved project intact", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("Project title").fill("Preserve this project");
  await expect(
    page.getByText("Saved on this device", { exact: true }),
  ).toBeVisible();
  await page.addInitScript(() => {
    if (new URLSearchParams(location.search).get("snapshot") !== "github")
      return;
    const put = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (value, key) {
      if (this.name === "projects" && key === "current")
        throw new DOMException("Storage is full", "QuotaExceededError");
      return put.call(this, value, key);
    };
  });
  await page.goto("/?snapshot=github");
  await expect(page.getByRole("alert")).toContainText(
    "Existing saved work was left intact",
  );
  const stored = await page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open("stillframe-studio");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const tx = db.transaction("projects");
    const current = await new Promise<any>((resolve, reject) => {
      const request = tx.objectStore("projects").get("current");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    db.close();
    return current.project.title;
  });
  expect(stored).toBe("Preserve this project");
});
