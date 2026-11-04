import { loadContent, orderedCases, readingMinutes } from '../../../scripts/content.mjs';
import { phases } from '../../model.js';

export function load() {
  const { cases } = loadContent();
  return {
    title: 'Case studies',
    description: 'Five documented infrastructure studies: the problem, the decision, the evidence and what stayed unproven.',
    section: 'cases',
    items: orderedCases(cases).map(item => ({
      id: item.data.id,
      title: item.data.title,
      summary: item.data.summary,
      technologies: item.data.technologies,
      phase: phases.find(phase => phase.cases.includes(item.data.id))?.name ?? null,
      minutes: readingMinutes(item.content)
    }))
  };
}
