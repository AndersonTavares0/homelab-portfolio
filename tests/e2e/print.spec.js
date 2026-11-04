import { expect, test } from '@playwright/test';

test('the home page prints as a document', async ({ page }) => {
  await page.goto('/');
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('#observatory')).toBeHidden();
  for (const actions of await page.locator('.hero-actions').all()) await expect(actions).toBeHidden();
  await expect(page.locator('.site-header')).toBeHidden();
  await expect(page.locator('.site-footer')).toBeHidden();
  await expect(page.locator('.print-only')).toHaveCount(2);
  await expect(page.locator('.print-only').first()).toBeVisible();
  await expect(page.getByText('open /#observatory in a browser')).toBeVisible();
});

test('a case study prints without navigation and controls', async ({ page }) => {
  await page.goto('/cases/gpu-lab/');
  await page.emulateMedia({ media: 'print' });
  for (const selector of ['.case-toc', '.case-related', '.case-pager', '.case-return', '.back-link']) {
    await expect(page.locator(selector)).toBeHidden();
  }
  await expect(page.getByRole('heading', { level: 2, name: 'Documented state' })).toBeVisible();
  await expect(page.locator('.prose').first()).toContainText('root-owned controller');
});

test('the professional summary prints without page chrome', async ({ page }) => {
  await page.goto('/profile/');
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.site-header')).toBeHidden();
  await expect(page.locator('.site-footer')).toBeHidden();
  await expect(page.locator('.profile-case')).toHaveCount(5);
});
