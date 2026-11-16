const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload();
});

test('workspace opens and core navigation is available', async ({ page }) => {
  await expect(page).toHaveTitle(/Advanced Notes/);
  await expect(page.locator('#new')).toBeVisible();
  await expect(page.locator('#search')).toBeVisible();
  await expect(page.locator('#calendarBtn')).toBeVisible();
  await expect(page.locator('#tasksBtn')).toBeVisible();
});

test('notes autosave locally and survive reload', async ({ page }) => {
  await page.locator('#new').click();
  await page.locator('#title').fill('Regression test note');
  await page.locator('#rich').fill('Saved locally by browser test');
  await page.waitForTimeout(900);
  await page.reload();
  await expect(page.locator('.note').first()).toContainText('Regression test note');
  await page.locator('.note').first().click();
  await expect(page.locator('#title')).toHaveValue('Regression test note');
  await expect(page.locator('#rich')).toContainText('Saved locally by browser test');
});

test('task manager creates and persists a task', async ({ page }) => {
  await page.locator('#tasksBtn').click();
  await page.locator('#taskText').fill('Test task');
  await page.locator('#taskForm button[type="submit"], #taskForm button').click();
  await expect(page.locator('#modal')).toContainText('Test task');
  await page.reload();
  await page.locator('#tasksBtn').click();
  await expect(page.locator('#modal')).toContainText('Test task');
});

test('calendar opens and navigates between months', async ({ page }) => {
  await page.locator('#calendarBtn').click();
  await expect(page.locator('#modal')).toContainText('Select an entry to open it');
  await page.locator('#calNext').click();
  await expect(page.locator('#calPrev')).toBeVisible();
});

test('PWA manifest declares both app icon sizes', async ({ page }) => {
  const manifest = await page.evaluate(async () => {
    const response = await fetch('./manifest.json');
    return response.json();
  });
  expect(manifest.icons.map(icon => icon.sizes)).toEqual(
    expect.arrayContaining(['192x192', '512x512'])
  );
  for (const icon of manifest.icons) {
    const response = await page.request.get(icon.src);
    expect(response.ok()).toBeTruthy();
  }
});

test('mobile viewport keeps primary controls reachable', async ({ page }, testInfo) => {
  if (!testInfo.project.name.includes('mobile')) test.skip();
  await expect(page.locator('#new')).toBeVisible();
  await expect(page.locator('#search')).toBeVisible();
  await expect(page.locator('#title')).toBeVisible();
});
