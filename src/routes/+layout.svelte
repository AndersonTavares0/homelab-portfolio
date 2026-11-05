<script lang="ts">
  import { onMount } from 'svelte';
  import { onNavigate } from '$app/navigation';
  import { page } from '$app/state';
  import { resolve } from '$app/paths';
  import '../styles/global.css';

  let { data, children } = $props();

  const themeKey = 'homelab-portfolio-theme';
  let theme = $state('light');
  let mounted = $state(false);
  let scrolled = $state(false);
  let scrollProgress = $state(0);
  const siteOrigin = (import.meta.env.PUBLIC_SITE_URL ?? '').replace(/\/+$/, '');

  onMount(() => {
    const stored = localStorage.getItem(themeKey);
    const media = matchMedia('(prefers-color-scheme: dark)');
    applyTheme(stored === 'light' || stored === 'dark' ? stored : media.matches ? 'dark' : 'light');
    mounted = true;
    const sync = () => { if (!localStorage.getItem(themeKey)) applyTheme(media.matches ? 'dark' : 'light'); };
    const syncScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scrolled = window.scrollY > 12;
      scrollProgress = max > 0 ? Math.min(1, window.scrollY / max) : 0;
    };
    syncScroll();
    media.addEventListener('change', sync);
    window.addEventListener('scroll', syncScroll, { passive: true });
    window.addEventListener('resize', syncScroll);
    return () => {
      media.removeEventListener('change', sync);
      window.removeEventListener('scroll', syncScroll);
      window.removeEventListener('resize', syncScroll);
    };
  });

  const canonicalUrl = $derived(`${siteOrigin}${page.url.pathname}`);
  const homePath = resolve('/');
  const casesPath = resolve('/cases/');
  const profilePath = resolve('/profile/');
  const explorerPath = `${homePath}#homelab-explorer`;
  const iconPath = resolve('/favicon.svg');
  const shareImagePath = resolve('/og.png');
  function applyTheme(next: 'light' | 'dark') {
    theme = next;
    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = next;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', next === 'dark' ? '#101922' : '#f4f6f5');
  }


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
  let activeTransition: ViewTransition | undefined;
  onNavigate((navigation) => {
    if (navigation.from?.url.pathname === navigation.to?.url.pathname ||
      typeof document.startViewTransition !== 'function' ||
      matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    activeTransition?.skipTransition();
    document.documentElement.dataset.routeTransition = 'true';
    return new Promise<void>((resume) => {
      const transition = document.startViewTransition(async () => {
        resume();
        await navigation.complete;
      });
      activeTransition = transition;
      transition.finished.catch(() => {}).finally(() => {
        if (activeTransition === transition) {
          delete document.documentElement.dataset.routeTransition;
          activeTransition = undefined;
        }
      });
    });
  });
</script>

<svelte:head>
  <meta name="description" content={pageDescription} />
  <meta name="theme-color" content={theme === 'dark' ? '#101922' : '#f4f6f5'} />
  <meta name="color-scheme" content="light dark" />
  <meta property="og:type" content={shareType} />
  <meta property="og:title" content={pageTitle} />
  <meta property="og:description" content={pageDescription} />
  <meta property="og:site_name" content={data.profile.data.name} />
  <meta property="og:url" content={canonicalUrl} />
  <meta property="og:image" content={`${siteOrigin}${shareImagePath}`} />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="canonical" href={canonicalUrl} />
  <link rel="icon" href={iconPath} type="image/svg+xml" />
  <title>{pageTitle} | {data.profile.data.name}</title>
  {@html `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>`}
</svelte:head>

<a class="skip" href="#main">Skip to content</a>
<header class="site-header" class:site-header--scrolled={scrolled}>
  <div class="site-header__inner">
    <a class="wordmark" href={homePath} aria-label="A Atlas.">
      <span class="wordmark__mark" aria-hidden="true">A</span>
      <span class="wordmark__label">Atlas<span>.</span></span>
    </a>
    <nav class="site-nav" aria-label="Main navigation">
      <a class="site-nav__link" href={casesPath} aria-current={section === 'cases' ? 'page' : undefined}>
        <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3.5 4.5h13v11h-13zM3.5 8h13M7 4.5v3.4M13 4.5v3.4" /></svg>
        <span>Case studies</span>
      </a>
      <a class="site-nav__link" href={explorerPath}>
        <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="5" cy="6" r="2" /><circle cx="15" cy="5" r="2" /><circle cx="10" cy="15" r="2" /><path d="m6.7 6.4 6.6-.8M6.4 7.8l2.6 5.4M13.4 6.9l-2.5 5.9" /></svg>
        <span>Homelab Explorer</span>
      </a>
      <a class="site-nav__link" href={profilePath} aria-current={section === 'profile' ? 'page' : undefined}>
        <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 3.5h12v13H4zM7 7h6M7 10h6M7 13h3" /></svg>
        <span aria-label="Professional summary">Summary</span>
      </a>
    </nav>
    <div class="site-header__actions">
      <span class="site-header__status"><i></i> documented / open</span>
      <button type="button" class:theme-toggle--pending={!mounted} class="theme-toggle" aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} onclick={toggleTheme}>
        <svg viewBox="0 0 20 20" aria-hidden="true">{#if theme === 'dark'}<circle cx="10" cy="10" r="3.2" /><path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.3 4.3l1.4 1.4M14.3 14.3l1.4 1.4M15.7 4.3l-1.4 1.4M5.7 14.3l-1.4 1.4" />{:else}<path d="M15.5 12.6A5.8 5.8 0 0 1 7.4 4.5 6.2 6.2 0 1 0 15.5 12.6Z" />{/if}</svg>
        <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
      </button>
    </div>
  </div>
  <div class="site-header__progress" aria-hidden="true"><span style={`transform: scaleX(${scrollProgress})`}></span></div>
</header>
<main id="main" tabindex="-1">{@render children()}</main>
<footer class="site-footer">
  <div class="site-footer__lead">
    <a class="site-footer__wordmark" href={homePath} aria-label="Atlas.">Atlas<span>.</span></a>
    <p>Documented infrastructure, made legible.</p>
  </div>
  <nav class="site-footer__nav" aria-label="Footer navigation">
    <a href={casesPath}>Work</a>
    <a href={explorerPath}>Homelab Explorer</a>
    <a href={profilePath}>Summary</a>
  </nav>
  <div class="site-footer__actions">
    <a class="site-footer__icon-link" href={data.profile.data.github} aria-label="Open GitHub profile">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5a9.5 9.5 0 0 0-3 18.51c.48.09.66-.2.66-.46v-1.67c-2.69.59-3.26-1.14-3.26-1.14-.44-1.12-1.08-1.42-1.08-1.42-.88-.6.07-.59.07-.59.97.07 1.48 1 1.48 1 .87 1.48 2.28 1.05 2.84.8.09-.63.34-1.05.62-1.29-2.15-.24-4.41-1.08-4.41-4.78 0-1.06.38-1.93 1-2.61-.1-.24-.43-1.23.1-2.57 0 0 .82-.26 2.68.99a9.3 9.3 0 0 1 4.88 0c1.86-1.25 2.68-.99 2.68-.99.53 1.34.2 2.33.1 2.57.62.68 1 1.55 1 2.61 0 3.71-2.26 4.54-4.42 4.78.35.31.66.91.66 1.83v2.72c0 .27.18.56.67.46A9.5 9.5 0 0 0 12 2.5Z" /></svg>
      <span>GitHub</span>
    </a>
    <a class="site-footer__icon-link" href="#main" aria-label="Back to top">
      <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m4 12 6-6 6 6M10 6v10" /></svg>
      <span>Top</span>
    </a>
  </div>
</footer>
