import fs from 'node:fs';
import { loadContent, orderedCases } from './content.mjs';

const { profile, cases, phases, timeline } = loadContent();
const caseById = new Map(cases.map(item => [item.data.id, item]));
const caseRows = orderedCases(cases, phases)
  .map(({ data, file }) => `| [${data.title}](content/cases/${file}) | ${data.summary} | ${data.technologies.join(', ')} |`)
  .join('\n');
const phaseRows = phases
  .map(phase => `| ${phase.name} | ${phase.challenge}<br>${phase.learning} | ${phase.cases.map(id => caseById.get(id).data.title).join(', ')} |`)
  .join('\n');

const lines = [
  '# Homelab project archive',
  '',
  'This repository preserves authored homelab project records and the evidence behind them.',
  '',
  profile.content.trim(),
  '',
  `**Engineer:** ${profile.data.name} · [GitHub profile](${profile.data.github})`,
  '',
  '## Skills',
  '',
  profile.data.skills.join(', '),
  '',
  '## Case studies',
  '',
  'Each study records its context, decision, observed result, learning and documented state. Results remain tied to the evidence and date of their source.',
  '',
  '| Study | Focus | Technologies |',
  '|---|---|---|',
  caseRows,
  '',
  `## ${timeline.data.title}`,
  '',
  timeline.content.trim(),
  '',
  '| Theme | Challenge and learning | Related studies |',
  '|---|---|---|',
  phaseRows,
  '',
  '## Validate the archive',
  '',
  'Requires Node.js 20 or newer.',
  '',
  '```sh',
  'npm ci',
  'npm run content:check',
  'npm run content:build',
  'npm test',
  'npm audit --audit-level=low',
  '```',
  '',
  'These case studies are historical project records, not live telemetry or a current inventory. Their results and limitations apply to the dates and evidence stated in each study.',
  '',
  '## License',
  '',
  'Original writing is [CC BY 4.0](CONTENT-LICENSE.md). Repository tooling is [MIT licensed](LICENSE).',
  ''
];

fs.writeFileSync('README.md', lines.join('\n'));
console.log(`Validated ${cases.length} case studies and generated README.md.`);
