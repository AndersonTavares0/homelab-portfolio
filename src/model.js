// Editorial themes organize case studies; they do not imply service connections.
const timelineSource = typeof window === 'undefined'
  ? process.getBuiltinModule('fs').readFileSync('content/timeline/phases.md', 'utf8')
  : import.meta.glob('../content/timeline/phases.md', { eager: true, query: '?raw', import: 'default' })['../content/timeline/phases.md'];
const frontmatter = timelineSource.match(/^---\s*\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
if (!frontmatter) throw new Error('content/timeline/phases.md: missing frontmatter');
let timeline;
try { timeline = JSON.parse(frontmatter[1]); }
catch (error) { throw new Error(`content/timeline/phases.md: invalid JSON frontmatter: ${error.message}`); }
export const phases = timeline.phases;
