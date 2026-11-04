import { expect, test } from '@playwright/test';

const componentButton = name => ({ role: 'button', name: `Select ${name}` });
const phaseButton = name => ({ role: 'button', name: new RegExp(`^${name}`) });

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
  await expect(page.locator('.observatory__wires line[data-from="gpu"][data-to="host"]')).toBeAttached();
  await gpu.click();
  await expect(gpu).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-selection-status]')).toContainText('GPU lab selected');
  await expect(page.getByRole('complementary', { name: 'GPU lab' })).toBeVisible();
  const detail = page.locator('.observatory__detail');
  await expect(detail.getByRole('heading', { name: 'Decision and learning' })).toBeVisible();
  await expect(detail).toContainText(/controller/i);
  await expect(detail.getByRole('button', { name: 'Select related system Virtualization host' })).toBeVisible();
  await page.getByRole('button', { name: 'Overview' }).click();
  await expect(gpu).toHaveAttribute('aria-pressed', 'false');
  await gpu.click();
  await expect(page).toHaveURL(/\/\?phase=overview&component=gpu#observatory$/);

  await page.getByRole('link', { name: 'Read the case: Sharing a GPU safely' }).click();
  await expect(page).toHaveURL(/\/cases\/gpu-lab\/\?phase=overview&component=gpu$/);
  await expect(page.getByRole('heading', { name: 'Sharing a GPU safely' })).toBeVisible();
  await expect(page.locator('[data-case-state]').getByRole('heading', { name: 'Documented state' })).toBeVisible();
  await page.getByRole('link', { name: 'Return to the Observatory' }).click();
  await expect(page).toHaveURL(/\/\?phase=overview&component=gpu#observatory$/);
  await expect(page.locator('#observatory')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Overview' })).toHaveAttribute('aria-pressed', 'false');
  await expect(page.getByRole('button', phaseButton('All systems'))).toHaveAttribute('aria-pressed', 'true');
  await expect(gpu).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.observatory__detail')).toContainText('GPU lab');
  assertNoExternalRequests();
});

test('deep links restore a selection and ignore invalid state', async ({ page }) => {
  const assertNoExternalRequests = watchForExternalRequests(page);
  await page.goto('/?phase=accelerated&component=gpu#observatory');
  await page.waitForFunction(() => !document.querySelector('astro-island')?.hasAttribute('ssr'));
  await expect(page.getByRole('button', componentButton('GPU lab'))).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', phaseButton('Accelerated computing'))).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.observatory__detail')).toContainText(/controller/i);

  await page.goto('/?component=gpu#observatory');
  await page.waitForFunction(() => !document.querySelector('astro-island')?.hasAttribute('ssr'));
  await expect(page.getByRole('button', componentButton('GPU lab'))).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', phaseButton('Accelerated computing'))).toHaveAttribute('aria-pressed', 'true');
  await expect(page).toHaveURL(/\/\?phase=accelerated&component=gpu#observatory$/);

  await page.goto('/?phase=missing&component=not-a-node#observatory');
  await page.waitForFunction(() => !document.querySelector('astro-island')?.hasAttribute('ssr'));
  await expect(page.getByRole('button', { name: 'Overview' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: 'All systems' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page).toHaveURL(/\/#observatory$/);
  assertNoExternalRequests();
});

test('a direct case visit returns to its documented phase and component', async ({ page }) => {
  const assertNoExternalRequests = watchForExternalRequests(page);
  await page.goto('/cases/alert-relay/');
  await expect(page.locator('[data-case-state]').getByRole('heading', { name: 'Documented state' })).toBeVisible();
  await expect(page.locator('.case-return')).toContainText('Automation & observability');
  await expect(page.locator('.case-return')).toContainText('Alert relay');
  await page.getByRole('link', { name: 'Return to the Observatory' }).click();
  await expect(page).toHaveURL(/\/\?phase=operations&component=alerts#observatory$/);
  await page.waitForFunction(() => !document.querySelector('astro-island')?.hasAttribute('ssr'));
  await expect(page.getByRole('button', componentButton('Alert relay'))).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', phaseButton('Automation & observability'))).toHaveAttribute('aria-pressed', 'true');
  assertNoExternalRequests();
});

test('a case return preserves a phase without a component', async ({ page }) => {
  const assertNoExternalRequests = watchForExternalRequests(page);
  await page.goto('/cases/gpu-lab/?phase=accelerated');
  await page.getByRole('link', { name: 'Return to the Observatory' }).click();
  await expect(page).toHaveURL(/\/\?phase=accelerated#observatory$/);
  await page.waitForFunction(() => !document.querySelector('astro-island')?.hasAttribute('ssr'));
  await expect(page.getByRole('button', phaseButton('Accelerated computing'))).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: 'Overview' })).toHaveAttribute('aria-pressed', 'false');
  assertNoExternalRequests();
});

test('browser history restores the observatory selection around a case page', async ({ page }) => {
  const assertNoExternalRequests = watchForExternalRequests(page);
  await enterObservatory(page);
  await page.getByRole('button', phaseButton('Services')).click();
  await page.getByRole('button', componentButton('Container services')).click();
  await page.getByRole('link', { name: /^Read the case:/ }).click();
  await expect(page).toHaveURL(/\/cases\/rss-relay\/\?phase=services&component=services$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/\?phase=services&component=services#observatory$/);
  const phaseGroup = page.getByRole('group', { name: 'Choose a project view' });
  await expect(phaseGroup.getByRole('button', phaseButton('Services'))).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', componentButton('Container services'))).toHaveAttribute('aria-pressed', 'true');
  await page.goForward();
  await expect(page).toHaveURL(/\/cases\/rss-relay\//);
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
  await expect(page).toHaveURL(/\/\?phase=services&component=services#observatory$/);
  await expect(page.locator('.observatory__detail')).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  assertNoExternalRequests();
});

test('the full-system map highlights only the selected system relationships', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#observatory');
  await page.waitForFunction(() => !document.querySelector('astro-island')?.hasAttribute('ssr'));

  const map = page.locator('.observatory__map');
  await expect(map.locator('[data-component-id]')).toHaveCount(6);
  await page.getByRole('button', { name: 'Select Virtualization host' }).click();
  await expect(map.locator('.wire-active')).toHaveCount(4);
  await expect(map.locator('.wire-muted')).toHaveCount(2);
  await expect(map.locator('line[data-from="alerts"][data-to="services"]')).toHaveClass(/wire-muted/);
});

test('observatory controls are keyboard operable', async ({ page }) => {
  const assertNoExternalRequests = watchForExternalRequests(page);
  await page.goto('/');
  const enter = page.getByRole('link', { name: 'Enter the Observatory' });
  await enter.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#observatory')).toBeVisible();
  await page.waitForFunction(() => !document.querySelector('astro-island')?.hasAttribute('ssr'));

  const phase = page.getByRole('group', { name: 'Choose a project view' }).getByRole('button', phaseButton('Services'));
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
