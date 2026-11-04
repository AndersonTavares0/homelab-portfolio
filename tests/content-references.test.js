import { describe, expect, it } from 'vitest';
import { components, phases, validateModel } from '../src/model.js';

const caseIds = ['gpu-lab', 'rss-relay', 'alert-relay', 'automation', 'observability'];

describe('content relationship validation', () => {
  it('reports an unknown component case with component path and case ID', () => {
    expect(() => validateModel(caseIds.filter(id => id !== 'automation')))
      .toThrow('component/host: unknown case automation');
  });

  it('reports an unknown component relation with component path and relation ID', () => {
    const component = components.find(item => item.id === 'services');
    const original = component.relations;
    component.relations = [...original, 'missing-component'];
    try {
      expect(() => validateModel(caseIds))
        .toThrow('component/services: unknown relation missing-component');
    } finally {
      component.relations = original;
    }
  });

  it('reports an unknown phase component with phase path and component ID', () => {
    const phase = phases.find(item => item.id === 'services');
    const original = phase.components;
    phase.components = [...original, 'missing-component'];
    try {
      expect(() => validateModel(caseIds))
        .toThrow('phase/services: unknown component missing-component');
    } finally {
      phase.components = original;
    }
  });

  it('reports an unknown phase case with phase path and case ID', () => {
    const phase = phases.find(item => item.id === 'services');
    const original = phase.cases;
    phase.cases = [...original, 'missing-case'];
    try {
      expect(() => validateModel(caseIds))
        .toThrow('phase/services: unknown case missing-case');
    } finally {
      phase.cases = original;
    }
  });
});
