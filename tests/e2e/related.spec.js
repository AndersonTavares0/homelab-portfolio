import { expect, test } from '@playwright/test';

test('a case lists related studies drawn from the shared categories', async ({ page }) => {
  await page.goto('/cases/rss-relay/');
  const related = page.locator('[data-case-related]');
  await expect(related).toBeVisible();
  const links = related.getByRole('link');
  await expect(links).toHaveCount(1);
  await expect(links.first()).toContainText('Safer alert delivery');

  await links.first().click();
  await expect(page).toHaveURL(/\/cases\/alert-relay\/?$/);
  await expect(page.locator('[data-case-related]').getByRole('link').first()).toContainText('Decoupling an RSS relay from inference');
});

test('each case links back to its own Homelab Explorer service', async ({ page }) => {
  await page.goto('/cases/observability/');
  const link = page.getByRole('link', { name: 'Return to the Homelab Explorer' });
  await expect(link).toHaveAttribute('href', /\/\?service=collector#homelab-explorer$/);
});

test('a case offers an index of its own sections', async ({ page }) => {
  await page.goto('/cases/observability/');
  const toc = page.getByRole('navigation', { name: 'In this study' });
  await expect(toc).toBeVisible();
  const links = toc.getByRole('link');
  await expect(links).toHaveCount(5);
  await expect(page.locator('h2#context')).toBeVisible();
  await expect(page.locator('h2#case-state-heading')).toBeVisible();

  await toc.getByRole('link', { name: 'Documented state' }).click();
  await expect(page).toHaveURL(/#case-state-heading$/);
  await expect(page.locator('h2#case-state-heading')).toBeInViewport();
});

test('the case section index has comfortable hit targets on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/cases/observability/');

  const toc = page.getByRole('navigation', { name: 'In this study' });
  const heights = await toc.getByRole('link').evaluateAll(links =>
    links.map(link => link.getBoundingClientRect().height)
  );

  expect(heights).toHaveLength(5);
  expect(heights.every(height => height >= 24)).toBe(true);
});
