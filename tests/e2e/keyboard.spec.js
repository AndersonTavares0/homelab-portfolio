import { expect, test } from '@playwright/test';

const component = name => ({ role: 'button', name: `Select ${name}` });

test('arrow keys move focus and selection across components', async ({ page }) => {
  await page.goto('/?phase=operations#observatory');
  await page.waitForFunction(() => !document.querySelector('astro-island')?.hasAttribute('ssr'));

  const host = page.getByRole('button', component('Virtualization host'));
  await host.focus();
  await page.keyboard.press('Enter');
  await expect(host).toHaveAttribute('aria-pressed', 'true');

  await page.keyboard.press('ArrowRight');
  const services = page.getByRole('button', component('Container services'));
  await expect(services).toBeFocused();
  await expect(services).toHaveAttribute('aria-pressed', 'true');
  await expect(host).toHaveAttribute('aria-pressed', 'false');

  await page.keyboard.press('End');
  const automation = page.getByRole('button', component('Automation'));
  await expect(automation).toBeFocused();
  await expect(automation).toHaveAttribute('aria-pressed', 'true');

  await page.keyboard.press('ArrowRight');
  await expect(host).toBeFocused();
  await expect(host).toHaveAttribute('aria-pressed', 'true');

  await page.keyboard.press('Home');
  await expect(host).toBeFocused();
});

test('arrow navigation follows the selected phase', async ({ page }) => {
  await page.goto('/?phase=accelerated#observatory');
  await page.waitForFunction(() => !document.querySelector('astro-island')?.hasAttribute('ssr'));

  const gpu = page.getByRole('button', component('GPU lab'));
  await gpu.focus();
  await page.keyboard.press('Enter');
  await expect(gpu).toHaveAttribute('aria-pressed', 'true');

  await page.keyboard.press('ArrowLeft');
  const host = page.getByRole('button', component('Virtualization host'));
  await expect(host).toBeFocused();
  await expect(host).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', component('Automation'))).toHaveCount(0);
});
