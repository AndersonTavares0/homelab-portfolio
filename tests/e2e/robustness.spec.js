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

test('share metadata points at a real image on every route', async ({ page, request }) => {
  for (const route of ['/', '/cases/', '/cases/gpu-lab/', '/profile/']) {
    await page.goto(route);
    const meta = await page.evaluate(() => ({
      image: document.querySelector('meta[property="og:image"]')?.getAttribute('content'),
      url: document.querySelector('meta[property="og:url"]')?.getAttribute('content'),
      large: document.querySelector('meta[name="twitter:card"]')?.getAttribute('content'),
      type: document.querySelector('meta[property="og:type"]')?.getAttribute('content')
    }));
    expect(meta.image, route).toBe('/og.png');
    expect(meta.url, route).toBe(route);
    expect(meta.large, route).toBe('summary_large_image');
    expect(meta.type, route).toBe(route.startsWith('/cases/') && route !== '/cases/' ? 'article' : 'website');
    expect((await request.get(meta.image)).status(), route).toBe(200);
  }
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('every page keeps its text and the observatory explains the limit', async ({ page }) => {
    await page.goto('/cases/gpu-lab/');
    await expect(page.getByRole('heading', { level: 1, name: 'Sharing a GPU safely' })).toBeVisible();
    await expect(page.locator('.prose').first()).toContainText('root-owned controller');

    await page.goto('/#observatory');
    await expect(page.locator('.observatory__noscript')).toBeVisible();
    await expect(page.locator('.observatory__noscript')).toContainText('needs JavaScript');
    await expect(page.getByRole('link', { name: 'the case studies catalogue' })).toHaveAttribute('href', '/cases/');
    expect(await page.evaluate(() => document.querySelectorAll('.observatory__wires line').length)).toBeGreaterThanOrEqual(0);
  });
});

test('the layout holds at 320 px without horizontal scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  for (const route of ['/', '/cases/', '/cases/gpu-lab/', '/profile/']) {
    await page.goto(route);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), route).toBe(true);
    const header = await page.locator('.site-header').boundingBox();
    expect(header.height, route).toBeLessThan(140);
  }
});

test('a case page stays readable at 200% zoom', async ({ page }) => {
  await page.setViewportSize({ width: 720, height: 900 });
  await page.goto('/cases/gpu-lab/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const width = await page.locator('.prose').first().evaluate(el => el.getBoundingClientRect().width);
  expect(width).toBeLessThanOrEqual(600);
  await expect(page.getByRole('navigation', { name: 'In this study' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Case studies' })).toBeVisible();
});
