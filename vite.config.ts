import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

const base = process.env.SITE_BASE_PATH ?? '';

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit({
      adapter: adapter({ pages: 'dist', assets: 'dist', fallback: '404.html' }),
      paths: { base },
      files: { assets: 'public' },
    })
  ]
});
