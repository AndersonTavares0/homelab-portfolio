import { describe, expect, it } from 'vitest';
import { components, phases, validateModel } from '../src/model.js';
import { caseSection, lead } from '../scripts/content.mjs';

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

describe('required model fields', () => {
  it.each([
    ['description', ''],
    ['type', ''],
    ['technologies', []],
    ['relations', null],
    ['caseId', '']
  ])('reports an invalid component %s at its field path', (field, value) => {
    const component = components[0];
    const original = component[field];
    component[field] = value;
    try {
      expect(() => validateModel(caseIds)).toThrow(`component/host.${field}`);
    } finally {
      component[field] = original;
    }
  });

  it.each(['description', 'challenge', 'learning', 'status', 'next', 'components', 'skills', 'cases'])(
    'reports an invalid phase %s at its field path', field => {
      const phase = phases[0];
      const original = phase[field];
      phase[field] = Array.isArray(original) ? [] : '';
      try {
        expect(() => validateModel(caseIds)).toThrow(`phase/foundation.${field}`);
      } finally {
        phase[field] = original;
      }
    }
  );
});

describe('case section extraction', () => {
  it('keeps multiline paragraphs and stops before the next section', () => {
    const content = '## Contribution and decision\nFirst line.\nSecond line.\n\nAnother paragraph.\n\n## Observed result\nResult.';
    expect(caseSection(content, 'Contribution and decision', 'example.md'))
      .toBe('First line.\nSecond line.\n\nAnother paragraph.');
  });

  it('reports a missing required section and its source file', () => {
    expect(() => caseSection('## Context\nBackground.', 'Learning and next step', 'example.md'))
      .toThrow('content/cases/example.md: missing section Learning and next step');
  });
});

describe('panel summary', () => {
  it('keeps whole sentences that fit the budget', () => {
    expect(lead('First point. Second point. Third point.', 30)).toBe('First point. Second point.');
  });

  it('always keeps the first sentence and never cuts mid-sentence', () => {
    const long = 'A very long opening sentence that exceeds the budget on its own. Then more.';
    expect(lead(long, 10)).toBe('A very long opening sentence that exceeds the budget on its own.');
  });
});
