import { describe, expect, it } from 'vitest';

describe('build configuration merge boundary', () => {
  it('ignores prototype-pollution keys while merging tooling configuration', async () => {
    const { default: safeMerge } = await import('../vendor/deepmerge/index.js');
    const payload = JSON.parse('{"__proto__":{"polluted":true},"constructor":{"polluted":true},"safe":{"enabled":true}}');
    const merged = safeMerge({}, payload);

    expect(merged.safe.enabled).toBe(true);
    expect(Object.prototype.polluted).toBeUndefined();
    expect(merged.polluted).toBeUndefined();
    expect(Object.prototype.hasOwnProperty.call(merged, '__proto__')).toBe(false);
  });
});
