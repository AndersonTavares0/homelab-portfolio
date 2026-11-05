import { expect, test } from '@playwright/test';
import { createRequire } from 'node:module';

const axePath = createRequire(import.meta.url).resolve('axe-core/axe.min.js');
const basePath = process.env.SITE_BASE_PATH ?? '';
const route = (pathname) => `${basePath}${pathname}`;

test('home, navigation, and every authored study render', async ({ page }) => {
  await page.goto(route('/'));
  await expect(page.getByRole('heading', { level: 1, name: 'Infrastructure work, documented.' })).toBeVisible();
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Case studies' }).click();
  await expect.poll(() => new URL(page.url()).pathname).toBe(route('/cases/'));
  const studies = page.locator('.project-list a');
  await expect(studies).toHaveCount(5);
  await studies.first().click();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Documented state' })).toBeVisible();
  await expect(page.locator('.reading-content h2')).toHaveCount(4);
});

test('service map filters categories and exposes evidence after selection', async ({ page }) => {
  await page.goto(route('/#service-map'));
  const map = page.getByRole('region', { name: 'Interactive service relationship map' });
  await expect(map).toBeVisible();
  await page.getByRole('button', { name: 'Compute', exact: true }).click();
  await expect(map.getByText('GPU lifecycle controller')).toBeVisible();
  await map.getByText('GPU lifecycle controller').click();
  await expect(page.locator('.map-detail')).toContainText('Evidence and limits');
  await expect(page.locator('.map-detail')).toContainText('HTTP job path was not validated');
});

test('theme control and mobile layout remain usable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(route('/'));
  await expect(page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Service map' })).toBeHidden();
  await page.getByRole('button', { name: /switch to dark theme/i }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.getByRole('button', { name: /switch to light theme/i })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.getByRole('button', { name: 'Select Semaphore: Execution console' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Semaphore/ })).toBeVisible();
});

test('editorial routes pass axe and keyboard focus is visible', async ({ page }) => {
  for (const path of ['/', '/cases/', '/cases/gpu-lab/', '/profile/']) {
    await page.goto(route(path));
    await page.addScriptTag({ path: axePath });
    const violations = await page.evaluate(async () => (await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } })).violations.map((item) => `${item.id}: ${item.help}`));
    expect(violations, `${path}: ${violations.join(', ')}`).toEqual([]);
  }
  await page.goto(route('/'));
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
});

test('export routes correctly at the configured base path', async ({ page }) => {
  await page.goto(route('/cases/automation/'));
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('link', { name: 'All case studies' })).toHaveAttribute('href', route('/cases/'));
  const iconHref = await page.locator('link[rel="icon"]').getAttribute('href');
  expect(iconHref).toContain(route('/icon.svg'));
  expect((await page.request.get(iconHref)).ok()).toBe(true);
});
