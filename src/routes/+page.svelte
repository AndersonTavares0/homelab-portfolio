<script lang="ts">
  import HomelabExplorer from '../components/HomelabExplorer.svelte';
  import ServiceFieldPreview from '../components/ServiceFieldPreview.svelte';
  import WorkflowDiagram from '../components/WorkflowDiagram.svelte';
  import { resolve } from '$app/paths';
  const homePath = resolve('/');
  const casesPath = resolve('/cases/');
  const profilePath = resolve('/profile/');
  const explorerPath = `${homePath}#homelab-explorer`;
  let { data } = $props();

  function reveal(node: HTMLElement) {
    if (typeof IntersectionObserver === 'undefined' || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      node.classList.add('is-visible');
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      node.classList.add('is-visible');
      observer.disconnect();
    }, { threshold: 0.12 });
    observer.observe(node);
    return { destroy: () => observer.disconnect() };
  }
</script>

<svelte:head>
  <meta property="og:type" content="website" />
  <meta property="og:title" content="Infrastructure in practice" />
  <meta property="og:description" content={data.profile.content} />
</svelte:head>

<section class="hero-wrap" aria-labelledby="hero-title">
  <div class="hero-copy">
    <h1 id="hero-title">Infrastructure,<br /><em>understood by building.</em></h1>
    <p class="lead">Infrastructure projects documented through practical work with Linux, virtualization, container operations, observability and shared GPU computing. Each case records a problem, a technical decision and the evidence available.</p>
    <div class="hero-context" aria-label="Portfolio scope">
      <span><strong>{data.cases.length}</strong> case studies</span>
      <span><strong>{data.profile.data.skills.length}</strong> working technologies</span>
      <span><strong>1</strong> connected map</span>
    </div>
    <div class="hero-actions">
      <a class="btn btn-primary" href="#projects">Read the work <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2v11m0 0-4-4m4 4 4-4" /></svg></a>
      <a class="text-link text-link--arrow" href={explorerPath}>Explore the homelab <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 13 13 3M5 3h8v8" /></svg></a>
    </div>
    <p class="hero-guidance"><span class="hero-guidance__mark" aria-hidden="true"></span> Choose a case, trace its services, then read the decision behind it.</p>
  </div>
  <ServiceFieldPreview />
</section>

<section class="intro section-wrap section-reveal" use:reveal aria-labelledby="practice-heading">
  <div><h2 id="practice-heading">Practice across the stack</h2><p class="lead">Virtual machines, services, monitoring and accelerated computing are connected by the same question: how does a system behave when something changes?</p></div>
  <div class="skill-list"><h3>Working with</h3><p>{data.profile.data.skills.join(' / ')}</p><a class="inline-block py-1 text-link text-link--arrow" href={profilePath}>Read the professional summary <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 13 13 3M5 3h8v8" /></svg></a></div>
</section>

  <section id="how-it-works" class="section-wrap section-reveal" use:reveal aria-labelledby="how-heading">
    <div class="section-heading"><div><h2 id="how-heading">How the parts talk</h2></div><p>Request, delivery, automation, evidence and shared-device ownership are different kinds of connection. Each lane labels what actually crosses it.</p></div>
    <WorkflowDiagram caseId="overview" />
  </section>

<section id="projects" class="section-wrap projects section-reveal" use:reveal aria-labelledby="projects-heading">
  <div class="section-heading"><div><h2 id="projects-heading">Selected projects</h2></div><p>Five documented decisions, their constraints and the lessons that followed. <a href={casesPath}>Read all case studies <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 13 13 3M5 3h8v8" /></svg></a>.</p></div>
  <div class="project-list">{#each data.cases as item, index}<a href={resolve(`/cases/${item.id}/`)}><span class="project-list__name"><small>0{index + 1}</small><strong>{item.title}</strong><small>{item.technologies.join(' / ')}</small></span><span class="project-list__context">{item.technologyContext}</span><span class="project-list__arrow" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="M3 13 13 3M5 3h8v8" /></svg></span></a>{/each}</div>
</section>

<section class="lessons section-wrap section-reveal" use:reveal aria-labelledby="lessons-heading">
  <div class="section-heading"><div><h2 id="lessons-heading">What the work taught me</h2></div><p>Each project ended with a rule I apply before the next change.</p></div>
  <ol class="lesson-list">{#each data.cases as item, index}<li><a href={resolve(`/cases/${item.id}/`)}><span class="lesson-list__source"><small>0{index + 1}</small>{item.title}</span><span>{item.learning}</span><span class="lesson-list__arrow" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="M3 13 13 3M5 3h8v8" /></svg></span></a></li>{/each}</ol>
</section>

<HomelabExplorer cases={data.cases} />
<p class="print-only">The Homelab Explorer is an interactive service map of the same work; open <strong>{explorerPath}</strong> in a browser to use it.</p>
<section class="closing section-wrap section-reveal" use:reveal aria-labelledby="closing-heading">
  <h2 id="closing-heading">Keep following the decisions.</h2><p class="lead">The professional summary condenses these projects into one printable page. The GitHub profile holds the code that builds this site.</p>
  <div class="hero-actions"><a class="btn" href={profilePath}>Open the professional summary <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 13 13 3M5 3h8v8" /></svg></a><a class="text-link text-link--arrow" href={data.profile.data.github}>Open GitHub <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 13 13 3M5 3h8v8" /></svg></a></div>
  <p class="print-only">Summary: {profilePath} · GitHub: {data.profile.data.github}</p>
</section>
