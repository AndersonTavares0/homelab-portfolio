<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { resolve } from '$app/paths';
  import '../styles/global.css';

  let { data, children } = $props();
  let mounted = $state(false);
  let theme = $state<'light' | 'dark'>('light');
  const themeKey = 'homelab-portfolio-theme';
  const resolvedBase = resolve('');
  const base = /^\.\/?$/.test(resolvedBase) ? '' : resolvedBase.replace(/\/+$/, '');

  function applyTheme(next: 'light' | 'dark') {
    theme = next;
    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = next;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', next === 'dark' ? '#101922' : '#f4f6f5');
  }

  onMount(() => {
    const stored = localStorage.getItem(themeKey);
    const media = matchMedia('(prefers-color-scheme: dark)');
    applyTheme(stored === 'light' || stored === 'dark' ? stored : media.matches ? 'dark' : 'light');
    mounted = true;
    const sync = () => { if (!localStorage.getItem(themeKey)) applyTheme(media.matches ? 'dark' : 'light'); };
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  });

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem(themeKey, next);
    applyTheme(next);
  }
  const section = $derived(page.route.id?.startsWith('/cases') ? 'cases' : page.route.id?.startsWith('/profile') ? 'profile' : undefined);
  const shareType = $derived(page.route.id?.startsWith('/cases/[id]') ? 'article' : 'website');
  type RouteData = { title?: string; description?: string; relatedPhase?: { name?: string } };
  const routeData = $derived(page.data as RouteData);
  const pageTitle = $derived(routeData.title ?? 'Infrastructure in practice');
  const pageDescription = $derived(routeData.description ?? data.profile.content.split(/[.!?]\s/)[0]);
  const structuredData = $derived(shareType === 'article'
    ? { '@context': 'https://schema.org', '@type': 'Article', headline: pageTitle, description: pageDescription, author: { '@type': 'Person', name: data.profile.data.name, sameAs: [data.profile.data.github] }, ...(routeData.relatedPhase?.name ? { articleSection: routeData.relatedPhase.name } : {}) }
    : { '@context': 'https://schema.org', '@type': 'Person', name: data.profile.data.name, description: data.profile.content, sameAs: [data.profile.data.github] });
</script>

<svelte:head>
  <meta name="description" content={pageDescription} />
  <meta name="theme-color" content={theme === 'dark' ? '#101922' : '#f4f6f5'} />
  <meta name="color-scheme" content="light dark" />
  <meta property="og:type" content={shareType} />
  <meta property="og:title" content={pageTitle} />
  <meta property="og:description" content={pageDescription} />
  <meta property="og:site_name" content={data.profile.data.name} />
  <meta property="og:url" content={page.url.pathname} />
  <meta property="og:image" content={`${base}/og.png`} />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="canonical" href={page.url.pathname} />
  <link rel="icon" href={`${base}/favicon.svg`} type="image/svg+xml" />
  <title>{pageTitle} | {data.profile.data.name}</title>
  {@html `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>`}
</svelte:head>

<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <a class="wordmark" href={`${base}/`}>{data.profile.data.name}<span>.</span></a>
  <nav aria-label="Main navigation">
    <a class="py-1" href={`${base}/cases/`} aria-current={section === 'cases' ? 'page' : undefined}>Case studies</a>
    <a class="py-1" href={`${base}/#observatory`}>Observatory</a>
    <a class="py-1" href={`${base}/profile/`} aria-current={section === 'profile' ? 'page' : undefined}>Professional summary</a>
  </nav>
  <button type="button" class="theme-toggle" hidden={!mounted} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} onclick={toggleTheme}>Switch to {theme === 'dark' ? 'light' : 'dark'} theme</button>
</header>
<main id="main" tabindex="-1">{@render children()}</main>
<footer class="site-footer"><span>Built from documented work.</span><a href={data.profile.data.github}>GitHub profile</a><a href="#main">Back to top</a></footer>
