import { describe, expect, it } from 'vitest';
import { overview, selectPhase } from '../src/model.js';

describe('phase selection', () => {
  it('clears a component that is not present in the selected phase', () => {
    expect(selectPhase({ phaseId: 'accelerated', selectedId: 'services' }, 'accelerated')).toEqual({
      phaseId: 'accelerated',
      selectedId: null
    });
  });

  it('keeps a component that remains present in the selected phase', () => {
    expect(selectPhase({ phaseId: 'foundation', selectedId: 'host' }, 'operations')).toEqual({
      phaseId: 'operations',
      selectedId: 'host'
    });
  });

  it('rejects an unknown phase with its ID', () => {
    expect(() => selectPhase({ selectedId: null }, 'missing-phase')).toThrow('Unknown phase: missing-phase');
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
