# Tests

This document outlines the testing strategy for our project, including best practices and guidelines for writing effective tests. It covers unit tests, component tests, and end-to-end (E2E) tests.

## General Best Practices

- **Do not modify production code for testing**: Tests must never rely on changes to production code. If adding methods, APIs, or logic solely for testing purposes (e.g., in preload) is required, the test design is flawed. Instead, simulate real interactions or use controlled mechanisms such as environment variables, development flags, or keyboard shortcuts.

## Unit tests

## Component tests

## E2E tests

### Best Practices
