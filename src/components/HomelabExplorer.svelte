<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { resolve } from '$app/paths';
  import { categories, services, technologies, relations, filterServices, explorerState } from '../explorer.js';
  import { goto, afterNavigate } from '$app/navigation';
  import { page } from '$app/state';

  let { cases = [] } = $props();

  let category = $state('all');
  let query = $state('');
  let selectedId = $state<string | null>(null);
  let traceId = $state<string | null>(null);
  let zoom = $state(1);
  let pan = $state({ x: 0, y: 0 });
  let dragging = $state(false);
  let origin: { x: number; y: number; px: number; py: number } | null = null;
  let status = $state('');
  let copyTimer: ReturnType<typeof setTimeout>;
  let viewport: HTMLDivElement;
  let mounted = false;
  let fit = $state(1);

  const known = (id: string) => services.find(item => item.id === id);

  function traceServices(id: string) {
    const members = services.filter(item => item.caseIds.includes(id));
    const links = relations.filter(edge => edge.caseId === id);
    if (!links.length) return members;
    const ordered: string[] = [];
    const visit = (serviceId: string) => {
      if (ordered.includes(serviceId)) return;
      ordered.push(serviceId);
      links.filter(edge => edge.from === serviceId).forEach(edge => visit(edge.to));
    };
    members.filter(item => !links.some(edge => edge.to === item.id)).forEach(item => visit(item.id));
    members.forEach(item => visit(item.id));
    return ordered.map(known).filter((item): item is NonNullable<ReturnType<typeof known>> => Boolean(item));
  }

  const visible = $derived(traceId ? traceServices(traceId) : filterServices(category, query));
  const traceCase = $derived(cases.find((item: any) => item.id === traceId) ?? null);

  const laneDefs = [
    { key: 'automation', title: 'Automation', note: 'Inspect before changing', ids: ['semaphore', 'ansible', 'proxmox'] },
    { key: 'delivery-alert', title: 'Delivery', note: 'Alert path', ids: ['crowdsec', 'alert-relay', 'telegram'] },
    { key: 'delivery-feed', title: 'Delivery', note: 'Feed path', ids: ['miniflux', 'rss-relay', 'discord'] },
    { key: 'observability', title: 'Observability', note: 'Evidence, not a claim of health', ids: ['collector', 'kuma', 'grafana', 'loki'] },
    { key: 'compute', title: 'Compute', note: 'Shared GPU ownership', ids: ['gpu-controller', 'podman'] }
  ];

  const visibleIds = $derived(new Set(visible.map(item => item.id)));

  const rows = $derived.by(() => {
    if (traceId) {
      if (!visible.length) return [];
      return [{
        key: 'trace',
        title: categories.find(item => item.id === visible[0].category)?.name ?? 'Study',
        note: traceCase?.title ?? 'Documented path',
        items: visible
      }];
    }
    return laneDefs
      .map(def => ({
        ...def,
        items: def.ids
          .map(known)
          .filter((item): item is NonNullable<ReturnType<typeof known>> => Boolean(item) && visibleIds.has(item.id))
      }))
      .filter(lane => lane.items.length);
  });

  function xFor(count: number, index: number) {
    const sets: Record<number, number[]> = {
      1: [560],
      2: [440, 720],
      3: [250, 530, 810],
      4: [245, 430, 615, 800]
    };
    return (sets[count] ?? sets[3])[index] ?? 560;
  }

  const positions = $derived.by(() => {
    const map = new Map<string, { x: number; y: number }>();
    rows.forEach((row, rowIndex) => {
      row.items.forEach((item, index) => {
        map.set(item.id, { x: xFor(row.items.length, index), y: rows.length === 1 ? 130 : 100 + rowIndex * 106 });
      });
    });
    return map;
  });

  const mapHeight = $derived(rows.length ? (rows.length === 1 ? 260 : 100 + rows.length * 106) : 260);
  const point = (item: any) => positions.get(item.id);

  const selected = $derived(known(selectedId ?? '') ?? null);
  const selectedRelations = $derived(relations.filter(edge => edge.from === selectedId || edge.to === selectedId));
  const visibleRelations = $derived(relations.filter(edge => visibleIds.has(edge.from) && visibleIds.has(edge.to)));
  const relatedIds = $derived(new Set(selectedRelations.flatMap(edge => [edge.from, edge.to])));
  const shownCategories = $derived(categories.filter(item => visible.some(service => service.category === item.id)));
  const selectedCases = $derived(cases.filter((item: any) => selected?.caseIds.includes(item.id)));
  const traceRelations = $derived(traceId ? relations.filter(edge => edge.caseId === traceId) : []);
  const traceSteps = $derived(traceId
    ? visible.map(item => ({ service: item, relation: relations.find(edge => edge.caseId === traceId && edge.from === item.id) ?? null }))
    : []);

  function edgeHint(item: any) {
    const labels = visibleRelations.filter(edge => edge.from === item.id).map(edge => edge.label);
    return labels.length ? labels.join(' · ') : '';
  }

  function sync() {
    const url = new URL(window.location.href);
    for (const key of ['service', 'category', 'q', 'trace']) url.searchParams.delete(key);
    if (traceId) url.searchParams.set('trace', traceId);
    if (selectedId) url.searchParams.set('service', selectedId);
    if (!traceId) {
      if (category !== 'all') url.searchParams.set('category', category);
      if (query.trim()) url.searchParams.set('q', query.trim());
    }
    void goto(`${url.pathname}${url.search}${url.hash}`, { replace: true, reset: false, shallow: true, state: page.state });
  }

  function filter(nextCategory = category, nextQuery = query) {
    traceId = null;
    category = nextCategory;
    query = nextQuery;
    if (!filterServices(category, query).some(item => item.id === selectedId)) selectedId = null;
    resetView();
    sync();
  }

  function startTrace(id: string) {
    traceId = id;
    category = 'all';
    query = '';
    selectedId = null;
    resetView();
    sync();
  }

  function clearTrace() {
    traceId = null;
    selectedId = null;
    resetView();
    sync();
  }

  async function select(id: string) {
    selectedId = id;
    sync();
    await tick();
    if (matchMedia('(max-width: 760px)').matches) {
      document.querySelector('.explorer-detail')?.scrollIntoView({
        block: 'start',
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
      });
    }
  }

  function moveFocus(event: KeyboardEvent, id: string) {
    const keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const index = visible.findIndex(item => item.id === id);
    const next = event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? visible.length - 1
        : (index + (['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1) + visible.length) % visible.length;
    selectedId = visible[next].id;
    sync();
    document.querySelector<HTMLButtonElement>(`[data-service-id="${selectedId}"]`)?.focus();
  }

  function resetView() {
    zoom = 1;
    pan = { x: 0, y: 0 };
  }

  function changeZoom(amount: number) {
    zoom = Math.max(0.7, Math.min(1.8, Math.round((zoom + amount) * 10) / 10));
  }

  function move(x: number, y: number) {
    pan = { x: Math.max(-600, Math.min(600, pan.x + x)), y: Math.max(-600, Math.min(600, pan.y + y)) };
  }

  function pointerDown(event: PointerEvent) {
    if (event.button !== 0 || (event.target as Element).closest('button,a')) return;
    origin = { x: event.clientX, y: event.clientY, px: pan.x, py: pan.y };
    dragging = true;
    viewport.setPointerCapture(event.pointerId);
  }

  function pointerMove(event: PointerEvent) {
    if (origin && dragging) {
      pan = {
        x: Math.max(-600, Math.min(600, origin.px + event.clientX - origin.x)),
        y: Math.max(-600, Math.min(600, origin.py + event.clientY - origin.y))
      };
    }
  }

  function pointerEnd() {
    dragging = false;
    origin = null;
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(location.href);
      status = 'Link copied';
    } catch {
      status = 'Copy failed; copy the address from your browser.';
    }
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => status = '', 3000);
  }

  function caseHref(id: string) {
    const params = new URLSearchParams();
    if (selectedId) params.set('service', selectedId);
    if (traceId) params.set('trace', traceId);
    if (!traceId && category !== 'all') params.set('category', category);
    if (!traceId && query.trim()) params.set('q', query.trim());
    return `${resolve(`/cases/${id}/`)}${params.size ? `?${params}` : ''}`;
  }

  function path(edge: any) {
    const a = point(known(edge.from));
    const b = point(known(edge.to));
    if (!a || !b) return '';
    const half = 104;
    if (Math.abs(a.y - b.y) < 1) return `M ${a.x + half} ${a.y} L ${b.x - half} ${b.y}`;
    return `M ${a.x + half} ${a.y} C ${a.x + half + 50} ${a.y}, ${b.x - half - 50} ${b.y}, ${b.x - half} ${b.y}`;
  }

  function labelPoint(edge: any) {
    const a = point(known(edge.from));
    const b = point(known(edge.to));
    if (!a || !b) return null;
    return { x: (a.x + b.x) / 2, y: Math.abs(a.y - b.y) < 1 ? a.y - 48 : (a.y + b.y) / 2 - 12 };
  }

  function readTrace() {
    const id = new URLSearchParams(location.search).get('trace');
    return cases.some((item: any) => item.id === id) ? id : null;
  }

  function restore() {
    const state = explorerState(location.search);
    category = state.category;
    query = state.q;
    traceId = readTrace();
    selectedId = state.service;
    if (traceId && selectedId && !traceServices(traceId).some(item => item.id === selectedId)) selectedId = null;
  }

  afterNavigate(() => {
    if (!mounted) return;
    restore();
  });

  onMount(() => {
    mounted = true;
    restore();
    sync();
    window.addEventListener('popstate', restore);
    const resize = new ResizeObserver(entries => {
      fit = Math.min(1, entries[0].contentRect.width / 940);
    });
    resize.observe(viewport);
    return () => {
      resize.disconnect();
      window.removeEventListener('popstate', restore);
      clearTimeout(copyTimer);
    };
  });
</script>

<section id="homelab-explorer" class="explorer" aria-labelledby="explorer-title" tabindex="-1">
  <div class="explorer-inner">
    <header class="explorer-heading">
      <div>
        <h2 id="explorer-title">Homelab Explorer</h2>
        <p>Browse the documented services and their supported links. Select a node for its role and evidence; this is a historical service map, not an operational view.</p>
      </div>
      <div class="explorer-evidence">
        <span class="evidence-mark" aria-hidden="true"></span>
        <strong>Documented, not live.</strong>
        <span>Historical evidence · no operational controls</span>
      </div>
    </header>

    <div class="explorer-toolbar" id="explorer-browse">
      <label class="explorer-search">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10" cy="10" r="6" /><path d="m15 15 5 5" /></svg>
        <input type="search" aria-label="Search services" placeholder="Find a service or technology…" value={query} oninput={event => filter(category, event.currentTarget.value)} />
      </label>
      <div class="explorer-filters" role="group" aria-label="Service categories">
        <button class:active={category === 'all' && !traceId} aria-pressed={category === 'all' && !traceId} onclick={() => filter('all')}>All services</button>
        {#each categories as item}
          <button class:active={category === item.id && !traceId} aria-pressed={category === item.id && !traceId} onclick={() => filter(item.id)}>{item.name}</button>
        {/each}
      </div>
    </div>

    <div class="explorer-trace" role="group" aria-label="Trace a documented study">
      <div class="explorer-trace__label">
        <strong>Trace a documented study</strong>
        <span>Follow one published sequence through the field.</span>
      </div>
      <div class="explorer-trace__chips">
        {#each cases as item}
          <button class:active={traceId === item.id} aria-pressed={traceId === item.id} onclick={() => traceId === item.id ? clearTrace() : startTrace(item.id)}>
            {item.title}
          </button>
        {/each}
      </div>
    </div>

    <noscript><p class="explorer-noscript">Interactive search and selection need JavaScript. The documented service map remains readable; read the evidence in <a href={resolve('/cases/')}>the case studies catalogue</a>.</p></noscript>

    <div class="explorer-layout">
      <div class="explorer-stage">
        <div class="explorer-map-heading">
          <span>
            <strong>{traceId ? 'Documented path' : category === 'all' ? 'Service field' : categories.find(c => c.id === category)?.name}</strong>
            <small>{visible.length} documented {visible.length === 1 ? 'service' : 'services'}</small>
          </span>
          <span class="explorer-map-key"><i></i>Evidence-backed relationship</span>
        </div>

        <div
          bind:this={viewport}
          class="explorer-viewport"
          style={`--fit:${fit};--map-height:${mapHeight}px;--viewport-height:${mapHeight * fit}px`}
          class:dragging
          role="region"
          aria-label="Service map. Drag to pan or use the map navigation buttons."
          onpointerdown={pointerDown}
          onpointermove={pointerMove}
          onpointerup={pointerEnd}
          onpointercancel={pointerEnd}
        >
          <div class="explorer-map" style={`--zoom:${zoom};--pan-x:${pan.x}px;--pan-y:${pan.y}px`} data-zoom={zoom}>
            {#each rows as row, rowIndex}
              <div class="explorer-lane" data-lane={row.key}>
                <div class="explorer-lane__head" style={`top:${rows.length === 1 ? 92 : 62 + rowIndex * 106}px`}>
                  <strong>{row.title}</strong>
                  <span>{row.note}</span>
                </div>
                <div class="explorer-lane__track">
                  {#each row.items as item}
                    {@const p = point(item)}
                    <button
                      class="service-node"
                      class:is-selected={selectedId === item.id}
                      class:is-related={Boolean(selectedId && relatedIds.has(item.id))}
                      class:is-muted={Boolean(selectedId && !relatedIds.has(item.id))}
                      style={`left:${p?.x ?? 600}px;top:${p?.y ?? 130}px;--node-width:${row.items.length === 4 ? '164px' : '196px'}`}
                      data-service-id={item.id}
                      aria-label={`Select ${item.name} ${item.summary}${edgeHint(item) ? ` ${edgeHint(item)}` : ''}`}
                      aria-pressed={selectedId === item.id}
                      onclick={() => select(item.id)}
                      onkeydown={event => moveFocus(event, item.id)}
                    >
                      <span class="service-node__symbol" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
                          {#if item.category === 'automation'}<path d="m9 4 3 3 3-3M12 7v10M5 17h14M5 14v6M19 14v6" />{:else if item.category === 'delivery'}<rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" />{:else if item.category === 'observability'}<path d="M3 12h4l3-7 4 14 3-7h4" />{:else}<rect x="5" y="5" width="14" height="14" rx="2" /><path d="M9 9h6v6H9zM9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" />{/if}
                        </svg>
                      </span>
                      <span class="service-node__body">
                        <strong>{item.name}</strong>
                        <small>{item.summary}</small>
                        {#if edgeHint(item)}<span class="service-node__edge">{edgeHint(item)}</span>{/if}
                      </span>
                    </button>
                  {/each}
                </div>
              </div>
            {/each}

            <svg class="explorer-connections" viewBox={`0 0 940 ${mapHeight}`} aria-hidden="true">
              <defs>
                <marker id="explorer-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                  <path d="M0 0 10 5 0 10z" fill="currentColor" />
                </marker>
              </defs>
              {#each visibleRelations as edge}
                {@const a = point(known(edge.from))}
                {@const b = point(known(edge.to))}
                {#if a && b}
                  <path d={path(edge)} data-relation-id={edge.id} class:is-active={selectedRelations.includes(edge)} class:is-muted={Boolean(selectedId && !selectedRelations.includes(edge))} marker-end="url(#explorer-arrow)" />
                {/if}
              {/each}
              {#each visibleRelations as edge}
                {@const label = labelPoint(edge)}
                {#if label}
                  <text x={label.x} y={label.y} text-anchor="middle" class:is-active={selectedRelations.includes(edge)} class:is-muted={Boolean(selectedId && !selectedRelations.includes(edge))}>{edge.label}</text>
                {/if}
              {/each}
            </svg>
          </div>

          {#if !visible.length}
            <div class="explorer-empty">
              <h3>No services match “{query}”.</h3>
              <p>Try a technology such as Python or clear the filters.</p>
              <button onclick={() => filter('all', '')}>Clear search and categories</button>
            </div>
          {/if}
        </div>

        <div class="explorer-controls">
          <div class="explorer-controls__view" role="group" aria-label="Map navigation">
            <button aria-label="Zoom out" onclick={() => changeZoom(-0.1)} disabled={zoom <= 0.7}>−</button>
            <output aria-label="Map zoom">{Math.round(zoom * 100)}%</output>
            <button aria-label="Zoom in" onclick={() => changeZoom(0.1)} disabled={zoom >= 1.8}>+</button>
            <button onclick={resetView}>Reset view</button>
          </div>
          <div class="pan-controls" role="group" aria-label="Pan map">
            <button aria-label="Pan left" onclick={() => move(80, 0)}>←</button>
            <button aria-label="Pan up" onclick={() => move(0, 80)}>↑</button>
            <button aria-label="Pan down" onclick={() => move(0, -80)}>↓</button>
            <button aria-label="Pan right" onclick={() => move(-80, 0)}>→</button>
          </div>
          <button class="copy-link" onclick={copyLink}>Copy link</button>
        </div>

        <p class="explorer-caption">
          {#if visible.length && !visibleRelations.length}
            No direct links are established between these results. Shared tools or a shared case do not imply a connection.
          {:else}
            Rows describe documented function, not physical placement. Lines show only evidence-backed relationships.
          {/if}
          {' '}Select a service to read the boundary and its source.
        </p>
      </div>

      <aside class="explorer-detail" aria-labelledby="explorer-detail-heading">
        {#key selectedId ?? traceId ?? 'default'}<div class="explorer-detail-content">
          {#if selected}
            <a class="explorer-back" href="#explorer-browse">Back to service selection ↑</a>
            <div class="detail-heading">
              <span>{categories.find(c => c.id === selected.category)?.name}{traceId ? ' · traced study' : ''}</span>
              <button aria-label="Clear selected service" onclick={() => { selectedId = null; sync(); }}>×</button>
            </div>
            <h3 id="explorer-detail-heading">{selected.name}</h3>
            <p class="detail-summary">{selected.summary}</p>
            <section><h4>What it does</h4><p>{selected.purpose}</p></section>
            <section><h4>Why this choice</h4><p>{selected.decision}</p></section>
            {#if selected.technologyIds.length}
              <section>
                <h4>Implementation technologies</h4>
                <ul class="explorer-tags">
                  {#each selected.technologyIds as id}<li title={technologies.find(t => t.id === id)?.role}>{technologies.find(t => t.id === id)?.name}</li>{/each}
                </ul>
                <p class="detail-note">Used in this work; not additional network connections.</p>
              </section>
            {/if}
            <section>
              <h4>Documented relationships</h4>
              {#if selectedRelations.length}
                <ul class="explorer-relations">
                  {#each selectedRelations as edge}
                    <li>
                      <button onclick={() => select(edge.from === selectedId ? edge.to : edge.from)}>
                        <span>{known(edge.from === selectedId ? edge.to : edge.from)?.name}</span>
                        <small>{edge.from === selectedId ? 'Outgoing' : 'Incoming'} · {edge.label}</small>
                      </button>
                      <p>{edge.explanation}</p>
                    </li>
                  {/each}
                </ul>
              {:else}
                <p>No direct connection is established by the available case. Sharing a study is not evidence of a transport link.</p>
              {/if}
            </section>
            <section class="detail-evidence"><h4>Evidence and limits</h4><p>{selected.evidence}</p></section>
            <div class="explorer-case-links">
              {#each selectedCases as item}<a href={caseHref(item.id)}>Read case: {item.title}</a>{/each}
            </div>
          {:else if traceCase}
            <div class="detail-heading">
              <span>Traced study</span>
              <button aria-label="Clear traced study" onclick={clearTrace}>×</button>
            </div>
            <h3 id="explorer-detail-heading">{traceCase.title}</h3>
            <p class="detail-summary">{traceCase.summary}</p>
            <ol class="detail-steps">
              {#each traceSteps as step, index}
                <li>
                  <button onclick={() => select(step.service.id)}>
                    <span class="detail-steps__index">{String(index + 1).padStart(2, '0')}</span>
                    <span>
                      <strong>{step.service.name}</strong>
                      {#if step.relation}<small>{step.relation.label}</small>{:else}<small>{step.service.summary}</small>{/if}
                    </span>
                  </button>
                </li>
              {/each}
            </ol>
            {#if !traceRelations.length}
              <p class="detail-note">No direct transport link is documented between these services. They share a study; the map does not invent a wire between them.</p>
            {/if}
            <div class="explorer-case-links">
              <a href={caseHref(traceCase.id)}>Read the full study: {traceCase.title}</a>
            </div>
            <button class="detail-clear-trace" onclick={clearTrace}>Clear trace</button>
          {:else}
            <span class="detail-intro-mark" aria-hidden="true">
              <svg viewBox="0 0 48 48"><path d="M8 24h32M24 8v32M8 8h8v8H8zm24 24h8v8h-8z" /><circle cx="24" cy="24" r="8" /></svg>
            </span>
            <h3 id="explorer-detail-heading">A map of intent,<br />not an inventory.</h3>
            <p class="detail-summary">Choose a service to uncover its role and the engineering boundary behind it. Or trace a study and follow the documented sequence.</p>
            <ul class="explorer-instructions">
              <li><strong>Find its purpose</strong><span>Search services or browse by function.</span></li>
              <li><strong>Trace the relationship</strong><span>Only source-backed connections are drawn.</span></li>
              <li><strong>Read the decision</strong><span>Open the study for tradeoffs and evidence limits.</span></li>
            </ul>
            <section class="detail-evidence"><h4>What this map does not claim</h4><p>It is not live status, a physical layout or a complete installation inventory. Each selection states the limits of its historical evidence.</p></section>
          {/if}
        </div>{/key}
      </aside>
    </div>

    <p class="explorer-status" role="status" aria-live="polite">
      {status || (selected
        ? `${selected.name} selected. ${selectedRelations.length} documented relationships.`
        : traceCase
          ? `${visible.length} services in ${traceCase.title}.`
          : `${visible.length} services shown.`)}
    </p>
  </div>
</section>

<style>
  .explorer {
    --ex-bg: #0b181d;
    --ex-panel: #162c32;
    --ex-panel-soft: #102025;
    --ex-line: #3b5f5a;
    --ex-line-soft: #223b3b;
    --ex-text: #eef1e8;
    --ex-muted: #bdd0c9;
    --ex-accent: #8fd6b8;
    --ex-signal: #e6a278;
    color: var(--ex-text);
    background: var(--ex-bg);
    border-block: 1px solid var(--ex-line);
    scroll-margin-top: 5.5rem;
    margin-block: clamp(3rem, 7vw, 6rem);
  }
  .explorer-inner {
    max-width: 1440px;
    margin-inline: auto;
    padding: clamp(2.5rem, 6vw, 5rem) clamp(1rem, 4vw, 3rem);
  }
  .explorer-heading {
    display: flex;
    justify-content: space-between;
    align-items: end;
    gap: 3rem;
    margin-bottom: clamp(2rem, 4vw, 3rem);
  }
  .explorer-heading h2 {
    font-family: var(--display);
    font-size: clamp(2.6rem, 5vw, 4.6rem);
    font-weight: 420;
    line-height: 0.98;
    letter-spacing: -0.035em;
    margin: 0 0 1.1rem;
    color: var(--ex-text);
  }
  .explorer-heading p {
    max-width: 42rem;
    color: var(--ex-muted);
    font-size: 1rem;
    line-height: 1.65;
    margin: 0;
  }
  .explorer-evidence {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.4rem 0.7rem;
    min-width: 16rem;
    font-size: 0.8rem;
    line-height: 1.5;
  }
  .explorer-evidence > span:last-child { grid-column: 2; color: var(--ex-muted); }
  .evidence-mark {
    width: 0.55rem;
    height: 0.55rem;
    border: 1px solid var(--ex-accent);
    transform: rotate(45deg);
    margin-top: 0.3rem;
  }

  .explorer-toolbar {
    display: flex;
    gap: 1.25rem;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 0;
    border-block: 1px solid var(--ex-line-soft);
  }
  .explorer-search {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    flex: 1;
    max-width: 26rem;
    border: 1px solid var(--ex-line);
    padding: 0.65rem 0.8rem;
    background: var(--ex-panel-soft);
  }
  .explorer-search:focus-within { border-color: var(--ex-accent); }
  .explorer-search svg {
    width: 1.05rem;
    flex: 0 0 auto;
    fill: none;
    stroke: var(--ex-muted);
    stroke-width: 1.5;
  }
  .explorer-search input {
    width: 100%;
    min-width: 0;
    background: transparent;
    border: 0;
    color: var(--ex-text);
    font: inherit;
    font-size: 0.86rem;
  }
  .explorer-search input::placeholder { color: var(--ex-muted); }
  .explorer-filters { display: flex; flex-wrap: wrap; gap: 0.3rem; }
  .explorer button { font: inherit; cursor: pointer; touch-action: manipulation; }
  .explorer-filters button,
  .explorer-trace__chips button {
    border: 1px solid transparent;
    background: transparent;
    color: var(--ex-muted);
    padding: 0.6rem 0.7rem;
    font-size: 0.78rem;
    line-height: 1.3;
  }
  .explorer-filters button:hover,
  .explorer-filters button.active,
  .explorer-trace__chips button:hover,
  .explorer-trace__chips button.active {
    color: var(--ex-text);
    border-color: var(--ex-line);
    background: var(--ex-panel);
  }
  .explorer-filters button.active { border-color: var(--ex-accent); }
  .explorer-trace__chips button.active { border-color: var(--ex-accent); color: var(--ex-accent); }

  .explorer-trace {
    display: grid;
    grid-template-columns: minmax(12rem, 0.25fr) minmax(0, 1fr);
    gap: 1.5rem;
    align-items: center;
    padding: 1rem 0;
    border-bottom: 1px solid var(--ex-line-soft);
  }
  .explorer-trace__label { display: grid; gap: 0.15rem; }
  .explorer-trace__label strong { font-size: 0.8rem; font-weight: 650; }
  .explorer-trace__label span { color: var(--ex-muted); font-size: 0.74rem; line-height: 1.4; }
  .explorer-trace__chips { display: flex; flex-wrap: wrap; gap: 0.3rem; }

  .explorer-noscript { margin: 1rem 0; padding: 0.9rem 1rem; border: 1px dashed var(--ex-line); color: var(--ex-muted); font-size: 0.82rem; line-height: 1.6; }
  .explorer-noscript a { color: var(--ex-accent); }

  .explorer-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(20rem, 0.38fr);
    gap: 1.5rem;
    align-items: start;
    margin-top: 1.5rem;
  }
  .explorer-stage {
    min-width: 0;
    border: 1px solid var(--ex-line);
    background: var(--ex-panel-soft);
  }
  .explorer-map-heading {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    padding: 0.85rem 1rem;
    border-bottom: 1px solid var(--ex-line);
  }
  .explorer-map-heading > span:first-child { display: flex; gap: 0.7rem; align-items: baseline; min-width: 0; }
  .explorer-map-heading strong { font-size: 0.86rem; }
  .explorer-map-heading small,
  .explorer-map-key { font-size: 0.71rem; color: var(--ex-muted); }
  .explorer-map-key { display: flex; gap: 0.4rem; align-items: center; white-space: nowrap; }
  .explorer-map-key i { width: 1.3rem; border-top: 1px solid var(--ex-accent); }

  .explorer-viewport {
    position: relative;
    height: var(--viewport-height, 760px);
    overflow: hidden;
    cursor: grab;
    touch-action: pan-y;
    background-color: var(--ex-bg);
    background-image:
      linear-gradient(var(--ex-line-soft) 1px, transparent 1px),
      linear-gradient(90deg, var(--ex-line-soft) 1px, transparent 1px);
    background-size: 80px 80px;
    background-position: 20px 10px;
  }
  .explorer-viewport.dragging { cursor: grabbing; user-select: none; touch-action: none; }
  .explorer-map {
    position: absolute;
    left: 50%;
    width: 940px;
    height: var(--map-height, 800px);
    margin-left: -470px;
    transform: translate(var(--pan-x), var(--pan-y)) scale(calc(var(--zoom) * var(--fit)));
    transform-origin: 50% 0;
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .dragging .explorer-map { transition: none; }

  .explorer-lane__head {
    position: absolute;
    left: 20px;
    width: 132px;
    display: grid;
    gap: 0.2rem;
    pointer-events: none;
  }
  .explorer-lane__head strong {
    font-family: var(--display);
    font-size: 1.02rem;
    font-weight: 500;
    letter-spacing: -0.01em;
    color: var(--ex-text);
  }
  .explorer-lane__head span {
    color: var(--ex-muted);
    font-size: 0.7rem;
    line-height: 1.35;
  }
  .explorer-lane__track { display: contents; }

  .explorer-connections {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    color: #7fa9a2;
    pointer-events: none;
    overflow: visible;
    z-index: 0;
  }
  .explorer-connections > path {
    fill: none;
    stroke: currentColor;
    stroke-width: 1.2;
    transition: opacity 0.25s, stroke 0.25s;
  }
  .explorer-connections > path.is-active {
    stroke: var(--ex-accent);
    stroke-width: 2;
    stroke-dasharray: 5 7;
    animation: trace-link 1s ease-out 2;
  }
  .explorer-connections > path.is-muted { opacity: 0.18; }
  .explorer-connections text {
    fill: var(--ex-muted);
    font-family: var(--sans);
    font-size: 12px;
    font-weight: 560;
    paint-order: stroke;
    stroke: var(--ex-bg);
    stroke-width: 6px;
    stroke-linejoin: round;
    letter-spacing: 0.01em;
  }
  .explorer-connections text.is-active { fill: var(--ex-accent); }
  .explorer-connections text.is-muted { opacity: 0.35; }
  @keyframes trace-link { from { stroke-dashoffset: 24; } to { stroke-dashoffset: 0; } }

  .service-node {
    position: absolute;
    z-index: 1;
    transform: translate(-50%, -50%);
    width: var(--node-width, 196px);
    min-height: 74px;
    display: flex;
    gap: 0.6rem;
    align-items: flex-start;
    padding: 0.68rem 0.7rem;
    border: 1px solid var(--ex-line);
    border-radius: 2px;
    background: var(--ex-panel);
    color: var(--ex-text);
    text-align: left;
    transition: transform 0.22s, border-color 0.22s, background 0.22s, opacity 0.22s;
  }
  .service-node:hover,
  .service-node:focus-visible {
    transform: translate(-50%, calc(-50% - 2px));
    border-color: var(--ex-accent);
    background: #173037;
  }
  .service-node.is-selected {
    border-color: var(--ex-accent);
    background: #1b3b3e;
    box-shadow: inset 3px 0 var(--ex-accent);
  }
  .service-node.is-muted { opacity: 0.55; }
  .service-node__symbol {
    width: 1.45rem;
    height: 1.45rem;
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    border: 1px solid var(--ex-line);
    color: var(--ex-accent);
    margin-top: 0.05rem;
  }
  .service-node__symbol svg { width: 0.9rem; height: 0.9rem; }
  .service-node__body { display: grid; gap: 0.15rem; min-width: 0; }
  .service-node strong { font-size: 0.9rem; line-height: 1.2; letter-spacing: -0.008em; }
  .service-node small { font-size: 0.72rem; color: var(--ex-muted); line-height: 1.35; }
  .service-node__edge { display: none; }

  .explorer-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
    padding: 0.7rem 0.8rem;
    border-top: 1px solid var(--ex-line);
    flex-wrap: wrap;
  }
  .explorer-controls > div { display: flex; gap: 0.25rem; align-items: center; }
  .explorer-controls button,
  .explorer-empty button,
  .detail-clear-trace {
    min-height: 34px;
    min-width: 34px;
    border: 1px solid var(--ex-line);
    background: transparent;
    color: var(--ex-text);
    padding: 0.35rem 0.55rem;
    font-size: 0.74rem;
  }
  .explorer-controls button:hover,
  .explorer-empty button:hover,
  .detail-clear-trace:hover { border-color: var(--ex-accent); color: var(--ex-accent); }
  .explorer-controls button:disabled { opacity: 0.45; cursor: not-allowed; }
  .explorer-controls output { font-family: var(--mono); font-size: 0.68rem; min-width: 2.6rem; text-align: center; font-variant-numeric: tabular-nums; }
  .explorer-controls .copy-link { margin-left: auto; }
  .explorer-caption {
    margin: 0;
    padding: 0.75rem 1rem;
    border-top: 1px solid var(--ex-line);
    color: var(--ex-muted);
    font-size: 0.71rem;
    line-height: 1.55;
  }
  .explorer-empty {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 2rem;
  }
  .explorer-empty h3 { font-family: var(--display); font-size: 1.5rem; font-weight: 500; margin: 0 0 0.4rem; }
  .explorer-empty p { color: var(--ex-muted); margin: 0 0 1rem; }

  .explorer-detail {
    position: sticky;
    top: 6rem;
    scroll-margin-top: 9rem;
    min-width: 0;
    padding: 1.4rem;
    border: 1px solid var(--ex-line);
    background: var(--ex-panel);
  }
  .explorer-back { display: none; color: var(--ex-accent); font-size: 0.78rem; text-underline-offset: 4px; }
  .detail-heading { display: flex; justify-content: space-between; align-items: center; gap: 0.6rem; color: var(--ex-accent); font-size: 0.76rem; }
  .detail-heading button {
    border: 1px solid var(--ex-line);
    background: transparent;
    color: var(--ex-text);
    min-width: 32px;
    min-height: 32px;
    font-size: 1rem;
    line-height: 1;
  }
  .explorer-detail h3 {
    font-family: var(--display);
    font-size: 1.8rem;
    font-weight: 460;
    line-height: 1.08;
    letter-spacing: -0.025em;
    margin: 0.65rem 0 0.7rem;
    color: var(--ex-text);
  }
  .detail-summary { color: var(--ex-muted); font-size: 0.88rem; line-height: 1.6; margin: 0 0 1.2rem; }
  .explorer-detail section,
  .detail-evidence { padding-top: 0.95rem; margin-top: 0.95rem; border-top: 1px solid var(--ex-line-soft); }
  .explorer-detail h4 {
    font-family: var(--sans);
    font-size: 0.71rem;
    font-weight: 680;
    letter-spacing: 0.045em;
    text-transform: uppercase;
    margin: 0 0 0.45rem;
    color: var(--ex-accent);
  }
  .explorer-detail p { font-size: 0.81rem; line-height: 1.62; color: var(--ex-muted); margin: 0; }
  .explorer-tags { padding: 0; margin: 0; list-style: none; display: flex; gap: 0.35rem; flex-wrap: wrap; }
  .explorer-tags li { border: 1px solid var(--ex-line); padding: 0.22rem 0.42rem; font-size: 0.71rem; }
  .explorer-detail .detail-note { font-size: 0.7rem; margin-top: 0.45rem; }
  .explorer-relations { list-style: none; margin: 0; padding: 0; }
  .explorer-relations li + li { border-top: 1px solid var(--ex-line-soft); padding-top: 0.7rem; margin-top: 0.7rem; }
  .explorer-relations button {
    display: grid;
    gap: 0.15rem;
    text-align: left;
    background: none;
    border: 0;
    padding: 0.2rem 0;
    color: var(--ex-text);
    width: 100%;
  }
  .explorer-relations button:hover { color: var(--ex-accent); }
  .explorer-relations button small { font-size: 0.69rem; color: var(--ex-accent); }
  .explorer-relations p { margin-top: 0.3rem; font-size: 0.75rem; }
  .detail-evidence { border-top-style: dashed; }
  .explorer-case-links { display: grid; gap: 0.45rem; margin-top: 1.2rem; }
  .explorer-case-links a {
    display: block;
    color: var(--ex-bg);
    background: var(--ex-accent);
    padding: 0.7rem 0.8rem;
    font-size: 0.79rem;
    font-weight: 650;
    text-decoration: none;
    line-height: 1.4;
  }
  .explorer-case-links a:hover { background: #b9efd7; }

  .detail-steps { list-style: none; margin: 0 0 1rem; padding: 0; display: grid; gap: 0.35rem; }
  .detail-steps button {
    display: flex;
    gap: 0.65rem;
    align-items: flex-start;
    width: 100%;
    padding: 0.45rem 0.5rem;
    border: 1px solid transparent;
    background: var(--ex-panel-soft);
    color: var(--ex-text);
    text-align: left;
  }
  .detail-steps button:hover { border-color: var(--ex-line); background: #163036; }
  .detail-steps__index { font-family: var(--mono); font-size: 0.66rem; color: var(--ex-accent); padding-top: 0.1rem; }
  .detail-steps strong { display: block; font-size: 0.8rem; line-height: 1.3; }
  .detail-steps small { display: block; margin-top: 0.1rem; color: var(--ex-muted); font-size: 0.71rem; line-height: 1.35; }
  .detail-clear-trace { margin-top: 0.8rem; width: 100%; }
  .detail-intro-mark { display: grid; width: 3rem; height: 3rem; place-items: center; margin-bottom: 0.8rem; border: 1px solid var(--ex-line); color: var(--ex-accent); }
  .detail-intro-mark svg { width: 2rem; fill: none; stroke: currentColor; stroke-width: 1.2; }
  .explorer-instructions { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.65rem; }
  .explorer-instructions li { display: grid; gap: 0.1rem; padding-top: 0.6rem; border-top: 1px solid var(--ex-line-soft); }
  .explorer-instructions strong { font-size: 0.8rem; }
  .explorer-instructions span { color: var(--ex-muted); font-size: 0.75rem; line-height: 1.45; }
  .explorer-status {
    margin: 1rem 0 0;
    color: var(--ex-muted);
    font-size: 0.72rem;
    min-height: 1.2em;
  }
  .explorer-detail-content { animation: detail-arrive 0.35s cubic-bezier(0.16, 1, 0.3, 1) both; }
  @keyframes detail-arrive { from { transform: translateY(0.45rem); opacity: 0; } to { transform: none; opacity: 1; } }
  .explorer :focus-visible { outline: 3px solid var(--ex-accent); outline-offset: 3px; }
  .explorer input:focus-visible { outline-offset: 5px; }
  #explorer-browse { scroll-margin-top: 8rem; }

  @media (prefers-reduced-motion: no-preference) {
    .service-node { animation: node-arrive 0.45s cubic-bezier(0.16, 1, 0.3, 1) both; }
  }
  @keyframes node-arrive { from { opacity: 0; translate: 0 8px; } to { opacity: 1; translate: 0 0; } }

  @media (max-width: 1180px) {
    .explorer-heading { align-items: start; }
    .explorer-evidence { min-width: 14rem; }
    .explorer-layout { grid-template-columns: minmax(0, 1fr); }
    .explorer-detail { position: static; }
    .explorer-map-key { display: none; }
  }
  @media (max-width: 860px) {
    .explorer-toolbar { align-items: stretch; flex-direction: column; gap: 0.8rem; }
    .explorer-search { max-width: none; }
    .explorer-trace { grid-template-columns: 1fr; gap: 0.6rem; }
    .explorer-heading { display: block; }
    .explorer-evidence { margin-top: 1.2rem; }
  }
  @media (max-width: 760px) {
    .explorer { margin-block: 2rem; scroll-margin-top: 6rem; }
    .explorer-inner { padding: 2.2rem 0.75rem 1.5rem; }
    .explorer-heading h2 { font-size: 2.5rem; }
    .explorer-heading p { font-size: 0.9rem; }
    .explorer-trace__chips { flex-wrap: wrap; }
    .explorer-trace__chips button { flex: 1 1 10rem; min-height: 40px; text-align: left; }
    .explorer-viewport { height: auto; min-height: 0; overflow: visible; cursor: default; background-size: 56px 56px; }
    .explorer-map {
      position: relative;
      left: auto;
      width: auto;
      height: auto;
      margin: 0;
      padding: 1rem 0.8rem;
      transform: none !important;
      display: grid;
      gap: 1.1rem;
    }
    .explorer-lane { display: grid; gap: 0.35rem; }
    .explorer-lane__head {
      position: static;
      width: auto;
      display: grid;
      gap: 0.05rem;
      align-items: start;
      padding-bottom: 0.2rem;
      border-bottom: 1px solid var(--ex-line-soft);
    }
    .explorer-lane__head strong { font-size: 1.05rem; }
    .explorer-lane__head span { font-size: 0.71rem; }
    .explorer-lane__track { display: grid; gap: 0.4rem; }
    .service-node {
      position: relative;
      left: auto !important;
      top: auto !important;
      transform: none !important;
      width: 100%;
      min-height: 0;
      padding: 0.65rem;
      gap: 0.6rem;
      animation: none;
    }
    .service-node:hover,
    .service-node:focus-visible { transform: none; }
    .service-node.is-muted { opacity: 1; }
    .service-node strong { font-size: 0.88rem; }
    .service-node small { font-size: 0.73rem; }
    .service-node__edge {
      display: block;
      margin-top: 0.3rem;
      color: var(--ex-accent);
      font-size: 0.69rem;
      line-height: 1.3;
    }
    .explorer-connections { display: none; }
    .explorer-controls__view,
    .pan-controls { display: none !important; }
    .explorer-controls { justify-content: flex-end; }
    .explorer-caption { padding: 0.7rem 0.8rem; }
    .explorer-detail { padding: 1.15rem; scroll-margin-top: 8rem; }
    .explorer-back { display: inline-block; min-height: 30px; margin-bottom: 0.8rem; }
    .explorer-detail h3 { font-size: 1.55rem; }
    .explorer-empty { position: static; padding: 2.5rem 1rem; }
  }
  @media (prefers-reduced-motion: reduce) {
    .explorer-map,
    .service-node,
    .explorer-connections > path,
    .explorer-detail-content { transition: none; animation: none !important; }
  }
  @media (forced-colors: active) {
    .service-node,
    .explorer-detail,
    .explorer-stage { border-color: CanvasText; }
    .explorer-connections > path { stroke: CanvasText; }
    .service-node.is-selected { outline: 3px solid Highlight; }
  }
  @media print {
    .explorer { display: none; }
  }
</style>
