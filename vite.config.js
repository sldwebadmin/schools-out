import { defineConfig } from 'vite';

export default defineConfig({
  // On GitHub Pages the site lives at /schools-out/ — set the base only
  // when building in CI so the local dev server still works at localhost:5173/
  base: process.env.GITHUB_ACTIONS ? '/schools-out/' : '/',
  build: {
    // esnext required for top-level await (ES2022) used in spriteLoader.js image loading.
    // Supported: Chrome 89+, Firefox 89+, Safari 15+ (all 2021).
    target: 'esnext',
  },
});
