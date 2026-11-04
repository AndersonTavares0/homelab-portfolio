import { error } from '@sveltejs/kit';
import { marked } from 'marked';
import { loadContent, orderedCases, readingMinutes } from '../../../../scripts/content.mjs';
import { components, overviewPhase, phases, views } from '../../../model.js';

export const prerender = true;

export function entries() {
  return loadContent().cases.map(item => ({ id: item.data.id }));
}

function takeSection(markdown, heading) {
  const pattern = new RegExp(`^##\\s+${heading}\\s*$`, 'mi');
  const match = pattern.exec(markdown);
  if (!match) return { body: markdown, section: null };
  const rest = markdown.slice(match.index + match[0].length);
  const nextHeading = rest.search(/^##\\s+/m);
  return { body: `${markdown.slice(0, match.index)}${nextHeading === -1 ? '' : rest.slice(nextHeading)}`.trim(), section: (nextHeading === -1 ? rest : rest.slice(0, nextHeading)).trim() || null };
}

const slug = value => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export async function load({ params }) {
  const { cases } = loadContent();
  const item = cases.find(entry => entry.data.id === params.id);
  if (!item) error(404, 'Study not found');
  const componentById = new Map(components.map(component => [component.id, component]));
  const relatedPhase = phases.find(phase => phase.cases.includes(item.data.id) && phase.components.some(id => componentById.get(id)?.caseId === item.data.id)) ?? phases.find(phase => phase.cases.includes(item.data.id)) ?? phases[0];
  const relatedComponent = relatedPhase.components.map(id => componentById.get(id)).find(component => component?.caseId === item.data.id) ?? null;
  const { body, section } = takeSection(item.content, 'Documented state');
  const headings = [...body.matchAll(/^##\s+(.+)$/gm)].map(match => match[1].trim());
  let html = await marked.parse(body);
  for (const heading of headings) html = html.replace(`<h2>${heading}</h2>`, `<h2 id="${slug(heading)}">${heading}</h2>`);
  const documentedState = section ? await marked.parse(section) : null;
  const sections = [...headings.map(heading => ({ id: slug(heading), label: heading })), ...(section ? [{ id: 'case-state-heading', label: 'Documented state' }] : [])];
  const relatedIds = new Set();
  for (const component of components.filter(candidate => candidate.caseId === item.data.id)) {
    for (const relationId of component.relations) {
      const relatedCase = componentById.get(relationId)?.caseId;
      if (relatedCase && relatedCase !== item.data.id) relatedIds.add(relatedCase);
    }
  }
  for (const phase of phases) if (phase.cases.includes(item.data.id)) for (const caseId of phase.cases) if (caseId !== item.data.id) relatedIds.add(caseId);
  const ordered = orderedCases(cases);
  const position = ordered.findIndex(entry => entry.data.id === item.data.id);
  const previous = position > 0 ? ordered[position - 1].data : null;
  const next = position < ordered.length - 1 ? ordered[position + 1].data : null;
  const observatoryState = { defaultPhaseId: overviewPhase.id, phaseId: relatedPhase?.id ?? '', componentId: relatedComponent?.id ?? '' };
  const query = new URLSearchParams();
  if (observatoryState.phaseId && observatoryState.phaseId !== observatoryState.defaultPhaseId) query.set('phase', observatoryState.phaseId);
  if (observatoryState.componentId) query.set('component', observatoryState.componentId);
  return {
    title: item.data.title,
    description: item.data.summary,
    section: 'cases',
    item: { ...item.data, minutes: readingMinutes(item.content) },
    html,
    documentedState,
    sections,
    relatedPhase,
    relatedComponent,
    relatedStudies: [...relatedIds].map(id => cases.find(entry => entry.data.id === id)).filter(Boolean).map(entry => ({ id: entry.data.id, title: entry.data.title, summary: entry.data.summary })),
    previous,
    next,
    observatoryQuery: query.toString(),
    views
  };
}
