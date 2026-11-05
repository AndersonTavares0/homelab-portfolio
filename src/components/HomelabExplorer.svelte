<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { resolve } from '$app/paths';
  import { categories, services, technologies, relations, filterServices, explorerState } from '../explorer.js';
  import { replaceState, afterNavigate } from '$app/navigation';
  import { page } from '$app/state';
  let { cases = [] } = $props();
  let category = $state('all');
  let query = $state('');
  let selectedId = $state<string | null>(null);
  let zoom = $state(1);
  let pan = $state({x:0,y:0});
  let dragging = $state(false);
  let origin: {x:number,y:number,px:number,py:number} | null = null;
  let status = $state('');
  let copyTimer: ReturnType<typeof setTimeout>;
  let viewport: HTMLDivElement;
  const visible = $derived(filterServices(category, query));
  let mounted = false;
  let fit = $state(1);
  const compactMap = $derived(category !== 'all' || query.trim() !== '');
  const mapHeight = $derived(compactMap ? Math.max(240, 100 + Math.ceil(visible.length / 3) * 125) : 640);
  function point(item) {
    if (!compactMap) {
      const column=categories.findIndex(c=>c.id===item.category);
      const row=services.filter(s=>s.category===item.category).findIndex(s=>s.id===item.id);
      return {x:110+column*195,y:120+row*82};
    }
    const index=visible.findIndex(service=>service.id===item.id);
    return {x:145+(index%3)*285,y:100+Math.floor(index/3)*125};
  }
  const selected = $derived(services.find(item=>item.id===selectedId) ?? null);
  const selectedRelations = $derived(relations.filter(edge=>edge.from===selectedId || edge.to===selectedId));
  const visibleIds = $derived(new Set(visible.map(item=>item.id)));
  const visibleRelations = $derived(relations.filter(edge=>visibleIds.has(edge.from)&&visibleIds.has(edge.to)));
  const relatedIds = $derived(new Set(selectedRelations.flatMap(edge=>[edge.from,edge.to])));
  const shownCategories = $derived(categories.filter(item=>visible.some(service=>service.category===item.id)));
  const selectedCases = $derived(cases.filter(item=>selected?.caseIds.includes(item.id)));
  function sync() {
    const url = new URL(window.location.href);
    for(const key of ['service','category','q']) url.searchParams.delete(key);
    if(selectedId) url.searchParams.set('service',selectedId);
    if(category!=='all') url.searchParams.set('category',category);
    if(query.trim()) url.searchParams.set('q',query.trim());
    replaceState(`${url.pathname}${url.search}${url.hash}`, page.state);
  }
  function filter(nextCategory=category,nextQuery=query) {
    category=nextCategory; query=nextQuery;
    if(!filterServices(category,query).some(item=>item.id===selectedId)) selectedId=null;
    resetView(); sync();
  }
  async function select(id: string) {
    selectedId=id; sync();
    await tick();
    if(matchMedia('(max-width: 760px)').matches) document.querySelector('.explorer-detail')?.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  }
  function moveFocus(event: KeyboardEvent,id:string) {
    const keys=['ArrowRight','ArrowDown','ArrowLeft','ArrowUp','Home','End'];
    if(!keys.includes(event.key)) return;
    event.preventDefault();
    const index=visible.findIndex(item=>item.id===id);
    const next=event.key==='Home'?0:event.key==='End'?visible.length-1:(index+(['ArrowRight','ArrowDown'].includes(event.key)?1:-1)+visible.length)%visible.length;
    selectedId=visible[next].id; sync();
    document.querySelector<HTMLButtonElement>(`[data-service-id="${selectedId}"]`)?.focus();
  }
  function resetView(){zoom=1;pan={x:0,y:0};}
  function changeZoom(amount:number){zoom=Math.max(.7,Math.min(1.8,Math.round((zoom+amount)*10)/10));}
  function move(x:number,y:number){pan={x:Math.max(-600,Math.min(600,pan.x+x)),y:Math.max(-600,Math.min(600,pan.y+y))};}
  function pointerDown(event:PointerEvent){
    if(event.button!==0 || (event.target as Element).closest('button,a'))return;
    origin={x:event.clientX,y:event.clientY,px:pan.x,py:pan.y};dragging=true;
    viewport.setPointerCapture(event.pointerId);
  }
  function pointerMove(event:PointerEvent){if(origin&&dragging)pan={x:Math.max(-600,Math.min(600,origin.px+event.clientX-origin.x)),y:Math.max(-600,Math.min(600,origin.py+event.clientY-origin.y))};}
  function pointerEnd(){dragging=false;origin=null;}
  async function copyLink(){
    try{await navigator.clipboard.writeText(location.href);status='Link copied';}
    catch{status='Copy failed; copy the address from your browser.';}
    clearTimeout(copyTimer);copyTimer=setTimeout(()=>status='',3000);
  }
  function caseHref(id:string){
    const params=new URLSearchParams();if(selectedId)params.set('service',selectedId);if(category!=='all')params.set('category',category);if(query.trim())params.set('q',query.trim());
    return `${resolve(`/cases/${id}/`)}${params.size?`?${params}`:''}`;
  }
  function path(edge) {
    const a=point(services.find(s=>s.id===edge.from)),b=point(services.find(s=>s.id===edge.to));
    const half=compactMap?104:95, mid=compactMap?41:30;
    if(Math.abs(a.x-b.x)<1) return `M ${a.x} ${a.y+mid} L ${b.x} ${b.y-mid}`;
    return `M ${a.x+half} ${a.y} C ${a.x+half+40} ${a.y}, ${b.x-half-40} ${b.y}, ${b.x-half} ${b.y}`;
  }
  afterNavigate(() => {
    if (!mounted) return;
    const state=explorerState(location.search);
    category=state.category;query=state.q;selectedId=state.service;
  });
  onMount(()=>{
    mounted = true;
    const restore=()=>{const state=explorerState(location.search);category=state.category;query=state.q;selectedId=state.service;sync();};
    restore();window.addEventListener('popstate',restore);
    const resize = new ResizeObserver(entries=>{fit=Math.min(1,entries[0].contentRect.width/860);});
    resize.observe(viewport);
    return()=>{resize.disconnect();window.removeEventListener('popstate',restore);clearTimeout(copyTimer);};
  });
</script>

<section id="homelab-explorer" class="explorer" aria-labelledby="explorer-title" tabindex="-1">
  <header class="explorer-heading">
    <div><h2 id="explorer-title">Homelab Explorer</h2><p>Services, responsibilities and the decisions that connect them.</p></div>
    <div class="explorer-evidence"><span class="evidence-mark" aria-hidden="true"></span><strong>Documented, not live.</strong><span>Historical evidence · no operational controls</span></div>
  </header>
  <div class="explorer-toolbar" id="explorer-browse">
    <label class="explorer-search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/></svg><input type="search" aria-label="Search services" placeholder="Find a service or technology…" value={query} oninput={event=>filter(category,event.currentTarget.value)}/></label>
    <div class="explorer-filters" role="group" aria-label="Service categories"><button class:active={category==='all'} aria-pressed={category==='all'} onclick={()=>filter('all')}>All services</button>{#each categories as item}<button class:active={category===item.id} aria-pressed={category===item.id} onclick={()=>filter(item.id)}>{item.name}</button>{/each}</div>
  </div>
  <noscript><p class="explorer-noscript">Interactive search and selection need JavaScript. The documented service map remains readable; read the evidence in <a href={resolve('/cases/')}>the case studies catalogue</a>.</p></noscript>
  <div class="explorer-layout">
    <div class="explorer-stage">
      <div class="explorer-map-heading"><span><strong>{category==='all'?'Service field':categories.find(c=>c.id===category)?.name}</strong><small>{visible.length} documented services</small></span><span class="explorer-map-key"><i></i>Evidence-backed relationship</span></div>
      <div bind:this={viewport} class="explorer-viewport" style={`--fit:${fit};--map-height:${mapHeight}px;--viewport-height:${mapHeight*fit}px`} class:dragging role="region" aria-label="Service map. Drag to pan or use the map navigation buttons." onpointerdown={pointerDown} onpointermove={pointerMove} onpointerup={pointerEnd} onpointercancel={pointerEnd}>
        <div class="explorer-map" class:explorer-map--overview={!compactMap} style={`--zoom:${zoom};--pan-x:${pan.x}px;--pan-y:${pan.y}px`} data-zoom={zoom}>
          {#each shownCategories as item}<div class="explorer-zone explorer-zone--{item.id}" class:compact-zone={compactMap} style={`left:${15+categories.findIndex(c=>c.id===item.id)*195}px;top:24px`}><strong>{item.name}</strong><span>{item.description}</span></div>{/each}
          <svg class="explorer-connections" viewBox={`0 0 860 ${mapHeight}`} aria-hidden="true"><defs><marker id="explorer-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" fill="currentColor"/></marker></defs>{#each visibleRelations as edge}<path d={path(edge)} data-relation-id={edge.id} class:is-active={selectedRelations.includes(edge)} class:is-muted={selectedId&&!selectedRelations.includes(edge)} marker-end="url(#explorer-arrow)"/>{/each}</svg>
          {#if compactMap}<svg class="explorer-edge-labels" viewBox={`0 0 860 ${mapHeight}`} aria-hidden="true">{#each visibleRelations as edge}{@const a=point(services.find(s=>s.id===edge.from))}{@const b=point(services.find(s=>s.id===edge.to))}<text x={a.x===b.x?a.x+14:(a.x+b.x)/2} y={a.x===b.x?(a.y+b.y)/2:Math.min(a.y,b.y)-48} text-anchor={a.x===b.x?'start':'middle'} class:is-muted={selectedId&&!selectedRelations.includes(edge)}>{edge.label}</text>{/each}</svg>{/if}
          {#each visible as item}
            <button class="service-node" class:is-selected={selectedId===item.id} class:is-related={selectedId&&relatedIds.has(item.id)} class:is-muted={selectedId&&!relatedIds.has(item.id)} style={`left:${point(item).x}px;top:${point(item).y}px`} data-service-id={item.id} aria-label={`Select ${item.name} ${item.summary}`} aria-pressed={selectedId===item.id} onclick={()=>select(item.id)} onkeydown={event=>moveFocus(event,item.id)}>
              <span class="service-node__symbol" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
                {#if item.category==='automation'}<path d="m9 4 3 3 3-3M12 7v10M5 17h14M5 14v6M19 14v6"/>{:else if item.category==='delivery'}<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>{:else if item.category==='observability'}<path d="M3 12h4l3-7 4 14 3-7h4"/>{:else}<rect x="5" y="5" width="14" height="14" rx="2"/><path d="M9 9h6v6H9zM9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/>{/if}
              </svg></span>
              <span><strong>{item.name}</strong>{' '}<small>{item.summary}</small></span>
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m6 3 5 5-5 5"/></svg>
            </button>
          {/each}
        </div>
        {#if !visible.length}<div class="explorer-empty"><h3>No services match “{query}”.</h3><p>Try a technology such as Python or clear the filters.</p><button onclick={()=>filter('all','')}>Clear search and categories</button></div>{/if}
      </div>
      <div class="explorer-controls"><div role="group" aria-label="Map navigation"><button aria-label="Zoom out" onclick={()=>changeZoom(-.1)} disabled={zoom<=.7}>−</button><output aria-label="Map zoom">{Math.round(zoom*100)}%</output><button aria-label="Zoom in" onclick={()=>changeZoom(.1)} disabled={zoom>=1.8}>+</button><button onclick={resetView}>Reset view</button></div><div class="pan-controls" role="group" aria-label="Pan map"><button aria-label="Pan left" onclick={()=>move(80,0)}>←</button><button aria-label="Pan up" onclick={()=>move(0,80)}>↑</button><button aria-label="Pan down" onclick={()=>move(0,-80)}>↓</button><button aria-label="Pan right" onclick={()=>move(-80,0)}>→</button></div><button onclick={copyLink}>Copy link</button></div>
      <p class="explorer-caption">{#if visible.length && !visibleRelations.length}No direct links are established between these results. Shared tools or a shared case do not imply a connection. {:else}Groups describe function, not physical placement. Lines show only evidence-backed relationships. {/if}Select a service to read the boundary and its source.</p>
    </div>
    <aside class="explorer-detail" aria-labelledby="explorer-detail-heading">
      {#key selectedId}<div class="explorer-detail-content">
      {#if selected}
        <a class="explorer-back" href="#explorer-browse">Back to service selection ↑</a>
        <div class="detail-heading"><span>{categories.find(c=>c.id===selected.category)?.name}</span><button aria-label="Clear selected service" onclick={()=>{selectedId=null;sync();}}>×</button></div>
        <h3 id="explorer-detail-heading">{selected.name}</h3><p class="detail-summary">{selected.summary}</p>
        <section><h4>What it does</h4><p>{selected.purpose}</p></section>
        <section><h4>Why this choice</h4><p>{selected.decision}</p></section>
        {#if selected.technologyIds.length}<section><h4>Implementation technologies</h4><ul class="explorer-tags">{#each selected.technologyIds as id}<li title={technologies.find(t=>t.id===id)?.role}>{technologies.find(t=>t.id===id)?.name}</li>{/each}</ul><p class="detail-note">Used in this work; not additional network connections.</p></section>{/if}
        <section><h4>Documented relationships</h4>{#if selectedRelations.length}<ul class="explorer-relations">{#each selectedRelations as edge}<li><button onclick={()=>{filter('all','');select(edge.from===selectedId?edge.to:edge.from);}}><span>{services.find(s=>s.id===(edge.from===selectedId?edge.to:edge.from))?.name}</span><small>{edge.from===selectedId?'Outgoing':'Incoming'} · {edge.label}</small></button><details><summary>Connection evidence</summary><p>{edge.explanation}</p></details></li>{/each}</ul>{:else}<p>No direct connection is established by the available case. Sharing a study is not evidence of a transport link.</p>{/if}</section>
        <details class="detail-evidence"><summary><h4>Evidence and limits</h4></summary><p>{selected.evidence}</p></details>
        <div class="explorer-case-links">{#each selectedCases as item}<a href={caseHref(item.id)}>Read case: {item.title}<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 13 13 3M5 3h8v8"/></svg></a>{/each}</div>
      {:else}
        <span class="detail-intro-mark" aria-hidden="true"><svg viewBox="0 0 48 48"><path d="M8 24h32M24 8v32M8 8h8v8H8zm24 24h8v8h-8z"/><circle cx="24" cy="24" r="8"/></svg></span>
        <h3 id="explorer-detail-heading">A map of intent,<br/>not an inventory.</h3><p class="detail-summary">Choose a service to uncover its role and the engineering boundary behind it.</p>
        <ol class="explorer-instructions"><li><strong>Find its purpose</strong><span>Search services or browse by function.</span></li><li><strong>Trace the relationship</strong><span>Only source-backed connections are drawn.</span></li><li><strong>Read the decision</strong><span>Open the study for tradeoffs and evidence limits.</span></li></ol>
        <div class="detail-evidence"><h4>What this map does not claim</h4><p>It is not live status, a physical layout or a complete installation inventory. Each selection states the limits of its historical evidence.</p></div>
      {/if}
      </div>{/key}
    </aside>
  </div>
  <p class="explorer-status" role="status" aria-live="polite">{status || (selected?`${selected.name} selected. ${selectedRelations.length} documented relationships.`:`${visible.length} services shown.`)}</p>
</section>

<style>
  .explorer{--ex-bg:#0b181d;--ex-panel:#122329;--ex-line:#345058;--ex-text:#edf5f0;--ex-muted:#b6cbc9;--ex-accent:#8bd6c7;color:var(--ex-text);background:var(--ex-bg);padding:clamp(1.25rem,4vw,4rem);margin:3rem 2vw;border:1px solid var(--ex-line);border-radius:1rem;scroll-margin-top:7rem}
  .explorer-heading{display:flex;justify-content:space-between;align-items:end;gap:3rem;margin-bottom:2.5rem}.explorer-heading h2{font-size:clamp(2.3rem,4.4vw,4.6rem);line-height:1.07;letter-spacing:-.04em;margin:0 0 1.3rem}.explorer-heading h2 em{font-style:normal;color:var(--ex-accent)}.explorer-heading p{max-width:42rem;color:var(--ex-muted);line-height:1.65;margin:0}.explorer-evidence{display:grid;grid-template-columns:auto 1fr;gap:.4rem .7rem;min-width:15rem;font-size:.8rem;line-height:1.5}.explorer-evidence>span:last-child{grid-column:2;color:var(--ex-muted)}.evidence-mark{width:.55rem;height:.55rem;border:1px solid var(--ex-accent);transform:rotate(45deg);margin-top:.3rem}
  .explorer-toolbar{display:flex;gap:1.25rem;align-items:center;justify-content:space-between;padding:1.25rem 0;border-block:1px solid var(--ex-line);margin-bottom:1.5rem}.explorer-search{display:flex;align-items:center;gap:.7rem;flex:1;max-width:25rem;border:1px solid var(--ex-line);border-radius:.5rem;padding:.7rem .85rem;background:#09151a}.explorer-search svg{width:1.1rem;fill:none;stroke:var(--ex-muted);stroke-width:1.5;flex-shrink:0}.explorer-search input{width:100%;min-width:0;background:transparent;border:0;color:var(--ex-text);font:inherit;font-size:.85rem}.explorer-search input::placeholder{color:var(--ex-muted)}.explorer-filters{display:flex;flex-wrap:wrap;gap:.35rem}.explorer button{font:inherit;cursor:pointer;touch-action:manipulation}.explorer-filters button{border:1px solid transparent;background:transparent;color:var(--ex-muted);padding:.65rem .8rem;border-radius:.4rem;font-size:.8rem}.explorer-filters button:hover,.explorer-filters button.active{color:var(--ex-text);border-color:var(--ex-line);background:#20373c}.explorer-filters button.active{box-shadow:inset 0 -2px var(--ex-accent)}
  .explorer-layout{display:grid;grid-template-columns:minmax(0,1fr) minmax(19rem,.39fr);gap:1.5rem;align-items:start}.explorer-stage{min-width:0;border:1px solid var(--ex-line);border-radius:.7rem;overflow:hidden;background:#0a171d}.explorer-map-heading{display:flex;justify-content:space-between;align-items:center;gap:1rem;padding:1rem 1.2rem;border-bottom:1px solid var(--ex-line)}.explorer-map-heading>span:first-child{display:flex;gap:.8rem;align-items:baseline}.explorer-map-heading strong{font-size:.9rem}.explorer-map-heading small,.explorer-map-key{font-size:.7rem;color:var(--ex-muted)}.explorer-map-key{display:flex;gap:.4rem;align-items:center}.explorer-map-key i{width:1.2rem;border-top:1px solid var(--ex-accent)}
  .explorer-viewport{height:850px;position:relative;overflow:hidden;cursor:grab;touch-action:pan-y;background-image:radial-gradient(#36525c88 .65px,transparent .65px);background-size:24px 24px}.explorer-viewport.dragging{cursor:grabbing;user-select:none;touch-action:none}.explorer-map{width:860px;height:920px;position:absolute;left:50%;margin-left:-430px;transform:translate(var(--pan-x),var(--pan-y)) scale(var(--zoom));transform-origin:50% 45%;transition:transform .3s cubic-bezier(.16,1,.3,1)}.dragging .explorer-map{transition:none}.explorer-zone{position:absolute;display:grid;gap:.35rem;pointer-events:none}.explorer-zone strong{font-size:1.1rem;letter-spacing:-.02em}.explorer-zone span{font-size:.72rem;color:var(--ex-muted)}.explorer-connections{position:absolute;inset:0;width:100%;height:100%;color:#7ea9ab;pointer-events:none;overflow:visible}.explorer-connections>path{fill:none;stroke:currentColor;stroke-width:1.4;transition:opacity .25s,stroke .25s}.explorer-connections>path.is-active{stroke:var(--ex-accent);stroke-width:2.5;stroke-dasharray:5 7;animation:trace-link 1s ease-out 2}.explorer-connections>path.is-muted{opacity:.22}@keyframes trace-link{from{stroke-dashoffset:24}to{stroke-dashoffset:0}}
  .service-node{position:absolute;transform:translate(-50%,-50%);width:208px;min-height:82px;display:flex;gap:.7rem;align-items:center;padding:.85rem;border:1px solid #48636c;border-radius:.5rem;background:linear-gradient(150deg,#213840,#14262e);color:var(--ex-text);box-shadow:0 7px 0 #061216,0 14px 24px #0004;text-align:left;transition:transform .25s,border-color .25s,opacity .25s,box-shadow .25s}.service-node:hover,.service-node:focus-visible{transform:translate(-50%,calc(-50% - 4px));border-color:var(--ex-accent)}.service-node.is-selected{border-color:var(--ex-accent);background:#294a4c;box-shadow:0 7px 0 #10272b,0 18px 28px #0005}.service-node.is-muted{opacity:.65}.service-node>span:nth-child(2){display:grid;gap:.35rem;min-width:0}.service-node strong{font-size:.83rem;line-height:1.25}.service-node small{font-size:.66rem;color:#c1d5d1;line-height:1.35}.service-node__symbol{width:1.7rem;height:1.7rem;display:grid;place-items:center;border:1px solid #5d7e83;border-radius:.3rem;font-weight:700;font-size:.7rem;color:var(--ex-accent);flex-shrink:0}.service-node>svg{width:.8rem;fill:none;stroke:currentColor;stroke-width:1.5;flex-shrink:0;margin-left:auto}
  .explorer-controls{display:flex;justify-content:space-between;align-items:center;gap:.5rem;padding:.85rem;border-top:1px solid var(--ex-line);flex-wrap:wrap}.explorer-controls>div{display:flex;gap:.3rem;align-items:center}.explorer-controls button,.explorer-empty button{min-height:36px;min-width:36px;border:1px solid #49636b;border-radius:.3rem;background:#172d34;color:var(--ex-text);padding:.4rem .6rem;font-size:.75rem}.explorer-controls button:hover{background:#29474b;border-color:var(--ex-accent)}.explorer-controls button:disabled{opacity:.45;cursor:not-allowed}.explorer-controls output{font-size:.7rem;min-width:2.7rem;text-align:center;font-variant-numeric:tabular-nums}.explorer-caption{margin:0;padding:.8rem 1rem;border-top:1px solid var(--ex-line);color:var(--ex-muted);font-size:.72rem;line-height:1.6}.explorer-empty{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:2rem}.explorer-empty h3{font-size:1.4rem}.explorer-empty p{color:var(--ex-muted)}
  .explorer-detail{background:var(--ex-panel);border:1px solid var(--ex-line);border-radius:.7rem;padding:1.5rem;position:sticky;top:6rem;scroll-margin-top:9rem;min-width:0}.detail-heading{display:flex;justify-content:space-between;align-items:center;color:var(--ex-accent);font-size:.78rem}.detail-heading button{border:1px solid var(--ex-line);background:transparent;color:var(--ex-text);min-width:32px;min-height:32px;border-radius:.3rem}.explorer-detail h3{font-size:1.75rem;line-height:1.15;letter-spacing:-.03em;margin:.8rem 0}.detail-summary{color:var(--ex-muted);font-size:.9rem;line-height:1.65;margin-bottom:1.5rem}.explorer-detail section,.detail-evidence{padding-top:1.1rem;margin-top:1.1rem;border-top:1px solid var(--ex-line)}.explorer-detail h4{font-size:.8rem;margin:0 0 .55rem;color:var(--ex-accent)}.explorer-detail p{font-size:.83rem;line-height:1.65;color:var(--ex-muted)}.explorer-tags{padding:0;margin:0;list-style:none;display:flex;gap:.4rem;flex-wrap:wrap}.explorer-tags li{border:1px solid #506b71;border-radius:.3rem;padding:.3rem .5rem;font-size:.73rem}.explorer-detail .detail-note{font-size:.7rem}.explorer-relations{list-style:none;margin:0;padding:0}.explorer-relations li+li{border-top:1px solid var(--ex-line);padding-top:.8rem}.explorer-relations button{display:grid;gap:.3rem;text-align:left;background:none;border:0;padding:.35rem 0;color:var(--ex-text);width:100%}.explorer-relations button:hover{color:var(--ex-accent)}.explorer-relations button small{font-size:.7rem;color:var(--ex-accent)}.explorer-relations p{font-size:.76rem}.detail-evidence{border-top-style:dashed}.explorer-case-links{display:grid;gap:.6rem;margin-top:1.5rem}.explorer-case-links a{display:flex;justify-content:space-between;gap:.7rem;align-items:center;color:#0b2426;background:var(--ex-accent);padding:.85rem;border-radius:.35rem;font-size:.8rem;font-weight:650;text-decoration:none;line-height:1.5}.explorer-case-links a:hover{background:#bcf0dd}.explorer-case-links svg{width:1rem;fill:none;stroke:currentColor;stroke-width:1.5;flex-shrink:0}.detail-intro-mark svg{width:3rem;height:3rem;fill:none;stroke:var(--ex-accent);stroke-width:1}.explorer-instructions{padding:0;list-style:none;counter-reset:explore}.explorer-instructions li{counter-increment:explore;display:grid;grid-template-columns:1.8rem 1fr;gap:.3rem .5rem;padding:1rem 0;border-top:1px solid var(--ex-line)}.explorer-instructions li::before{content:counter(explore);grid-row:span 2;font-size:.75rem;color:var(--ex-accent);padding-top:.2rem}.explorer-instructions strong{font-size:.84rem}.explorer-instructions span{font-size:.78rem;color:var(--ex-muted);line-height:1.6}.explorer-status{min-height:1.4rem;color:var(--ex-muted);font-size:.75rem;margin:1rem 0 0}.explorer-noscript{padding:1rem;border:1px solid var(--ex-line);font-size:.85rem}.explorer-noscript a{color:var(--ex-accent);text-decoration:underline}
  .explorer :focus-visible{outline:3px solid #bcf0dd;outline-offset:4px}.explorer input:focus-visible{outline-offset:7px}
  .explorer-viewport{height:var(--viewport-height,920px)}.explorer-map{height:var(--map-height,920px);transform:translate(var(--pan-x),var(--pan-y)) scale(calc(var(--zoom)*var(--fit)));transform-origin:50% 0}.compact-zone{display:none}.service-node.is-muted{opacity:1;color:#9ab3b2;background:#102027}.service-node.is-muted strong{color:#aec4c0}
  .explorer-edge-labels{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible}.explorer-edge-labels text{fill:#bed5cf;font:11px 'Public Sans Variable',sans-serif;paint-order:stroke;stroke:#0a171d;stroke-width:5px;stroke-linejoin:round}.explorer-edge-labels text.is-muted{fill:#92aaa8}.explorer-back{display:none;color:var(--ex-accent);font-size:.78rem;text-underline-offset:4px}#explorer-browse{scroll-margin-top:9rem}
  .explorer-detail-content{animation:detail-arrive .42s cubic-bezier(.16,1,.3,1) both}
  @keyframes detail-arrive{from{transform:translateY(.65rem)}to{transform:none}}
  .service-node__symbol svg{width:1rem;height:1rem}
  .explorer{padding:clamp(1.15rem,2.5vw,2.25rem);margin:2rem 2vw}.explorer-heading{margin-bottom:1.25rem;align-items:center;gap:1.5rem}.explorer-heading h2{font-size:clamp(1.8rem,3vw,2.7rem);margin:0 0 .5rem;letter-spacing:-.035em}.explorer-heading p{font-size:.88rem}.explorer-toolbar{padding:.85rem 0;margin-bottom:1rem}.explorer-layout{gap:1rem;grid-template-columns:minmax(0,1fr) minmax(18rem,.36fr)}.explorer-detail{padding:1.15rem}.explorer-detail h3{font-size:1.45rem}.explorer-detail p{font-size:.79rem;line-height:1.6}.explorer-detail section,.detail-evidence{padding-top:.8rem;margin-top:.8rem}.explorer-detail details summary{cursor:pointer;font-size:.74rem;color:var(--ex-accent);padding:.35rem 0}.explorer-detail details summary h4{display:inline;margin:0}.explorer-detail details[open]{padding-bottom:.3rem}.explorer-zone{width:190px}.explorer-zone strong{font-size:.95rem}.explorer-zone span{font-size:.67rem;line-height:1.5;max-width:175px}.explorer-map--overview .service-node{width:190px;min-height:60px;padding:.6rem;gap:.5rem;box-shadow:0 3px 0 #061216,0 8px 14px #0003}.explorer-map--overview .service-node strong{font-size:.78rem}.explorer-map--overview .service-node small{font-size:.63rem}.explorer-map--overview .service-node__symbol{width:1.4rem;height:1.4rem}.explorer-map--overview .service-node>svg{display:none}
  @media(prefers-reduced-motion:no-preference){.service-node{animation:node-arrive .55s cubic-bezier(.16,1,.3,1) both}.service-node:nth-of-type(3n+2){animation-delay:.05s}.service-node:nth-of-type(3n){animation-delay:.1s}}
  @keyframes node-arrive{from{translate:0 12px}to{translate:0 0}}
  @media(max-width:1100px){.explorer-toolbar{align-items:stretch;flex-direction:column}.explorer-search{max-width:none}.explorer-layout{grid-template-columns:minmax(0,1fr)}.explorer-detail{position:static}.explorer-map-key{display:none}.explorer-heading{align-items:start}.explorer-evidence{min-width:13rem}}
  @media(max-width:760px){.explorer{margin:1rem .5rem;padding:1.2rem;border-radius:.7rem;scroll-margin-top:9rem}.explorer-heading{display:block;margin-bottom:1.5rem}.explorer-heading h2{font-size:2.4rem}.explorer-heading p{font-size:.87rem}.explorer-evidence{margin-top:1.4rem}.explorer-layout{grid-template-columns:1fr;gap:1.2rem}.explorer-detail{position:static;padding:1.2rem}.explorer-filters{gap:.25rem}.explorer-filters button{padding:.65rem .6rem;font-size:.74rem}.explorer-map-heading{padding:.85rem}.explorer-map-heading>span:first-child{align-items:start;flex-direction:column;gap:.3rem}.explorer-viewport{height:auto;min-height:0;overflow:visible;background-size:20px 20px;touch-action:pan-y}.explorer-map{position:relative;left:auto;margin:0;width:auto;height:auto;transform:none!important;display:grid;gap:.75rem;padding:1rem}.explorer-zone{position:static;grid-column:1/-1;margin-top:.8rem}.explorer-zone span{font-size:.72rem}.explorer-connections{display:none}.service-node{position:relative;left:auto!important;top:auto!important;transform:none!important;width:100%;min-height:74px;box-shadow:0 4px 0 #061216,0 8px 12px #0002}.service-node.is-muted{opacity:1}.service-node strong{font-size:.9rem}.service-node small{font-size:.74rem}.explorer-zone--automation{order:0}.explorer-zone--delivery{order:4}.explorer-zone--observability{order:11}.explorer-zone--compute{order:16}.service-node[data-service-id='semaphore']{order:1}.service-node[data-service-id='ansible']{order:2}.service-node[data-service-id='proxmox']{order:3}.service-node[data-service-id='crowdsec']{order:5}.service-node[data-service-id='alert-relay']{order:6}.service-node[data-service-id='telegram']{order:7}.service-node[data-service-id='miniflux']{order:8}.service-node[data-service-id='rss-relay']{order:9}.service-node[data-service-id='discord']{order:10}.service-node[data-service-id='collector']{order:12}.service-node[data-service-id='kuma']{order:13}.service-node[data-service-id='grafana']{order:14}.service-node[data-service-id='loki']{order:15}.service-node[data-service-id='gpu-controller']{order:17}.service-node[data-service-id='podman']{order:18}.explorer-controls>div{display:none}.explorer-controls{justify-content:flex-end}.explorer-empty{position:relative;min-height:200px}.explorer-caption{font-size:.73rem}}
  @media(max-width:760px){.explorer-edge-labels{display:none}.explorer-back{display:inline-block;margin-bottom:1rem;min-height:30px}.compact-zone{display:grid}.explorer-detail{scroll-margin-top:9rem}}
  @media(max-width:760px){.explorer-map{grid-template-columns:repeat(2,minmax(0,1fr));gap:.45rem}.explorer-map--overview .service-node{width:100%;min-height:46px;padding:.5rem .6rem;gap:.45rem}.service-node{min-height:46px}.service-node small{display:none}.service-node__symbol{width:1.25rem;height:1.25rem}.explorer-zone{margin-top:.35rem}.explorer-zone span{display:none}.explorer-zone strong{font-size:.82rem}}
  @media(prefers-reduced-motion:reduce){.explorer-map,.service-node,.explorer-connections>path{transition:none;animation:none!important}}
  @media(forced-colors:active){.service-node,.explorer-detail,.explorer-stage{border-color:CanvasText}.explorer-connections>path{stroke:CanvasText}.service-node.is-selected{outline:3px solid Highlight}}
</style>
