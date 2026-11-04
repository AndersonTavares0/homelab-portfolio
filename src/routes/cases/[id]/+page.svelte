<script lang="ts">
  import { onMount } from 'svelte';
  import { resolve } from '$app/paths';
  let { data } = $props();
  const base = resolve('').replace(/\/+$/, '');
  const initialObservatoryHref = $derived(`${base}/${data.observatoryQuery ? `?${data.observatoryQuery}` : ''}#observatory`);
  let observatoryHref = $state('');
  onMount(() => {
    const incoming = new URLSearchParams(window.location.search);
    const query = incoming.toString() || data.observatoryQuery;
    observatoryHref = `${base}/${query ? `?${query}` : ''}#observatory`;
  });
</script>

<svelte:head>
  <meta property="og:type" content="article" />
  <meta property="og:title" content={data.title} />
  <meta property="og:description" content={data.description} />
</svelte:head>

<article class="reading section-wrap">
  <a class="back-link" href={`${base}/cases/`}>← All case studies</a>
  <p class="case-tech">{data.item.technologies.join(' / ')} · About {data.item.minutes} min read</p>
  <h1>{data.item.title}</h1>
  <p class="lead">{data.item.summary}</p>
  <section class="case-technology-context" aria-labelledby="technology-context-heading"><h2 id="technology-context-heading">Technology in practice</h2><p>{data.item.technologyContext}</p></section>
  <nav class="case-toc" aria-label="In this study"><p>In this study</p><ol>{#each data.sections as entry}<li><a class="py-1" href={`#${entry.id}`}>{entry.label}</a></li>{/each}</ol></nav>
  <div class="prose">{@html data.html}</div>
  {#if data.documentedState}<section class="prose case-state" aria-labelledby="case-state-heading" data-case-state><h2 id="case-state-heading">Documented state</h2><div>{@html data.documentedState}</div></section>{/if}
  {#if data.relatedStudies.length}<section class="case-related" aria-labelledby="case-related-heading" data-case-related><h2 id="case-related-heading">Related studies</h2><ul>{#each data.relatedStudies as study}<li><a href={`${base}/cases/${study.id}/`}><strong>{study.title}</strong><span>{study.summary}</span></a></li>{/each}</ul></section>{/if}
  <div class="case-return">{#if data.relatedPhase}<p class="case-tech">Observatory context: {data.relatedPhase.name}{data.relatedComponent ? ` · ${data.relatedComponent.name}` : ''}</p>{/if}<p><a class="btn" href={observatoryHref || initialObservatoryHref}>Return to the Observatory</a></p><p>Continue exploring the documented relationships and decisions.</p></div>
  <nav class="case-pager" aria-label="Case studies">{#if data.previous}<a rel="prev" href={`${base}/cases/${data.previous.id}/`}><span>Previous study</span><strong>{data.previous.title}</strong></a>{/if}{#if data.next}<a rel="next" href={`${base}/cases/${data.next.id}/`}><span>Next study</span><strong>{data.next.title}</strong></a>{/if}</nav>
</article>

<style>
  .case-state { border-top: 1px solid var(--page-line); padding-top: .5rem; }
  .case-state h2 { margin-top: 0; }
  .case-pager { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; margin-top: 3rem; border-top: 1px solid var(--page-line); padding-top: 1.2rem; }
  .case-pager a { display: grid; gap: .25rem; text-decoration: none; }
  .case-pager a[rel='next'] { text-align: right; justify-items: end; }
  .case-pager a:hover strong { text-decoration: underline; text-decoration-color: var(--page-accent); text-underline-offset: .22em; }
  .case-pager span { color: var(--page-subtle); font-size: .78rem; }
  .case-pager strong { font-size: 1rem; line-height: 1.3; }
  .case-return { display: grid; gap: .8rem; justify-items: start; margin-top: 2.5rem; }
  .case-return p { margin: 0; }
  .case-toc { border-top: 1px solid var(--page-line-strong); border-bottom: 1px solid var(--page-line); padding: .9rem 0; margin: 0 0 1rem; }
  .case-toc p { margin: 0 0 .5rem; color: var(--page-subtle); font-size: .78rem; }
  .case-toc ol { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: .4rem 1.1rem; }
  .case-toc a { font-size: .88rem; }
  [id] { scroll-margin-top: 1.5rem; }
  .case-related { margin-top: 3rem; border-top: 1px solid var(--page-line); padding-top: 1.5rem; }
  .case-related h2 { font-size: 1.35rem; margin: 0 0 1rem; }
  .case-related ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 1rem; }
  .case-related a { display: grid; gap: .3rem; text-decoration: none; }
  .case-related a:hover strong { text-decoration: underline; text-decoration-color: var(--page-accent); text-underline-offset: .22em; }
  .case-related strong { font-size: 1.05rem; }
  .case-related span { color: var(--page-muted); line-height: 1.55; max-width: 62ch; }
  @media print { .case-toc, .case-related, .case-return, .case-pager { display: none; } .reading { max-width: none; padding-top: 0; } .prose { max-width: none; margin-top: 1rem; } .case-state { break-inside: avoid; } }
</style>
