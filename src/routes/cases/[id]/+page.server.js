import { error } from '@sveltejs/kit';
import { marked } from 'marked';
import { loadContent, orderedCases, readingMinutes } from '../../../../scripts/content.mjs';
import { categories, services } from '../../../explorer.js';
import { phases } from '../../../model.js';

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
  const relatedService = services.find(service => service.caseIds.includes(item.data.id)) ?? null;
  const relatedCategory = relatedService ? categories.find(category => category.id === relatedService.category) ?? null : null;
  const categoryIdsFor = caseId => new Set(services.filter(service => service.caseIds.includes(caseId)).map(service => service.category));
  const categoryTheme = categoryIdsFor(item.data.id);
  const relatedPhase = phases.find(phase => phase.cases.includes(item.data.id)) ?? phases[0];
  const { body, section } = takeSection(item.content, 'Documented state');
  const headings = [...body.matchAll(/^##\s+(.+)$/gm)].map(match => match[1].trim());
  let html = await marked.parse(body);
  for (const heading of headings) html = html.replace(`<h2>${heading}</h2>`, `<h2 id="${slug(heading)}">${heading}</h2>`);
  const documentedState = section ? await marked.parse(section) : null;
  const sections = [...headings.map(heading => ({ id: slug(heading), label: heading })), ...(section ? [{ id: 'case-state-heading', label: 'Documented state' }] : [])];
  const ordered = orderedCases(cases);
  const relatedIds = ordered
    .map(entry => entry.data.id)
    .filter(id => id !== item.data.id && [...categoryIdsFor(id)].some(categoryId => categoryTheme.has(categoryId)));
  const position = ordered.findIndex(entry => entry.data.id === item.data.id);
  const previous = position > 0 ? ordered[position - 1].data : null;
  const next = position < ordered.length - 1 ? ordered[position + 1].data : null;
  const query = new URLSearchParams();
  if (relatedService) query.set('service', relatedService.id);
  return {
    title: item.data.title,
    description: item.data.summary,
    section: 'cases',
    item: { ...item.data, minutes: readingMinutes(item.content) },
    html,
    documentedState,
    sections,
    relatedPhase,
    relatedService,
    relatedCategory,
    relatedStudies: relatedIds.map(id => cases.find(entry => entry.data.id === id)).filter(Boolean).map(entry => ({ id: entry.data.id, title: entry.data.title, summary: entry.data.summary })),
    previous,
    next,
    explorerQuery: query.toString()
  };
}
