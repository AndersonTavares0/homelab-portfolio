import 'server-only';

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

const contentRoot = path.join(process.cwd(), 'content');

export type CaseStudy = {
  id: string;
  title: string;
  summary: string;
  technologies: string[];
  technologyContext?: string;
  data: Record<string, any>;
  markdown: string;
  documentedState: string;
  phase: string | null;
  minutes: number;
};

export async function getProfile() {
  const raw = await readFile(path.join(contentRoot, 'profile.md'), 'utf8');
  const { data, content } = matter(raw);
  return { data, content };
}

export async function getCases(): Promise<CaseStudy[]> {
  const { data: timeline } = await getTimeline();
  const phases: Array<{ id: string; name: string; cases: string[] }> = Array.isArray(timeline.phases) ? timeline.phases : [];
  const files = (await readdir(path.join(contentRoot, 'cases'))).filter((file) => file.endsWith('.md'));
  const cases = await Promise.all(files.map(async (file) => {
    const markdown = await readFile(path.join(contentRoot, 'cases', file), 'utf8');
    const { data, content } = matter(markdown);
    const documentedState = content.match(/(?:^|\n)## Documented state\s*\n([\s\S]*?)(?=\n## |$)/i)?.[1]?.trim() ?? '';
    const body = content.replace(/(?:^|\n)## Documented state\s*\n[\s\S]*?(?=\n## |$)/i, '').trim();
    const words = body.split(/\s+/).filter(Boolean).length;
    const id = String(data.id ?? path.basename(file, '.md'));
    return {
      id,
      title: String(data.title ?? id),
      summary: String(data.summary ?? ''),
      technologies: Array.isArray(data.technologies) ? data.technologies.map(String) : [],
      technologyContext: data.technologyContext ? String(data.technologyContext) : undefined,
      data,
      markdown: body,
      documentedState,
      phase: phases.find((phase) => phase.cases.includes(id))?.name ?? null,
      minutes: Math.max(1, Math.ceil(words / 200))
    } satisfies CaseStudy;
  }));
  return cases.sort((a, b) => a.title.localeCompare(b.title));
}

export async function getCase(id: string) {
  return (await getCases()).find((item) => item.id === id);
}

export async function getTimeline() {
  const raw = await readFile(path.join(contentRoot, 'timeline', 'phases.md'), 'utf8');
  const { data, content } = matter(raw);
  return { data, content };
}
