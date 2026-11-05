import { expect, test } from '@playwright/test';

test('the home page shows one communication model with labelled lanes', async ({ page }) => {
  await page.goto('/#how-it-works');
  const workflow = page.locator('[data-workflow="overview"]');
  await expect(workflow).toBeVisible();
  for (const lane of ['Request path', 'Delivery path', 'Management path', 'Ownership and lease', 'Observability bus']) {
    await expect(workflow.getByRole('heading', { name: lane })).toBeVisible();
  }
  await expect(workflow.getByText('Historical documentation · not live traffic')).toBeVisible();
});

test('each case renders its own workflow instead of the shared model', async ({ page }) => {
  await page.goto('/cases/alert-relay/');
  const workflow = page.locator('[data-workflow="alert-relay"]');
  await expect(workflow).toBeVisible();
  await expect(workflow.getByText('Credential boundary', { exact: true })).toBeVisible();
  await expect(page.locator('[data-workflow="overview"]')).toHaveCount(0);
});
