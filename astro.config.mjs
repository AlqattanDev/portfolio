import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://alialqattan.dev',
  // No base needed since we're using a custom domain
  compilerOptions: {
    // Disable source maps and debugging attributes
    sourcemap: false,
  },
  devToolbar: {
    // Disable dev toolbar
    enabled: false
  },
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

