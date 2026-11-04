export const components = [
  { id: 'host', name: 'Virtualization host', type: 'server', description: 'Linux and Proxmox host virtual machines and containers.', technologies: ['Linux', 'Proxmox'], caseId: 'automation', relations: ['services', 'telemetry'] },
  { id: 'services', name: 'Container services', type: 'storage', description: 'Podman and systemd manage application services.', technologies: ['Podman', 'Quadlet', 'systemd'], caseId: 'rss-relay', relations: ['host', 'alerts'] },
  { id: 'alerts', name: 'Alert relay', type: 'switch', description: 'A local relay separates notification transport from credentials.', technologies: ['CrowdSec', 'Telegram'], caseId: 'alert-relay', relations: ['services', 'telemetry'] },
  { id: 'telemetry', name: 'Observability', type: 'switch', description: 'Metrics, freshness and logs provide context for operations.', technologies: ['Grafana', 'Loki', 'Uptime Kuma'], caseId: 'observability', relations: ['host', 'alerts'] },
  { id: 'automation', name: 'Automation', type: 'server', description: 'Ansible and Semaphore separate inspection, simulation and manual changes.', technologies: ['Ansible', 'Semaphore'], caseId: 'automation', relations: ['host'] },
  { id: 'gpu', name: 'GPU lab', type: 'gpu', description: 'A controller coordinates GPU ownership between lab and inference.', technologies: ['systemd', 'Podman', 'GPU'], caseId: 'gpu-lab', relations: ['host'] }
];
export const phases = [
  { id: 'foundation', name: 'Foundation', description: 'Virtualization and Linux establish the environment.', components: ['host'], skills: ['Linux', 'Proxmox'], cases: ['automation'], challenge: 'Keep management and workload boundaries clear.', learning: 'Treat documented configuration and live state as distinct.', status: 'Virtualization is documented.', next: 'Continue checking assumptions against evidence.' },
  { id: 'services', name: 'Services', description: 'Container services and a feed relay extend the environment.', components: ['host', 'services'], skills: ['Podman', 'Quadlet', 'systemd'], cases: ['rss-relay'], challenge: 'Keep service delivery independent of scarce compute.', learning: 'Remove unnecessary dependencies from a critical path.', status: 'The relay change is documented as a historical operation.', next: 'Translation was left as a separate possible change.' },
  { id: 'operations', name: 'Automation & observability', description: 'Inspection, simulations and telemetry support operations.', components: ['host', 'services', 'alerts', 'telemetry', 'automation'], skills: ['Ansible', 'Semaphore', 'Grafana', 'Loki'], cases: ['automation', 'alert-relay', 'observability'], challenge: 'Distinguish missing, old and failed observations.', learning: 'Keep safe inspection separate from changes.', status: 'Historical tests and simulations are documented.', next: 'Validate a change before applying it.' },
  { id: 'accelerated', name: 'Accelerated computing', description: 'A shared GPU has an explicit lifecycle and isolation boundary.', components: ['host', 'gpu'], skills: ['Linux', 'systemd', 'Podman', 'GPU'], cases: ['gpu-lab'], challenge: 'Prevent stale sessions from claiming a shared resource.', learning: 'Prove ownership and cleanup together.', status: 'A historical cutover and recovery checks are documented.', next: 'Retest the ordinary user journey after lifecycle changes.' }
];
export function selectPhase(state, phaseId) {
  const phase = phases.find(item => item.id === phaseId);
  if (!phase) throw new Error(`Unknown phase: ${phaseId}`);
  return { phaseId, selectedId: phase.components.includes(state.selectedId) ? state.selectedId : null };
}
export function overview(state) { return { ...state, selectedId: null }; }
export function validateModel(caseIds) {
  for (const [kind, items] of [['component', components], ['phase', phases]]) {
    const ids = new Set();
    for (const item of items) {
      if (!item.id || !item.name || ids.has(item.id)) throw new Error(`${kind}/${item.id}: missing or duplicate ID/name`);
      ids.add(item.id);
    }
  }
  const ids = new Set(components.map(item => item.id));
  for (const component of components) {
    if (!caseIds.includes(component.caseId)) throw new Error(`component/${component.id}: unknown case ${component.caseId}`);
    for (const relation of component.relations) if (!ids.has(relation)) throw new Error(`component/${component.id}: unknown relation ${relation}`);
  }
  for (const phase of phases) {
    for (const id of phase.components) if (!ids.has(id)) throw new Error(`phase/${phase.id}: unknown component ${id}`);
    for (const id of phase.cases) if (!caseIds.includes(id)) throw new Error(`phase/${phase.id}: unknown case ${id}`);
    for (const field of ['description', 'challenge', 'learning', 'status', 'next']) if (!phase[field]) throw new Error(`phase/${phase.id}: missing ${field}`);
  }
}
