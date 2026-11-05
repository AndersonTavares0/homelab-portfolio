import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

test('a touch device selects a category and a service, then clears the detail', async ({ page }) => {
  await page.goto('/#homelab-explorer');
  await expect(page.locator('#homelab-explorer')).toBeVisible();

  const categories = page.getByRole('group', { name: 'Service categories' });
  await categories.getByRole('button', { name: 'Compute' }).tap();
  await expect(categories.getByRole('button', { name: 'Compute' })).toHaveAttribute('aria-pressed', 'true');

  const service = page.getByRole('button', { name: 'Select GPU lifecycle controller' });
  await service.tap();
  await expect(service).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.explorer-detail')).toBeInViewport();
  await expect(page.locator('.explorer-status')).toContainText('GPU lifecycle controller selected');

  await page.getByRole('button', { name: 'Clear selected service' }).tap();
  await expect(page.locator('[data-service-id][aria-pressed="true"]')).toHaveCount(0);
  expect(new URL(page.url()).searchParams.get('service')).toBe(null);
});

test('touch targets stay large enough on the stacked layout', async ({ page }) => {
  await page.goto('/#homelab-explorer');
  await expect(page.locator('#homelab-explorer')).toBeVisible();

  const controls = [
    page.getByRole('button', { name: 'All services' }),
    page.getByRole('button', { name: 'Select Proxmox' }),
    page.getByRole('button', { name: 'Select Uptime Kuma' })
  ];
  for (const control of controls) {
    const box = await control.boundingBox();
    expect(box.height).toBeGreaterThanOrEqual(24);
  }
});
