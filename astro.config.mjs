import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';

const base = process.env.SITE_BASE_PATH ?? '/';

export default defineConfig({
  site: 'https://andersontavares0.github.io',
  base,
  integrations: [svelte()],
  vite: { plugins: [tailwindcss()] }
});
