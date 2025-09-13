import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://alialqattan.dev',
  output: 'hybrid',
  adapter: cloudflare(),
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

