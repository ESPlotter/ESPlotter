# Architecture

## Overview

Uniplot follows a hexagonal architecture inside the Electron main process, separating business logic, application logic, and infrastructure concerns.
This design keeps the core logic independent from Electron APIs and allows new features to be added or tested in isolation.

```
         ┌─────────────────────┐
         │     Renderer (UI)   │
         │ React, Tailwind,    │
         │ ECharts, shadcn     │
         └────────┬────────────┘
                  │
            [Preload Bridge]
                  │
         ┌────────▼────────────┐
         │     Main Process    │
         │ (Hexagonal Core)    │
         └─────────────────────┘
```

For inter-process communication details, see [IPC Documentation](./ipc-inter-process-communication.md).

## Main Process (`src/app/main`)

### Purpose

The main process acts as the backend of Uniplot.
It owns the application’s lifecycle, domain logic, and persistence, while exposing only typed APIs to the renderer.

```sh
src/app/main/
 ├─ main.ts
 ├─ shared/{ipc,menu}/
 └─ <feature>/
     ├─ application/
     ├─ domain/
     └─ infrastructure/
```

### Architectural Layers

| Layer              | Purpose             | Description                                                                                  |
| ------------------ | ------------------- | -------------------------------------------------------------------------------------------- |
| **Domain**         | Core business logic | Entities, value objects, and interfaces. No Electron code.                                   |
| **Application**    | Use cases           | Coordinates domain objects and repositories. Stateless and pure.                             |
| **Infrastructure** | Adapters            | Handles IPC, persistence, file system, and observers. depends on APIs external to the domain |

Each feature (e.g. channel-file) follows this same split.
The domain and application layers are framework-agnostic, while infrastructure connects them to Electron. **The use cases are the only entry points for backend logic**.

### Example Flow

```
Renderer → Preload API → Main IPC handler
→ Use case (Application) → Repository (Infrastructure)
→ Store update → Observer broadcast → Renderer update
```

### Rules

1. `main.ts` only registers features and handles app lifecycle.
2. Use cases have no external APIs imports (electron, fetch, fs...).
3. Repositories/Services isolate persistence or external APIs (e.g. electron-store, file system).
4. Features load lazily through dynamic imports.
5. Business logic never leaks into `renderer` or `preload`.

## Preload (`src/app/preload`)

### Purpose

The preload process acts as the secure bridge between `main` and `renderer`.
It exposes a minimal, typed API using Electron’s `contextBridge`.

### Structure

```sh
src/app/preload/
 ├─ preload.ts
 └─ ipc/
```

### Responsibilities

- Expose grouped APIs such as `window.files` or `window.versions`.
- Wrap IPC calls with helpers (`ipcRendererInvoke`, `ipcRendererOn`) that share contracts with the main process (`IPCContracts.ts`).
- Prevent direct Node access in the renderer.
- Stay stateless — no data or business logic.

### Example

```ts
contextBridge.exposeInMainWorld('files', {
  getOpened: () => ipcRendererInvoke('files:getOpened'),
  onChanged: (cb) => ipcRendererOn('files:changed', cb),
});
```

### Rules

1. Never import directly from @main.
2. Expose only typed, documented functions.
3. Keep preload as thin as possible — only delegation, no transformation.
4. Group related APIs under namespaces on `window`.

## Renderer (`src/app/renderer`)

### Purpose

The renderer is the presentation layer.
It’s a React-based UI that consumes validated data through the APIs exposed by preload.

### Structure

```sh
src/app/renderer/
 ├─ renderer.tsx
 ├─ app.tsx
 ├─ pages/
 ├─ components/
 └─ shadcn/
```

### Responsibilities

- Render deterministic, route-driven UI (`createHashRouter`).
- Subscribe to data changes through preload APIs (`window.files`, etc.).
- Manage only UI state (layout, filters, theme).
- Never handle domain or persistence logic.

### Example

```tsx
useEffect(() => {
  window.files.getOpened().then(setData);
  return window.files.onChanged(setData);
}, []);
```

### Rules

1. No imports from `@main` or `@preload`.
2. All domain data must come through the exposed window APIs.
3. Components must be pure and predictable.
4. Global UI state (e.g., via Zustand or Context) is allowed, but domain state stays in main.

## Shared (`src/app/shared`)

### Purpose

The shared folder contains code that is reused across different electron layers (main, preload, renderer).
This includes functions, classes, types... that are not tied to a specific feature.

### Structure

```sh
src/app/shared/
 ├─ domain/
 ├─ infrastructure/
 └─ components/
```

### Rules

1. Keep shared code generic and reusable.
2. Avoid feature-specific logic in shared code.
