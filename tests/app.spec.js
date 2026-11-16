const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
    await new Promise(resolve => { const request = indexedDB.deleteDatabase('advanced-notes-file-vault'); request.onsuccess = request.onerror = request.onblocked = () => resolve(); });
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

test('quick capture creates a note without leaving the workspace', async ({ page }) => {
  await page.locator('#quickCapture').click();
  await page.locator('#quickTitle').fill('Quick capture test');
  await page.locator('#quickBody').fill('Captured from the quick capture dialog');
  await page.locator('#quickForm button[type="submit"]').click();
  await expect(page.locator('.note').first()).toContainText('Quick capture test');
});

test('saved searches can be created and reused', async ({ page }) => {
  await page.locator('#search').fill('meeting');
  page.once('dialog', dialog => dialog.accept('Meeting notes'));
  await page.locator('#saveSearch').click();
  await expect(page.locator('#savedSearches')).toContainText('Meeting notes');
  await page.locator('#search').fill('');
  await page.locator('[data-saved-search="0"]').click();
  await expect(page.locator('#search')).toHaveValue('meeting');
});

test('workspace statistics open and show local totals', async ({ page }) => {
  await page.locator('#statsBtn').click();
  await expect(page.locator('#modal')).toContainText('Workspace statistics');
  await expect(page.locator('#modal')).toContainText('Active notes');
  await page.locator('#statsClose').click();
});

test('header logo, favicon, and PWA icons use the same transparent artwork', async ({ page }) => {
  const iconPath = './icons/icon-512.svg';
  await expect(page.locator('.app-brand img')).toHaveAttribute('src', iconPath);
  await expect(page.locator('link[rel="icon"][type="image/svg+xml"]')).toHaveAttribute('href', iconPath);
  const manifest = await (await page.request.get(new URL('./manifest.json', page.url()).toString())).json();
  const iconResponses = await Promise.all(manifest.icons.map(icon =>
    page.request.get(new URL(icon.src, page.url()).toString())
  ));
  const artwork = await Promise.all(iconResponses.map(response => response.text()));
  expect(artwork[0]).toBe(artwork[1]);
  expect(artwork[0]).not.toMatch(/<rect\b/i);
});

test('deployed root favicon.ico is served successfully', async ({ page }) => {
  test.skip(!process.env.BASE_URL, 'favicon.ico is generated in the Pages build artifact');
  const response = await page.request.get(new URL('./favicon.ico', page.url()).toString());
  expect(response.ok()).toBeTruthy();
  expect(response.headers()['content-type']).toMatch(/image\/(x-icon|vnd.microsoft.icon|ico)/i);
  const bytes = await response.body();
  expect(bytes.subarray(0, 4)).toEqual(Buffer.from([0, 0, 1, 0]));
});


test('note templates create a structured meeting note', async ({ page }) => {
  await page.locator('#templatesBtn').click();
  await page.locator('[data-template="meeting"]').click();
  await expect(page.locator('#title')).toHaveValue(/Meeting notes/);
  await expect(page.locator('#rich')).toContainText('Action items');
  await expect(page.locator('.note').first()).toContainText('Meeting notes');
});

test('related notes can be linked and opened from backlinks', async ({ page }) => {
  await page.locator('#new').click();
  await page.locator('#title').fill('First note');
  await page.locator('#rich').fill('First note body');
  await page.waitForTimeout(700);
  await page.locator('#new').click();
  await page.locator('#title').fill('Second note');
  await page.waitForTimeout(700);
  await page.locator('#linkNoteBtn').click();
  await page.locator('[data-link-choice]').check();
  await page.locator('#relatedClose').click();
  await expect(page.locator('#relatedNotes')).toContainText('First note');
  await page.locator('[data-open-related]').click();
  await expect(page.locator('#title')).toHaveValue('First note');
  await expect(page.locator('#relatedNotes')).toContainText('Second note');
});

test('focus mode hides navigation panes and can be exited', async ({ page }) => {
  await page.locator('#focusBtn').click();
  await expect(page.locator('body')).toHaveClass(/focus-mode/);
  await expect(page.locator('.nav')).toBeHidden();
  await page.locator('#focusBtn').click();
  await expect(page.locator('body')).not.toHaveClass(/focus-mode/);
  await expect(page.locator('.nav')).toBeVisible();
});

test('code snippets can be saved, searched, copied, downloaded and survive reload', async ({ page }) => {
  await page.locator('#codeLibraryBtn').click();
  await page.locator('#codeNew').click();
  await page.locator('#snippetTitle').fill('Example JavaScript');
  await page.locator('#snippetLanguage').selectOption('JavaScript');
  await page.locator('#snippetTags').fill('demo, javascript');
  await page.locator('#snippetSource').fill('const answer = 42;\\nconsole.log(answer);');
  await page.locator('#codeForm button[type="submit"]').click();
  await expect(page.locator('#codeList')).toContainText('Example JavaScript');
  await expect(page.locator('#snippetSource')).toHaveValue('const answer = 42;\\nconsole.log(answer);');
  await page.locator('#codeSearch').fill('console.log');
  await expect(page.locator('#codeList')).toContainText('Example JavaScript');
  const downloadPromise = page.waitForEvent('download');
  await page.locator('#snippetDownload').click();
  const file = await downloadPromise;
  expect(file.suggestedFilename()).toBe('Example-JavaScript.js');
  await page.locator('#codeClose').click();
  await page.reload();
  await page.locator('#codeLibraryBtn').click();
  await expect(page.locator('#codeList')).toContainText('Example JavaScript');
  await expect(page.locator('#snippetSource')).toHaveValue('const answer = 42;\\nconsole.log(answer);');
});

test('universal file vault saves arbitrary formats and restores original file bytes', async ({ page }) => {
  await page.locator('#fileVaultBtn').click();
  const file = {
    name: 'sample.customdata',
    mimeType: 'application/octet-stream',
    buffer: Buffer.from([0, 1, 2, 3, 10, 13, 255])
  };
  await page.locator('#fileInput').setInputFiles(file);
  await expect(page.locator('#fileList')).toContainText('sample.customdata');
  const downloadPromise = page.waitForEvent('download');
  await page.locator('[data-file-download]').click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('sample.customdata');
  const path = await download.path();
  const fs = require('fs');
  expect(fs.readFileSync(path)).toEqual(file.buffer);
  await page.reload();
  await page.locator('#fileVaultBtn').click();
  await expect(page.locator('#fileList')).toContainText('sample.customdata');
});
