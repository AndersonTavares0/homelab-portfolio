import fs from 'node:fs';
import { loadContent } from './content.mjs';

const { profile, cases, timeline, phases } = loadContent();

const lines = [
  `# ${profile.data.name}`,
  '',
  profile.content.trim(),
  '',
  `[GitHub profile](${profile.data.github})`,
  '',
  '![Illustrative infrastructure topology showing virtualization, services, alerting, automation, observation and GPU computing](public/topology.svg)',
  '',
  '## Skills',
  '',
  profile.data.skills.join(' · '),
  '',
  '## Projects',
  '',
  ...cases.map(item => `- **[${item.data.title}](content/cases/${item.file})** — ${item.data.summary}`),
  '',
  `## ${timeline.data.title}`,
  '',
  timeline.content.trim(),
  '',
  ...phases.flatMap(phase => [
    `### ${phase.name}`,
    '',
    phase.description,
    '',
    `Documented state: ${phase.status}`,
    '',
    `Next: ${phase.next}`,
    ''
  ]),
  'Each case separates the documented state from the next step; see the studies above for sources and limits.',
  '',
  '## Development',
  '',
  'Requires Node.js 22.23.4 or newer.',
  '',
  '```sh',
  'npm ci',
  'npm run dev        # local development',
  'npm run build      # static build into dist/',
  'npm run preview    # serve the built site on 127.0.0.1:4321',
  'npm test           # model and content unit tests',
  'npm run test:e2e   # Chromium end-to-end tests against the built site',
  'npm run content:check',
  'npm run content:build  # regenerate this README',
  'npm run audit:public   # heuristic scan of authored and built files',
  '```',
  '',
  'The Observatory state is deep-linkable, for example `/?phase=accelerated&component=gpu#observatory`.',
  '',
  'Share metadata uses relative URLs by default. Set `PUBLIC_SITE_URL` to an absolute origin at build time when the site has one, so Open Graph and Twitter previews resolve.',
  '',
  '## Licensing',
  '',
  'Original code is [MIT licensed](LICENSE). Original text and diagrams are [CC BY 4.0](CONTENT-LICENSE.md). Third-party dependencies and fonts keep their own licenses.',
  ''
];

fs.writeFileSync('README.md', lines.join('\n'));
console.log(`Validated ${cases.length} cases and their relationships; generated README.md.`);
