<script>
  import { onMount } from 'svelte';
  import { components, overview, phases, selectPhase } from '../model.js';

  let { cases = [] } = $props();
  let phaseId = $state(phases[0]?.id ?? '');
  let selectedId = $state(null);
  let canvas;
  let scene = null;
  let sceneMode = $state('topology');
  let sceneError = $state(false);
  let sceneLoading = $state(false);
  const nodeCoordinates = {
    host: [17, 27], services: [50, 27], alerts: [83, 27],
    telemetry: [83, 75], automation: [50, 75], gpu: [17, 75]
  };
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
  const activePhase = $derived(phases.find((phase) => phase.id === phaseId) ?? phases[0]);
  const activeComponents = $derived(components.filter((component) => activePhase?.components.includes(component.id)));
  const topologyLinks = $derived(edges
    .filter(([from, to]) => activePhase?.components.includes(from) && activePhase.components.includes(to))
    .map(([from, to]) => ({ fromId: from, toId: to, from: nodeCoordinates[from], to: nodeCoordinates[to] })));
  const selectedComponent = $derived(components.find((component) => component.id === selectedId) ?? null);
  const selectedCase = $derived(cases.find((item) => item.id === selectedComponent?.caseId) ?? null);
  const activeCases = $derived((activePhase?.cases ?? []).map((id) => cases.find((item) => item.id === id)).filter(Boolean));
  const relatedComponents = $derived(selectedComponent ? edges
    .filter((edge) => edge.includes(selectedComponent.id))
    .map(([from, to]) => components.find((component) => component.id === (from === selectedComponent.id ? to : from)))
    .filter(Boolean) : []);

  function choosePhase(id) {
    const state = selectPhase({ phaseId, selectedId }, id);
    phaseId = state.phaseId;
    selectedId = state.selectedId;
    scene?.setPhase(phases.find((phase) => phase.id === id)?.components ?? []);
    scene?.setSelected(selectedId);
  }

  function chooseComponent(id) {
    if (!activePhase?.components.includes(id)) return;
    selectedId = selectedId === id ? null : id;
    scene?.setSelected(selectedId);
  }

  function clearSelection() {
    const state = overview({ phaseId, selectedId });
    selectedId = state.selectedId;
    scene?.setSelected(null);
  }

  onMount(() => {
    let destroyed = false;
    let observer;
    const media = window.matchMedia('(min-width: 800px)');
    const host = canvas?.closest('.observatory');

    async function loadScene() {
      if (!media.matches || !canvas || scene || sceneLoading || destroyed) return;
      sceneLoading = true;
      try {
        const support = document.createElement('canvas').getContext('webgl2');
        if (!support) throw new Error('WebGL is unavailable');
        const { createObservatory } = await import('./observatory-scene.js');
        if (destroyed || !media.matches) return;
        scene = createObservatory(canvas, chooseComponent, edges);
        scene.setPhase(activePhase?.components ?? []);
        scene.setSelected(selectedId);
        sceneMode = '3d';
        sceneError = false;
      } catch {
        sceneError = true;
        sceneMode = 'topology';
      } finally {
        sceneLoading = false;
      }
    }
    function updateMode() {
      if (!media.matches) {
        scene?.destroy();
        scene = null;
        sceneMode = 'topology';
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
    updateMode();
    return () => {
      destroyed = true;
      observer?.disconnect();
      media.removeEventListener('change', updateMode);
      canvas?.removeEventListener('webglcontextlost', contextLost);
      scene?.destroy();
      scene = null;
    };
  });
</script>

<section class="observatory" id="observatory" data-scene-mode={sceneMode} aria-labelledby="observatory-title">
  <header class="observatory__header">
    <div>
      <p class="observatory__eyebrow">Infrastructure, in context</p>
      <h2 id="observatory-title">The Observatory</h2>
      <p class="observatory__intro">Follow the connections between systems, decisions and the work behind them.</p>
    </div>
    <button type="button" class="btn btn-sm observatory__overview" onclick={clearSelection} aria-pressed={!selectedId}>
      Overview
    </button>
  </header>

  <div class="observatory__layout">
    <div class="observatory__stage">
      <div class="observatory__stage-title">
        <span class="observatory__live-dot" aria-hidden="true"></span>
        <span>{activePhase?.name ?? 'Infrastructure map'}</span>
        <span class="observatory__stage-hint">Select a node to explore</span>
      </div>
      <div class="observatory__visual">
        <canvas bind:this={canvas} class="observatory__canvas" aria-label="Interactive homelab topology. Drag to orbit and use the scroll wheel to zoom." role="img"></canvas>
        {#if sceneLoading && sceneMode !== '3d'}
          <p class="observatory__scene-status" role="status">Preparing the interactive view…</p>
        {/if}
        {#if sceneError}
          <p class="observatory__fallback-note" data-webgl-fallback role="status">Interactive 3D is unavailable. The complete topology remains available below.</p>
        {/if}
        <div class="observatory__map" aria-label="System topology">
          <svg class="observatory__wires" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
            {#each topologyLinks as link}<line data-from={link.fromId} data-to={link.toId} x1={link.from[0]} y1={link.from[1]} x2={link.to[0]} y2={link.to[1]} />{/each}
          </svg>
          {#each activeComponents as component (component.id)}
            <button type="button" class="topology-node" class:is-selected={selectedId === component.id} class:topology-node--host={component.id === 'host'} class:topology-node--services={component.id === 'services'} class:topology-node--alerts={component.id === 'alerts'} class:topology-node--telemetry={component.id === 'telemetry'} class:topology-node--automation={component.id === 'automation'} class:topology-node--gpu={component.id === 'gpu'} data-component-id={component.id} aria-label={`Select ${component.name}`} aria-pressed={selectedId === component.id} onclick={() => chooseComponent(component.id)}>
              <span class="topology-node__glyph" aria-hidden="true">{component.type === 'gpu' ? '▰' : component.type === 'switch' ? '⌁' : component.type === 'storage' ? '▤' : '▥'}</span>
              <span>{component.name}</span>
            </button>
          {/each}
        </div>
        <p class="observatory__map-caption">Illustrative topology · relationships, not physical placement</p>
      </div>
      <div class="observatory__legend" aria-label="Topology legend">
        <span><i class="legend-mark legend-mark--host"></i>Compute</span>
        <span><i class="legend-mark legend-mark--service"></i>Services</span>
        <span><i class="legend-mark legend-mark--link"></i>Documented relationship</span>
      </div>
    </div>

    <aside class="observatory__detail" aria-live="polite" aria-atomic="true">
      {#if selectedComponent}
        <div class="detail__topline"><span>Selected system</span><span class="detail__id">{selectedComponent.id}</span></div>
        <h3>{selectedComponent.name}</h3>
        <p class="detail__description">{selectedComponent.description}</p>
        <div class="detail__section">
          <h4>Technologies</h4>
          <ul class="detail__tags">{#each selectedComponent.technologies as technology}<li>{technology}</li>{/each}</ul>
        </div>
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
          <a class="btn btn-primary btn-sm detail__case-link" href={`/cases/${selectedCase.id}/`}>Read the case: {selectedCase.title}</a>
        {/if}
      {:else}
        <div class="detail__topline"><span>Phase briefing</span><span class="detail__id">{activePhase?.id}</span></div>
        <h3>{activePhase?.name}</h3>
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
      <div class="lower-heading"><div><p class="observatory__eyebrow">Themes from documented work</p><h3 id="phase-heading">Explore by phase</h3></div><span class="phase-panel__count">{phases.length} phases</span></div>
      <p class="phase-panel__context">These phases group related work by theme; their order is not a measured chronology.</p>
      <div class="phase-list" role="group" aria-label="Choose a project phase">
        {#each phases as phase (phase.id)}
          <button type="button" class="phase-option" class:phase-option--active={phaseId === phase.id} data-phase-id={phase.id} aria-pressed={phaseId === phase.id} onclick={() => choosePhase(phase.id)}>
            <span class="phase-option__text"><strong>{phase.name}</strong><small>{phase.description}</small></span><span class="phase-option__arrow" aria-hidden="true">↗</span>
          </button>
        {/each}
      </div>
    </section>

    <section class="phase-work" aria-labelledby="phase-work-heading">
      <div class="lower-heading"><div><p class="observatory__eyebrow">Capabilities & evidence</p><h3 id="phase-work-heading">{activePhase?.name}</h3></div></div>
      <div class="phase-work__skills" aria-label="Related technologies">
        {#each activePhase?.skills ?? [] as skill}<span>{skill}</span>{/each}
      </div>
      {#if activeCases.length}
        <h4 class="phase-work__case-heading">Related case studies</h4>
        <ul class="phase-work__cases">{#each activeCases as item (item.id)}<li><a href={`/cases/${item.id}/`}>{item.title}<span aria-hidden="true">↗</span></a></li>{/each}</ul>
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
  .observatory__eyebrow { margin: 0 0 .55rem; color: var(--obs-teal); font-size: .72rem; font-weight: 700; letter-spacing: .105em; text-transform: uppercase; }
  .observatory h2 { margin: 0; font-size: clamp(2rem, 4vw, 3.2rem); letter-spacing: -.045em; line-height: 1.02; }
  .observatory__intro { margin: .8rem 0 0; color: var(--obs-muted); max-width: 36rem; line-height: 1.6; }
  .observatory .btn { min-height: 2.55rem; border-color: #4b6270; color: var(--obs-text); background: #1c2a34; border-radius: .45rem; text-transform: none; font-weight: 600; }
  .observatory .btn:hover { border-color: var(--obs-blue); background: #243745; }
  .observatory .btn-primary { color: #101922; background: var(--obs-blue); border-color: var(--obs-blue); }
  .observatory .btn-primary:hover { background: #a1cfe1; }
  .observatory button:focus-visible, .observatory a:focus-visible { outline: 3px solid #acd7e9; outline-offset: 3px; }
  .observatory__layout { display: grid; grid-template-columns: minmax(0, 1.7fr) minmax(17rem, .8fr); gap: 1rem; align-items: stretch; }
  .observatory__stage, .observatory__detail, .phase-panel, .phase-work { border: 1px solid var(--obs-line); border-radius: .9rem; background: var(--obs-surface); }
  .observatory__stage { min-width: 0; overflow: hidden; }
  .observatory__stage-title { height: 3.4rem; display: flex; align-items: center; gap: .65rem; padding: 0 1rem; color: var(--obs-text); border-bottom: 1px solid var(--obs-line); font-size: .86rem; font-weight: 650; }
  .observatory__live-dot { width: .55rem; height: .55rem; border-radius: 50%; background: var(--obs-teal); box-shadow: 0 0 0 4px #84bfba1f; }
  .observatory__stage-hint { margin-left: auto; color: var(--obs-muted); font-size: .75rem; font-weight: 400; }
  .observatory__visual { position: relative; min-height: 25rem; background: radial-gradient(ellipse at 53% 44%, #1b2e3a 0%, #131f29 56%, #101922 100%); }
  .observatory__canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; touch-action: none; cursor: grab; }
  .observatory__canvas:active { cursor: grabbing; }
  [data-scene-mode='topology'] .observatory__canvas { visibility: hidden; }
  .observatory__map { position: absolute; left: 4%; right: 4%; top: 1rem; bottom: 2.7rem; min-height: 20rem; pointer-events: none; }
  .observatory__wires { position: absolute; inset: 0; width: 100%; height: 100%; }
  .observatory__wires line { fill: none; stroke: #638397; stroke-width: 1.1; stroke-dasharray: 4 5; opacity: .7; vector-effect: non-scaling-stroke; }
  .topology-node { position: absolute; z-index: 1; width: clamp(7.2rem, 24%, 10rem); min-height: 4.25rem; display: flex; align-items: center; gap: .6rem; padding: .65rem .75rem; border: 1px solid #536977; border-radius: .55rem; color: var(--obs-text); background: #1b2a35; box-shadow: 0 8px 22px #080e1466; font: inherit; font-size: .75rem; line-height: 1.3; text-align: left; cursor: pointer; transition: border-color .16s ease, background-color .16s ease, transform .16s ease; }
  .topology-node { pointer-events: auto; }
  .topology-node:hover { border-color: #91bbcf; transform: translateY(-2px); }
  .topology-node.is-selected { border-color: #9bcfe4; background: #274153; box-shadow: 0 0 0 2px #8bbbd733, 0 8px 22px #080e1466; }
  .topology-node__glyph { width: 1.6rem; height: 1.6rem; flex: 0 0 1.6rem; display: grid; place-items: center; border-radius: .3rem; background: #395568; color: #d7e9ef; font-size: 1rem; }
  .topology-node--host { left: 3%; top: 19%; }
  .topology-node--services { left: 35%; top: 19%; }
  .topology-node--alerts { right: 2%; top: 19%; }
  .topology-node--telemetry { right: 2%; bottom: 10%; }
  .topology-node--automation { left: 35%; bottom: 10%; }
  .topology-node--gpu { left: 3%; bottom: 10%; }
  .observatory__map-caption { position: absolute; bottom: .7rem; left: 1rem; right: 1rem; margin: 0; color: #9cabb5; font-size: .68rem; text-align: center; }
  .observatory__fallback-note, .observatory__scene-status { position: absolute; z-index: 2; top: .75rem; left: 1rem; max-width: calc(100% - 2rem); margin: 0; padding: .45rem .7rem; border: 1px solid #566b78; border-radius: .35rem; color: var(--obs-text); background: #17232dee; font-size: .73rem; }
  .observatory__scene-status { left: auto; right: .75rem; }
  .observatory__legend { display: flex; flex-wrap: wrap; gap: 1.25rem; padding: .75rem 1rem; border-top: 1px solid var(--obs-line); color: var(--obs-muted); font-size: .7rem; }
  .observatory__legend span { display: flex; align-items: center; gap: .45rem; }
  .legend-mark { width: .52rem; height: .52rem; border-radius: 2px; background: #8197a5; }
  .legend-mark--service { background: #82b9ae; }
  .legend-mark--link { width: .8rem; height: 1px; border-radius: 0; background: #82b9d2; }
  .observatory__detail { padding: 1.3rem; min-height: 18rem; }
  .detail__topline { display: flex; align-items: center; justify-content: space-between; gap: .7rem; color: var(--obs-teal); font-size: .68rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; }
  .detail__id { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: .65rem; letter-spacing: .04em; color: #99aab3; }
  .observatory h3 { margin: .9rem 0 .55rem; font-size: 1.32rem; line-height: 1.2; letter-spacing: -.02em; }
  .detail__description { margin: 0; color: var(--obs-muted); font-size: .86rem; line-height: 1.6; }
  .detail__section { padding-top: 1.05rem; margin-top: 1rem; border-top: 1px solid var(--obs-line); }
  .observatory h4 { margin: 0 0 .65rem; font-size: .72rem; font-weight: 700; color: #c6d2d8; }
  .detail__tags, .detail__relations, .phase-work__cases { list-style: none; padding: 0; margin: 0; }
  .detail__tags { display: flex; flex-wrap: wrap; gap: .4rem; }
  .detail__tags li, .phase-work__skills span { padding: .28rem .5rem; border: 1px solid #435663; border-radius: .3rem; color: #d5e0e4; background: #1b2a34; font-size: .69rem; }
  .detail__relations { display: flex; flex-wrap: wrap; gap: .35rem .75rem; }
  .detail__relations button { border: 0; padding: .1rem 0; color: var(--obs-blue); background: transparent; font: inherit; font-size: .78rem; text-decoration: underline; text-underline-offset: 3px; cursor: pointer; }
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
  .lower-heading .observatory__eyebrow { font-size: .63rem; }
  .phase-panel__count { color: var(--obs-muted); font-size: .7rem; padding-top: .2rem; }
  .phase-panel__context { margin: 0 0 1rem; color: var(--obs-muted); font-size: .75rem; line-height: 1.5; }
  .phase-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .5rem; }
  .phase-option { min-width: 0; display: flex; align-items: flex-start; gap: .7rem; padding: .75rem; border: 1px solid #3c4e5a; border-radius: .5rem; color: var(--obs-text); background: #182630; text-align: left; cursor: pointer; }
  .phase-option:hover { border-color: #7899aa; }
  .phase-option--active { border-color: #7bb6cb; background: #223847; box-shadow: inset 3px 0 #82b9d2; }
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
    .observatory__visual { min-height: 22rem; }
    .observatory__map { left: 1%; right: 1%; }
    .topology-node { width: clamp(6.6rem, 28%, 9.5rem); min-height: 3.8rem; padding: .5rem; font-size: .68rem; }
    .topology-node--host, .topology-node--gpu { left: 0; }
    .topology-node--services, .topology-node--automation { left: 35%; }
    .topology-node--alerts, .topology-node--telemetry { right: 0; }
    .observatory__wires line { stroke-dasharray: 3 5; }
    .observatory__detail { min-height: 0; }
  }
  @media (max-width: 520px) {
    .observatory { padding: 1rem; border-radius: .8rem; }
    .observatory__header { align-items: flex-start; margin-bottom: 1.3rem; }
    .observatory__overview { flex: 0 0 auto; padding-inline: .6rem; }
    .observatory__stage-title { padding-inline: .75rem; font-size: .76rem; }
    .observatory__stage-hint { max-width: 7rem; text-align: right; line-height: 1.3; }
    .observatory__visual { min-height: 25rem; }
    .observatory__map { top: .7rem; bottom: 2.6rem; }
    .topology-node { width: 6.8rem; gap: .35rem; font-size: .64rem; }
    .topology-node__glyph { width: 1.35rem; height: 1.35rem; flex-basis: 1.35rem; }
    .topology-node--host { top: 15%; }
    .topology-node--services { left: calc(50% - 3.4rem); top: 15%; }
    .topology-node--alerts { top: 15%; }
    .topology-node--gpu { bottom: 13%; }
    .topology-node--automation { left: calc(50% - 3.4rem); bottom: 13%; }
    .topology-node--telemetry { bottom: 13%; }
    .observatory__wires line { stroke-width: 1.4; }
    .phase-list { grid-template-columns: minmax(0, 1fr); }
    .observatory__legend { gap: .7rem; padding-inline: .7rem; font-size: .64rem; }
    .phase-panel, .phase-work, .observatory__detail { padding: 1rem; }
  }
  @media (prefers-reduced-motion: reduce) {
    .observatory *, .observatory *::before, .observatory *::after { scroll-behavior: auto !important; transition-duration: .01ms !important; animation-duration: .01ms !important; animation-iteration-count: 1 !important; }
  }
</style>
