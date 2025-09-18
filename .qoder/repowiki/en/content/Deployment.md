# Deployment

<cite>
**Referenced Files in This Document**   
- [astro.config.mjs](file://astro.config.mjs)
- [package.json](file://package.json)
- [public/sw.js](file://public/sw.js)
</cite>

## Table of Contents
1. [Static Site Generation](#static-site-generation)
2. [Service Worker and Offline Capabilities](#service-worker-and-offline-capabilities)
3. [Hosting Options](#hosting-options)
4. [Step-by-Step Deployment Guides](#step-by-step-deployment-guides)
5. [Custom Domain and SSL Setup](#custom-domain-and-ssl-setup)
6. [Performance Optimization](#performance-optimization)
7. [Versioning and Rollback Strategies](#versioning-and-rollback-strategies)
8. [Preview Deployments](#preview-deployments)
9. [Verification and Testing](#verification-and-testing)

## Static Site Generation

The project uses Astro as a static site generator to produce optimized HTML, CSS, and JavaScript assets. The build process is triggered via the `astro build` command defined in the `package.json` scripts. This command compiles all source files under the `src/` directory, processes Markdown content from the `src/content/blog` directory, and outputs fully rendered static pages into the `dist` directory.

Astro optimizes assets during the build by bundling and minifying JavaScript and CSS, inlining critical CSS, and lazy-loading non-critical resources. The resulting output is highly performant and suitable for CDN delivery. The `dist` directory contains all static assets ready for deployment to any hosting provider.

The build configuration is defined in `astro.config.mjs`, where key settings such as the site URL and compiler options are specified. Source maps are disabled for production builds to reduce bundle size and improve security.

**Section sources**
- [package.json](file://package.json#L8-L11)
- [astro.config.mjs](file://astro.config.mjs#L4-L30)

## Service Worker and Offline Capabilities

Offline functionality is enabled through a custom service worker located at `public/sw.js`. Files placed in the `public` directory are copied directly to the `dist` folder during the build process, ensuring that `sw.js` is available at the root of the deployed site.

The service worker implements multiple caching strategies:
- **Cache-first** for static assets (CSS, JS, fonts, images)
- **Stale-while-revalidate** for API requests (e.g., GitHub API)
- **Network-first with cache fallback** for HTML pages

It pre-caches essential static assets during installation, including the homepage, favicon, and web fonts. When offline, users are served a custom offline page with ASCII art and a retry button. The service worker also supports background sync for deferred actions and exposes messaging APIs for cache inspection and resource preloading from the main thread.

Cache cleanup is automated to prevent unbounded growth, with limits set on the number of cached items and maximum cache age. This ensures efficient storage usage across devices.

**Section sources**
- [public/sw.js](file://public/sw.js#L1-L436)

## Hosting Options

This Astro-based static site can be deployed to multiple platforms, each offering seamless integration:

- **Netlify**: Supports automatic builds from Git, instant cache invalidation, and split testing.
- **Vercel**: Offers edge network deployment, instant rollbacks, and preview deployments for pull requests.
- **GitHub Pages**: Ideal for simple deployments directly from a repository, especially for open-source portfolios.
- **Cloudflare Pages**: Provides global CDN, preview deployments, and integration with Cloudflare’s security and performance tools.

All platforms support the standard `astro build` command and publish the `dist` directory as the site root. Environment variables can be configured through the platform dashboard or configuration files.

## Step-by-Step Deployment Guides

### Vercel Deployment

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket).
2. Log in to [vercel.com](https://vercel.com) and import your project.
3. Configure the project settings:
   - **Framework Preset**: Astro
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. Set environment variables if needed (none required in this project).
5. Click "Deploy" — Vercel will build and deploy your site automatically.
6. After deployment, assign a custom domain if desired.

### Netlify Deployment

1. Push your code to a Git repository.
2. Sign in to [netlify.com](https://netlify.com) and select "New site from Git".
3. Choose your repository and configure the build settings:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
4. Click "Deploy site".
5. Netlify will trigger the build, deploy the `dist` folder, and provide a default `*.netlify.app` URL.
6. Configure a custom domain and SSL in the site settings.

**Section sources**
- [package.json](file://package.json#L8-L11)
- [astro.config.mjs](file://astro.config.mjs#L4-L30)

## Custom Domain and SSL Setup

To configure a custom domain:
1. Purchase a domain through a registrar (e.g., Namecheap, Google Domains).
2. In your hosting platform (Vercel, Netlify, etc.), navigate to the domain settings.
3. Add your domain (e.g., `alialqattan.dev`).
4. Update DNS records with your registrar to point to the hosting provider (usually via CNAME or A records).
5. Enable SSL/TLS — all major platforms provide automatic HTTPS via Let’s Encrypt.
6. Enforce HTTPS to ensure secure connections.

The `site` field in `astro.config.mjs` is set to `https://alialqattan.dev`, which helps Astro generate correct absolute URLs for SEO and asset loading.

**Section sources**
- [astro.config.mjs](file://astro.config.mjs#L6-L7)

## Performance Optimization

The deployment workflow includes several performance optimizations:

- **Asset Compression**: Astro automatically minifies HTML, CSS, and JavaScript. Enable Brotli or Gzip compression on your hosting platform.
- **Lazy Loading**: Images and non-critical components are lazy-loaded using native `loading="lazy"` attributes.
- **Cache Headers**: Configure long-term caching for static assets (e.g., 1 year for hashed files) and short TTLs for HTML.
- **Critical CSS Inlining**: Astro inlines above-the-fold CSS to reduce render-blocking resources.
- **Font Optimization**: Web fonts (JetBrains Mono, Space Mono) are served in WOFF2 format and preloaded for performance.

Use the `sw.js` service worker to cache assets locally, reducing load times on repeat visits.

## Versioning and Rollback Strategies

All major platforms support Git-based versioning:
- Each commit to the main branch triggers a new deployment with a unique version ID.
- Previous deployments are preserved, allowing instant rollback via the dashboard.
- Vercel and Netlify maintain full deployment history with logs and asset diffs.

For manual rollback:
1. Navigate to the "Deployments" section.
2. Select a previous successful deployment.
3. Click "Rollback" or "Promote" to make it live.

This ensures zero-downtime recovery from failed updates.

## Preview Deployments

Preview deployments are automatically generated for every pull request:
- Platforms like Vercel and Netlify create unique URLs (e.g., `pr-123-site.vercel.app`).
- The `astro build` command runs in isolation, producing a complete preview of changes.
- Reviewers can test functionality, check visual regressions, and validate performance before merging.

This enables safe collaboration and continuous integration.

## Verification and Testing

After deployment:
1. Open the site in a browser and verify all pages load correctly.
2. Test offline mode by disabling network connectivity — the service worker should serve the offline page.
3. Run a Lighthouse audit (via Chrome DevTools) to evaluate performance, accessibility, SEO, and PWA compliance.
4. Check that the service worker is registered and caching assets by inspecting the Application tab.
5. Validate custom domain and SSL by confirming the padlock icon and certificate details.

Regular audits help maintain high performance and user experience standards.