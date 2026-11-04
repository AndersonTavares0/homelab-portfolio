import { describe, expect, it } from 'vitest';
import { components, observatoryLayout, overview, overviewPhase, phases, selectView, views } from '../src/model.js';

describe('Observatory layout', () => {
  it('provides a 2D and 3D position for every system', () => {
    expect(Object.keys(observatoryLayout).sort()).toEqual(components.map(component => component.id).sort());
    for (const layout of Object.values(observatoryLayout)) {
      expect(layout.topology).toHaveLength(2);
      expect(layout.topology.every(value => Number.isFinite(value) && value >= 0 && value <= 100)).toBe(true);
      expect(layout.scene).toHaveLength(3);
      expect(layout.scene.every(Number.isFinite)).toBe(true);
    }
  });
});
describe('view selection', () => {
  it('keeps thematic phases separate from the full-system overview', () => {
    expect(views[0]).toBe(overviewPhase);
    expect(overviewPhase.components).toEqual(components.map(component => component.id));
    expect(overviewPhase.cases).toEqual([...new Set(components.map(component => component.caseId))]);
    expect(views.slice(1)).toEqual(phases);
  });

  it('clears a component that is absent from a selected view', () => {
    expect(selectView({ phaseId: 'accelerated', selectedId: 'services' }, 'accelerated')).toEqual({
      phaseId: 'accelerated',
      selectedId: null
    });
  });

  it('keeps a component that remains present when switching views', () => {
    expect(selectView({ phaseId: 'foundation', selectedId: 'host' }, 'operations')).toEqual({
      phaseId: 'operations',
      selectedId: 'host'
    });
    expect(selectView({ phaseId: 'accelerated', selectedId: 'gpu' }, 'overview')).toEqual({
      phaseId: 'overview',
      selectedId: 'gpu'
    });
  });

  it('rejects an unknown view with its ID', () => {
    expect(() => selectView({ selectedId: null }, 'missing-view')).toThrow('Unknown view: missing-view');
  });
});

describe('overview', () => {
  it('clears component focus while preserving other state', () => {
    expect(overview({ phaseId: 'services', selectedId: 'services', panelOpen: true })).toEqual({
      phaseId: 'services',
      selectedId: null,
      panelOpen: true
    });
  });
});

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
