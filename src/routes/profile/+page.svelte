<script lang="ts">
  import { resolve } from '$app/paths';
  const homePath = resolve('/');
  let { data } = $props();
</script>

<article class="reading section-wrap"><a class="back-link" href={homePath}>← Home</a><h1>{data.profile.data.name}</h1><p class="lead">{data.profile.content}</p><p class="profile-contact"><a href={data.profile.data.github}>GitHub profile</a></p><h2>Technical areas</h2><p>{data.profile.data.skills.join(' / ')}</p><h2>Project experience</h2><p class="profile-order">Listed in the same thematic order as the case catalogue.</p>{#each data.studies as study}<section class="profile-case"><h3><a href={resolve(`/cases/${study.data.id}/`)}>{study.data.title}</a></h3><p>{study.data.summary}</p><small>{study.data.technologies.join(' / ')}{study.phase ? ` · ${study.phase}` : ''}</small></section>{/each}<p class="print-only">GitHub: {data.profile.data.github}</p></article>

<style>
  .profile-contact { margin-top: 1rem; }
  .profile-order { margin: 0 0 1.5rem; color: var(--page-subtle); font-size: .9rem; }
</style>
