import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://alialqattan.dev',
  // No base needed since we're using a custom domain
  vite: {
    server: {
      fs: {
        allow: [
          // Allow serving files from the project root and node_modules
          '..',
          '../../node_modules'
        ]
      }
    },
    optimizeDeps: {
      exclude: ['astro', '@astrojs/internal-helpers']
    }
  }
});

