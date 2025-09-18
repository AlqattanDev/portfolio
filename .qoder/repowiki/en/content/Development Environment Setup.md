# Development Environment Setup

<cite>
**Referenced Files in This Document**   
- [package.json](file://package.json)
- [tsconfig.json](file://tsconfig.json)
- [astro.config.mjs](file://astro.config.mjs)
- [vitest.config.ts](file://vitest.config.ts)
- [src/env.d.ts](file://src/env.d.ts)
- [src/data/profile.json](file://src/data/profile.json)
- [src/content/config.ts](file://src/content/config.ts)
</cite>

## Table of Contents
1. [Prerequisites Installation](#prerequisites-installation)
2. [Repository Setup](#repository-setup)
3. [Project Structure Overview](#project-structure-overview)
4. [IDE Configuration](#ide-configuration)
5. [Running the Development Server](#running-the-development-server)
6. [Testing and Coverage](#testing-and-coverage)
7. [Building the Project](#building-the-project)
8. [Troubleshooting Common Issues](#troubleshooting-common-issues)

## Prerequisites Installation

To begin local development, ensure the following tools are installed:

- **Node.js**: Version compatible with the project's engine requirements. The project uses modern JavaScript features and requires at least Node.js 18.x or higher.
- **npm**: Comes bundled with Node.js. Ensure it is updated to the latest stable version.
- **Code Editor**: A modern editor with TypeScript and Astro support. Visual Studio Code is highly recommended.

Install Node.js from the [official website](https://nodejs.org/) or use a version manager like `nvm`. After installation, verify with:
```bash
node --version
npm --version
```

**Section sources**
- [package.json](file://package.json#L1-L42)

## Repository Setup

Clone the repository using Git:
```bash
git clone https://github.com/alialqattan/portfolio-github.git manus-reference
cd manus-reference
```

Install all dependencies using npm:
```bash
npm install
```

This command reads `package.json` and installs all required packages, including Astro, TypeScript, ESLint, Prettier, and Vitest.

**Section sources**
- [package.json](file://package.json#L1-L42)

## Project Structure Overview

The project follows a modular structure optimized for Astro:

```
src/
├── animation/       # Animation logic and systems
├── components/      # Reusable Astro components
├── content/         # Markdown blog posts and site config
├── data/            # JSON data files (e.g., profile.json)
├── scripts/         # Client-side scripts
├── styles/          # Global and utility CSS
├── systems/         # Specialized systems (e.g., Vim emulation)
├── types/           # TypeScript type definitions
├── utils/           # Shared utility functions
└── env.d.ts         # Environment variable types
```

Key configuration files:
- `astro.config.mjs`: Astro framework settings
- `tsconfig.json`: TypeScript compiler options with path aliases (`@/*`, `@/utils/*`, etc.)
- `vitest.config.ts`: Test runner configuration
- `package.json`: Scripts and dependencies

**Section sources**
- [tsconfig.json](file://tsconfig.json#L1-L28)
- [astro.config.mjs](file://astro.config.mjs#L1-L31)
- [vitest.config.ts](file://vitest.config.ts#L1-L24)
- [src/data/profile.json](file://src/data/profile.json)
- [src/content/config.ts](file://src/content/config.ts)

## IDE Configuration

For optimal development experience in VS Code:

1. Install recommended extensions:
   - **Astro**: Official Astro language support
   - **Prettier**: Code formatter
   - **ESLint**: Linting integration
   - **TypeScript Hero**: Enhanced TS IntelliSense

2. Enable path aliases:
   The `tsconfig.json` defines aliases like `@/utils/*` → `src/utils/*`. Ensure your editor resolves these paths correctly.

3. Configure formatting:
   Run `npm run format:check` to validate formatting. Use `npm run format` to auto-fix.

4. Enable TypeScript checking:
   Run `npm run type-check` to validate types across the codebase.

**Section sources**
- [tsconfig.json](file://tsconfig.json#L1-L28)
- [package.json](file://package.json#L1-L42)

## Running the Development Server

Start the local development server with:
```bash
npm run dev
```

This launches the Astro development server at `http://localhost:3000`. The server supports:
- Hot module replacement (HMR)
- Real-time reloading
- Full TypeScript and CSS support

The `dev` script maps directly to `astro dev`, as defined in `package.json`.

**Section sources**
- [package.json](file://package.json#L6-L7)
- [astro.config.mjs](file://astro.config.mjs#L1-L31)

## Testing and Coverage

Run unit tests using Vitest:
```bash
npm run test
```

For interactive test UI:
```bash
npm run test:ui
```

Generate test coverage reports:
```bash
npm run test:coverage
```

Coverage reports are output in text, JSON, and HTML formats. The `vitest.config.ts` file configures `happy-dom` as the test environment and excludes test/utility files from coverage.

**Section sources**
- [package.json](file://package.json#L10-L12)
- [vitest.config.ts](file://vitest.config.ts#L1-L24)

## Building the Project

Generate a static production build with:
```bash
npm run build
```

This command runs `astro build`, compiling all pages into static assets in the `dist/` directory. After building, preview the output locally:
```bash
npm run preview
```

The preview server simulates production hosting at `http://localhost:4173`.

**Section sources**
- [package.json](file://package.json#L8-L9)
- [astro.config.mjs](file://astro.config.mjs#L1-L31)

## Troubleshooting Common Issues

### Port Conflicts
If port 3000 is in use, stop the conflicting process or configure Astro to use a different port:
```bash
npm run dev -- --port 3001
```

### Missing Binaries or Permissions
Ensure `node_modules` is correctly installed:
```bash
rm -rf node_modules package-lock.json
npm install
```
Avoid using `sudo` with npm. Fix permissions if needed using:
```bash
npm config set prefix ~/.npm-global
```

### TypeScript Path Resolution Errors
Ensure your IDE recognizes `@/*` imports. Restart the TypeScript server or reload the VS Code window after opening the project.

### ESLint or Prettier Not Working
Verify extensions are installed and enabled. Run `npm run lint` and `npm run format:check` to diagnose issues.

### Test Failures
Check that `happy-dom` is properly installed. Ensure no global variables are missing by reviewing `vitest.config.ts` setup files.

**Section sources**
- [package.json](file://package.json#L1-L42)
- [vitest.config.ts](file://vitest.config.ts#L1-L24)
- [astro.config.mjs](file://astro.config.mjs#L1-L31)