import { loadContent, orderedCases } from '../../scripts/content.mjs';
import { phases } from '../model.js';

export function load() {
  const { cases } = loadContent();
  return {
    cases: orderedCases(cases).map(({ data, decision, learning }) => ({
      id: data.id,
      title: data.title,
      summary: data.summary,
      technologies: data.technologies,
      technologyContext: data.technologyContext,
      decision,
      learning,
      phase: phases.find(phase => phase.cases.includes(data.id))?.name ?? null
    }))
  };
}
