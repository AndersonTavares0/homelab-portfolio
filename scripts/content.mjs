import fs from 'node:fs';
import matter from 'gray-matter';
import { validateModel } from '../src/model.js';

export function loadContent() {
  const profile = matter(fs.readFileSync('content/profile.md', 'utf8'));
  const files = fs.readdirSync('content/cases').filter(name => name.endsWith('.md'));
  const cases = files.map(file => ({ ...matter(fs.readFileSync(`content/cases/${file}`, 'utf8')), file }));
  const ids = new Set();
  for (const item of cases) {
    const { id, title, summary, technologies } = item.data;
    if (!id || !title || !summary || !Array.isArray(technologies) || !technologies.length || ids.has(id)) throw new Error(`content/cases/${item.file}: missing fields or duplicate ID ${id}`);
    ids.add(id);
  }
  validateModel([...ids]);
  if (!profile.data.title || !profile.data.skills?.length || !profile.content.trim()) throw new Error('content/profile.md: missing profile fields');
  return { profile, cases };
}
if (process.argv[1]?.replaceAll('\\', '/').endsWith('/scripts/content.mjs')) {
  const { profile, cases } = loadContent();
  if (process.argv.includes('--build')) {
    const text = `# ${profile.data.title}\n\n${profile.content.trim()}\n\n## Skills\n\n${profile.data.skills.join(' · ')}\n\n## Projects\n\n${cases.map(c => `- **${c.data.title}** — ${c.data.summary}`).join('\n')}\n\n## Development\n\nThe timeline groups work thematically, not chronologically.\n\nRun npm ci, npm run dev, or npm run build. Generate this README with npm run content:build.\n\nOriginal code is MIT licensed; original text and diagrams are CC BY 4.0.\n`;
    fs.writeFileSync('README.md', text);
  }
  console.log(`Validated ${cases.length} cases and their relationships.`);
}
