import fs from 'node:fs';
import { loadContent } from './content.mjs';

const { profile, cases, timeline, phases } = loadContent();
const text = `# ${profile.data.name}\n\n${profile.content.trim()}\n\n[GitHub profile](${profile.data.github})\n\n![Illustrative infrastructure topology showing virtualization, services, alerting, automation, observation and GPU computing](public/topology.svg)\n\n## Skills\n\n${profile.data.skills.join(' · ')}\n\n## Projects\n\n${cases.map(c => `- **${c.data.title}** — ${c.data.summary}`).join('\n')}\n\n## ${timeline.data.title}\n\n${timeline.content.trim()}\n\n${phases.map(phase => `- **${phase.name}**: ${phase.description} ${phase.status} ${phase.learning} Next: ${phase.next}`).join('\n')}\n\n## Development\n\nRun npm ci, npm run dev, or npm run build. Generate this README with npm run content:build.\n\nOriginal code is MIT licensed; original text and diagrams are CC BY 4.0.\n`;
fs.writeFileSync('README.md', text);
console.log(`Validated ${cases.length} cases and their relationships; generated README.md.`);
