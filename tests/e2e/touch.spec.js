import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

test('a touch device can select a phase and a component, then clear it', async ({ page }) => {
  await page.goto('/#observatory');
  await page.waitForFunction(() => !document.querySelector('astro-island')?.hasAttribute('ssr'));

  const phases = page.getByRole('group', { name: 'Choose a project view' });
  await phases.getByRole('button', { name: /^Services/ }).tap();
  await expect(phases.getByRole('button', { name: /^Services/ })).toHaveAttribute('aria-pressed', 'true');

  const services = page.getByRole('button', { name: 'Select Container services' });
  await services.tap();
  await expect(services).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.observatory__detail')).toBeInViewport();
  await expect(page.locator('[data-selection-status]')).toContainText('Container services selected');

  await page.getByRole('button', { name: 'Overview' }).tap();
  await expect(page.getByRole('button', { name: 'Overview' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-component-id][aria-pressed="true"]')).toHaveCount(0);
});

test('touch targets stay large enough on the stacked layout', async ({ page }) => {
  await page.goto('/#observatory');
  await page.waitForFunction(() => !document.querySelector('astro-island')?.hasAttribute('ssr'));

  const controls = [
    page.getByRole('button', { name: 'Overview' }),
    page.getByRole('group', { name: 'Choose a project view' }).getByRole('button', { name: 'All systems' }),
    page.getByRole('button', { name: 'Select Virtualization host' })
  ];
  for (const control of controls) {
    const box = await control.boundingBox();
    expect(box.height, await control.getAttribute('aria-label') ?? 'control').toBeGreaterThanOrEqual(24);
  }
});
