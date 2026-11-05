import { expect, test } from '@playwright/test';

test('the home page shows one communication model with labelled lanes', async ({ page }) => {
  await page.goto('/#how-it-works');
  const workflow = page.locator('[data-workflow="overview"]');
  await expect(workflow).toBeVisible();
  for (const lane of ['Request path', 'Delivery path', 'Management path', 'Ownership and lease', 'Observability bus']) {
    await expect(workflow.getByRole('heading', { name: lane })).toBeVisible();
  }
  await expect(workflow.getByText('Historical documentation · not live traffic')).toBeVisible();
  await expect(workflow.getByText('Manual apply', { exact: true })).toBeVisible();
  await expect(workflow.getByText('A guarded template exists; no apply is recorded.')).toBeVisible();
});

test('the overview groups architecture paths on wide screens and stacks them on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/#how-it-works');
  const overview = page.locator('[data-workflow="overview"] .overview');
  const desktopColumns = await overview.evaluate(element => getComputedStyle(element).gridTemplateColumns.split(' ').length);
  expect(desktopColumns).toBe(2);

  await page.setViewportSize({ width: 390, height: 844 });
  const mobileColumns = await overview.evaluate(element => getComputedStyle(element).gridTemplateColumns.split(' ').length);
  expect(mobileColumns).toBe(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
});

test('each case renders its own workflow instead of the shared model', async ({ page }) => {
  await page.goto('/cases/alert-relay/');
  const workflow = page.locator('[data-workflow="alert-relay"]');
  await expect(workflow).toBeVisible();
  await expect(workflow.getByText('Credential boundary', { exact: true })).toBeVisible();
  await expect(page.locator('[data-workflow="overview"]')).toHaveCount(0);
});
