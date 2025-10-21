# Zustand Store Standards

## Purpose

Define consistent patterns for Zustand usage in this project.
LLMs and developers must follow these rules when creating, updating, or reading stores.

## Core Principles

1. Atomic subscriptions only. Never subscribe to the whole store.
2. Actions separated from state. State mutates, actions don’t.
3. Stores stay small. Each store handles one clear concern.
4. Selectors over shallow compare. Use explicit selectors instead of useShallow.
5. Encapsulate business logic. Components never mutate state directly.

## Structure Rules

### 1. File Layout

Each store file must export:

```ts
export function useExampleValue() {
  return useExampleStore((s) => s.value);
}

export function useExampleActions() {
  return useExampleStore((s) => s.actions);
}
```

No direct exports of the full store (e.g. useExampleStore) are allowed.

### 2. State and Actions Separation

```ts
interface ExampleState {
  value: number;
  actions: {
    increment: () => void;
    reset: () => void;
  };
}
```

Actions live inside the `actions` object and use `set()` internally.
Keep logic (validation, limits, derived updates) inside the store.

### 3. Hooks as Public API

Expose only atomic hooks:

```ts
export function useValue() {
  return useExampleStore((s) => s.value);
}

export function useExampleActions() {
  return useExampleStore((s) => s.actions);
}
```

Do not access multiple state fields in one hook.

### 4. Store Size

- Each store handles one bounded domain (e.g. `ChannelCharts`, `UserPreferences`).
- If a store grows over ~300 lines or mixes unrelated concepts, split it.

### 5. Error Handling and Side Effects

- Actions may perform lightweight validation or throw typed errors.
- Async operations use actions, not components.
- Side effects like persistence or IPC must be delegated to infrastructure services, not embedded in the store.

#### Example Usage

```ts
import {
  useSelectedChartId,
  useCharts,
  useChannelChartsActions,
} from '@renderer/store/ChannelChartsStore';

const { addChart } = useChannelChartsActions();
const charts = useCharts();
const selectedId = useSelectedChartId();
```

## LLM Notes

- When generating new stores, follow this structure exactly.
- Use naming convention: `<Domain>Store.ts`.
- Always provide selectors and `use<Domain>Actions` exports.
- Avoid inline anonymous stores or direct imports of Zustand in components.
