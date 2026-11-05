import { expect, test } from '@playwright/test';
import { filterServices, relations, services } from '../../src/explorer.js';

const byId = new Map(services.map(service => [service.id, service]));
const gpuCaseTitle = 'Sharing a GPU safely';

const serviceButton = name => ({ role: 'button', name: `Select ${name}` });
const visibleServices = page => page.locator('[data-service-id]:visible');

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

async function openExplorer(page, search = '') {
  await page.goto(`/${search}#homelab-explorer`);
  await expect(page.locator('#homelab-explorer')).toBeVisible();
}

function params(page) {
  return new URL(page.url()).searchParams;
}

test('the explorer renders a static service map without a 3D runtime', async ({ page }) => {
  const assertNoExternalRequests = watchForExternalRequests(page);
  await openExplorer(page);

  await expect(page.locator('#homelab-explorer')).toBeVisible();
  await expect(page.locator('#homelab-explorer canvas')).toHaveCount(0);
  await expect(page.locator('.explorer-map .explorer-connections')).toBeVisible();
  await expect(page.locator('.explorer-map path[data-relation-id]')).toHaveCount(relations.length);
  await expect(page.getByLabel('Search services')).toBeVisible();
  for (const name of ['All services', 'Automation', 'Delivery', 'Observability', 'Compute']) {
    await expect(page.getByRole('group', { name: 'Service categories' }).getByRole('button', { name, exact: true }), name).toBeVisible();
  }
  for (const service of services) {
    await expect(page.getByRole('button', serviceButton(service.name)), service.name).toBeVisible();
  }
  expect(await visibleServices(page).count()).toBe(services.length);
  assertNoExternalRequests();
});

test('category filtering limits the map to the documented services', async ({ page }) => {
  await openExplorer(page);
  const expected = filterServices('observability');

  await page.getByRole('button', { name: 'Observability' }).click();
  await expect(page.getByRole('button', { name: 'Observability' })).toHaveAttribute('aria-pressed', 'true');
  await expect(visibleServices(page)).toHaveCount(expected.length);
  for (const service of services.filter(item => item.category !== 'observability')) {
    await expect(page.getByRole('button', serviceButton(service.name)), service.name).toHaveCount(0);
  }
  await expect.poll(() => params(page).get('category')).toBe('observability');
  expect(params(page).get('service')).toBe(null);

  await page.getByRole('button', { name: 'All services' }).click();
  await expect(page.getByRole('button', { name: 'All services' })).toHaveAttribute('aria-pressed', 'true');
  await expect(visibleServices(page)).toHaveCount(services.length);
  await expect.poll(() => params(page).get('category')).toBe(null);
});

test('a category change clears a service it hides and keeps a valid one', async ({ page }) => {
  await openExplorer(page, '?category=observability&service=grafana');
  await expect(page.getByRole('button', serviceButton(byId.get('grafana').name))).toHaveAttribute('aria-pressed', 'true');

  await page.getByRole('group', { name: 'Service categories' }).getByRole('button', { name: 'Delivery', exact: true }).click();
  await expect(page.locator('[data-service-id][aria-pressed="true"]')).toHaveCount(0);
  await expect.poll(() => params(page).get('service')).toBe(null);

  await page.getByRole('button', { name: 'Observability' }).click();
  await page.getByRole('button', serviceButton(byId.get('grafana').name)).click();
  await expect(page.getByRole('button', serviceButton(byId.get('grafana').name))).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'All services' }).click();
  await expect(page.getByRole('button', serviceButton(byId.get('grafana').name))).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.explorer-detail').getByRole('heading', { name: byId.get('grafana').name })).toBeVisible();
  await expect.poll(() => params(page).get('category')).toBe(null);
});

test('search finds a service and opens its documented detail', async ({ page }) => {
  await openExplorer(page);
  const service = byId.get('grafana');

  await page.getByLabel('Search services').fill('grafana');
  await expect(visibleServices(page)).toHaveCount(1);
  await page.getByRole('button', serviceButton(service.name)).click();

  await expect(page.getByRole('button', serviceButton(service.name))).toHaveAttribute('aria-pressed', 'true');
  const detail = page.locator('.explorer-detail');
  await expect(detail).toBeVisible();
  await expect(page.getByRole('complementary', { name: service.name })).toBeVisible();
  await expect(detail.getByRole('heading', { name: service.name })).toBeVisible();
  for (const section of ['What it does', 'Why this choice', 'Documented relationships', 'Evidence and limits']) {
    await expect(detail.getByRole('heading', { name: section }), section).toBeVisible();
  }
  await expect(detail).toContainText(service.summary);
  await expect(detail).toContainText(service.decision);
  await expect.poll(() => params(page).get('service')).toBe('grafana');
  expect(params(page).get('q')).toBe('grafana');
});

test('a search with no documented match clears the selected service', async ({ page }) => {
  await openExplorer(page);
  await page.getByRole('button', serviceButton(byId.get('loki').name)).click();
  await expect(page.locator('.explorer-detail')).toContainText(byId.get('loki').name);

  await page.getByLabel('Search services').fill('zzzz-no-match');
  await expect(visibleServices(page)).toHaveCount(0);
  await expect(page.locator('.explorer-empty')).toContainText('No services match');
  await expect.poll(() => params(page).get('service')).toBe(null);
  await expect(page.locator('.explorer-detail')).not.toContainText(byId.get('loki').name);
});

test('the detail can clear its own selection', async ({ page }) => {
  await openExplorer(page, '?category=delivery');
  const service = byId.get('alert-relay');
  await page.getByRole('button', serviceButton(service.name)).click();
  await expect(page.locator('.explorer-detail').getByRole('heading', { name: service.name })).toBeVisible();

  await page.getByRole('button', { name: 'Clear selected service' }).click();
  await expect(page.locator('[data-service-id][aria-pressed="true"]')).toHaveCount(0);
  await expect.poll(() => params(page).get('service')).toBe(null);
  await expect(page.locator('.explorer-detail')).not.toContainText(service.decision);
});

test('a selected service highlights only its documented relations', async ({ page }) => {
  await openExplorer(page, '?category=delivery');
  await page.getByRole('button', serviceButton(byId.get('alert-relay').name)).click();

  const expected = relations.filter(relation => relation.from === 'alert-relay' || relation.to === 'alert-relay');
  expect(expected.length).toBeGreaterThan(0);
  const map = page.locator('.explorer-map');
  await expect(map.locator('path[data-relation-id].is-active')).toHaveCount(expected.length);
  for (const relation of expected) {
    await expect(map.locator(`path[data-relation-id="${relation.id}"]`)).toHaveClass(/is-active/);
  }
  for (const relation of relations.filter(item => !expected.includes(item) && [item.from, item.to].every(id => byId.get(id).category === 'delivery'))) {
    await expect(map.locator(`path[data-relation-id="${relation.id}"]`), relation.id).not.toHaveClass(/is-active/);
  }

  await expect(page.locator('.explorer-detail').getByRole('heading', { name: 'Documented relationships' })).toBeVisible();
  for (const relation of expected) {
    await expect(page.locator('.explorer-detail')).toContainText(relation.label);
  }
  await expect(page.locator('.explorer-status')).toContainText(`${byId.get('alert-relay').name} selected`);

  await page.locator('.explorer-relations').getByRole('button', { name: /Telegram/ }).click();
  await expect(page.locator('.explorer-detail').getByRole('heading', { name: byId.get('telegram').name })).toBeVisible();
  await expect.poll(() => params(page).get('service')).toBe('telegram');
  await expect(page.getByRole('button', serviceButton(byId.get('telegram').name))).toHaveAttribute('aria-pressed', 'true');
});

test('opening the linked case and returning restores the service', async ({ page }) => {
  const assertNoExternalRequests = watchForExternalRequests(page);
  await openExplorer(page, '?category=compute');
  const service = byId.get('gpu-controller');
  await page.getByRole('button', serviceButton(service.name)).click();

  await page.getByRole('link', { name: `Read case: ${gpuCaseTitle}` }).click();
  await expect(page).toHaveURL(/\/cases\/gpu-lab\/(?:\?.*)?$/);
  await expect(page.getByRole('heading', { level: 1, name: gpuCaseTitle })).toBeVisible();

  await page.getByRole('link', { name: 'Return to the Homelab Explorer' }).click();
  await expect(page).toHaveURL(/#homelab-explorer$/);
  await expect(page.getByRole('button', serviceButton(service.name))).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.explorer-detail')).toContainText(service.decision);
  expect(params(page).get('service')).toBe('gpu-controller');
  assertNoExternalRequests();
});

test('deep links restore a valid selection and ignore unknown identifiers', async ({ page }) => {
  await openExplorer(page, '?category=observability&service=grafana');
  await expect(page.getByRole('button', serviceButton(byId.get('grafana').name))).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: 'Observability' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.explorer-detail')).toContainText(byId.get('grafana').decision);

  await openExplorer(page, '?category=not-a-category&service=not-a-service');
  await expect(page.getByRole('button', { name: 'All services' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-service-id][aria-pressed="true"]')).toHaveCount(0);
  await expect(visibleServices(page)).toHaveCount(services.length);
  await expect.poll(() => params(page).get('category')).toBe(null);
  await expect.poll(() => params(page).get('service')).toBe(null);

  await openExplorer(page, '?phase=accelerated&component=gpu');
  await expect(page.getByRole('button', { name: 'All services' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-service-id][aria-pressed="true"]')).toHaveCount(0);
});

test('the map view controls and copied link preserve the current view', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await openExplorer(page, '?category=observability&service=loki');
  const map = page.locator('.explorer-map');
  await expect(map).toHaveAttribute('data-zoom', '1');

  for (const name of ['Zoom in', 'Zoom out', 'Reset view', 'Pan left', 'Pan right', 'Pan up', 'Pan down', 'Copy link']) {
    await expect(page.getByRole('button', { name }), name).toBeEnabled();
  }

  await page.getByRole('button', { name: 'Zoom in' }).click();
  await expect(map).toHaveAttribute('data-zoom', '1.1');
  await page.getByRole('button', { name: 'Pan left' }).click();
  expect(await map.evaluate(element => element.style.getPropertyValue('--pan-x'))).toBe('80px');
  await page.getByRole('button', { name: 'Reset view' }).click();
  await expect(map).toHaveAttribute('data-zoom', '1');
  expect(await map.evaluate(element => element.style.getPropertyValue('--pan-x'))).toBe('0px');
  await expect(page.locator('.explorer-detail')).toContainText(byId.get('loki').decision);

  await page.getByRole('button', { name: 'Copy link' }).click();
  await expect(page.locator('.explorer-status')).toContainText('Link copied');
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toContain('service=loki');
  expect(copied).toContain('category=observability');
  expect(copied).toContain('#homelab-explorer');
});

test('the same map stays usable when WebGL is unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (contextType, ...args) {
      if (['webgl', 'webgl2', 'experimental-webgl'].includes(contextType)) return null;
      return getContext.call(this, contextType, ...args);
    };
  });
  await openExplorer(page);
  await expect(page.locator('.explorer-map .explorer-connections')).toBeVisible();
  const service = byId.get('proxmox');
  await page.getByRole('button', serviceButton(service.name)).click();
  await expect(page.locator('.explorer-detail')).toContainText(service.summary);
});

test('reduced motion keeps the service selection available', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openExplorer(page, '?category=automation');
  const service = byId.get('ansible');
  await page.getByRole('button', serviceButton(service.name)).click();
  await expect(page.getByRole('button', serviceButton(service.name))).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.explorer-detail').getByRole('heading', { name: service.name })).toBeVisible();
});

test('mobile keeps the explorer filters and detail readable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openExplorer(page);
  await page.getByRole('button', { name: 'Compute' }).click();
  await expect(visibleServices(page)).toHaveCount(filterServices('compute').length);

  const service = byId.get('gpu-controller');
  await page.getByRole('button', serviceButton(service.name)).click();
  await expect(page.locator('.explorer-detail')).toBeInViewport();
  await expect(page.locator('.explorer-detail')).toContainText(service.summary);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
