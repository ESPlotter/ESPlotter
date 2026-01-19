# Conventional Commits

This project uses Conventional Commits for all commit messages.

## Format

```
<type>(<scope>): <subject>
```

- `scope` is optional.
- Use present tense, imperative verbs in the subject line.
- Keep the subject short and descriptive.

## Types

- `feat`: new user-facing functionality.
- `fix`: bug fixes.
- `docs`: documentation changes only.
- `refactor`: code changes that neither fix a bug nor add a feature.
- `test`: adding or updating tests.
- `chore`: maintenance tasks, dependency updates, or repo housekeeping.
- `ci`: CI pipeline changes.
- `build`: build tooling or packaging changes.
- `perf`: performance improvements.

## Scopes (Optional)

Use a scope when it helps clarify the area of the change. Examples:

- `chart`
- `channel-file`
- `settings`,
- `import`

## Examples

```
feat: add contribution file import
fix(import): handle missing python path on startup
docs: add contribution guidelines
refactor: simplify ipc bridge typing
test(chart): cover plot legend rendering
chore: update playwright snapshot baselines
ci: cache electron forge artifacts
build: bump electron-forge packaging config
perf(chart): reduce chart redraws
```

## Breaking Changes

Breaking change messages are allowed but not required for this desktop app. If a change is disruptive, call it out in the issue and PR description as well.
