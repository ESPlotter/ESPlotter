import { ElectronApplication, Page } from '@playwright/test';
import { KeyboardInputEvent } from 'electron';

export async function triggerFileOpenShortcut(
  app: ElectronApplication,
  mainPage: Page,
): Promise<void> {
  await mainPage.bringToFront(); // this is needed to ensure the window is focused to receive the shortcut

  // On macOS, use Meta (Cmd) key; on other platforms, use Control key
  const modifiers = (process.platform === 'darwin' ? ['meta'] : ['control']) as Array<
    'control' | 'meta'
  >;
  await app.evaluate(
    ({ BrowserWindow }, { accelModifiers }) => {
      const win = BrowserWindow.getFocusedWindow();
      if (!win) {
        throw new Error('No focused window to receive shortcut');
      }

      const events: KeyboardInputEvent[] = [
        { type: 'keyDown', keyCode: 'O', modifiers: accelModifiers },
        { type: 'char', keyCode: 'O', modifiers: accelModifiers },
        { type: 'keyUp', keyCode: 'O', modifiers: accelModifiers },
      ];
      for (const event of events) {
        win.webContents.sendInputEvent(event);
      }
    },
    { accelModifiers: modifiers },
  );
}
