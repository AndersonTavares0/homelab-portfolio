export const categories = [
  { id: 'automation', name: 'Automation', description: 'Inspect before changing', x: 32, y: 28 },
  { id: 'delivery', name: 'Delivery', description: 'Move messages, protect boundaries', x: 32, y: 250 },
  { id: 'observability', name: 'Observability', description: 'Separate collection from delivery', x: 32, y: 580 },
  { id: 'compute', name: 'Compute', description: 'Prove ownership and cleanup', x: 620, y: 580 }
];
export const technologies = [
  ['linux','Linux','Operating system'], ['python','Python','Implementation language'],
  ['systemd','systemd','Service supervision and isolation'], ['hmac','HMAC','Message authentication'],
  ['cgroups','cgroups','Resource and process boundary'], ['gpu','GPU','Shared accelerated resource']
].map(([id,name,role]) => ({id,name,role}));
const service = (id,name,category,summary,purpose,decision,evidence,caseIds,technologyIds,x,y) => ({id,name,category,summary,purpose,decision,evidence,caseIds,technologyIds,x,y});
export const services = [
  service('semaphore','Semaphore','automation','Execution console','Runs versioned automation templates and keeps credentials in its key store.','Separate facts, simulations and manually confirmed applies rather than offering one unrestricted run action.','9 Oct 2026 validation: facts and simulations passed; manual package applies were not yet proven.',['automation'],[],145,150),
  service('ansible','Ansible','automation','Versioned playbooks','Collects facts and simulates or applies package changes under explicit inventories and privilege boundaries.','Use purpose-specific inventories and one-host-at-a-time manual applies; do not reboot automatically.','The documented validation did not install packages. No schedules existed in this control-plane project.',['automation'],['linux'],430,150),
  service('proxmox','Proxmox','automation','Virtualization management','Provides the host management and API boundary addressed by the automation study.','Keep global API access audit-only; limit writes to a sandbox pool. Host updates follow a separate fail-closed path.','Historical read-only facts were collected from the Proxmox host. This map is not its current guest inventory.',['automation'],['linux'],715,150),
  service('crowdsec','CrowdSec','delivery','Security notifications','Produces the alert payload sent to a local notification relay.','Keep the credential-bearing destination out of the detector; preserve detection-only behavior.','6–9 Oct 2026 records describe controlled failure and delivery checks, not current detection coverage.',['alert-relay'],[],145,365),
  service('alert-relay','Alert relay','delivery','Credential boundary','Accepts local alert payloads, enforces one destination and forwards safely to Telegram.','A loopback-only Python hop owns credentials; safe status classes replace raw exception and URL logging.','Synthetic failure and test delivery were checked historically. Later audit sent no message.',['alert-relay'],['python','systemd'],430,365),
  service('telegram','Telegram','delivery','Alert destination','Receives the reduced notification sent by the alert relay.','Enforce the configured destination and allowlist useful alert fields instead of forwarding raw events.','Historical test delivery was accepted. No current delivery or notification rate is claimed.',['alert-relay'],[],715,365),
  service('miniflux','Miniflux','delivery','Feed source','Sends feed-entry webhooks to the RSS relay.','Feed transport does not need GPU-based translation or ranking in its critical path.','7 Oct 2026 cutover removed inference from relay delivery; it is not a current availability check.',['rss-relay'],[],145,495),
  service('rss-relay','RSS relay','delivery','Deterministic delivery','Deduplicates, filters and queues entries before sending scheduled digests to Discord.','Remove inference and ranking while retaining freshness checks, durable queues and signed webhook verification.','A signed empty webhook returned 200 without posting to Discord. Translation was intentionally removed.',['rss-relay'],['python','hmac'],430,495),
  service('discord','Discord','delivery','Feed destination','Receives original feed titles and summaries from the RSS relay.','Prefer deterministic recency and source rules over a model score; accept the loss of automatic translation.','The cutover does not establish throughput, delivery volume or current channel state.',['rss-relay'],[],715,495),
  service('collector','Telemetry collector','observability','Freshness-aware collection','Tracks each source independently, retaining the last good value with status, timestamp and error class.','A stale sample is useful only when its age travels with it. Collection success and heartbeat delivery are separate observations.','Freshness behavior is in versioned source. Historical speedtest and dashboard checks do not establish current health.',['observability'],['python','systemd'],145,700),
  service('kuma','Uptime Kuma','observability','Heartbeat monitoring','Reports whether the scheduled speedtest heartbeat reached its destination.','Fail explicitly when push delivery fails; a successful timer does not prove receipt.','14 Sep 2026 correction recorded a successful heartbeat. No long-term delivery rate was measured.',['observability'],[],430,700),
  service('grafana','Grafana','observability','Evidence visualization','Presents operational evidence and a source-coverage overview.','Use a time-window count for coverage, and validate the saved dashboard rather than an unsaved query.','6 Oct 2026 record confirmed the corrected query and saved panel. No direct collector-to-Grafana transport is established here.',['observability'],[],145,830),
  service('loki','Loki','observability','Log context','Provides log evidence in the documented observability stack.','Treat logs as evidence from ingested sources, not proof that every component was observed.','The case identifies Loki in the stack but does not establish a direct ingestion link from each displayed service.',['observability'],[],430,830),
  service('gpu-controller','GPU lifecycle controller','compute','Exclusive ownership','Coordinates the shared GPU between interactive lab sessions and production inference.','Fence mutations with generation, attempt and session; quarantine when ownership cannot be proven.','7–9 Oct 2026 records cover cutover and recovery checks. The HTTP job path was not validated.',['gpu-lab'],['python','systemd','gpu','cgroups'],715,700),
  service('podman','Podman','compute','Rootless workload runtime','Runs the lab container inside the verified transient service cgroup.','Explicitly parent the container into the service boundary and prove absence during cleanup.','Historical canaries verified containment and recovery. This is not a live container inventory.',['gpu-lab'],['linux','systemd','cgroups'],715,830)
];
export const relations = [
  {id:'semaphore-ansible',from:'semaphore',to:'ansible',label:'launches playbooks',explanation:'Semaphore launches versioned Ansible playbooks through distinct facts, simulation and manual-apply templates.',caseId:'automation'},
  {id:'ansible-proxmox',from:'ansible',to:'proxmox',label:'reads host facts',explanation:'A separate read-only Proxmox inventory collects facts without privilege escalation. This is not unrestricted host management.',caseId:'automation'},
  {id:'crowdsec-relay',from:'crowdsec',to:'alert-relay',label:'posts alert payload',explanation:'CrowdSec posts to a loopback-only relay, without holding the credential-bearing Telegram destination.',caseId:'alert-relay'},
  {id:'relay-telegram',from:'alert-relay',to:'telegram',label:'forwards safely',explanation:'The relay reads its configured destination and credential, then forwards an allowlisted notification.',caseId:'alert-relay'},
  {id:'miniflux-relay',from:'miniflux',to:'rss-relay',label:'sends webhooks',explanation:'Miniflux webhooks supply feed entries for deduplication, filtering and durable queuing.',caseId:'rss-relay'},
  {id:'relay-discord',from:'rss-relay',to:'discord',label:'delivers digests',explanation:'The RSS relay forwards original titles and summaries to Discord without GPU inference.',caseId:'rss-relay'},
  {id:'controller-podman',from:'gpu-controller',to:'podman',label:'binds workload',explanation:'The controller verifies that the rootless Podman runtime and payload belong to the transient systemd service cgroup.',caseId:'gpu-lab'}
];
export function filterServices(category = 'all', query = '') {
  const term = query.trim().toLowerCase();
  return services.filter(item => (category === 'all' || item.category === category) && `${item.name} ${item.summary} ${item.purpose} ${item.technologyIds.map(id=>technologies.find(t=>t.id===id)?.name).join(' ')}`.toLowerCase().includes(term));
}
export function explorerState(search) {
  const params = new URLSearchParams(search);
  const category = categories.some(item=>item.id===params.get('category')) ? params.get('category') : 'all';
  const q = (params.get('q') || '').trim().slice(0,120);
  const service = filterServices(category,q).some(item=>item.id===params.get('service')) ? params.get('service') : null;
  return {category,q,service};
}
export function validateExplorer(caseIds) {
  const ids = new Set();
  for (const item of services) {
    if(ids.has(item.id)) throw new Error(`service/${item.id}: duplicate ID`);
    ids.add(item.id);
    for(const key of ['name','summary','purpose','decision','evidence']) if(!item[key]?.trim()) throw new Error(`service/${item.id}.${key}: required`);
    if(!categories.some(c=>c.id===item.category)) throw new Error(`service/${item.id}: unknown category`);
    for(const id of item.caseIds) if(!caseIds.includes(id)) throw new Error(`service/${item.id}: unknown case ${id}`);
    for(const id of item.technologyIds) if(!technologies.some(t=>t.id===id)) throw new Error(`service/${item.id}: unknown technology ${id}`);
  }
  const relationIds = new Set();
  for(const edge of relations) {
    if(relationIds.has(edge.id)) throw new Error(`relation/${edge.id}: duplicate ID`);
    relationIds.add(edge.id);
    if(!ids.has(edge.from)||!ids.has(edge.to)||edge.from===edge.to) throw new Error(`relation/${edge.id}: invalid endpoints`);
    if(!caseIds.includes(edge.caseId)||!edge.explanation.trim()||!edge.label.trim()) throw new Error(`relation/${edge.id}: missing evidence`);
  }
}
