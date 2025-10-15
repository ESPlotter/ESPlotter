# Tests

## Unit tests

## Component tests

## E2E tests

- Apertura de archivos sin exponer APIs a Renderer:
  - Para simular “File > Open” en E2E sin usar `window.files.openByPath`, se dispara el atajo `CmdOrCtrl+O` y se configura la ruta a abrir con la variable de entorno `UNIPLOT_E2E_OPEN_PATH`.
  - Implementación: `showOpenFileDialog` en `src/app/main/files/fileService.ts` devuelve directamente esa ruta cuando `CI=1` y `UNIPLOT_E2E_OPEN_PATH` están presentes.
  - Ejemplo (Playwright):
    - Establecer la variable en el proceso principal
      ```ts
      await electronApp.evaluate((_, fpath) => {
        process.env.UNIPLOT_E2E_OPEN_PATH = fpath as string;
      }, '/abs/path/to/fixture.json');
      ```
    - Disparar el menú: `await page.keyboard.press('Control+O')`.
  - Esto evita exponer métodos de prueba en `preload` y mantiene el contrato de IPC limpio.
