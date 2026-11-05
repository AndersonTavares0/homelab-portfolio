import { describe, expect, it } from 'vitest';
import { caseSection, loadContent, orderedCases, validateCaseSections } from '../scripts/content.mjs';

describe('content catalogue', () => {
  it('loads the five documented studies with valid references', () => {
    const { cases, phases } = loadContent();
    expect(cases.map(item => item.data.id).sort()).toEqual([
      'alert-relay', 'automation', 'gpu-lab', 'observability', 'rss-relay'
    ]);
    for (const item of cases) {
      expect(item.data.title.length).toBeGreaterThan(0);
      expect(item.data.technologyContext.length).toBeGreaterThan(0);
    }
    expect(orderedCases(cases, phases).map(item => item.data.id)).toEqual([
      'automation', 'rss-relay', 'observability', 'alert-relay', 'gpu-lab'
    ]);
  });
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

describe('case section requirements', () => {
  const complete = `## Context
c

## Contribution and decision
d

## Observed result
r

## Learning and next step
l

## Documented state
s
`;

  it('accepts a case that carries every required section', () => {
    expect(() => validateCaseSections(complete, 'example.md')).not.toThrow();
  });

  it('names the source file and the missing section', () => {
    const withoutState = complete.replace(/## Documented state[\s\S]*$/, '');
    expect(() => validateCaseSections(withoutState, 'example.md'))
      .toThrow('content/cases/example.md: missing section Documented state');
  });
});
