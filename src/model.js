export const components = [
  { id: 'host', name: 'Virtualization host', type: 'server', description: 'Linux and Proxmox host virtual machines and containers.', technologies: ['Linux', 'Proxmox'], caseId: 'automation', relations: ['services', 'telemetry'] },
  { id: 'services', name: 'Container services', type: 'storage', description: 'Podman and systemd manage application services.', technologies: ['Podman', 'Quadlet', 'systemd'], caseId: 'rss-relay', relations: ['host', 'alerts'] },
  { id: 'alerts', name: 'Alert relay', type: 'switch', description: 'A local relay separates notification transport from credentials.', technologies: ['CrowdSec', 'Telegram'], caseId: 'alert-relay', relations: ['services', 'telemetry'] },
  { id: 'telemetry', name: 'Observability', type: 'switch', description: 'Metrics, freshness and logs provide context for operations.', technologies: ['Grafana', 'Loki', 'Uptime Kuma'], caseId: 'observability', relations: ['host', 'alerts'] },
  { id: 'automation', name: 'Automation', type: 'server', description: 'Ansible and Semaphore separate inspection, simulation and manual changes.', technologies: ['Ansible', 'Semaphore'], caseId: 'automation', relations: ['host'] },
  { id: 'gpu', name: 'GPU lab', type: 'gpu', description: 'A controller coordinates GPU ownership between lab and inference.', technologies: ['systemd', 'Podman', 'GPU'], caseId: 'gpu-lab', relations: ['host'] }
];

export const observatoryLayout = {
  host: { topology: [50, 52], scene: [0, 0.1, 0] },
  services: { topology: [76, 22], scene: [3.2, 0.05, -2.2] },
  alerts: { topology: [84, 50], scene: [4.2, 0.15, 0] },
  telemetry: { topology: [76, 78], scene: [3.2, 0.15, 2.2] },
  automation: { topology: [23, 78], scene: [-3.2, 0.05, 2.2] },
  gpu: { topology: [16, 50], scene: [-4.2, 0.1, 0] }
};
// JSON is valid YAML frontmatter and can be parsed in both Node and the browser.
// Vite embeds the Markdown for the interactive island; Node reads the same file
// directly, so content checks and development need no generated intermediate.
const timelineSource = typeof window === 'undefined'
  ? process.getBuiltinModule('fs').readFileSync('content/timeline/phases.md', 'utf8')
  : import.meta.glob('../content/timeline/phases.md', { eager: true, query: '?raw', import: 'default' })['../content/timeline/phases.md'];
const frontmatter = timelineSource.match(/^---\s*\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
if (!frontmatter) throw new Error('content/timeline/phases.md: missing frontmatter');
let timeline;
try {
  timeline = JSON.parse(frontmatter[1]);
} catch (error) {
  throw new Error(`content/timeline/phases.md: invalid JSON frontmatter: ${error.message}`);
}
export const phases = timeline.phases;
export const overviewPhase = {
  id: 'overview',
  name: 'All systems',
  description: 'Every documented system and the cases connected to it.',
  components: components.map(component => component.id),
  skills: [...new Set(components.flatMap(component => component.technologies))],
  cases: [...new Set(components.map(component => component.caseId))],
  challenge: 'Make the documented relationships explorable without implying physical placement or live status.',
  learning: 'Trace each system to its documented decisions, technologies and related work.',
  status: 'Illustrative topology; it does not represent live service state or physical placement.',
  next: 'Select a system to open its decision notes and case study.'
};
export const views = [overviewPhase, ...phases];
export function selectView(state, viewId) {
  const view = views.find(item => item.id === viewId);
  if (!view) throw new Error(`Unknown view: ${viewId}`);
  return { phaseId: viewId, selectedId: view.components.includes(state.selectedId) ? state.selectedId : null };
}
export function overview(state) { return { ...state, selectedId: null }; }
export function validateModel(caseIds) {
  const nonempty = value => typeof value === 'string' && value.trim().length > 0;
  const validateFields = (kind, items, strings, lists) => {
    if (!Array.isArray(items) || !items.length) throw new Error(`${kind}: expected a non-empty array`);
    const ids = new Set();
    for (const [index, item] of items.entries()) {
      const path = `${kind}/${nonempty(item?.id) ? item.id : index}`;
      for (const field of strings) {
        if (!nonempty(item?.[field])) throw new Error(`${path}.${field}: expected a non-empty string`);
      }
      if (ids.has(item.id)) throw new Error(`${path}.id: duplicate ID ${item.id}`);
      ids.add(item.id);
      for (const field of lists) {
        if (!Array.isArray(item[field]) || !item[field].length || !item[field].every(nonempty)) {
          throw new Error(`${path}.${field}: expected a non-empty array of strings`);
        }
      }
    }
  };
  validateFields('component', components, ['id', 'name', 'type', 'description', 'caseId'], ['technologies', 'relations']);
  validateFields('phase', phases, ['id', 'name', 'description', 'challenge', 'learning', 'status', 'next'], ['components', 'skills', 'cases']);
  const ids = new Set(components.map(item => item.id));
  for (const component of components) {
    if (!caseIds.includes(component.caseId)) throw new Error(`component/${component.id}: unknown case ${component.caseId}`);
    const layout = observatoryLayout[component.id];
    if (!layout) throw new Error(`component/${component.id}: missing Observatory layout`);
    if (!Array.isArray(layout.topology) || layout.topology.length !== 2 || !layout.topology.every(value => Number.isFinite(value) && value >= 0 && value <= 100)) {
      throw new Error(`component/${component.id}.layout.topology: expected two finite coordinates from 0 to 100`);
    }
    if (!Array.isArray(layout.scene) || layout.scene.length !== 3 || !layout.scene.every(Number.isFinite)) {
      throw new Error(`component/${component.id}.layout.scene: expected three finite coordinates`);
    }
    for (const relation of component.relations) if (!ids.has(relation)) throw new Error(`component/${component.id}: unknown relation ${relation}`);
  }

  for (const id of Object.keys(observatoryLayout)) {
    if (!ids.has(id)) throw new Error(`observatoryLayout/${id}: unknown component`);
  }
  for (const phase of phases) {
    for (const id of phase.components) if (!ids.has(id)) throw new Error(`phase/${phase.id}: unknown component ${id}`);
    for (const id of phase.cases) if (!caseIds.includes(id)) throw new Error(`phase/${phase.id}: unknown case ${id}`);
  }
}
