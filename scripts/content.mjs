import fs from 'node:fs';
import matter from 'gray-matter';
import { phases } from '../src/model.js';
import { validateExplorer } from '../src/explorer.js';

export function caseSection(content, heading, file) {
  const match = content.match(new RegExp(`(?:^|\\r?\\n)## ${heading}[ \\t]*\\r?\\n([\\s\\S]*?)(?=\\r?\\n## |$)`));
  const text = match?.[1].trim();
  if (!text) throw new Error(`content/cases/${file}: missing section ${heading}`);
  return text;
}

export const REQUIRED_SECTIONS = [
  'Context',
  'Contribution and decision',
  'Observed result',
  'Learning and next step',
  'Documented state'
];

export function validateCaseSections(content, file) {
  for (const heading of REQUIRED_SECTIONS) caseSection(content, heading, file);
}

// The explorer panel summarizes; the case page keeps the full reasoning.
export function lead(text, maxChars = 220) {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const kept = [];
  for (const sentence of sentences) {
    if (kept.length && [...kept, sentence].join(' ').length > maxChars) break;
    kept.push(sentence);
  }
  return kept.join(' ');
}

// Estimated reading time, used by the catalogue and by each study header.
export function readingMinutes(text, wordsPerMinute = 200) {
  return Math.max(1, Math.round(text.trim().split(/\s+/).length / wordsPerMinute));
}

// Catalogue order shared by the index and by previous/next navigation.
export function orderedCases(cases) {
  const rank = id => {
    const index = phases.findIndex(phase => phase.cases.includes(id));
    return index === -1 ? phases.length : index;
  };
  return [...cases].sort((a, b) => rank(a.data.id) - rank(b.data.id) || a.data.title.localeCompare(b.data.title));
}

export function loadContent() {
  const profile = matter(fs.readFileSync('content/profile.md', 'utf8'));
  const files = fs.readdirSync('content/cases').filter(name => name.endsWith('.md'));
  const cases = files.map(file => {
    const item = matter(fs.readFileSync(`content/cases/${file}`, 'utf8'));
    validateCaseSections(item.content, file);
    return {
      ...item, file,
      decision: lead(caseSection(item.content, 'Contribution and decision', file).split(/\n\s*\n/)[0]),
      learning: lead(caseSection(item.content, 'Learning and next step', file).split(/\n\s*\n/)[0])
    };
  });
  const ids = new Set();
  for (const item of cases) {
    const { id, title, summary, technologies, technologyContext } = item.data;
    if (!id || !title || !summary || !Array.isArray(technologies) || !technologies.length || typeof technologyContext !== 'string' || !technologyContext.trim() || ids.has(id)) throw new Error(`content/cases/${item.file}: missing fields or duplicate ID ${id}`);
    ids.add(id);
  }
  validateExplorer([...ids]);
  for (const phase of phases) {
    if (!phase.id?.trim() || !phase.name?.trim() || !phase.description?.trim()) throw new Error('content/timeline/phases.md: phase needs id, name and description');
    if (!Array.isArray(phase.cases) || !phase.cases.length || !phase.cases.every(id => ids.has(id))) throw new Error(`content/timeline/phases.md: phase ${phase.id} has an unknown case`);
    if (!Array.isArray(phase.skills) || !phase.skills.length) throw new Error(`content/timeline/phases.md: phase ${phase.id} needs skills`);
  }
  if (!profile.data.title || !profile.data.name || !profile.data.github || !profile.data.skills?.length || !profile.content.trim()) throw new Error('content/profile.md: missing profile fields');
  const timeline = matter(fs.readFileSync('content/timeline/phases.md', 'utf8'));
  if (!timeline.data.title || !timeline.content.trim()) throw new Error('content/timeline/phases.md: missing title or editorial context');
  return { profile, cases, timeline, phases };
}
if (process.argv[1]?.replaceAll('\\', '/').endsWith('/scripts/content.mjs')) {
  const { cases } = loadContent();
  console.log(`Validated ${cases.length} cases and their relationships.`);
}
