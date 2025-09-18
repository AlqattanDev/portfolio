# Technology Stack & Dependencies

<cite>
**Referenced Files in This Document**   
- [package.json](file://package.json)
- [astro.config.mjs](file://astro.config.mjs)
- [src/env.d.ts](file://src/env.d.ts)
- [src/utils/device.ts](file://src/utils/device.ts)
- [public/sw.js](file://public/sw.js)
- [src/utils/validation/schemas.ts](file://src/utils/validation/schemas.ts)
- [vitest.config.ts](file://vitest.config.ts)
- [tsconfig.json](file://tsconfig.json)
</cite>

## Table of Contents
1. [Astro: Static Site Builder with Island Architecture](#astro-static-site-builder-with-island-architecture)
2. [TypeScript: Type Safety Across the Codebase](#typescript-type-safety-across-the-codebase)
3. [Zod: Runtime Validation for Configuration and Forms](#zod-runtime-validation-for-configuration-and-forms)
4. [Web Vitals: Performance Monitoring](#web-vitals-performance-monitoring)
5. [Vitest: Unit Testing Framework](#vitest-unit-testing-framework)
6. [Development Tools: ESLint and Prettier](#development-tools-eslint-and-prettier)
7. [Vite: Build System and Development Server](#vite-build-system-and-development-server)
8. [Service Worker (sw.js): Offline Support](#service-worker-swjs-offline-support)
9. [device.ts: Responsive and Mobile Optimization](#devicets-responsive-and-mobile-optimization)
10. [Version Compatibility and Framework Rationale](#version-compatibility-and-framework-rationale)

## Astro: Static Site Builder with Island Architecture

Astro serves as the core static site generator for this portfolio, enabling high-performance rendering through its unique island architecture and partial hydration model. By default, Astro renders pages at build time into static HTML, CSS, and JavaScript, minimizing client-side execution and improving load performance. Interactive components—referred to as "islands"—are selectively hydrated only when necessary, reducing JavaScript payload and improving runtime efficiency.

This project uses Astro version ^4.0.0, which provides enhanced compiler optimizations, improved TypeScript integration, and support for modern web standards. The configuration in `astro.config.mjs` disables source maps and the development toolbar to optimize production output and reduce bundle size.

Astro integrates seamlessly with Vite (discussed later) for both development server functionality and production builds, leveraging Vite’s fast hot module replacement (HMR) and efficient asset handling.

**Section sources**
- [package.json](file://package.json#L15-L17)
- [astro.config.mjs](file://astro.config.mjs#L1-L31)

## TypeScript: Type Safety Across the Codebase

TypeScript (version ^5.0.0) is used throughout the codebase to enforce robust typing, improve developer experience, and prevent runtime errors. The `tsconfig.json` extends Astro’s base TypeScript configuration and enforces strict type-checking options such as `strictNullChecks`, `noImplicitAny`, and `exactOptionalPropertyTypes`, ensuring high code quality and maintainability.

The `src/env.d.ts` file provides type declarations for environment variables and Astro-generated types, enhancing IntelliSense and compile-time validation. It references Astro’s auto-generated type definitions via `/// <reference path="../.astro/types.d.ts" />`, ensuring that components and integrations are correctly typed.

TypeScript is used across all source files, including utilities, animations, and system modules, enabling consistent interfaces and predictable data structures.

**Section sources**
- [tsconfig.json](file://tsconfig.json#L1-L28)
- [src/env.d.ts](file://src/env.d.ts#L1)

## Zod: Runtime Validation for Configuration and Forms

Zod (version ^3.22.4) is employed for runtime type validation, particularly in configuration parsing and form data handling. Unlike compile-time type checking, Zod ensures data integrity at runtime, which is essential when dealing with external inputs such as API responses or user-submitted forms.

The `src/utils/validation/schemas.ts` file defines a `userProfileSchema` using Zod’s fluent API, validating nested structures for personal information, social links, and contact details. The `validateData` utility function wraps Zod’s `safeParse` method to return a standardized `ValidationResult` object, making error handling predictable and consistent across the application.

This approach enables type inference via `z.infer<typeof schema>`, allowing developers to maintain type safety from schema definition to usage without duplication.

**Section sources**
- [package.json](file://package.json#L18-L20)
- [src/utils/validation/schemas.ts](file://src/utils/validation/schemas.ts#L1-L41)

## Web Vitals: Performance Monitoring

The `web-vitals` library (version ^5.1.0) is integrated to measure key user-centric performance metrics such as Largest Contentful Paint (LCP), First Input Delay (FID), Cumulative Layout Shift (CLS), and others. These metrics are critical for understanding real-world user experience and optimizing the site accordingly.

Although not directly invoked in the provided code snippets, `web-vitals` is included as a production dependency, indicating its use in tracking performance in production environments. It can be configured to send data to analytics services, enabling continuous monitoring of site performance over time.

Its lightweight footprint and standardized API make it ideal for integration into Astro-based static sites where performance is a top priority.

**Section sources**
- [package.json](file://package.json#L18-L20)

## Vitest: Unit Testing Framework

Vitest (version ^1.1.0) is the primary unit testing framework, chosen for its compatibility with Vite and fast execution in a simulated browser environment. It runs tests using `happy-dom` as the testing environment, allowing DOM manipulation and event simulation without requiring a full browser.

The `vitest.config.ts` file extends Astro’s Vite configuration using `getViteConfig`, ensuring consistency between development and testing setups. Test coverage is reported via the `v8` provider, with outputs in text, JSON, and HTML formats. Tests are located in files matching the pattern `*.test.ts` or `*.spec.ts` within the `src/` directory.

Additional tools like `@vitest/ui` provide a browser-based interface for test debugging, while `@vitest/coverage-v8` enhances code coverage reporting.

**Section sources**
- [package.json](file://package.json#L27-L33)
- [vitest.config.ts](file://vitest.config.ts#L1-L24)

## Development Tools: ESLint and Prettier

Code quality is enforced through ESLint and Prettier, which are integrated into the development workflow via npm scripts such as `lint`, `lint:fix`, `format`, and `format:check`.

ESLint, configured with `@typescript-eslint/parser` and `astro-eslint-parser`, provides static analysis for both TypeScript and Astro components. The `eslint-plugin-astro` ensures proper linting of `.astro` files, while `@typescript-eslint/eslint-plugin` enforces TypeScript best practices.

Prettier, enhanced with `prettier-plugin-astro`, ensures consistent code formatting across `.ts`, `.astro`, `.css`, and `.json` files. This combination eliminates style debates and automates code formatting, improving readability and maintainability.

**Section sources**
- [package.json](file://package.json#L21-L26)
- [package.json](file://package.json#L34-L41)

## Vite: Build System and Development Server

Vite powers both the development server and build pipeline, integrated directly through Astro. It enables fast cold starts, instant hot module replacement (HMR), and efficient asset handling via native ES modules.

In `astro.config.mjs`, Vite is configured to allow file system access to parent directories and node_modules, which is essential for monorepo or linked package setups. Dependency optimization excludes core Astro modules to prevent unnecessary re-optimization.

Vite’s plugin ecosystem and configuration flexibility make it an ideal foundation for Astro, enabling advanced features like code splitting, asset preloading, and environment-specific optimizations.

**Section sources**
- [astro.config.mjs](file://astro.config.mjs#L18-L30)

## Service Worker (sw.js): Offline Support

The `public/sw.js` file implements a service worker to enable offline functionality and network resilience. It uses cache-first, network-first, and stale-while-revalidate strategies to optimize performance and reliability.

Key features include:
- Pre-caching of static assets (HTML, fonts, CSS) during installation
- Dynamic caching of pages and API responses
- Offline fallback page with ASCII art and retry functionality
- Background sync for retrying failed requests
- Cache cleanup to prevent storage bloat

The service worker intercepts fetch requests and applies appropriate caching strategies based on request type (static, API, page). It also exposes messaging capabilities for cache inspection and manual clearing from the main thread.

This implementation ensures the portfolio remains accessible even under poor or no network conditions, aligning with progressive web app (PWA) best practices.

**Section sources**
- [public/sw.js](file://public/sw.js#L1-L436)

## device.ts: Responsive and Mobile Optimization

The `src/utils/device.ts` module provides comprehensive device detection and responsive utilities. It exports a `deviceUtils` object containing several submodules:

- `device`: Detects mobile, iOS, Android, tablet, and touch capabilities
- `capabilities`: Checks for reduced motion, dark mode, WebGL, and service worker support
- `responsive`: Manages breakpoints and viewport monitoring
- `mobileOptimizations`: Applies mobile-specific scroll and animation settings

These utilities enable adaptive behavior across devices, such as disabling complex animations on low-end devices or adjusting layout based on screen size. The module also includes battery and network information detection, allowing performance-sensitive decisions based on device state.

This centralized approach ensures consistent device handling across the application and improves accessibility and performance.

**Section sources**
- [src/utils/device.ts](file://src/utils/device.ts#L1-L388)

## Version Compatibility and Framework Rationale

The technology stack was selected based on performance, developer experience, and long-term maintainability:

- **Astro** was chosen over traditional frameworks like React or Vue for its static-first approach and island architecture, which minimize JavaScript bloat and maximize Core Web Vitals.
- **TypeScript** provides end-to-end type safety, crucial for a personal portfolio that may integrate with external APIs and evolve over time.
- **Zod** complements TypeScript by validating runtime data, closing the gap between compile-time and runtime type guarantees.
- **Vite** offers superior build performance and developer experience compared to older bundlers like Webpack.
- **Vitest** integrates seamlessly with Vite and provides fast, reliable testing with modern tooling.
- **ESLint + Prettier** enforce code quality and consistency, essential for open-source visibility.
- **Web Vitals** ensures the site meets user experience benchmarks.
- **Service Worker** enables offline access, enhancing reliability.
- **device.ts** ensures responsive, performant behavior across diverse devices.

All dependencies are kept within compatible version ranges, with major versions pinned to ensure stability while allowing minor updates for bug fixes and performance improvements.

For further details, refer to the official documentation:
- [Astro Documentation](https://docs.astro.build)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Zod Documentation](https://zod.dev)
- [Vite Documentation](https://vitejs.dev)
- [Vitest Documentation](https://vitest.dev)
- [Web Vitals Guide](https://web.dev/vitals/)