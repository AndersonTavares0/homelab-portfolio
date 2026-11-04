import { expect, test } from '@playwright/test';

const routes = ['/', '/cases/', '/cases/gpu-lab/', '/profile/'];

for (const route of routes) {
  test(`document structure holds on ${route}`, async ({ page }) => {
    await page.goto(route);
    const result = await page.evaluate(() => {
      const ids = [...document.querySelectorAll('[id]')].map(element => element.id);
      const duplicates = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
      const levels = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(heading => Number(heading.tagName[1]));
      const jumps = levels.filter((level, index) => index > 0 && level - levels[index - 1] > 1).length;
      const nested = document.querySelectorAll('a a, button button, a button, button a').length;
      const missingAlt = [...document.querySelectorAll('img')].filter(image => !image.hasAttribute('alt')).length;
      return { duplicates, jumps, nested, missingAlt, h1: document.querySelectorAll('h1').length };
    });
    expect(result.duplicates).toEqual([]);
    expect(result.jumps).toBe(0);
    expect(result.nested).toBe(0);
    expect(result.missingAlt).toBe(0);
    expect(result.h1).toBe(1);
  });
}

test('structured data describes the page', async ({ page }) => {
  await page.goto('/');
  const person = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());
  expect(person['@type']).toBe('Person');
  expect(person.name).toBe('Anderson Tavares');
  expect(person.sameAs).toContain('https://github.com/AndersonTavares0');

  await page.goto('/cases/gpu-lab/');
  const article = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());
  expect(article['@type']).toBe('Article');
  expect(article.headline).toBe('Sharing a GPU safely');
  expect(article.articleSection).toBe('Accelerated computing');
  expect(article.author['@type']).toBe('Person');
});
