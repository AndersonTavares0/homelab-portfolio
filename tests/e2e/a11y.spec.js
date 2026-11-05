import { expect, test } from '@playwright/test';
import { createRequire } from 'node:module';

const axePath = createRequire(import.meta.url).resolve('axe-core/axe.min.js');

async function audit(page, label) {
  await page.addScriptTag({ path: axePath });
  const result = await page.evaluate(async () => {
    const run = await window.axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] }
    });
    return run.violations.map(v => ({
      id: v.id,
      impact: v.impact,
      help: v.help,
      nodes: v.nodes.slice(0, 3).map(n => n.target.join(' '))
    }));
  });
  expect(result, `axe violations on ${label}: ${JSON.stringify(result, null, 1)}`).toEqual([]);
}

test('editorial routes pass an automated accessibility audit', async ({ page }) => {
  for (const path of ['/', '/cases/', '/cases/gpu-lab/', '/profile/']) {
    await page.goto(path);
    await audit(page, path);
  }
});

test('mobile home and case page pass the audit', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ['/', '/cases/observability/']) {
    await page.goto(path);
    await audit(page, `mobile ${path}`);
  }
});

test('the explorer passes the audit with a service selected', async ({ page }) => {
  await page.goto('/?category=compute&service=gpu-controller#homelab-explorer');
  const service = page.getByRole('button', { name: 'Select GPU lifecycle controller' });
  await expect(service).toBeVisible();
  await expect(service).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.explorer-detail')).toContainText('GPU lifecycle controller');
  await audit(page, 'explorer with selection');
});

test('the stacked explorer passes the audit', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?category=observability&service=grafana#homelab-explorer');
  await expect(page.getByRole('button', { name: 'Select Grafana' })).toHaveAttribute('aria-pressed', 'true');
  await audit(page, 'mobile explorer with selection');
});

test('the not-found page passes the audit', async ({ page }) => {
  const response = await page.goto('/missing-page/');
  expect(response?.status()).toBe(404);
  await audit(page, '404');
});
