import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';

const base = process.env.SITE_BASE_PATH ?? '/';
const publicSiteUrl = process.env.PUBLIC_SITE_URL;

export default defineConfig({
  ...(publicSiteUrl ? { site: publicSiteUrl } : {}),
  base,
  integrations: [svelte()],
  vite: { plugins: [tailwindcss()] }
});
