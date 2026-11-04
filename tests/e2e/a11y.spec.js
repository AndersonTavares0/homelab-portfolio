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
  for (const path of ['/', '/cases/gpu-lab/', '/profile/']) {
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

test('observatory passes the audit with a component selected', async ({ page }) => {
  await page.goto('/?phase=accelerated&component=gpu#observatory');
  await page.waitForFunction(() => !document.querySelector('astro-island')?.hasAttribute('ssr'));
  await expect(page.getByRole('button', { name: 'Select GPU lab' })).toBeVisible();
  await audit(page, 'observatory with selection');
});
