import { test, expect } from '@playwright/test';

test('scene details scroll independently and stop scroll chaining at both ends', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Keep local project', exact: true }).click();
  await page.getByRole('tab', { name: 'Scenes advanced', exact: true }).click();
  const details = page.getByRole('complementary', { name: 'Flow selection details' });
  await expect(details).toBeVisible();
  const map = page.locator('.flow-canvas');
  const before = await map.evaluate(el => ({ rect: el.getBoundingClientRect().toJSON(), markup: el.innerHTML }));
  const bounds = await details.boundingBox();
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(901);
  expect(await details.evaluate(el => el.scrollHeight)).toBeGreaterThan(bounds!.height);
  await details.hover({ position: { x: 30, y: 160 } });
  await page.mouse.wheel(0, 700);
  await expect.poll(() => details.evaluate(el => el.scrollTop)).toBeGreaterThan(0);
  await details.evaluate(el => { el.scrollTop = el.scrollHeight; });
  await page.mouse.wheel(0, 1000);
  await page.waitForTimeout(250);
  expect(await map.evaluate(el => ({ rect: el.getBoundingClientRect().toJSON(), markup: el.innerHTML }))).toEqual(before);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  expect(await details.evaluate(el => getComputedStyle(el).overscrollBehaviorY)).toBe('contain');
});
