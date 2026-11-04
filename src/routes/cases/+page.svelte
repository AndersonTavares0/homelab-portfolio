<script lang="ts">
  import { resolve } from '$app/paths';
  let { data } = $props();
  const base = resolve('').replace(/\/+$/, '');
</script>

<svelte:head><meta property="og:type" content="website" /></svelte:head>

<article class="reading section-wrap case-index">
  <a class="back-link" href={`${base}/`}>← Home</a>
  <h1>Case studies</h1>
  <p class="lead">Five studies from one environment. Each records the problem, the decision, the observed result and the limit of what the evidence establishes. They follow the same thematic order as the Observatory, from foundation to accelerated computing.</p>
  <ol class="case-list">
    {#each data.items as item, index}
      <li><a href={`${base}/cases/${item.id}/`}><span class="case-list__index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><span class="case-list__body"><strong>{item.title}</strong><span class="case-list__summary">{item.summary}</span><span class="case-list__meta">{item.technologies.join(' / ')}{item.phase ? ` · ${item.phase}` : ''} · About {item.minutes} min read</span></span></a></li>
    {/each}
  </ol>
  <p><a href={`${base}/#observatory`}>Explore the same work in the Observatory</a></p>
</article>

<style>
  .case-index .lead { margin-bottom: 2.5rem; }
  .case-list { list-style: none; margin: 0 0 2rem; padding: 0; border-top: 1px solid var(--page-line-strong); }
  .case-list li { border-bottom: 1px solid var(--page-line); }
  .case-list a { display: grid; grid-template-columns: 3.5rem 1fr; gap: 1.5rem; padding: 1.6rem 0; text-decoration: none; }
  .case-list__index { padding-top: .3rem; color: var(--page-subtle); font-size: .8rem; font-variant-numeric: tabular-nums; }
  .case-list__body { display: grid; gap: .45rem; max-width: 62ch; }
  .case-list__body strong { font-size: 1.35rem; line-height: 1.25; }
  .case-list a:hover strong { text-decoration: underline; text-decoration-color: var(--page-accent); text-underline-offset: .22em; }
  .case-list__summary { color: var(--page-muted); line-height: 1.6; }
  .case-list__meta { color: var(--page-subtle); font-size: .82rem; }
  @media (max-width: 700px) { .case-list a { grid-template-columns: 2.2rem 1fr; gap: 1rem; } }
  @media (max-width: 380px) { .case-list a { grid-template-columns: 1fr; } .case-list__index { display: none; } .case-list__body strong { font-size: 1.18rem; } .case-list__body { gap: .35rem; } }
</style>
