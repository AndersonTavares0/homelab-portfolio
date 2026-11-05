<script lang="ts">
  type Step = {
    name: string;
    role: string;
    arrival?: string;
    boundary?: string;
    status?: string;
    tone?: 'pending' | 'verified';
  };

  type Lane = {
    id: string;
    title: string;
    tag: string;
    steps: Step[];
  };

  type State = {
    name: string;
    arrival?: string;
  };

  type Pair = {
    from: string;
    to: string;
    relation: string;
  };

  type OverviewLane = {
    id: string;
    title: string;
    tag: string;
    steps?: Step[];
    pairs?: Pair[];
  };

  type MiniStep = {
    name: string;
  };

  type Track = {
    id: string;
    label: string;
    steps: MiniStep[];
  };

  type Workflow = {
    layout: 'chain' | 'branch' | 'lanes' | 'cycle' | 'overview';
    kind: string;
    intro: string;
    note: string;
    steps?: Step[];
    removed?: string;
    prefix?: Step[];
    branchLabel?: string;
    operations?: Step[];
    lanes?: Lane[];
    freshness?: { title: string; tag: string; role: string; note: string };
    control?: Step[];
    states?: State[];
    returnLabel?: string;
    quarantine?: string;
    fence?: string;
    overview?: {
      lanes: OverviewLane[];
      signals: { title: string; tag: string; tracks: Track[]; note: string };
    };
  };

  let { caseId = 'alert-relay' }: { caseId?: string } = $props();

  const alertRelay: Workflow = {
    layout: 'chain',
    kind: 'Communication and credential boundary',
    intro: 'CrowdSec posts to a loopback-only relay that owns the destination and credential. Telegram receives the forwarded message.',
    note: 'Purpose: keep alert communication working while confining the credential to one process boundary. The operation record is historical; current configuration is not claimed. No endpoint or token is shown.',
    steps: [
      {
        name: 'CrowdSec',
        role: 'Detects an event and posts the alert payload. It does not hold the Telegram destination or credential.'
      },
      {
        name: 'Local relay',
        role: 'Receives the payload, owns the destination and credential, and logs only safe status classes.',
        arrival: 'posts',
        boundary: 'Credential boundary'
      },
      {
        name: 'Telegram',
        role: 'Receives the forwarded message at the configured destination.',
        arrival: 'forwards'
      }
    ]
  };

  const rssRelay: Workflow = {
    layout: 'chain',
    kind: 'Delivery path with inference removed',
    intro: 'Miniflux sends each entry to a Python relay that checks the signature, removes duplicates and queues a digest. Discord receives the entries as published.',
    note: 'Historical cutover checks only. No throughput, latency or delivery-volume measurement is claimed.',
    steps: [
      {
        name: 'Miniflux',
        role: 'Emits a webhook when feed entries change.'
      },
      {
        name: 'Python relay',
        role: 'Receives the signed webhook; verifies HMAC, deduplicates, filters noise and keeps a durable digest queue.',
        arrival: 'webhook'
      },
      {
        name: 'Discord',
        role: 'Receives the original titles and summaries in the digest.',
        arrival: 'digest'
      }
    ],
    removed: 'GPU inference, translation and importance ranking are no longer on this path. No model translates or ranks an entry before delivery.'
  };

  const automation: Workflow = {
    layout: 'branch',
    kind: 'Execution and review boundary',
    intro: 'Semaphore launches versioned Ansible playbooks, and the template keeps three operations apart: read-only facts, a package simulation and a guarded apply.',
    note: 'Facts and simulation are documented. Apply templates had not installed packages when the source was written; apply success, rollback and drift remain unproven.',
    prefix: [
      {
        name: 'Semaphore templates',
        role: 'Launches a chosen, versioned template against a purpose-specific inventory.'
      },
      {
        name: 'Versioned Ansible',
        role: 'Runs the declared operation. Credentials stay in the key store, not in the repository.',
        arrival: 'launches'
      }
    ],
    branchLabel: 'From the versioned playbooks, one template at a time. The operation sets the review boundary.',
    operations: [
      {
        name: 'Read-only facts',
        role: 'Collects guest and host state; the Proxmox inventory runs without privilege escalation.',
        status: 'Documented with no changes.',
        tone: 'verified'
      },
      {
        name: 'APT simulation',
        role: 'Predicts pending package updates without installing anything.',
        status: 'Documented with no changes.',
        tone: 'verified'
      },
      {
        name: 'Manual apply',
        role: 'Requires the exact tier confirmation token, runs one host at a time and never reboots automatically.',
        status: 'Not yet validated; no package install recorded.',
        tone: 'pending'
      }
    ]
  };

  const observability: Workflow = {
    layout: 'lanes',
    kind: 'Independent telemetry lanes',
    intro: 'Two independent paths carry log evidence and heartbeat delivery. A separate freshness record describes each source\'s age and status.',
    note: 'Documented historical architecture from 9 October 2026. This is not current live state, and no delivery rate or uptime is claimed.',
    lanes: [
      {
        id: 'logs',
        title: 'Log evidence',
        tag: 'Independent lane',
        steps: [
          {
            name: 'Alloy agents',
            role: 'Collect and ship logs from the monitored systems.'
          },
          {
            name: 'Loki log store',
            role: 'Stores the log streams received from the agents.',
            arrival: 'ships'
          },
          {
            name: 'Grafana',
            role: 'Queries the stored logs for inspection.',
            arrival: 'queries'
          }
        ]
      },
      {
        id: 'heartbeat',
        title: 'Delivery heartbeat',
        tag: 'Independent lane',
        steps: [
          {
            name: 'Speedtest push heartbeat',
            role: 'Sends a push heartbeat after the speedtest run.'
          },
          {
            name: 'Uptime Kuma',
            role: 'Records whether the heartbeat arrived.',
            arrival: 'push'
          }
        ]
      }
    ],
    freshness: {
      title: 'Freshness collector',
      tag: 'Separate signal',
      role: 'Records each source\'s last success, age and status: OK, STALE or UNKNOWN. A failed source keeps its last value with the stale label.',
      note: 'No direct collector-to-Grafana link is drawn. Freshness is neither a delivery heartbeat nor proof that a remote system received data.'
    }
  };

  const gpuLab: Workflow = {
    layout: 'cycle',
    kind: 'Lifecycle control and containment',
    intro: 'A root-owned controller authorizes the transition. Each attempt runs in a transient systemd service, and a rootless Podman container is bound inside the verified cgroup before using the GPU.',
    note: 'Control and containment view, not a network topology. The cutover record is historical; current state is not claimed.',
    control: [
      {
        name: 'Lifecycle controller',
        role: 'Authorizes every mutation with an attempt, session and generation.'
      },
      {
        name: 'Transient systemd service',
        role: 'Owns a cgroup and per-attempt CPU, memory and PID limits.',
        arrival: 'grants'
      },
      {
        name: 'Rootless Podman container',
        role: 'The runtime and payload are proven inside the service cgroup before the attempt is bound.',
        arrival: 'binds',
        boundary: 'Verified boundary'
      }
    ],
    states: [
      { name: 'Production' },
      { name: 'Acquire', arrival: 'request' },
      { name: 'Lab', arrival: 'lease' },
      { name: 'Cleanup', arrival: 'release' },
      { name: 'Restore', arrival: 'restore' }
    ],
    returnLabel: 'returns to Production',
    quarantine: 'If ownership cannot be proven, the system enters Quarantine and stays closed. It does not recover automatically.',
    fence: 'Stale operations are ignored. The generation is never reused, so an old release cannot tear down a newer attempt.'
  };

  const overviewModel: Workflow = {
    layout: 'overview',
    kind: 'Communication and ownership model',
    intro: 'Request, management, ownership and signal paths in one compact model.',
    note: 'Consolidated from documented architecture. This figure is a communication model, not a complete topology, and it does not prove every path is active.',
    overview: {
      lanes: [
        {
          id: 'request',
          title: 'Request path',
          tag: 'User data plane',
          steps: [
            {
              name: 'Clients',
              role: 'LAN and Tailscale devices.'
            },
            {
              name: 'Caddy reverse proxy',
              role: 'Resolves internal DNS and routes each request.',
              arrival: 'request'
            },
            {
              name: 'Published services',
              role: 'Application workloads, file sync, monitoring UI and the GPU inference gateway.',
              arrival: 'route'
            }
          ]
        },
        {
          id: 'delivery',
          title: 'Delivery path',
          tag: 'Content to chat',
          steps: [
            {
              name: 'Feed source',
              role: 'Watched feeds produce new entries.'
            },
            {
              name: 'RSS relay',
              role: 'Verifies, deduplicates and filters into a digest queue.',
              arrival: 'webhook'
            },
            {
              name: 'Chat destination',
              role: 'Receives the queued digest in its original language.',
              arrival: 'digest'
            }
          ]
        },
        {
          id: 'management',
          title: 'Management path',
          tag: 'Not a user request',
          steps: [
            {
              name: 'Management plane',
              role: 'Hypervisor API / UI plus Semaphore, versioned Ansible and inventory.'
            },
            {
              name: 'Documented path',
              role: 'Administrative access, separate from user requests.',
              arrival: 'admin'
            },
            {
              name: 'Guests',
              role: 'Administrative targets, not user traffic.',
              arrival: 'control'
            }
          ]
        },
        {
          id: 'ownership',
          title: 'Ownership and lease',
          tag: 'Exclusive grants',
          pairs: [
            { from: 'Single application host', to: 'Passthrough disks', relation: 'exclusive ownership' },
            { from: 'Hypervisor host', to: 'Backup storage', relation: 'exclusive ownership' },
            { from: 'Lifecycle controller', to: 'Shared GPU', relation: 'exclusive lease' }
          ]
        }
      ],
      signals: {
        title: 'Observability bus',
        tag: 'Independent signals',
        tracks: [
          {
            id: 'logs',
            label: 'Evidence flow',
            steps: [{ name: 'Agents' }, { name: 'Log store' }, { name: 'Dashboards' }]
          },
          {
            id: 'alerts',
            label: 'Outbound alert path',
            steps: [{ name: 'CrowdSec' }, { name: 'Alert relay' }, { name: 'Telegram' }]
          }
        ],
        note: 'Heartbeat monitor is independent of both tracks.'
      }
    }
  };

  const workflows: Record<string, Workflow> = {
    'alert-relay': alertRelay,
    'rss-relay': rssRelay,
    automation,
    observability,
    'gpu-lab': gpuLab,
    overview: overviewModel
  };

  const workflow = $derived(workflows[caseId] ?? alertRelay);
  const headingId = $derived(`workflow-${caseId.replace(/[^a-z0-9-]/gi, '') || 'case'}`);
</script>

{#snippet connector(label: string)}
  <span class="link" aria-hidden="true">
    <span class="link__draw">
      <svg class="link__h" viewBox="0 0 60 12" preserveAspectRatio="none">
        <path class="link__line" d="M0 6h48" />
        <path class="link__tip" d="m42 1 6 5-6 5" />
      </svg>
      <svg class="link__v" viewBox="0 0 12 44" preserveAspectRatio="none">
        <path class="link__line" d="M6 0v32" />
        <path class="link__tip" d="m1 26 5 6 5-6" />
      </svg>
    </span>
    {#if label}
      <span class="link__label">{label}</span>
    {/if}
  </span>
{/snippet}

{#snippet node(step: Step)}
  <div class="node" class:isBoundary={Boolean(step.boundary)} class:isPending={step.tone === 'pending'}>
    <span class="node__name">{step.name}</span>
    <span class="node__role">{step.role}</span>
    {#if step.boundary}
      <span class="node__boundary">{step.boundary}</span>
    {/if}
    {#if step.status}
      <span class="node__status">
        {#if step.tone === 'pending'}
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M8 2.2 14.3 13H1.7L8 2.2Z" />
            <path d="M8 6.2v3.2" />
            <circle cx="8" cy="11.4" r=".55" fill="currentColor" stroke="none" />
          </svg>
        {:else}
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <circle cx="8" cy="8" r="5.6" />
            <path d="m5.3 8.2 1.8 1.8 3.6-4" />
          </svg>
        {/if}
        {step.status}
      </span>
    {/if}
  </div>
{/snippet}

{#snippet flow(steps: Step[], label: string)}
  <ol class="flow" aria-label={label} style={`--cols:${steps.length}`}>
    {#each steps as step, index (step.name)}
      <li class="flow__item">
        {#if index > 0}
          {@render connector(step.arrival ?? '')}
        {/if}
        {@render node(step)}
      </li>
    {/each}
  </ol>
{/snippet}

{#snippet pairItem(item: Pair)}
  <li class="pair">
    <span class="pair__from">{item.from}</span>
    <span class="pair__arrow" aria-hidden="true">
      <svg viewBox="0 0 40 10" preserveAspectRatio="none">
        <path class="pair__line" d="M0 5h36" />
        <path class="pair__tip" d="m28 1 8 4-8 4" />
      </svg>
    </span>
    <span class="pair__to">{item.to}</span>
    <span class="pair__label">{item.relation}</span>
  </li>
{/snippet}

{#snippet miniFlow(steps: MiniStep[], label: string)}
  <ol class="mini-flow" aria-label={label} style={`--cols:${steps.length}`}>
    {#each steps as step, index (step.name)}
      <li class="mini-flow__item">
        {#if index > 0}
          {@render connector('')}
        {/if}
        <div class="mini-node">{step.name}</div>
      </li>
    {/each}
  </ol>
{/snippet}

<section class="workflow" aria-labelledby={headingId} data-workflow={caseId}>
  <header class="workflow__head">
    <h3 id={headingId}>Workflow</h3>
    <p class="workflow__kind">{workflow.kind}</p>
    <p class="workflow__intro">{workflow.intro}</p>
  </header>

  <div class="workflow__stage">
    {#if workflow.layout === 'chain'}
      {@render flow(workflow.steps ?? [], `${workflow.kind} steps`)}
      {#if workflow.removed}
        <div class="removed">
          <span class="removed__tag">Not on this path</span>
          <p>{workflow.removed}</p>
        </div>
      {/if}
    {:else if workflow.layout === 'branch'}
      <div class="branch">
        <div class="branch__prefix">
          {@render flow(workflow.prefix ?? [], 'Shared automation path')}
        </div>
        <p class="branch__label">{workflow.branchLabel}</p>
        <ol class="ops" aria-label="Three separate automation operations">
          {#each workflow.operations ?? [] as operation (operation.name)}
            <li class="ops__item">
              <span class="ops__arrow" aria-hidden="true">
                <svg viewBox="0 0 12 34" preserveAspectRatio="none">
                  <path class="ops__shaft" d="M6 0v26" />
                  <path class="ops__tip" d="m1 20 5 6 5-6" />
                </svg>
              </span>
              {@render node(operation)}
            </li>
          {/each}
        </ol>
      </div>
    {:else if workflow.layout === 'lanes'}
      <div class="lanes">
        {#each workflow.lanes ?? [] as lane (lane.id)}
          <section class="lane" aria-labelledby={`${headingId}-${lane.id}`}>
            <div class="lane__head">
              <h4 id={`${headingId}-${lane.id}`}>{lane.title}</h4>
              <span>{lane.tag}</span>
            </div>
            {@render flow(lane.steps, `${lane.title} steps`)}
          </section>
        {/each}
        {#if workflow.freshness}
          <section class="freshness" aria-labelledby={`${headingId}-freshness`}>
            <div class="freshness__head">
              <h4 id={`${headingId}-freshness`}>{workflow.freshness.title}</h4>
              <span>{workflow.freshness.tag}</span>
            </div>
            <p class="freshness__role">{workflow.freshness.role}</p>
            <p class="freshness__note">{workflow.freshness.note}</p>
          </section>
        {/if}
      </div>
    {:else if workflow.layout === 'overview'}
      {#if workflow.overview}
        <div class="overview">
          {#each workflow.overview.lanes as lane (lane.id)}
            <section class="lane lane--overview" aria-labelledby={`${headingId}-${lane.id}`}>
              <div class="lane__head">
                <h4 id={`${headingId}-${lane.id}`}>{lane.title}</h4>
                <span>{lane.tag}</span>
              </div>
              {#if lane.pairs}
                <ul class="pairs" aria-label={`${lane.title} relationships`}>
                  {#each lane.pairs as pair (pair.from)}
                    {@render pairItem(pair)}
                  {/each}
                </ul>
              {:else}
                {@render flow(lane.steps ?? [], `${lane.title} steps`)}
              {/if}
            </section>
          {/each}
          <section class="lane lane--overview" aria-labelledby={`${headingId}-signals`}>
            <div class="lane__head">
              <h4 id={`${headingId}-signals`}>{workflow.overview.signals.title}</h4>
              <span>{workflow.overview.signals.tag}</span>
            </div>
            <div class="signals">
              {#each workflow.overview.signals.tracks as track (track.id)}
                <div class="track">
                  <p class="track__label">{track.label}</p>
                  {@render miniFlow(track.steps, `${track.label} steps`)}
                </div>
              {/each}
              <p class="signals__independent">
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <circle cx="8" cy="8" r="5.2" />
                  <circle cx="8" cy="8" r="1.2" fill="currentColor" stroke="none" />
                </svg>
                <span>{workflow.overview.signals.note}</span>
              </p>
            </div>
          </section>
        </div>
      {/if}
    {:else}
      <div class="cycle">
        {@render flow(workflow.control ?? [], 'Control path')}
        <ol class="flow flow--states" aria-label="Lifecycle state cycle" style={`--cols:${(workflow.states ?? []).length}`}>
          {#each workflow.states ?? [] as state, index (state.name)}
            <li class="flow__item">
              {#if index > 0}
                {@render connector(state.arrival ?? '')}
              {/if}
              <div class="state">{state.name}</div>
            </li>
          {/each}
        </ol>
        <div class="loop">
          <svg class="loop__h" viewBox="0 0 1000 30" preserveAspectRatio="none" aria-hidden="true">
            <path class="loop__path" d="M930 0v8c0 9-7 16-16 16H86c-9 0-16-7-16-16V0" />
            <path class="loop__tip" d="m62 8 8-8 8 8" />
          </svg>
          <svg class="loop__v" viewBox="0 0 20 34" preserveAspectRatio="none" aria-hidden="true">
            <path class="loop__path" d="M10 34V10" />
            <path class="loop__tip" d="m4 16 6-6 6 6" />
          </svg>
          <span>{workflow.returnLabel}</span>
        </div>
        <div class="aside">
          <div class="quarantine">
            <svg class="quarantine__mark" viewBox="0 0 30 38" aria-hidden="true">
              <path class="quarantine__path" d="M3 0v12c0 8 6 14 14 14h3" />
              <path class="quarantine__tip" d="M20 20 27 26 20 32" />
            </svg>
            <div>
              <strong>Quarantine branch</strong>
              <p>{workflow.quarantine}</p>
            </div>
          </div>
          <div class="fence">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 3v18M12 3v18M19 3v18M3 8h18M3 15h18" />
            </svg>
            <div>
              <strong>Stale operations fenced</strong>
              <p>{workflow.fence}</p>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>

  <footer class="workflow__foot">
    <p class="workflow__status">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="8" />
        <path d="M12 7.5v5l3 2" />
      </svg>
      Historical documentation · not live traffic
    </p>
    <p class="workflow__note">{workflow.note}</p>
  </footer>
</section>

<style>
  .workflow {
    --wf-bg: var(--ex-bg, var(--page-bg));
    --wf-panel: var(--ex-panel, var(--page-surface));
    --wf-line: var(--ex-line, var(--page-line));
    --wf-line-strong: var(--ex-line-strong, var(--ex-line, var(--page-line-strong)));
    --wf-text: var(--ex-text, var(--page-text));
    --wf-muted: var(--ex-muted, var(--page-muted));
    --wf-accent: var(--ex-accent, var(--page-accent));
    --wf-stage: color-mix(in srgb, var(--wf-panel) 26%, var(--wf-bg));
    --wf-node: color-mix(in srgb, var(--wf-panel) 78%, var(--wf-bg));
    container-name: wf;
    container-type: inline-size;
    display: grid;
    gap: 0.7rem;
    margin: 1.5rem 0;
    padding: clamp(0.9rem, 2vw, 1.15rem);
    border: 1px solid var(--wf-line-strong);
    border-radius: 0.2rem;
    background: color-mix(in srgb, var(--wf-panel) 18%, var(--wf-bg));
    color: var(--wf-text);
  }

  .workflow__head {
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: baseline;
    gap: 0.3rem 0.9rem;
  }

  .workflow__head h3 {
    margin: 0;
    font-size: 1.08rem;
    font-weight: 700;
    letter-spacing: -0.022em;
    line-height: 1.2;
  }

  .workflow__kind {
    margin: 0;
    color: var(--wf-accent);
    font-size: 0.7rem;
    font-weight: 650;
    line-height: 1.35;
  }

  .workflow__intro {
    grid-column: 1 / -1;
    max-width: 68ch;
    margin: 0;
    color: var(--wf-muted);
    font-size: 0.82rem;
    line-height: 1.55;
  }

  .workflow__stage {
    padding: 0.75rem;
    border: 1px solid var(--wf-line);
    background: var(--wf-stage);
  }

  .workflow__foot {
    display: grid;
    gap: 0.28rem;
  }

  .workflow__status {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin: 0;
    color: var(--wf-text);
    font-size: 0.68rem;
    font-weight: 650;
    line-height: 1.35;
  }

  .workflow__status svg {
    width: 0.85rem;
    height: 0.85rem;
    flex: 0 0 auto;
    fill: none;
    stroke: var(--wf-accent);
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.45;
  }

  .workflow__note {
    max-width: 78ch;
    margin: 0;
    color: var(--wf-muted);
    font-size: 0.68rem;
    line-height: 1.5;
  }

  .flow {
    --flow-gap: clamp(3rem, 5vw, 4.5rem);
    display: grid;
    grid-template-columns: repeat(var(--cols, 3), minmax(0, 1fr));
    gap: var(--flow-gap);
    align-items: stretch;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .flow__item {
    position: relative;
    min-width: 0;
  }

  .node {
    display: flex;
    height: 100%;
    min-height: 3.9rem;
    flex-direction: column;
    gap: 0.22rem;
    padding: 0.55rem 0.65rem;
    border: 1px solid var(--wf-line-strong);
    border-radius: 0.16rem;
    background: var(--wf-node);
    box-shadow: 0 1px 2px rgb(0 0 0 / 0.04);
  }

  .node.isBoundary {
    border-color: color-mix(in srgb, var(--wf-accent) 68%, var(--wf-line-strong));
    background: color-mix(in srgb, var(--wf-accent) 6%, var(--wf-node));
  }

  .node.isPending {
    border-style: dashed;
  }

  .node__name {
    font-size: 0.88rem;
    font-weight: 700;
    letter-spacing: -0.012em;
    line-height: 1.2;
  }

  .node__role {
    color: var(--wf-muted);
    font-size: 0.7rem;
    line-height: 1.42;
  }

  .node__boundary {
    align-self: flex-start;
    margin-top: auto;
    padding: 0.1rem 0.3rem;
    border: 1px solid color-mix(in srgb, var(--wf-accent) 52%, var(--wf-line-strong));
    color: var(--wf-accent);
    font-size: 0.63rem;
    font-weight: 650;
    line-height: 1.35;
  }

  .node__status {
    display: flex;
    align-items: flex-start;
    gap: 0.28rem;
    margin-top: auto;
    padding-top: 0.18rem;
    color: var(--wf-muted);
    font-size: 0.66rem;
    line-height: 1.4;
  }

  .node__status svg {
    width: 0.78rem;
    height: 0.78rem;
    flex: 0 0 auto;
    margin-top: 0.04rem;
    fill: none;
    stroke: var(--wf-accent);
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.3;
  }

  .node.isPending .node__status {
    color: var(--wf-text);
    font-weight: 650;
  }

  .link {
    position: absolute;
    z-index: 1;
    top: 0;
    right: calc(100% + 0.45rem);
    bottom: 0;
    display: flex;
    width: calc(var(--flow-gap) - 0.9rem);
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.12rem;
    color: var(--wf-accent);
  }

  .link__draw {
    display: grid;
    width: 100%;
    place-items: center;
  }

  .link__h {
    display: block;
    width: 100%;
    height: 0.75rem;
    overflow: visible;
  }

  .link__v {
    display: none;
    width: 1rem;
    height: 100%;
    overflow: visible;
  }

  .link__line,
  .link__tip,
  .ops__shaft,
  .ops__tip,
  .pair__line,
  .pair__tip,
  .loop__path,
  .loop__tip,
  .quarantine__path,
  .quarantine__tip {
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.2;
    vector-effect: non-scaling-stroke;
  }

  .link__line,
  .ops__shaft,
  .pair__line,
  .loop__path,
  .quarantine__path {
    stroke-dasharray: 3 3;
  }

  .link__label {
    color: var(--wf-muted);
    font-size: 0.63rem;
    font-weight: 600;
    letter-spacing: 0.005em;
    line-height: 1.2;
    text-align: center;
    white-space: nowrap;
  }

  .removed {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 0.55rem;
    margin-top: 0.7rem;
    padding: 0.55rem 0.65rem;
    border: 1px dashed var(--wf-line-strong);
    background: color-mix(in srgb, var(--wf-bg) 55%, transparent);
  }

  .removed__tag {
    align-self: start;
    padding-top: 0.04rem;
    color: var(--wf-accent);
    font-size: 0.63rem;
    font-weight: 650;
    line-height: 1.35;
    white-space: nowrap;
  }

  .removed p {
    margin: 0;
    color: var(--wf-muted);
    font-size: 0.69rem;
    line-height: 1.45;
  }

  .branch__prefix {
    max-width: 48rem;
    margin-inline: auto;
  }

  .branch__label {
    margin: 0.5rem 0 0;
    color: var(--wf-muted);
    font-size: 0.68rem;
    line-height: 1.4;
    text-align: center;
  }

  .ops {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.75rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .ops__item {
    min-width: 0;
  }

  .ops__arrow {
    display: flex;
    height: 1.05rem;
    justify-content: center;
    color: var(--wf-accent);
  }

  .ops__arrow svg {
    display: block;
    width: 0.7rem;
    height: 100%;
    overflow: visible;
  }

  .flow--states {
    --flow-gap: clamp(2.9rem, 4.5vw, 4rem);
  }

  .state {
    display: grid;
    min-height: 2.7rem;
    place-items: center;
    padding: 0.38rem 0.3rem;
    border: 1px solid var(--wf-line-strong);
    border-radius: 0.16rem;
    background: var(--wf-node);
    font-size: 0.73rem;
    font-weight: 650;
    letter-spacing: -0.005em;
    line-height: 1.2;
    text-align: center;
  }

  .loop {
    position: relative;
    height: 2.2rem;
    margin-top: 0.05rem;
    color: var(--wf-accent);
  }

  .loop__h {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 1.35rem;
    overflow: visible;
  }

  .loop__v {
    display: none;
  }

  .loop span {
    position: absolute;
    top: 0;
    left: 50%;
    padding: 0.06rem 0.4rem;
    background: var(--wf-stage);
    color: var(--wf-muted);
    font-size: 0.64rem;
    font-weight: 600;
    line-height: 1.3;
    white-space: nowrap;
    transform: translateX(-50%);
  }

  .aside {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 0.8rem;
    margin-top: 0.55rem;
    padding-top: 0.65rem;
    border-top: 1px solid var(--wf-line);
  }

  .quarantine,
  .fence {
    display: grid;
    grid-template-columns: 1.35rem minmax(0, 1fr);
    gap: 0.45rem;
    align-items: start;
  }

  .quarantine {
    padding: 0.5rem 0.6rem;
    border: 1px dashed var(--wf-line-strong);
  }

  .fence {
    padding: 0.5rem 0.15rem;
  }

  .quarantine svg {
    width: 1.2rem;
    height: 1.5rem;
    color: var(--wf-accent);
    overflow: visible;
  }

  .fence svg {
    width: 1rem;
    height: 1rem;
    margin-top: 0.06rem;
    fill: none;
    stroke: var(--wf-muted);
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.4;
  }

  .quarantine strong,
  .fence strong {
    display: block;
    font-size: 0.7rem;
    font-weight: 650;
    line-height: 1.35;
  }

  .quarantine p,
  .fence p {
    margin: 0.12rem 0 0;
    color: var(--wf-muted);
    font-size: 0.66rem;
    line-height: 1.45;
  }

  .lane {
    display: grid;
    grid-template-columns: minmax(6.8rem, 0.2fr) minmax(0, 1fr);
    gap: 0.75rem;
    align-items: center;
    padding: 0.4rem 0;
  }

  .lane + .lane {
    border-top: 1px solid var(--wf-line);
  }

  .lane__head {
    display: grid;
    gap: 0.12rem;
    margin: 0;
  }

  .lane__head h4,
  .freshness__head h4 {
    margin: 0;
    font-size: 0.76rem;
    font-weight: 700;
    letter-spacing: -0.008em;
    line-height: 1.3;
  }

  .lane__head span,
  .freshness__head span {
    color: var(--wf-accent);
    font-size: 0.63rem;
    font-weight: 600;
    line-height: 1.3;
  }

  .freshness {
    display: grid;
    grid-template-columns: minmax(8.5rem, 0.55fr) minmax(0, 1.15fr) minmax(0, 0.9fr);
    gap: 0.75rem;
    align-items: start;
    padding-top: 0.5rem;
    border-top: 1px solid var(--wf-line-strong);
  }

  .freshness__head {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  .freshness__role,
  .freshness__note {
    margin: 0;
    color: var(--wf-muted);
    font-size: 0.68rem;
    line-height: 1.48;
  }

  .freshness__note {
    color: var(--wf-text);
  }

  .overview {
    display: grid;
  }

  .lane--overview {
    align-items: start;
    padding: 0.32rem 0;
  }

  .lane--overview .lane__head h4 {
    font-size: 0.74rem;
  }

  .overview .node {
    min-height: 3.1rem;
    gap: 0.18rem;
    padding: 0.38rem 0.48rem;
  }

  .overview .flow {
    --flow-gap: clamp(3.2rem, 5vw, 4.25rem);
  }

  .overview .node__name {
    font-size: 0.82rem;
  }

  .overview .node__role {
    font-size: 0.64rem;
    line-height: 1.34;
  }

  .overview .link__label {
    font-size: 0.6rem;
  }

  .pairs {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.5rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .pair {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 1.35rem minmax(0, 1fr);
    grid-template-rows: auto auto;
    gap: 0.1rem 0.22rem;
    align-items: center;
    padding: 0.34rem 0.4rem;
    border: 1px solid var(--wf-line);
    background: color-mix(in srgb, var(--wf-bg) 45%, transparent);
  }

  .pair__from,
  .pair__to {
    font-size: 0.64rem;
    font-weight: 650;
    line-height: 1.22;
  }

  .pair__arrow {
    display: block;
    grid-column: 2;
    color: var(--wf-accent);
  }

  .pair__arrow svg {
    display: block;
    width: 100%;
    height: 0.55rem;
    overflow: visible;
  }

  .pair__label {
    grid-column: 1 / -1;
    color: var(--wf-accent);
    font-size: 0.58rem;
    font-weight: 650;
    line-height: 1.25;
  }

  .signals {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.45rem 0.8rem;
    align-items: start;
  }

  .track__label {
    margin: 0 0 0.22rem;
    color: var(--wf-accent);
    font-size: 0.61rem;
    font-weight: 650;
    line-height: 1.3;
  }

  .mini-flow {
    --flow-gap: 2.4rem;
    display: grid;
    grid-template-columns: repeat(var(--cols, 3), minmax(0, 1fr));
    gap: var(--flow-gap);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .mini-flow__item {
    position: relative;
    min-width: 0;
  }

  .mini-node {
    display: grid;
    min-height: 2.15rem;
    place-items: center;
    padding: 0.24rem 0.3rem;
    border: 1px solid var(--wf-line-strong);
    border-radius: 0.12rem;
    background: var(--wf-node);
    font-size: 0.63rem;
    font-weight: 650;
    line-height: 1.2;
    text-align: center;
  }

  .signals__independent {
    display: flex;
    grid-column: 1 / -1;
    align-items: center;
    gap: 0.35rem;
    margin: 0.05rem 0 0;
    padding-top: 0.32rem;
    border-top: 1px solid var(--wf-line);
    color: var(--wf-muted);
    font-size: 0.64rem;
    line-height: 1.35;
  }

  .signals__independent svg {
    width: 0.72rem;
    height: 0.72rem;
    flex: 0 0 auto;
    color: var(--wf-accent);
    fill: none;
    stroke: var(--wf-accent);
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.2;
  }

  @media (prefers-reduced-motion: no-preference) {
    .link__line,
    .ops__shaft,
    .loop__path,
    .quarantine__path {
      animation: wf-trace 0.9s linear 2;
    }
  }

  @keyframes wf-trace {
    from {
      stroke-dashoffset: 12;
    }
    to {
      stroke-dashoffset: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .link__line,
    .ops__shaft,
    .loop__path,
    .quarantine__path {
      animation: none;
    }
  }

  @container wf (max-width: 620px) {
    .workflow__head {
      grid-template-columns: 1fr;
    }

    .workflow__kind,
    .workflow__intro {
      grid-column: 1;
    }

    .workflow__stage {
      padding: 0.8rem 0.7rem;
    }

    .flow {
      grid-template-columns: 1fr;
      gap: 2.65rem;
    }

    .flow__item {
      width: 100%;
    }

    .link {
      top: auto;
      right: auto;
      bottom: calc(100% + 0.05rem);
      left: 0.8rem;
      width: auto;
      height: calc(2.65rem - 0.1rem);
      flex-direction: row;
      justify-content: flex-start;
      gap: 0.35rem;
    }

    .link__draw {
      width: 1rem;
      height: 100%;
    }

    .link__h {
      display: none;
    }

    .link__v {
      display: block;
    }

    .link__label {
      text-align: left;
    }

    .removed {
      grid-template-columns: 1fr;
      gap: 0.2rem;
    }

    .removed__tag {
      white-space: normal;
    }

    .branch__label {
      text-align: left;
    }

    .ops {
      grid-template-columns: 1fr;
      gap: 1.35rem;
    }

    .flow--states {
      gap: 2.2rem;
    }

    .flow--states .link {
      height: calc(2.2rem - 0.05rem);
    }

    .loop {
      display: flex;
      height: auto;
      align-items: center;
      gap: 0.45rem;
      padding-top: 0.1rem;
    }

    .loop__h {
      display: none;
    }

    .loop__v {
      display: block;
      width: 1rem;
      height: 1.7rem;
      flex: 0 0 auto;
      overflow: visible;
    }

    .loop span {
      position: static;
      padding: 0;
      background: none;
      transform: none;
    }

    .aside {
      grid-template-columns: 1fr;
      gap: 0.5rem;
    }

    .freshness {
      grid-template-columns: 1fr;
      gap: 0.3rem;
    }

    .lane {
      grid-template-columns: 1fr;
      gap: 0.45rem;
    }

    .lane__head {
      display: flex;
      align-items: baseline;
      gap: 0.5rem;
    }

    .lane--overview {
      align-items: start;
    }

    .pairs,
    .signals {
      grid-template-columns: 1fr;
    }

    .mini-flow {
      grid-template-columns: 1fr;
      gap: 2.2rem;
    }

    .mini-flow .link {
      height: calc(2.2rem - 0.05rem);
    }
  }
</style>
