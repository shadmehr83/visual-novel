import { test, expect } from '@playwright/test';

test('artwork expands and closes without changing the project', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Assets', exact: true }).click();
  await page.locator('.asset-card').first().click();
  await page.getByRole('button', { name: 'Expand image', exact: true }).click();
  const preview = page.getByRole('dialog', { name: 'Artwork preview' });
  await expect(preview).toBeVisible();
  await expect(preview.locator('img')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(preview).toHaveCount(0);
  await page.getByRole('button', { name: 'Expand image', exact: true }).click();
  await page.getByRole('button', { name: 'Close preview', exact: true }).click();
  await expect(preview).toHaveCount(0);
});

test('progress saves reuse artwork and restore latest runtime; snapshot resets it', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Saved on this device', { exact: true }).first()).toBeVisible();
  const result = await page.evaluate(async () => {
    const { save, load, openGithubSnapshot, loadSnapshotRecovery } = await import('/src/storage.ts');
    const { demo } = await import('/src/demo.ts');
    const { start } = await import('/src/model.ts');
    const { openDB } = await import('/node_modules/.vite/deps/idb.js');
    const p = demo();
    const r = start(p);
    await save(p, r);
    const db = await openDB('stillframe-studio', 1);
    const firstToken = await db.get('projects', 'current-project-token');
    const next = { ...r, history: [...r.history, 'Progress saved separately'] };
    await save(p, next);
    const secondToken = await db.get('projects', 'current-project-token');
    const restored = await load();
    const changed = { ...p, title: 'Changed project' };
    await save(changed, next);
    const thirdToken = await db.get('projects', 'current-project-token');
    await openGithubSnapshot(p);
    const recovery = await loadSnapshotRecovery();
    const reset = await load();
    return { recoveredHistory: recovery?.runtime?.history, reused: firstToken === secondToken, renewed: secondToken !== thirdToken, history: restored?.runtime?.history, reset: reset?.runtime, title: reset?.project.title };
  });
  expect(result.reused).toBe(true);
  expect(result.renewed).toBe(true);
  expect(result.history).toContain('Progress saved separately');
  expect(result.reset).toBeNull();
  expect(result.recoveredHistory).toContain("Progress saved separately");
});
