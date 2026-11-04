import { expect, test } from '@playwright/test';

test('the case index lists every study and returns from a case', async ({ page }) => {
  await page.goto('/cases/');
  await expect(page.getByRole('heading', { level: 1, name: 'Case studies' })).toBeVisible();

  const links = page.locator('.case-list a');
  await expect(links).toHaveCount(5);

  for (const title of [
    'Safer alert delivery',
    'Automation with a review boundary',
    'Sharing a GPU safely',
    'Making telemetry failures visible',
    'Decoupling an RSS relay from inference'
  ]) {
    await expect(page.getByRole('link', { name: new RegExp(title) })).toBeVisible();
  }

  const order = await page.locator('.case-list strong').allTextContents();
  expect(order).toEqual([
    'Automation with a review boundary',
    'Decoupling an RSS relay from inference',
    'Making telemetry failures visible',
    'Safer alert delivery',
    'Sharing a GPU safely'
  ]);
  await expect(page.locator('.case-list__meta').first()).toContainText('min read');

  await page.getByRole('link', { name: /Sharing a GPU safely/ }).click();
  await expect(page).toHaveURL(/\/cases\/gpu-lab\/?$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Sharing a GPU safely');
  await page.getByRole('link', { name: 'All case studies' }).click();
  await expect(page).toHaveURL(/\/cases\/?$/);
  await expect(page.locator('.case-list a')).toHaveCount(5);
});

test('the main navigation reaches the index from the home page', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Case studies' }).click();
  await expect(page).toHaveURL(/\/cases\/?$/);
  await expect(page.locator('.case-list a')).toHaveCount(5);
});

test('the index keeps its order and metadata on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/cases/');
  await expect(page.locator('.case-list a')).toHaveCount(5);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('the navigation marks the current section', async ({ page }) => {
  await page.goto('/cases/gpu-lab/');
  await expect(page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Case studies' })).toHaveAttribute('aria-current', 'page');

  await page.goto('/profile/');
  await expect(page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Professional summary' })).toHaveAttribute('aria-current', 'page');

  await page.goto('/');
  await expect(page.locator('header nav a[aria-current="page"]')).toHaveCount(0);
});

test('studies offer previous and next navigation in catalogue order', async ({ page }) => {
  await page.goto('/cases/automation/');
  const pager = page.getByRole('navigation', { name: 'Case studies' });
  await expect(pager.getByRole('link', { name: /Next study/ })).toHaveAttribute('href', '/cases/rss-relay/');
  await expect(pager.getByRole('link', { name: /Previous study/ })).toHaveCount(0);

  await page.goto('/cases/gpu-lab/');
  const last = page.getByRole('navigation', { name: 'Case studies' });
  await expect(last.getByRole('link', { name: /Previous study/ })).toHaveAttribute('href', '/cases/alert-relay/');
  await expect(last.getByRole('link', { name: /Next study/ })).toHaveCount(0);

  await last.getByRole('link', { name: /Previous study/ }).click();
  await expect(page).toHaveURL(/\/cases\/alert-relay\/?$/);
});
