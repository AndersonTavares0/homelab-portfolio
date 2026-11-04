import { expect, test } from '@playwright/test';

test('a missing route returns the editorial not-found page', async ({ page }) => {
  const response = await page.goto('/missing-page/');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1, name: 'This page is not here' })).toBeVisible();
  await page.getByRole('link', { name: 'Browse case studies' }).click();
  await expect(page).toHaveURL(/\/cases\/?$/);
});

test('every internal link resolves to a document', async ({ page, request }) => {
  const paths = new Set();
  for (const route of ['/', '/cases/', '/cases/gpu-lab/', '/profile/']) {
    const response = await page.goto(route);
    expect(response?.status(), route).toBeLessThan(400);
    for (const href of await page.$$eval('a[href]', links => links.map(link => link.getAttribute('href')))) {
      if (!href || !href.startsWith('/') || href.startsWith('//')) continue;
      const path = href.split('#')[0].split('?')[0] || '/';
      paths.add(path);
    }
  }
  expect(paths.size).toBeGreaterThanOrEqual(6);
  for (const path of paths) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
  }
});

test('malformed Observatory parameters fall back without breaking the page', async ({ page }) => {
  await page.goto('/?phase=nope&component=nope#observatory');
  await page.waitForFunction(() => !document.querySelector('astro-island')?.hasAttribute('ssr'));
  await expect(page.getByRole('button', { name: 'Foundation' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-component-id][aria-pressed="true"]')).toHaveCount(0);

  await page.goto('/?phase=accelerated&component=services#observatory');
  await page.waitForFunction(() => !document.querySelector('astro-island')?.hasAttribute('ssr'));
  await expect(page.getByRole('button', { name: 'Accelerated computing' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-component-id][aria-pressed="true"]')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Select GPU lab' })).toBeVisible();
});

test('the observatory can copy the current deep link', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/?phase=operations&component=telemetry#observatory');
  await page.waitForFunction(() => !document.querySelector('astro-island')?.hasAttribute('ssr'));

  await page.getByRole('button', { name: 'Copy link' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Link copied' })).toBeVisible();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toContain('phase=operations');
  expect(copied).toContain('component=telemetry');
  expect(copied).toContain('#observatory');
});
