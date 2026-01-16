# Tests

This document defines where and how we test new functionality across the project.

## General Best Practices

- **Do not modify production code solely for testing purposes.** Tests must never rely on custom hooks or APIs that exist only for test scenarios. Instead, exercise the application through real entry points.
- **Favour high-value entry points.** Write assertions against public contracts (use cases, repositories, UI interactions) so that value objects and entities are validated implicitly.
- **Keep fixtures realistic.** When stubbing data, mirror real-world payloads and structures to avoid brittle assumptions.

## Required Test Suites

### Use Case Tests (Unit)

- Location: `src/test/main/<feature>/application/`.
- Cover all application use cases (`GetUserPreferences`, `UpdateChartSeriesPalette`, etc.).
- Exercise success paths, default fallbacks, and validation failures. These specs implicitly verify domain entities and value objects, so no separate tests are needed for them.

### Infrastructure Tests (Unit-Integration)

- Location: `src/test/main/<feature>/infrastructure/`.
- Instantiate the real infrastructure adapters (e.g., `ElectronStoreUserPreferencesRepository`) with isolated dependencies.
- Verify persistence, migrations, and change notifications. Avoid mocking internals; mock only external side effects such as filesystem locations.

### End-to-End Tests

- Location: `e2e/`.
- Drive the Electron application via Playwright. Confirm that menu actions, dialogs, and chart updates behave correctly with real user flows.
- Ensure the happy path is always covered for new features. Add regression scenarios when the feature involves persistence or asynchronous updates.

#### Packaged Runs

- Set `ESPLOTTER_E2E_PACKAGED=1` to run against a packaged app.
- Set `ESPLOTTER_E2E_APP_PATH` to the packaged executable path.
- When packaged mode is enabled, the Playwright `webServer` is disabled and the tests launch the app binary directly.

#### Best Practices

- Check `e2e/support` for existing helpers before adding new ones.
- If a helper is reusable, add it to `e2e/support` with one named export per file (one function per file).
- Keep test files focused on intent and compose helpers for setup and interactions.

## Optional Test Suites

### Component Tests

- Location: Co-located alongside each component in `src/app/renderer/`.
- Add only when a component contains significant logic (e.g., complex validation or state transitions). Otherwise rely on E2E coverage to avoid redundant maintenance.
