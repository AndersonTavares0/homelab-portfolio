import { expect, test } from '@playwright/test';
import { filterServices } from '../../src/explorer.js';

const serviceButton = name => ({ role: 'button', name: `Select ${name}` });

async function openExplorer(page, search = '') {
  await page.goto(`/${search}#homelab-explorer`);
  await expect(page.locator('#homelab-explorer')).toBeVisible();
}

const namesIn = page => page.locator('[data-service-id]:visible').evaluateAll(buttons =>
  buttons.map(button => button.querySelector('strong').textContent)
);

test('arrow, Home and End move focus and selection across the visible services', async ({ page }) => {
  await openExplorer(page, '?category=compute');
  const names = await namesIn(page);
  expect(names).toEqual(filterServices('compute').map(service => service.name));

  const first = page.getByRole('button', serviceButton(names[0]));
  await first.focus();
  await page.keyboard.press('Enter');
  await expect(first).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.explorer-detail').getByRole('heading', { name: names[0] })).toBeVisible();

  await page.keyboard.press('ArrowRight');
  const second = page.getByRole('button', serviceButton(names[1]));
  await expect(second).toBeFocused();
  await expect(second).toHaveAttribute('aria-pressed', 'true');
  await expect(first).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('.explorer-detail').getByRole('heading', { name: names[1] })).toBeVisible();

  await page.keyboard.press('End');
  const last = page.getByRole('button', serviceButton(names.at(-1)));
  await expect(last).toBeFocused();
  await expect(last).toHaveAttribute('aria-pressed', 'true');

  await page.keyboard.press('ArrowRight');
  await expect(first).toBeFocused();
  await expect(first).toHaveAttribute('aria-pressed', 'true');

  await page.keyboard.press('Home');
  await expect(first).toBeFocused();
  await expect(first).toHaveAttribute('aria-pressed', 'true');
});

test('arrow navigation follows the active category and search', async ({ page }) => {
  await openExplorer(page, '?category=delivery');
  await page.getByLabel('Search services').fill('relay');
  const names = await namesIn(page);
  expect(names).toEqual(filterServices('delivery', 'relay').map(service => service.name));
  expect(names.length).toBeGreaterThan(1);

  const first = page.getByRole('button', serviceButton(names[0]));
  await first.focus();
  await page.keyboard.press('End');
  const last = page.getByRole('button', serviceButton(names.at(-1)));
  await expect(last).toBeFocused();
  await expect(last).toHaveAttribute('aria-pressed', 'true');

  await page.keyboard.press('ArrowRight');
  await expect(first).toBeFocused();
  await expect(first).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', serviceButton('Loki'))).toHaveCount(0);
});
