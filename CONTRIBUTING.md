# Contributing to ESPlotter

Thanks for taking the time to contribute. This guide explains how to report issues, propose changes, and open pull requests.

## Code of Conduct

This project follows the Contributor Covenant Code of Conduct. By participating, you agree to uphold it.

Read the full text in `CODE_OF_CONDUCT.md`.

## Before You Start

- If you want to work on something, open an issue first and describe your proposal or the approach you plan to take.
- Wait for confirmation from maintainers before starting large or complex changes.
- If you want a place to begin, look for issues labeled `help wanted` or `good first issue`.

## Reporting Issues

- Search existing issues to avoid duplicates.
- Include reproduction steps, expected vs actual results, and environment details.
- Use clear titles and add any relevant context or screenshots.
- Labels such as `bug`, `feature`, `docs`, and `question` are commonly used, along with topic-specific labels.

## Pull Requests

- All PRs should target `develop` by default.
- `main` is only used for exceptional cases (for example, hotfixes).
- Create a branch with a clear prefix:
  - `feat/` for new features
  - `fix/` for bug fixes
  - `docs/` for documentation
  - `refactor/` for refactors
  - `test/` for tests
  - `chore/` for maintenance
  - `ci/` for CI changes
  - `build/` for build tooling
- Reference the related issue in the PR description.
- If a PR template exists, fill it in. Otherwise describe the change, testing performed, and any user impact.

## Commit Messages

We require Conventional Commits. See `docs/conventional-commits.md` for types and examples.

## Development Setup

1. Install dependencies:

```bash
npm install
```

2. Run the app:

```bash
npm run start
```

## Useful Scripts

- `npm run start`: start the Electron app with the main process.
- `npm run lint:fix`: auto-fix lint and formatting issues.
- `npm run test:unit`: run unit tests.
- `npm run test:unit:watch`: run unit tests in watch mode.
- `npm run test:components`: run component tests.
- `npm run test:components:watch`: run component tests in watch mode.
- `npm run test:e2e`: run Playwright end-to-end tests.
- `npm run test:e2e:ui`: run Playwright tests with UI.
- `npm run test:e2e:compiled`: package the app and run compiled Playwright tests.

## Testing Notes

Some tests require `dyntools` and Windows-specific tooling. If you are not on Windows or do not have `dyntools` installed, local runs may fail for tests that open `.out` files. In that case, skip those tests locally and mention it in your PR.
