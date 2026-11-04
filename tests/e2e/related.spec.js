import { expect, test } from '@playwright/test';

test('a case lists related studies drawn from the shared model', async ({ page }) => {
  await page.goto('/cases/gpu-lab/');
  const related = page.locator('[data-case-related]');
  await expect(related).toBeVisible();
  const links = related.getByRole('link');
  await expect(links).toHaveCount(1);
  await expect(links.first()).toContainText('Automation with a review boundary');

  await links.first().click();
  await expect(page).toHaveURL(/\/cases\/automation\/?$/);
  await expect(page.locator('[data-case-related]').getByRole('link').first()).toBeVisible();
});

test('each case links back to its own Observatory context', async ({ page }) => {
  await page.goto('/cases/observability/');
  await expect(page.getByRole('link', { name: 'Return to the Observatory' })).toHaveAttribute('href', /\?phase=operations&component=telemetry#observatory$/);
});
