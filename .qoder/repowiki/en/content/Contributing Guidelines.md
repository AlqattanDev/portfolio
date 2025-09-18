# Contributing Guidelines

<cite>
**Referenced Files in This Document**  
- [package.json](file://package.json)
- [src/animation/EffectSystem.ts](file://src/animation/EffectSystem.ts)
- [src/utils/constants.ts](file://src/utils/constants.ts)
</cite>

## Table of Contents
1. [Contribution Workflow](#contribution-workflow)
2. [Coding Standards](#coding-standards)
3. [Commit Message Conventions](#commit-message-conventions)
4. [Documentation and Testing](#documentation-and-testing)
5. [Extending Core Systems](#extending-core-systems)
6. [Reporting Bugs and Requesting Features](#reporting-bugs-and-requesting-features)
7. [Community and Communication](#community-and-communication)
8. [License and Security](#license-and-security)

## Contribution Workflow

To contribute to this project, follow the standard GitHub fork-and-pull request model:

1. **Fork the Repository**: Click the "Fork" button on the GitHub repository page to create your own copy.
2. **Clone Your Fork**: `git clone https://github.com/your-username/manus-reference.git`
3. **Create a Feature Branch**: Use descriptive branch names such as `feature/add-swift-effect` or `fix/vim-mode-bug`.
4. **Make Your Changes**: Implement your feature or fix.
5. **Run Local Checks**: Ensure code formatting and linting pass (see Coding Standards).
6. **Commit Changes**: Follow the commit message conventions (see Commit Message Conventions).
7. **Push to Your Fork**: `git push origin your-branch-name`
8. **Open a Pull Request**: Submit a pull request to the main repository with a clear description of your changes.

**Section sources**
- [package.json](file://package.json#L10-L15)

## Coding Standards

This project enforces consistent code style using ESLint and Prettier. All contributions must adhere to these standards.

- **ESLint**: Used for TypeScript and Astro files in the `src` directory.
- **Prettier**: Enforces consistent formatting across TypeScript, Astro, CSS, and JSON files.

To run checks locally:
```bash
npm run lint           # Check code with ESLint
npm run lint:fix       # Automatically fix ESLint issues
npm run format         # Format code with Prettier
npm run format:check   # Check formatting without modifying files
npm run type-check     # Validate TypeScript types
```

These scripts are defined in `package.json` and must pass before a pull request is merged.

**Section sources**
- [package.json](file://package.json#L16-L24)

## Commit Message Conventions

While no strict conventional commits format is enforced, contributors are encouraged to use clear, descriptive commit messages that explain the purpose of the change. Examples:
- `feat: add SWIFT Network animation effect`
- `fix: resolve visual mode cursor offset in VimSystem`
- `docs: update contribution guidelines`

This improves code review clarity and changelog generation.

## Documentation and Testing

- **Documentation Updates**: Any new features or significant changes should include updates to relevant documentation, including inline code comments where appropriate.
- **Testing Coverage**: While no explicit test coverage threshold is defined, new functionality should be accompanied by unit tests when feasible. Run tests with `npm run test` or `npm run test:ui` for the interactive UI.

Ensure all tests pass before submitting a pull request.

**Section sources**
- [package.json](file://package.json#L25-L27)

## Extending Core Systems

When extending core systems such as animation effects or Vim commands, follow the existing architectural patterns:

### Adding New Animation Effects
1. Define the effect name in `EFFECT_NAMES` in `constants.ts`.
2. Create a new effect class that implements the effect strategy pattern.
3. Register the effect in `EffectSystem.initializeEffects()` using the next available numeric ID.
4. Ensure the effect adheres to the color scheme constants defined in `COLOR_SCHEMES`.

Example: The SWIFT Network effect was added as ID 5 in `EffectSystem.ts`.

### Adding Vim Commands
1. Extend the `VIM_MODES` enum in `constants.ts` if introducing a new mode.
2. Implement command logic within `VimSystem.ts`, ensuring separation of concerns between modes.
3. Maintain consistent keybinding patterns and user feedback mechanisms.

Always preserve type safety and modular design principles.

**Section sources**
- [src/utils/constants.ts](file://src/utils/constants.ts#L0-L39)
- [src/animation/EffectSystem.ts](file://src/animation/EffectSystem.ts#L732-L757)

## Reporting Bugs and Requesting Features

Use GitHub Issues to report bugs or request features. When reporting a bug, include:
- A clear title and description
- Steps to reproduce
- Expected vs. actual behavior
- Browser and OS information
- Console error messages, if any

For feature requests, provide:
- A detailed explanation of the desired functionality
- Use cases and benefits
- Any design or implementation suggestions

While no formal issue templates are present, structured and detailed reports are strongly preferred.

## Community and Communication

Contributors are expected to maintain a respectful and collaborative tone in all communications, including pull request reviews, issue discussions, and code comments. Constructive feedback and openness to iteration are key to maintaining a healthy open-source community.

## License and Security

- **License Attribution**: This project is licensed under the MIT License. All contributions are assumed to be made under the same license. Ensure any third-party code or assets comply with permissive licensing.
- **Security Disclosures**: For security vulnerabilities, do not disclose publicly via issues. Instead, contact the maintainers directly through private channels to allow for responsible disclosure and patching.