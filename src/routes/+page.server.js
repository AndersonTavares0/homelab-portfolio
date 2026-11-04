import { loadContent } from '../../scripts/content.mjs';

export function load() {
  const { cases } = loadContent();
  return {
    cases: cases.map(({ data, decision, learning }) => ({
      id: data.id,
      title: data.title,
      summary: data.summary,
      technologies: data.technologies,
      technologyContext: data.technologyContext,
      decision,
      learning
    }))
  };
}
