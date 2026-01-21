# Release Process

This repository creates GitHub Releases automatically when a tag like `vX.Y.Z` is pushed.

## Prerequisites

- The release tag must point to a commit on `main`.
- Commit messages should follow Conventional Commits so the changelog is complete.
- Version bump should be done on `main` before tagging.

## Steps (copy/paste)

1. Checkout `main` and pull the latest changes

```bash
git switch main
git pull --all --prune
```

2. Bump the version, commit, and create the tag using semantic shortcuts:

Choose one:

```bash
npm version patch
npm version minor
npm version major
```

3. Push commit and tag

```bash
git push origin main --tags
```

## What happens next

- The Release workflow runs on the pushed tag and publishes the installer.
- The changelog is generated from commits since the previous tag.
- Only Conventional Commit messages are included in the changelog.
