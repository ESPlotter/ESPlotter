# IPC: Inter-Process Communication

Electron apps run in two processes:
- **Main process** → controls lifecycle, manages APIs, registers handlers.
- **Renderer process** → runs UI, calls safe wrappers.
- **Preload script** → the only bridge between them.
Direct use of `ipcRenderer` or `ipcMain` is not allowed.

## Core Rules
### IPC Wrapper Functions
1. Never call `ipcRenderer`, `ipcMain`, or `contextBridge` directly. Always go through wrappers.
2. Use `contextBridgeExposeInMainWorld` in preload to expose grouped APIs.
3. Use `ipcRendererInvoke` in preload only (never in renderer directly).
4. Use `ipcMainHandle` only in the main process to register handlers.
5. Keep the main ↔ renderer contract symmetrical (invoke signatures match handler signatures).

### IPC Strong Types 
3. Update `ipc-contracts.d.ts` whenever preload exposes new APIs or main registers new handlers.
4. Use the type `IpcChannelMap` to define channels between main and renderer.
5. Use the type `RendererExposureMap` to define what the renderer can access.

### API Exposure
1. Group related API surface areas when exposing them to the renderer.
  - correct: `window.versions.ping()`
  - wrong: `window.ping()`

## Available Wrappers
- `contextBridgeExposeInMainWorld(key, api)` → exposes grouped APIs on `window` from the preload.
- `ipcRendererInvoke(channel, ...args)` → typed wrapper over `ipcRenderer.invoke` for ad-hoc calls.
- `ipcMainHandle(channel, handler)` → registers typed `ipcMain.handle` implementations in the main process.
If you need another helper, add it alongside their types.

## Grouping Example
Group related functions into objects (namespaces).

```ts
// preload.ts
contextBridgeExposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  ping: () => ipcRendererInvoke('ping'),
});

contextBridgeExposeInMainWorld('data', {
  foo: () => ipcRendererInvoke('foo'),
  bar: (param: string) => ipcRendererInvoke('bar', param),
});
``` 
## Usage in the Renderer

```ts
window.versions.electron();
window.data.bar("example");
```
