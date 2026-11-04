<script lang="ts">
  import { page } from '$app/state';
  import { resolve } from '$app/paths';
  const resolvedBase = resolve('/');
  const base = resolvedBase === '.' || resolvedBase === './' ? '' : resolvedBase.replace(/\/+$/, '');
</script>

<svelte:head><title>Page not found | Infrastructure in practice</title><meta name="description" content="This page does not exist. Browse the case studies or return home." /></svelte:head>
<article class="reading section-wrap not-found"><p class="case-tech">404</p><h1>This page is not here</h1><p class="lead">The address may be mistyped, or the page may have moved. Every study is listed in the catalogue.</p><div class="hero-actions"><a class="btn" href={`${base}/cases/`}>Browse case studies</a><a class="text-link" href={`${base}/`}>Return home</a></div></article>
