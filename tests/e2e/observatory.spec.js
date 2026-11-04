import { expect, test } from '@playwright/test';

const componentButton = name => ({ role: 'button', name: `Select ${name}` });
const phaseButton = name => ({ role: 'button', name });

function watchForExternalRequests(page) {
  const external = [];
  page.on('request', request => {
    const url = new URL(request.url());
    if (url.protocol !== 'data:' && url.protocol !== 'blob:' && !['127.0.0.1', 'localhost'].includes(url.hostname)) {
      external.push(url.origin);
    }
  });
  return () => expect(external, 'page must not contact any non-local origin').toEqual([]);
}

async function enterObservatory(page) {
  await page.goto('/');
  await page.getByRole('link', { name: 'Enter the Observatory' }).click();
  await expect(page.locator('#observatory')).toBeVisible();
  await page.waitForFunction(() => !document.querySelector('astro-island')?.hasAttribute('ssr'));
}

test('phase, component, case and return preserve the exploration path', async ({ page }) => {
  const assertNoExternalRequests = watchForExternalRequests(page);
  await enterObservatory(page);

  await page.getByRole('button', phaseButton('Accelerated computing')).click();
  const gpu = page.getByRole('button', componentButton('GPU lab'));
  await expect(gpu).toBeVisible();
  await gpu.click();
  await expect(gpu).toHaveAttribute('aria-pressed', 'true');

  await page.getByRole('link', { name: 'Read the case: Sharing a GPU safely' }).click();
  await expect(page).toHaveURL(/\/cases\/gpu-lab\/?$/);
  await expect(page.getByRole('heading', { name: 'Sharing a GPU safely' })).toBeVisible();
  await page.getByRole('link', { name: 'Return to the Observatory' }).click();
  await expect(page.locator('#observatory')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Overview' })).toHaveAttribute('aria-pressed', 'true');
  assertNoExternalRequests();
});

test('mobile topology exposes phase and component selection without horizontal overflow', async ({ page }) => {
  const assertNoExternalRequests = watchForExternalRequests(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await enterObservatory(page);
  await expect(page.getByRole('button', phaseButton('Services'))).toBeVisible();
  await page.getByRole('button', phaseButton('Services')).click();
  const services = page.getByRole('button', componentButton('Container services'));
  await expect(services).toBeVisible();
  await services.click();
  await expect(services).toHaveAttribute('aria-pressed', 'true');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  assertNoExternalRequests();
});

test('observatory controls are keyboard operable', async ({ page }) => {
  const assertNoExternalRequests = watchForExternalRequests(page);
  await page.goto('/');
  const enter = page.getByRole('link', { name: 'Enter the Observatory' });
  await enter.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#observatory')).toBeVisible();
  await page.waitForFunction(() => !document.querySelector('astro-island')?.hasAttribute('ssr'));

  const phase = page.getByRole('group', { name: 'Choose a project phase' }).getByRole('button', phaseButton('Services'));
  await phase.focus();
  await page.keyboard.press('Enter');
  await expect(phase).toHaveAttribute('aria-pressed', 'true');
  assertNoExternalRequests();
});

test('reduced motion keeps phase and component navigation available', async ({ page }) => {
  const assertNoExternalRequests = watchForExternalRequests(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await enterObservatory(page);
  await page.getByRole('button', phaseButton('Accelerated computing')).click();
  const gpu = page.getByRole('button', componentButton('GPU lab'));
  await gpu.click();
  await expect(gpu).toHaveAttribute('aria-pressed', 'true');
  assertNoExternalRequests();
});

test('unavailable WebGL leaves the accessible topology usable', async ({ page }) => {
  const assertNoExternalRequests = watchForExternalRequests(page);
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (contextType, ...args) {
      if (['webgl', 'webgl2', 'experimental-webgl'].includes(contextType)) return null;
      return getContext.call(this, contextType, ...args);
    };
  });
  await enterObservatory(page);
  await expect(page.locator('[data-webgl-fallback]')).toBeVisible();
  const host = page.getByRole('button', componentButton('Virtualization host'));
  await host.click();
  await expect(host).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#observatory')).toHaveAttribute('data-scene-mode', 'topology');
  assertNoExternalRequests();
});
