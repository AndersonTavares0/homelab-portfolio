import { expect, test } from '@playwright/test';
import { relations, services } from '../../src/explorer.js';

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

test('malformed explorer parameters fall back without breaking the map', async ({ page }) => {
  await page.goto('/?category=nope&service=nope#homelab-explorer');
  await expect(page.getByRole('button', { name: 'All services' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-service-id][aria-pressed="true"]')).toHaveCount(0);
  await expect(page.locator('[data-service-id]:visible')).toHaveCount(services.length);
  await expect.poll(() => new URL(page.url()).searchParams.get('service')).toBe(null);
  await expect.poll(() => new URL(page.url()).searchParams.get('category')).toBe(null);

  await page.goto('/?category=accelerated&component=services#homelab-explorer');
  await expect(page.getByRole('button', { name: 'All services' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-service-id][aria-pressed="true"]')).toHaveCount(0);

  await page.goto('/?category=compute&service=grafana#homelab-explorer');
  await expect(page.getByRole('button', { name: 'Compute' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-service-id][aria-pressed="true"]')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Select Grafana' })).toHaveCount(0);
});

test('the explorer can copy the current deep link', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/?category=observability&service=collector#homelab-explorer');
  await expect(page.getByRole('button', { name: 'Select Telemetry collector' })).toHaveAttribute('aria-pressed', 'true');

  await page.getByRole('button', { name: 'Copy link' }).click();
  await expect(page.locator('.explorer-status')).toContainText('Link copied');
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toContain('service=collector');
  expect(copied).toContain('category=observability');
  expect(copied).toContain('#homelab-explorer');
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
    const imageUrl = new URL(meta.image ?? '', page.url());
    expect(imageUrl.pathname, route).toBe('/og.png');
    expect(meta.url, route).toBe(route);
    expect(meta.large, route).toBe('summary_large_image');
    expect(meta.type, route).toBe(route.startsWith('/cases/') && route !== '/cases/' ? 'article' : 'website');
    expect((await request.get(imageUrl.href)).status(), route).toBe(200);
  }
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('every page keeps its text and the explorer shows a readable static map', async ({ page }) => {
    await page.goto('/cases/gpu-lab/');
    await expect(page.getByRole('heading', { level: 1, name: 'Sharing a GPU safely' })).toBeVisible();
    await expect(page.locator('.prose').first()).toContainText('root-owned controller');

    await page.goto('/#homelab-explorer');
    await expect(page.locator('.explorer-map .explorer-connections')).toBeVisible();
    await expect(page.locator('.explorer-map path[data-relation-id]')).toHaveCount(relations.length);
    await expect(page.locator('[data-service-id]')).toHaveCount(services.length);
    await expect(page.locator('.explorer-noscript')).toBeVisible();
    await expect(page.locator('.explorer-noscript')).toContainText('need JavaScript');
    const catalogueHref = await page.getByRole('link', { name: 'the case studies catalogue' }).getAttribute('href');
    expect(new URL(catalogueHref ?? '', page.url()).pathname).toBe('/cases/');
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

  await page.goto('/cases/rss-relay/');
  const pager = page.getByRole('navigation', { name: 'Case studies' });
  await expect(pager.getByRole('link')).toHaveCount(2);
  for (const box of await pager.getByRole('link').evaluateAll(links => links.map(l => l.getBoundingClientRect().width))) {
    expect(box).toBeLessThan(200);
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
