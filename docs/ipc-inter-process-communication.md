# IPC: Inter-Process Communication

For communication between the main process and the renderer process, use specific wrapper functions that correctly check types and encapsulate Electron's IPC logic.

If you add a new function exposed from the preload, update `types/global.d.ts` to maintain typing for interprocess communication.

Group the things you want to communicate between the "main" and "renderer" processes into objects, such that you use the `exposeInMainWorld` function multiple times, once for each object you want to expose. For example, encapsulating the functions related to system versions in `versions`.

```ts
contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
});

contextBridge.exposeInMainWorld('data', {
  foo: () => ipcRenderer.invoke('foo'),
  bar: (param: string) => ipcRenderer.invoke('bar', param),
});
``` 
This allows you to group related functions together and avoid cluttering the window object with too many separate functions.

When using them in the renderer, you would do this:

```ts
window.versions.electron();
window.data.foo();
```
