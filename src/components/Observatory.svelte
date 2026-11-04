<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { gsap } from 'gsap';
  import { resolve } from '$app/paths';
  import { components, observatoryLayout, overview, overviewPhase, phases, selectView, views } from '../model.js';
  const sitePath = (path: string) => resolve(path);

  let { cases = [] } = $props();
  let phaseId = $state(views[0]?.id ?? '');
  let selectedId = $state(null);
  let hoveredId = $state(null);
  let canvas;
  let scene = null;
  let sceneMode = $state('topology');
  let sceneError = $state(false);
  let sceneLoading = $state(false);
  let copyStatus = $state('');
  const edges = [];
  const edgeKeys = new Set();
  for (const component of components) {
    for (const id of component.relations) {
      const pair = [component.id, id].sort();
      const key = JSON.stringify(pair);
      if (!edgeKeys.has(key)) {
        edgeKeys.add(key);
        edges.push(pair);
      }
    }
  }
  const activePhase = $derived(views.find((phase) => phase.id === phaseId) ?? overviewPhase);
  const activeComponents = $derived(components.filter((component) => activePhase?.components.includes(component.id)));
  const topologyLinks = $derived(edges
    .filter(([from, to]) => activePhase?.components.includes(from) && activePhase.components.includes(to))
    .map(([from, to]) => ({ fromId: from, toId: to, from: observatoryLayout[from].topology, to: observatoryLayout[to].topology })));
  const selectedComponent = $derived(components.find((component) => component.id === selectedId) ?? null);
  const hoveredComponent = $derived(components.find((component) => component.id === hoveredId) ?? null);
  const selectedCase = $derived(cases.find((item) => item.id === selectedComponent?.caseId) ?? null);
  const activeCases = $derived((activePhase?.cases ?? []).map((id) => cases.find((item) => item.id === id)).filter(Boolean));
  const relatedComponents = $derived(selectedComponent ? edges
    .filter((edge) => edge.includes(selectedComponent.id))
    .map(([from, to]) => components.find((component) => component.id === (from === selectedComponent.id ? to : from)))
    .filter(Boolean) : []);
  const defaultPhaseId = overviewPhase.id;

  // The URL carries the exploration state so a case page can link back to the
  // exact phase and component. Unknown IDs fall back to the overview instead of
  // failing, and only known IDs are ever written back to the address bar.
  function stateFromUrl(search) {
    const params = new URLSearchParams(search);
    const requestedPhase = params.get('phase');
    const requested = params.get('component');
    const phase = views.find((item) => item.id === requestedPhase)
      ?? phases.find((item) => requested && item.components.includes(requested))
      ?? overviewPhase;
    const component = components.find((item) => item.id === requested && phase?.components.includes(item.id));
    return { phaseId: phase?.id ?? '', selectedId: component?.id ?? null };
  }

  function searchParamsFor(state, includeDefaultPhase = false) {
    const params = new URLSearchParams();
    if (state.phaseId && (includeDefaultPhase || state.phaseId !== defaultPhaseId || state.selectedId)) params.set('phase', state.phaseId);
    if (state.selectedId) params.set('component', state.selectedId);
    return params;
  }

  function caseHref(id) {
    const query = searchParamsFor({ phaseId, selectedId }, true).toString();
    return `${sitePath(`/cases/${id}/`)}${query ? `?${query}` : ''}`;
  }

  function syncUrl() {
    const url = new URL(window.location.href);
    url.searchParams.delete('phase');
    url.searchParams.delete('component');
    for (const [key, value] of searchParamsFor({ phaseId, selectedId })) url.searchParams.set(key, value);
    const next = `${url.pathname}${url.search}${url.hash}`;
    const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (next !== current) history.replaceState(history.state, '', next);
  }

  function choosePhase(id) {
    const state = selectView({ phaseId, selectedId }, id);
    phaseId = state.phaseId;
    selectedId = state.selectedId;
    hoveredId = null;
    scene?.setPhase(views.find((view) => view.id === id)?.components ?? []);
    scene?.setSelected(selectedId);
    syncUrl();
  }

  function chooseComponent(id) {
    if (!activePhase?.components.includes(id)) return;
    selectedId = selectedId === id ? null : id;
    hoveredId = null;
    scene?.setSelected(selectedId);
    syncUrl();
    revealDetail(selectedId !== null);
  }

  // On stacked layouts the panel sits below the stage, so bring it into view after a selection.
  function revealDetail(selected) {
    if (!selected || !window.matchMedia('(max-width: 799px)').matches) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.querySelector('.observatory__detail')?.scrollIntoView({ block: 'start', behavior: reduced ? 'auto' : 'smooth' });
  }

  function moveComponentFocus(event, id) {
    const keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const ids = activeComponents.map(component => component.id);
    if (ids.length < 2) return;
    const current = ids.indexOf(id);
    const last = ids.length - 1;
    const next = event.key === 'Home' ? 0
      : event.key === 'End' ? last
        : event.key === 'ArrowRight' || event.key === 'ArrowDown' ? (current === last ? 0 : current + 1)
          : (current <= 0 ? last : current - 1);
    const targetId = ids[next];
    selectComponent(targetId);
    document.querySelector(`[data-component-id="${targetId}"]`)?.focus();
  }

  function movePhaseFocus(event, id) {
    const keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const ids = views.map(view => view.id);
    if (ids.length < 2) return;
    const current = ids.indexOf(id);
    const last = ids.length - 1;
    const next = event.key === 'Home' ? 0
      : event.key === 'End' ? last
        : event.key === 'ArrowRight' || event.key === 'ArrowDown' ? (current === last ? 0 : current + 1)
          : (current <= 0 ? last : current - 1);
    const targetId = ids[next];
    choosePhase(targetId);
    document.querySelector(`[data-phase-id="${targetId}"]`)?.focus();
  }

  function selectComponent(id) {
    if (!activePhase?.components.includes(id)) return;
    selectedId = id;
    scene?.setSelected(id);
    syncUrl();
  }

  function setHoveredComponent(id) {
    hoveredId = id;
  }

  function zoomView(direction) {
    scene?.zoom(direction);
  }

  function resetView() {
    scene?.resetCamera();
  }

  async function copyViewLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      copyStatus = 'Link copied';
    } catch {
      copyStatus = 'Copy failed; use the address bar';
    }
    setTimeout(() => { copyStatus = ''; }, 3000);
  }

  function clearSelection() {
    const state = overview(selectView({ phaseId, selectedId }, defaultPhaseId));
    phaseId = state.phaseId;
    selectedId = state.selectedId;
    hoveredId = null;
    scene?.setPhase(overviewPhase.components);
    scene?.setSelected(null);
    syncUrl();
  }

  onMount(() => {
    let destroyed = false;
    let observer;
    const media = window.matchMedia('(min-width: 800px)');
    const host = canvas?.closest('.observatory');
    const initial = stateFromUrl(window.location.search);
    phaseId = initial.phaseId;
    selectedId = initial.selectedId;
    syncUrl();
    const stage = host?.querySelector('.observatory__stage');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (stage && media.matches && !reduced) gsap.fromTo(stage, { opacity: 1, y: 16 }, { opacity: 1, y: 0, duration: .7, ease: 'power3.out', clearProps: 'all' });

    function restoreFromHistory() {
      const next = stateFromUrl(window.location.search);
      if (next.phaseId === phaseId && next.selectedId === selectedId) return;
      phaseId = next.phaseId;
      selectedId = next.selectedId;
      scene?.setPhase(activePhase?.components ?? []);
      scene?.setSelected(selectedId);
    }

    async function loadScene() {
      if (!media.matches || !canvas || scene || sceneLoading || destroyed) return;
      sceneLoading = true;
      try {
        const support = document.createElement('canvas').getContext('webgl2');
        if (!support) throw new Error('WebGL is unavailable');
        const { createObservatory } = await import('./observatory-scene.js');
        if (destroyed || !media.matches) return;
        scene = createObservatory(canvas, chooseComponent, setHoveredComponent, edges, components);
        scene.setPhase(activePhase?.components ?? []);
        scene.setSelected(selectedId);
        const focusedComponent = document.activeElement?.dataset?.componentId;
        sceneMode = '3d';
        sceneError = false;
        if (focusedComponent) {
          await tick();
          document.querySelector(`[data-component-id="${focusedComponent}"]`)?.focus();
        }
      } catch {
        sceneError = true;
        sceneMode = 'topology';
      } finally {
        sceneLoading = false;
      }
    }
    function updateMode() {
      if (!media.matches) {
        const focusedComponent = document.activeElement?.dataset?.componentId;
        scene?.destroy();
        scene = null;
        sceneMode = 'topology';
        if (focusedComponent) {
          tick().then(() => document.querySelector(`[data-component-id="${focusedComponent}"]`)?.focus());
        }
      } else if (host && 'IntersectionObserver' in window) {
        observer?.disconnect();
        observer = new IntersectionObserver((entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            observer?.disconnect();
            loadScene();
          }
        }, { rootMargin: '160px' });
        observer.observe(host);
      } else loadScene();
    }
    function contextLost(event) {
      event.preventDefault();
      scene?.destroy();
      scene = null;
      sceneMode = 'topology';
      sceneError = true;
    }
    canvas?.addEventListener('webglcontextlost', contextLost);
    media.addEventListener('change', updateMode);
    window.addEventListener('popstate', restoreFromHistory);
    updateMode();
    return () => {
      destroyed = true;
      observer?.disconnect();
      media.removeEventListener('change', updateMode);
      window.removeEventListener('popstate', restoreFromHistory);
      canvas?.removeEventListener('webglcontextlost', contextLost);
      gsap.killTweensOf(stage);
      scene?.destroy();
      scene = null;
    };
  });
</script>

<section class="observatory" id="observatory" data-scene-mode={sceneMode} aria-labelledby="observatory-title" tabindex="-1">
  <header class="observatory__header">
    <div>
      <h2 id="observatory-title">The Observatory</h2>
      <p class="observatory__intro">Explore how systems connect, why decisions were made and where each case study goes deeper.</p>
    </div>
    <div class="observatory__actions">
      <button type="button" class="btn btn-sm observatory__overview" onclick={clearSelection} aria-pressed={phaseId === defaultPhaseId && !selectedId}>
        Overview
      </button>
      <button type="button" class="btn btn-sm observatory__overview" onclick={() => zoomView(-1)} disabled={sceneMode !== '3d'} aria-label="Zoom out 3D view">
        −
      </button>
      <button type="button" class="btn btn-sm observatory__overview" onclick={() => zoomView(1)} disabled={sceneMode !== '3d'} aria-label="Zoom in 3D view">
        +
      </button>
      <button type="button" class="btn btn-sm observatory__overview" onclick={resetView} disabled={sceneMode !== '3d'} data-reset-view>
        Recenter 3D view
      </button>
      <button type="button" class="btn btn-sm observatory__overview" onclick={copyViewLink} data-copy-view>
        Copy link
      </button>
      <p class="observatory__copy-status" role="status" aria-live="polite">{copyStatus}</p>
    </div>
  </header>

  <noscript>
    <p class="observatory__noscript">
      Interactive phase and component selection needs JavaScript. The static map shows every documented system; each study remains available in
      <a href={sitePath('/cases/')}>the case studies catalogue</a>.
    </p>
  </noscript>
  <div class="observatory__layout">
    <div class="observatory__stage">
      <div class="observatory__stage-title">
        <span class="observatory__stage-mark" aria-hidden="true"></span>
        <span class="observatory__stage-code" aria-hidden="true">REL MAP / 06</span>
        <span>{activePhase?.name ?? 'Relationship map'}</span>
        <span class="observatory__stage-hint" role={sceneLoading ? 'status' : undefined}>
          {sceneLoading && sceneMode !== '3d' ? 'Preparing the interactive view…' : sceneMode === '3d' ? 'Drag to orbit · Ctrl/⌘ + scroll to zoom' : 'Select a station to explore'}
        </span>
        <span class="observatory__stage-readout" data-scene-readout>{sceneMode === '3d' ? `${activeComponents.length} stations · ${topologyLinks.length} links` : `DOM topology · ${activeComponents.length} stations`}</span>
      </div>
      {#snippet nodeButton(component)}
        <button type="button" class="topology-node topology-node--{component.id}" class:is-selected={selectedId === component.id} class:is-related={selectedId === component.id || relatedComponents.some((relation) => relation.id === component.id)} class:is-dimmed={selectedId && selectedId !== component.id && !relatedComponents.some((relation) => relation.id === component.id)} data-component-id={component.id} style={`left: ${observatoryLayout[component.id].topology[0]}%; top: ${observatoryLayout[component.id].topology[1]}%;`} aria-label={`Select ${component.name}`} aria-pressed={selectedId === component.id} onclick={() => chooseComponent(component.id)} onkeydown={(event) => moveComponentFocus(event, component.id)}>
          <svg class="topology-node__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            {#if component.type === 'gpu'}
              <rect x="3" y="6" width="18" height="12" rx="2" /><circle cx="10" cy="12" r="3" /><path d="M10 9v6m-3-3h6M21 10h1m-1 4h1" />
            {:else if component.type === 'switch'}
              <path d="M5 12h14M8 8l-3 4 3 4M16 8l3 4-3 4" /><circle cx="12" cy="12" r="1.5" />
            {:else if component.type === 'storage'}
              <path d="M5 5h14v4H5zM5 10h14v4H5zM5 15h14v4H5z" /><path d="M8 7h.01M8 12h.01M8 17h.01" />
            {:else}
              <rect x="4" y="3" width="16" height="18" rx="2" /><path d="M7 8h7M7 12h7M7 16h10" /><circle cx="17" cy="8" r=".5" />
            {/if}
          </svg>
          <span class="topology-node__name">{component.name}</span>
        </button>
      {/snippet}
      <div class="observatory__visual" class:observatory__visual--3d={sceneMode === '3d'}>
        <canvas bind:this={canvas} class="observatory__canvas" aria-hidden="true"></canvas>
        <div class="observatory__scene-hud" data-scene-hud aria-live="polite">
          <span class="scene-hud__mode">{sceneMode === '3d' ? '3D / RELATIONSHIPS' : '2D / RELATIONSHIPS'}</span>
          <span>{selectedComponent ? `Focus · ${selectedComponent.name}` : hoveredComponent ? `Inspecting · ${hoveredComponent.name}` : `${activeComponents.length} stations · ${topologyLinks.length} documented links`}</span>
        </div>
        {#if sceneError}
          <p class="observatory__fallback-note" data-webgl-fallback role="status">Interactive 3D is unavailable. The complete topology remains available below.</p>
        {/if}
        <div class="observatory__map" class:observatory__map--overlay={sceneMode !== '3d'} role={sceneMode === '3d' ? undefined : 'group'} aria-label={sceneMode === '3d' ? undefined : 'System topology'} aria-hidden={sceneMode === '3d' ? 'true' : undefined}>
          <svg class="observatory__wires" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
            {#each topologyLinks as link}<line class:wire-active={selectedId && (link.fromId === selectedId || link.toId === selectedId)} class:wire-muted={selectedId && link.fromId !== selectedId && link.toId !== selectedId} data-from={link.fromId} data-to={link.toId} x1={link.from[0]} y1={link.from[1]} x2={link.to[0]} y2={link.to[1]} />{/each}
          </svg>
          {#if sceneMode !== '3d'}{#each activeComponents as component (component.id)}{@render nodeButton(component)}{/each}{/if}
        </div>
        <p class="observatory__map-caption">Conceptual map · relationships, not physical placement or live state</p>
      </div>
      {#if sceneMode === '3d'}
        <div class="observatory__nodes" role="group" aria-label="Choose a component">
          {#each activeComponents as component (component.id)}{@render nodeButton(component)}{/each}
        </div>
      {/if}
      <div class="observatory__legend" aria-label="Topology legend">
        <span><i class="legend-mark legend-mark--host"></i>Compute</span>
        <span><i class="legend-mark legend-mark--service"></i>Services</span>
        <span><i class="legend-mark legend-mark--link"></i>Documented relationship</span>
      </div>
    </div>

    <p class="sr-only" role="status" data-selection-status>
      {selectedComponent ? `${selectedComponent.name} selected. ${relatedComponents.length} connected systems.` : `${activePhase?.name} view shown.`}
    </p>
    <aside class="observatory__detail" aria-labelledby="detail-heading">
      {#if selectedComponent}
        <div class="detail__topline"><span>Selected system</span><span class="detail__id">{selectedComponent.id}</span></div>
        <h3 id="detail-heading">{selectedComponent.name}</h3>
        <p class="detail__description">{selectedComponent.description}</p>
        <div class="detail__section">
          <h4>Technologies</h4>
          <ul class="detail__tags">{#each selectedComponent.technologies as technology}<li>{technology}</li>{/each}</ul>
        </div>
        {#if selectedCase?.technologyContext}
          <div class="detail__section detail__technology">
            <h4>Technology in practice</h4>
            <p class="detail__description">{selectedCase.technologyContext}</p>
          </div>
        {/if}
        <div class="detail__section">
          <h4>Connected systems</h4>
          {#if relatedComponents.length}
            <ul class="detail__relations">{#each relatedComponents as relation}<li>{#if activePhase.components.includes(relation.id)}<button type="button" onclick={() => chooseComponent(relation.id)} aria-label={`Select related system ${relation.name}`}>{relation.name}</button>{:else}<span>{relation.name} (outside this phase)</span>{/if}</li>{/each}</ul>
          {:else}<p class="detail__quiet">No connected systems are documented.</p>{/if}
        </div>
        {#if selectedCase?.decision || selectedCase?.learning}
          <div class="detail__section">
            <h4>Decision and learning</h4>
            {#if selectedCase.decision}<p class="detail__description">{selectedCase.decision}</p>{/if}
            {#if selectedCase.learning}<p class="detail__description">{selectedCase.learning}</p>{/if}
          </div>
        {/if}
        {#if selectedCase}
          <a class="btn btn-primary btn-sm detail__case-link" href={caseHref(selectedCase.id)}>Read the case: {selectedCase.title}</a>
        {/if}
      {:else}
        <div class="detail__topline"><span>View briefing</span><span class="detail__id">{activePhase?.id}</span></div>
        <h3 id="detail-heading">{activePhase?.name}</h3>
        <p class="detail__description">{activePhase?.description}</p>
        {#if activePhase}
          <dl class="phase-facts">
            <div><dt>Challenge</dt><dd>{activePhase.challenge}</dd></div>
            <div><dt>Learning</dt><dd>{activePhase.learning}</dd></div>
            <div><dt>Documented state</dt><dd>{activePhase.status}</dd></div>
            <div><dt>Next</dt><dd>{activePhase.next}</dd></div>
          </dl>
        {/if}
      {/if}
    </aside>
  </div>

  <div class="observatory__lower">
    <section class="phase-panel" aria-labelledby="phase-heading">
      <div class="lower-heading"><div><h3 id="phase-heading">Explore the system</h3></div><span class="phase-panel__count">{views.length} views</span></div>
      <p class="phase-panel__context">Start with every documented system, then focus the map on a theme. Theme order is editorial, not a measured chronology.</p>
      <div class="phase-list" role="group" aria-label="Choose a project view">
        {#each views as phase (phase.id)}
          <button type="button" class="phase-option" class:phase-option--active={phaseId === phase.id} data-phase-id={phase.id} aria-pressed={phaseId === phase.id} onclick={() => choosePhase(phase.id)} onkeydown={(event) => movePhaseFocus(event, phase.id)}>
            <span class="phase-option__text"><strong>{phase.name}</strong><small>{phase.description}</small></span><span class="phase-option__arrow" aria-hidden="true">↗</span>
          </button>
        {/each}
      </div>
    </section>

    <section class="phase-work" aria-labelledby="phase-work-heading">
      <div class="lower-heading"><div><h3 id="phase-work-heading">Capabilities and cases</h3></div></div>
      <div class="phase-work__skills" aria-label="Related technologies">
        {#each activePhase?.skills ?? [] as skill}<span>{skill}</span>{/each}
      </div>
      {#if activeCases.length}
        <h4 class="phase-work__case-heading">Related case studies</h4>
        <ul class="phase-work__cases">{#each activeCases as item (item.id)}<li><a href={caseHref(item.id)}>{item.title}<span aria-hidden="true">↗</span></a></li>{/each}</ul>
      {/if}
    </section>
  </div>
</section>

<style>
  .observatory {
    --obs-bg: #101922;
    --obs-surface: #17232d;
    --obs-raised: #1d2b36;
    --obs-line: #344754;
    --obs-text: #ecf1f2;
    --obs-muted: #a8b7bf;
    --obs-blue: #82b9d2;
    --obs-teal: #84bfba;
    color: var(--obs-text);
    background: var(--obs-bg);
    border: 1px solid #31414c;
    border-radius: 1.25rem;
    padding: clamp(1.2rem, 3.5vw, 3rem);
    font-family: inherit;
    overflow: hidden;
  }
  .observatory * { box-sizing: border-box; }
  .observatory__header, .lower-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 1rem; }
  .observatory__header { margin-bottom: 2rem; }
  .observatory h2 { margin: 0; font-size: clamp(2rem, 4vw, 3.2rem); letter-spacing: -.045em; line-height: 1.02; }
  .observatory__intro { margin: .8rem 0 0; color: var(--obs-muted); max-width: 36rem; line-height: 1.6; }
  .observatory .btn { min-height: 2.55rem; border-color: #4b6270; color: var(--obs-text); background: #1c2a34; border-radius: .45rem; text-transform: none; font-weight: 600; }
  .observatory .btn:hover { border-color: var(--obs-blue); background: #243745; }
  .observatory .btn-primary { color: #101922; background: var(--obs-blue); border-color: var(--obs-blue); }
  .observatory .btn-primary:hover { background: #a1cfe1; }
  .observatory button:focus-visible, .observatory a:focus-visible { outline: 3px solid #acd7e9; outline-offset: 3px; }
  .observatory__noscript { margin: 0 0 1rem; padding: .75rem 1rem; border: 1px solid var(--obs-line); border-radius: .5rem; color: var(--obs-text); background: var(--obs-raised); font-size: .85rem; line-height: 1.5; }
  .observatory__noscript a { color: var(--obs-blue); }
  .observatory__actions { display: flex; flex-wrap: wrap; justify-content: flex-end; align-items: center; gap: .4rem; }
  .observatory__actions .btn { white-space: nowrap; }
  .observatory__actions .btn:disabled { opacity: .42; cursor: not-allowed; }
  .observatory__actions .btn[aria-label^='Zoom'] { width: 2.25rem; padding-inline: 0; font-size: 1.1rem; }
  .observatory__copy-status { width: 100%; margin: 0; min-height: 1rem; color: var(--obs-muted); font-size: .72rem; text-align: right; }
  .observatory__layout { display: grid; grid-template-columns: minmax(0, 1.7fr) minmax(17rem, .8fr); gap: 1rem; align-items: start; }
  .observatory__stage, .observatory__detail, .phase-panel, .phase-work { border: 1px solid var(--obs-line); border-radius: .9rem; background: var(--obs-surface); }
  .observatory__stage { min-width: 0; overflow: hidden; }
  .observatory__stage-title { height: 3.4rem; display: flex; align-items: center; gap: .65rem; padding: 0 1rem; color: var(--obs-text); border-bottom: 1px solid var(--obs-line); font-size: .86rem; font-weight: 650; }
  .observatory__stage-mark { position: relative; width: .62rem; height: .62rem; flex: 0 0 .62rem; border: 1px solid var(--obs-blue); border-radius: 50%; }
  .observatory__stage-mark::after { position: absolute; inset: .16rem; border-radius: 50%; background: var(--obs-blue); content: ''; }
  .observatory__stage-hint { margin-left: auto; color: var(--obs-muted); font-size: .75rem; font-weight: 400; }
  .observatory__visual { position: relative; min-height: 28rem; background: radial-gradient(ellipse at 53% 44%, #1b2e3a 0%, #131f29 56%, #101922 100%); }
  .observatory__map { position: absolute; left: 2%; right: 2%; top: 1rem; bottom: 2.7rem; min-height: 20rem; pointer-events: none; }
  .observatory__map:not(.observatory__map--overlay) { opacity: 0; }
  .observatory__nodes { display: flex; flex-wrap: wrap; gap: .5rem; padding: .8rem 1rem; border-top: 1px solid var(--obs-line); }
  .observatory__nodes .topology-node { position: static; left: auto; top: auto; width: auto; min-height: 2.8rem; padding: .45rem .7rem; transform: none; font-size: .72rem; }
  .observatory__nodes .topology-node:hover { transform: none; }
  .observatory__wires { position: absolute; inset: 0; width: 100%; height: 100%; }
  .observatory__wires line { fill: none; stroke: #638397; stroke-width: .9; stroke-dasharray: 2 2; opacity: .68; vector-effect: non-scaling-stroke; transition: stroke .2s ease, opacity .2s ease; }
  .observatory__wires .wire-active { stroke: #9bcfe4; opacity: 1; stroke-width: 1.5; }
  .observatory__wires .wire-muted { opacity: .18; }
  .topology-node { position: absolute; z-index: 1; width: clamp(7rem, 21%, 10.2rem); min-height: 3.5rem; display: flex; align-items: center; gap: .65rem; padding: .65rem .75rem; border: 1px solid #536977; border-radius: .55rem; color: var(--obs-text); background: #1b2a35; box-shadow: 0 10px 26px #080e1466; font: inherit; font-size: .75rem; line-height: 1.3; text-align: left; cursor: pointer; transform: translate(-50%, -50%); transition: border-color .18s ease, background-color .18s ease, transform .18s ease, opacity .18s ease; }
  .topology-node { pointer-events: auto; }
  .topology-node:hover { border-color: #91bbcf; transform: translate(-50%, -53%); }
  .topology-node.is-selected { border-color: #9bcfe4; background: #274153; box-shadow: 0 0 0 2px #8bbbd733, 0 10px 26px #080e1466; }
  .topology-node.is-related:not(.is-selected) { border-color: #718c9a; }
  .topology-node.is-dimmed { opacity: .55; }
  .topology-node__icon { width: 1.45rem; height: 1.45rem; flex: 0 0 1.45rem; color: #c7dce4; }
  .topology-node__name { min-width: 0; }
  .observatory__canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; touch-action: none; cursor: grab; }
  .observatory__canvas:active { cursor: grabbing; }
  [data-scene-mode='topology'] .observatory__canvas { visibility: hidden; }
  .observatory__map-caption { position: absolute; bottom: .7rem; left: 1rem; right: 1rem; margin: 0; color: #9cabb5; font-size: .68rem; text-align: center; }
  .observatory__fallback-note { position: absolute; z-index: 2; top: .75rem; left: 1rem; max-width: calc(100% - 2rem); margin: 0; padding: .45rem .7rem; border: 1px solid #566b78; border-radius: .35rem; color: var(--obs-text); background: #17232dee; font-size: .73rem; }
  .observatory__legend { display: flex; flex-wrap: wrap; gap: 1.25rem; padding: .75rem 1rem; border-top: 1px solid var(--obs-line); color: var(--obs-muted); font-size: .7rem; }
  .observatory__legend span { display: flex; align-items: center; gap: .45rem; }
  .legend-mark { width: .52rem; height: .52rem; border-radius: 2px; background: #8197a5; }
  .legend-mark--service { background: #82b9ae; }
  .legend-mark--link { width: .8rem; height: 1px; border-radius: 0; background: #82b9d2; }
  .observatory__detail { padding: 1.3rem; min-height: 18rem; }
  .detail__topline { display: flex; align-items: center; justify-content: space-between; gap: .7rem; color: var(--obs-teal); font-size: .76rem; font-weight: 600; }
  .detail__id { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: .68rem; color: #99aab3; }
  .observatory h3 { margin: .9rem 0 .55rem; font-size: 1.32rem; line-height: 1.2; letter-spacing: -.02em; }
  .detail__description { margin: 0; color: var(--obs-muted); font-size: .86rem; line-height: 1.6; }
  .detail__section { padding-top: 1.05rem; margin-top: 1rem; border-top: 1px solid var(--obs-line); }
  .observatory h4 { margin: 0 0 .65rem; font-size: .72rem; font-weight: 700; color: #c6d2d8; }
  .detail__tags, .detail__relations, .phase-work__cases { list-style: none; padding: 0; margin: 0; }
  .detail__tags { display: flex; flex-wrap: wrap; gap: .4rem; }
  .detail__tags li, .phase-work__skills span { padding: .28rem .5rem; border: 1px solid #435663; border-radius: .3rem; color: #d5e0e4; background: #1b2a34; font-size: .69rem; }
  .detail__relations { display: flex; flex-wrap: wrap; gap: .35rem .75rem; }
  .detail__relations button { border: 0; padding: .1rem 0; color: var(--obs-blue); background: transparent; font: inherit; font-size: .78rem; text-decoration: underline; text-underline-offset: 3px; cursor: pointer; }
  .detail__relations span { padding: .1rem 0; color: var(--obs-muted); font-size: .78rem; }
  .detail__quiet { margin: 0; color: var(--obs-muted); font-size: .78rem; }
  .detail__case-link { width: 100%; margin-top: 1.2rem; white-space: normal; }
  .phase-facts { margin: 1.2rem 0 0; }
  .phase-facts div { padding: .7rem 0; border-top: 1px solid var(--obs-line); }
  .phase-facts dt { margin-bottom: .28rem; color: var(--obs-teal); font-size: .68rem; font-weight: 700; }
  .phase-facts dd { margin: 0; color: #ced8dc; font-size: .78rem; line-height: 1.5; }
  .observatory__lower { display: grid; grid-template-columns: minmax(0, 1.12fr) minmax(16rem, .88fr); gap: 1rem; margin-top: 1rem; }
  .phase-panel, .phase-work { padding: 1.2rem; }
  .lower-heading { align-items: flex-start; min-height: 3.4rem; margin-bottom: .95rem; }
  .lower-heading h3 { margin: 0; font-size: 1.14rem; }
  .phase-panel__count { color: var(--obs-muted); font-size: .7rem; padding-top: .2rem; }
  .phase-panel__context { margin: 0 0 1rem; color: var(--obs-muted); font-size: .75rem; line-height: 1.5; }
  .phase-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .5rem; }
  .phase-option { min-width: 0; display: flex; align-items: flex-start; gap: .7rem; padding: .75rem; border: 1px solid #3c4e5a; border-radius: .5rem; color: var(--obs-text); background: #182630; text-align: left; cursor: pointer; }
  .phase-option:hover { border-color: #7899aa; }
  .phase-option--active { border-color: #9bcfe4; background: #223847; }
  .phase-option--active strong { color: #eaf4f8; }
  .phase-option__text { display: grid; gap: .3rem; min-width: 0; }
  .phase-option__text strong { font-size: .76rem; line-height: 1.3; }
  .phase-option__text small { color: var(--obs-muted); font-size: .68rem; line-height: 1.4; }
  .phase-option__arrow { margin-left: auto; color: #9bb4c0; font-size: .85rem; }
  .phase-work { display: flex; flex-direction: column; }
  .phase-work__skills { display: flex; flex-wrap: wrap; gap: .4rem; padding-bottom: .95rem; }
  .phase-work__case-heading { padding-top: .8rem; border-top: 1px solid var(--obs-line); }
  .phase-work__cases li + li { margin-top: .3rem; }
  .phase-work__cases a { display: flex; justify-content: space-between; gap: 1rem; padding: .45rem 0; color: var(--obs-blue); font-size: .8rem; line-height: 1.35; text-decoration: none; }
  .phase-work__cases a:hover { text-decoration: underline; text-underline-offset: 3px; }
  .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
  @media (max-width: 799px) {
    .observatory__layout, .observatory__lower { grid-template-columns: minmax(0, 1fr); }
    .observatory__visual { min-height: 26rem; }
    .observatory__map { left: 0; right: 0; }
    .topology-node { width: min(6.8rem, 29%); min-height: 3.4rem; padding: .5rem; font-size: .68rem; }
    .observatory__wires line { stroke-dasharray: 2 2; }
    .observatory__detail { min-height: 0; }
  }
  @media (max-width: 520px) {
    .observatory { padding: 1rem; border-radius: .8rem; }
    .observatory__header { flex-direction: column; }
    .observatory__actions { width: 100%; justify-content: flex-start; }
    .observatory__stage-title { height: auto; min-height: 3.4rem; padding-inline: .75rem; font-size: .76rem; }
    .observatory__stage-hint { max-width: 48%; font-size: .66rem; text-align: right; line-height: 1.3; }
    .observatory__visual { min-height: 25rem; }
    .observatory__map { top: .6rem; bottom: 2.4rem; }
    .topology-node { width: min(6.25rem, 29%); min-height: 3.15rem; gap: .35rem; padding: .45rem; font-size: .64rem; }
    .topology-node__icon { width: 1.2rem; height: 1.2rem; flex-basis: 1.2rem; }
    .observatory__wires line { stroke-width: 1.2; }
    .phase-list { grid-template-columns: minmax(0, 1fr); }
    .observatory__legend { gap: .7rem; padding-inline: .7rem; font-size: .64rem; }
    .phase-panel, .phase-work, .observatory__detail { padding: 1rem; }
  }
  @media (forced-colors: active) {
    .observatory__map-caption { width: fit-content; margin-inline: auto; left: 0; right: 0; color: CanvasText; background: Canvas; border: 1px solid CanvasText; padding: .2rem .5rem; }
  }
  @media (max-height: 520px) {
    .observatory__visual { min-height: 16rem; }
    .observatory__map { min-height: 12rem; }
    .observatory__stage-title { height: 2.8rem; }
  }
  @media (prefers-reduced-motion: reduce) {
    .observatory *, .observatory *::before, .observatory *::after { scroll-behavior: auto !important; transition-duration: .01ms !important; animation-duration: .01ms !important; animation-iteration-count: 1 !important; }
  }
  .observatory {
    position: relative;
    border-radius: .85rem;
    border-color: #3b505e;
    background-color: #0f1922;
    background-image: linear-gradient(rgba(130, 185, 210, .035) 1px, transparent 1px), linear-gradient(90deg, rgba(130, 185, 210, .035) 1px, transparent 1px);
    background-size: 2.1rem 2.1rem;
    isolation: isolate;
  }
  .observatory::before {
    position: absolute;
    inset: 1rem;
    z-index: -1;
    border: 1px solid rgba(130, 185, 210, .12);
    border-radius: .45rem;
    content: '';
    pointer-events: none;
  }
  .observatory__header { align-items: flex-start; padding-bottom: 1.15rem; border-bottom: 1px solid rgba(130, 185, 210, .2); }
  .observatory__header h2 { max-width: 9ch; }
  .observatory__intro { max-width: 32rem; }
  .observatory__stage, .observatory__detail, .phase-panel, .phase-work { border-radius: .35rem; border-color: #3b505e; background: #14212b; box-shadow: 0 18px 34px rgba(3, 9, 14, .22); }
  .observatory__stage-title { display: grid; grid-template-columns: auto auto minmax(0, 1fr) auto auto; letter-spacing: .03em; background: #111d26; }
  .observatory__stage-code { color: #ffffff !important; font: 600 .62rem/1 ui-monospace, SFMono-Regular, Consolas, monospace; letter-spacing: .08em; }
  .observatory__stage-hint { color: #ffffff !important; }
  .observatory__stage-title > span { color: #ffffff; }
  .observatory__stage-readout { color: #9db5c0 !important; font: 600 .59rem/1 ui-monospace, SFMono-Regular, Consolas, monospace; letter-spacing: .04em; white-space: nowrap; }
  .observatory__scene-hud { position: absolute; z-index: 2; left: 1rem; top: 1rem; display: flex; align-items: center; gap: .65rem; max-width: calc(100% - 2rem); padding: .42rem .58rem; border: 1px solid rgba(158, 202, 220, .24); background: rgba(12, 24, 33, .78); color: #dcecf1; font: .62rem/1.2 ui-monospace, SFMono-Regular, Consolas, monospace; letter-spacing: .035em; pointer-events: none; }
  .scene-hud__mode { color: #a9d7e7; font-weight: 700; }
  .observatory__visual { background-color: #101b25; background-image: radial-gradient(circle at 50% 50%, rgba(63, 115, 142, .2), transparent 45%), linear-gradient(rgba(130, 185, 210, .045) 1px, transparent 1px), linear-gradient(90deg, rgba(130, 185, 210, .045) 1px, transparent 1px); background-size: auto, 2.1rem 2.1rem, 2.1rem 2.1rem; }
  .observatory__wires line { stroke: #68899b; stroke-width: .7; stroke-dasharray: 1.5 3; }
  .observatory__wires .wire-active { stroke: #b1e0f0; stroke-width: 1.35; }
  .topology-node { border-radius: .18rem; border-color: #5b7482; background: #192a35; box-shadow: 0 14px 24px rgba(3, 9, 14, .32); }
  .topology-node__name { color: #f0f7f9; }
  .topology-node::before { width: .35rem; height: .35rem; align-self: flex-start; border-top: 1px solid var(--obs-blue); border-left: 1px solid var(--obs-blue); content: ''; }
  .topology-node.is-dimmed { opacity: 1; }
  .topology-node.is-selected { border-color: #b1e0f0; background: #254252; box-shadow: 0 0 0 2px rgba(155, 207, 228, .18), 0 16px 28px rgba(3, 9, 14, .38); }
  .topology-node__icon { display: none; }
  .observatory__map-caption { left: 50%; right: auto; width: max-content; max-width: calc(100% - 2rem); transform: translateX(-50%); padding: .25rem .55rem; border: 1px solid rgba(130, 185, 210, .22); background: rgba(15, 25, 34, .82); font: .62rem/1.35 ui-monospace, SFMono-Regular, Consolas, monospace; letter-spacing: .025em; }
  .observatory__detail { background: #13212b; }
  .detail__topline, .detail__id, .phase-panel__count { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; letter-spacing: .04em; }
  .detail__technology { background: rgba(132, 191, 186, .055); padding: .8rem; border: 1px solid rgba(132, 191, 186, .2); }
  .detail__technology h4 { color: var(--obs-teal); }
  .detail__tags li, .phase-work__skills span { border-radius: .15rem; background: #182a35; }
  .phase-panel, .phase-work { background: #12202a; }
  .phase-list { gap: 0; border-top: 1px solid var(--obs-line); }
  .phase-option { border-width: 0 0 1px; border-radius: 0; border-color: var(--obs-line); background: transparent; }
  .phase-option:hover, .phase-option--active { border-color: #9bcfe4; background: rgba(130, 185, 210, .1); }
  .phase-option--active strong { color: #f0f7f9; }
  @media (max-width: 520px) {
    .observatory__header { padding-bottom: .9rem; }
    .observatory__header h2 { max-width: 100%; }
    .observatory__stage-title { grid-template-columns: auto auto 1fr; }
    .observatory__stage-hint { grid-column: 1 / -1; margin: .2rem 0 0; max-width: none; text-align: left; }
    .observatory__stage-readout { grid-column: 1 / -1; margin-top: .15rem; white-space: normal; }
    .observatory__scene-hud { left: .7rem; top: .7rem; right: .7rem; max-width: none; flex-wrap: wrap; gap: .35rem .55rem; }
    .observatory__stage-code { font-size: .56rem; }
    .observatory::before { inset: .6rem; }
  }
</style>
