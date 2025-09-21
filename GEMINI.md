# Project: Manus Reference - Personal Portfolio

## Project Overview

This repository contains the source code for a highly stylized and interactive personal portfolio website. The project is built with [Astro](https://astro.build/) and TypeScript, and it showcases a unique, terminal-inspired aesthetic with advanced animations and unconventional navigation.

The portfolio is designed as a single-page experience, featuring a sophisticated background ASCII particle animation system and Vim-like keyboard navigation for browsing content and changing visual themes. The content, including project details, skills, and personal information, is dynamically loaded from a central JSON data file (`src/data/profile.json`).

### Key Features:

*   **Astro Framework**: A modern static site builder for fast, content-focused websites.
*   **TypeScript**: For type safety and robust code.
*   **ASCII Animation System**: A custom HTML5 Canvas-based particle animation system that runs in the background, with multiple color schemes and effects (e.g., Matrix Rain).
*   **Vim Navigation**: The site can be navigated using Vim keybindings (`j`/`k` for scrolling, `gg`/`G` to jump to top/bottom, `n`/`N` to cycle through color schemes).
*   **Data-Driven Content**: All portfolio content is managed in `src/data/profile.json`, making it easy to update.
*   **Component-Based Architecture**: Built with reusable Astro components.
*   **Blog**: Includes a blog section powered by Astro's content collections.

## Building and Running

The project uses `npm` for dependency management and running scripts.

### Key Commands:

*   **Install Dependencies**:
    ```bash
    npm install
    ```

*   **Run Development Server**: Starts a local development server with hot-reloading.
    ```bash
    npm run dev
    ```

*   **Build for Production**: Compiles the application into the `dist/` directory for deployment.
    ```bash
    npm run build
    ```

*   **Preview Production Build**: Starts a local server to preview the production build.
    ```bash
    npm run preview
    ```

*   **Run Tests**: Executes the test suite using Vitest.
    ```bash
    npm run test
    ```

*   **Lint and Format**:
    ```bash
    # Check for linting errors
    npm run lint

    # Fix linting errors
    npm run lint:fix

    # Check formatting with Prettier
    npm run format:check

    # Apply formatting
    npm run format
    ```

*   **Type Checking**:
    ```bash
    npm run type-check
    ```

## Development Conventions

*   **Styling**: The project uses plain CSS with CSS variables for theming. It does not use a utility-class framework like Tailwind CSS. Styles are organized in the `src/styles` directory.
*   **State Management**: Client-side state, particularly for the animation and Vim systems, is managed within dedicated TypeScript classes (`ASCIIAnimationSystem.ts`, `VimSystem.ts`).
*   **Data**: All personal data for the portfolio is centralized in `src/data/profile.json`.
*   **Components**: Reusable UI elements are created as Astro components (`.astro`) in the `src/components` directory.
*   **Testing**: Unit and integration tests are written with [Vitest](https://vitest.dev/).
*   **Code Quality**: ESLint and Prettier are configured to enforce a consistent code style. A pre-commit hook or CI step should be used to run `lint`, `format`, and `type-check`.
