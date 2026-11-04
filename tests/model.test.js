import { describe, expect, it } from 'vitest';
import { components, overview, overviewPhase, phases, selectView, views } from '../src/model.js';

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
