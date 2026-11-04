<script lang="ts">
  import Observatory from '../components/Observatory.svelte';
  import { resolve } from '$app/paths';
  let { data } = $props();
  const base = resolve('').replace(/\/+$/, '');
</script>

<svelte:head>
  <meta property="og:type" content="website" />
  <meta property="og:title" content="Infrastructure in practice" />
  <meta property="og:description" content={data.profile.content} />
</svelte:head>

<section class="hero-wrap">
  <div class="hero-copy">
    <h1>{data.profile.data.name}</h1>
    <p class="hero-statement">Infrastructure,<br />understood by building.</p>
    <p class="lead">{data.profile.content}</p>
    <div class="hero-actions"><a class="btn btn-primary" href="#projects">Explore the projects</a><a class="text-link" href="#observatory">Enter the Observatory</a></div>
  </div>
  <div class="hero-art"><img src={`${base}/atlas.svg`} width="640" height="520" alt="Stylized server marking connections between services, observation and compute" /><p>One lab, many interconnected decisions.</p></div>
</section>

<section class="intro section-wrap"><div><h2>Practice across the stack</h2><p class="lead">Virtual machines, services, monitoring and accelerated computing are connected by the same question: how does a system behave when something changes?</p></div><div class="skill-list"><h3>Working with</h3><p>{data.profile.data.skills.join(' / ')}</p><a class="inline-block py-1" href={`${base}/profile/`}>Read the professional summary</a></div></section>

<section id="projects" class="section-wrap projects"><div class="section-heading"><h2>Selected projects</h2><p>Five documented decisions, their constraints and the lessons that followed. <a href={`${base}/cases/`}>Read all case studies</a>.</p></div><div class="project-list">{#each data.cases as item}<a href={`${base}/cases/${item.id}/`}><span><strong>{item.title}</strong><small>{item.technologies.join(' / ')}</small></span><span class="project-list__context">{item.technologyContext}</span><span aria-hidden="true">↗</span></a>{/each}</div></section>

<section class="lessons section-wrap" aria-labelledby="lessons-heading"><div class="section-heading"><h2 id="lessons-heading">What the work taught me</h2><p>Each project ended with a rule I apply before the next change.</p></div><ol class="lesson-list">{#each data.cases as item}<li><a href={`${base}/cases/${item.id}/`}><span class="lesson-list__source">{item.title}</span><span>{item.learning}</span></a></li>{/each}</ol></section>

<Observatory cases={data.cases} />
<p class="print-only">The Observatory is an interactive view of the same work; open <strong>{base}/#observatory</strong> in a browser to use it.</p>
<section class="closing section-wrap" aria-labelledby="closing-heading"><h2 id="closing-heading">Read the summary, or follow the work</h2><p class="lead">The professional summary condenses these projects into one printable page. The GitHub profile holds the code that builds this site.</p><div class="hero-actions"><a class="btn" href={`${base}/profile/`}>Open the professional summary</a><a class="text-link" href={data.profile.data.github}>GitHub profile</a></div><p class="print-only">Summary: {base}/profile/ · GitHub: {data.profile.data.github}</p></section>
