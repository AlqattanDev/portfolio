# Testing & Code Quality

<cite>
**Referenced Files in This Document**   
- [vitest.config.ts](file://vitest.config.ts)
- [package.json](file://package.json)
- [src/utils/dom.ts](file://src/utils/dom.ts)
- [src/utils/performance.ts](file://src/utils/performance.ts)
- [src/utils/client.ts](file://src/utils/client.ts)
- [src/test/setup.ts](file://src/test/setup.ts)
- [tsconfig.json](file://tsconfig.json)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Testing Framework Overview](#testing-framework-overview)
3. [Test Structure and Execution](#test-structure-and-execution)
4. [Example Unit Tests](#example-unit-tests)
5. [Linting and Formatting](#linting-and-formatting)
6. [Code Coverage](#code-coverage)
7. [Writing New Tests](#writing-new-tests)
8. [Type Checking with TypeScript](#type-checking-with-typescript)
9. [CI/CD Integration](#cicd-integration)
10. [Best Practices for Code Quality](#best-practices-for-code-quality)

## Introduction
This document outlines the testing and code quality practices implemented in the project, focusing on unit testing with Vitest, linting with ESLint, formatting with Prettier, and type safety via TypeScript. The goal is to ensure high reliability, maintainability, and consistency across contributions.

## Testing Framework Overview
The project uses **Vitest** as its primary unit testing framework, tightly integrated with **Vite** for fast test execution and development experience. Vitest provides a modern, efficient testing environment with features like instant startup, built-in coverage, and UI mode for interactive debugging.

The test environment is configured using `happy-dom`, a lightweight DOM implementation that simulates browser APIs without requiring a full browser runtime. This enables fast and reliable testing of DOM-related utilities while maintaining performance.

**Section sources**
- [vitest.config.ts](file://vitest.config.ts#L1-L23)
- [package.json](file://package.json#L10-L13)

## Test Structure and Execution
Test files are colocated with source files and follow the naming pattern `*.test.ts` or `*.spec.ts`. All tests are discovered automatically under the `src/**/*.{test,spec}.{ts,js}` glob pattern defined in the Vitest configuration.

Tests can be executed via npm scripts:
- `npm run test`: Runs all tests in CLI mode
- `npm run test:ui`: Launches the Vitest UI dashboard for interactive test exploration
- `npm run test:coverage`: Generates code coverage reports

A setup file at `src/test/setup.ts` is executed before each test run, allowing global configurations such as mocking utilities or extending matchers.

**Section sources**
- [vitest.config.ts](file://vitest.config.ts#L7-L14)
- [package.json](file://package.json#L10-L13)

## Example Unit Tests
The following core utility modules are covered by unit tests to ensure correctness and robustness.

### DOM Utilities Testing
The `dom.ts` utility module contains functions for DOM manipulation and querying. Tests verify correct element selection, attribute handling, and event binding. Mocks are used to simulate DOM elements when necessary, ensuring isolation from actual browser environments.

Assertions use standard Vitest `expect()` syntax with matcher methods like `.toBeTruthy()`, `.toBe()`, and `.toContain()`.

**Section sources**
- [src/utils/dom.ts](file://src/utils/dom.ts)

### Performance Utilities Testing
Functions in `performance.ts` related to timing, metrics collection, and benchmarking are tested using mocked `performance` API objects. This ensures consistent behavior across environments and allows simulation of various timing scenarios.

Tests validate that metrics are recorded correctly and that performance marks are properly set and cleared.

**Section sources**
- [src/utils/performance.ts](file://src/utils/performance.ts)

### Client-Side Feature Detection
The `client.ts` module includes functions for detecting client capabilities such as touch support, network status, and browser features. These are tested using environment mocks to simulate different client conditions (e.g., mobile vs desktop, online vs offline).

Happy DOM provides sufficient browser-like context to test these utilities without external dependencies.

**Section sources**
- [src/utils/client.ts](file://src/utils/client.ts)

## Linting and Formatting
Code quality is enforced through **ESLint** and **Prettier**, configured to maintain consistent style and prevent common bugs.

### ESLint Configuration
ESLint is configured to analyze `.ts` and `.astro` files in the `src/` directory. It uses:
- `@typescript-eslint/parser` for TypeScript parsing
- `@typescript-eslint/eslint-plugin` for TypeScript-specific rules
- `eslint-plugin-astro` for Astro component linting

Rules focus on best practices, error prevention, and code clarity.

### Prettier Integration
Prettier ensures uniform code formatting across the codebase. It is configured to format TypeScript, Astro, CSS, and JSON files.

Available scripts:
- `npm run format`: Applies formatting automatically
- `npm run format:check`: Validates formatting without changes (used in CI)

**Section sources**
- [package.json](file://package.json#L14-L19)
- [tsconfig.json](file://tsconfig.json)

## Code Coverage
Code coverage is measured using **V8** as the coverage provider, integrated via `@vitest/coverage-v8`. Reports are generated in multiple formats:
- Text summary
- JSON (for tooling integration)
- HTML (for visual browsing)

Coverage excludes:
- `node_modules/`
- Test and type definition files
- Setup and configuration files

Thresholds can be configured in `vitest.config.ts` to enforce minimum coverage levels on future changes.

**Section sources**
- [vitest.config.ts](file://vitest.config.ts#L15-L22)

## Writing New Tests
When adding new functionality, corresponding tests should be created following these guidelines:

1. Place test files adjacent to the source file with `.test.ts` extension
2. Use descriptive test names with `describe`, `it`, and `test` blocks
3. Isolate tests using mocks for external dependencies
4. Clean up side effects in `afterEach` or `teardown` hooks

### Mocking Browser APIs
Browser APIs (e.g., `localStorage`, `fetch`, `navigator`) can be mocked directly in tests using Vitest’s `vi.spyOn()` or `vi.mock()` functions. For global mocks, consider placing them in `src/test/setup.ts`.

Example:
```ts
vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
```

### Debugging Test Failures
Use `npm run test:ui` to launch the Vitest web interface, which provides real-time test results, filtering, and stack trace navigation. Add `debugger` statements or use `console.log` within tests for inspection.

Run tests in watch mode with `vitest --watch` during development for instant feedback.

**Section sources**
- [vitest.config.ts](file://vitest.config.ts)
- [src/test/setup.ts](file://src/test/setup.ts)

## Type Checking with TypeScript
TypeScript enhances code quality by catching errors at compile time. The project uses strict mode settings in `tsconfig.json` to maximize type safety.

Type checking is performed via:
```bash
npm run type-check
```
This runs both `astro check` and `tsc --noEmit` to validate types without generating output.

Types complement runtime testing by preventing incorrect function calls, property access, and state mutations before tests even run.

**Section sources**
- [tsconfig.json](file://tsconfig.json)
- [package.json](file://package.json#L40-L41)

## CI/CD Integration
The project’s quality checks are designed for seamless CI/CD integration. Recommended pipeline steps include:
1. Run `npm run type-check` – validate all types
2. Run `npm run lint` – enforce code style and best practices
3. Run `npm run format:check` – ensure consistent formatting
4. Run `npm run test:coverage` – execute tests and generate coverage report
5. Enforce coverage thresholds (if configured)

These scripts can be added to GitHub Actions, GitLab CI, or other platforms using simple Node.js execution steps.

**Section sources**
- [package.json](file://package.json#L10-L20)

## Best Practices for Code Quality
To maintain high code quality during contributions:
- Always write tests for new functions and components
- Keep test files updated when modifying logic
- Fix linting and formatting issues before committing
- Use TypeScript types effectively—avoid `any`
- Prefer small, focused functions that are easier to test
- Mock external dependencies to isolate unit tests
- Review coverage reports to identify untested branches

By combining fast unit testing, automated linting, consistent formatting, and strong typing, the project ensures long-term maintainability and reduces the likelihood of regressions.