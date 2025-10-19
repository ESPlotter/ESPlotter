import { ElectronApplication, Page } from '@playwright/test';
import { KeyboardInputEvent } from 'electron';

export async function triggerFileOpenShortcut(
  app: ElectronApplication,
  mainPage: Page,
): Promise<void> {
  await mainPage.bringToFront(); // this is needed to ensure the window is focused to receive the shortcut

  const isMac = process.platform === 'darwin';
  await app.evaluate(
    ({ BrowserWindow }, { isMac }) => {
      const win = BrowserWindow.getFocusedWindow();
      if (!win) {
        throw new Error('No focused window to receive shortcut');
      }
      // Ensure the window is focused
      if (!win.isFocused()) {
        win.focus();
      }
      // Small delay to ensure focus takes effect
      setTimeout(() => {
        const events: KeyboardInputEvent[] = isMac
          ? [
              { type: 'keyDown', keyCode: 'Meta', modifiers: ['meta'] },
              { type: 'keyDown', keyCode: 'O', modifiers: ['meta'] },
              { type: 'char', keyCode: 'o', modifiers: ['meta'] },
              { type: 'keyUp', keyCode: 'O', modifiers: ['meta'] },
              { type: 'keyUp', keyCode: 'Meta', modifiers: ['meta'] },
            ]
          : [
              { type: 'keyDown', keyCode: 'O', modifiers: ['control'] },
              { type: 'char', keyCode: 'o', modifiers: ['control'] },
              { type: 'keyUp', keyCode: 'O', modifiers: ['control'] },
            ];
        for (const event of events) {
          win.webContents.sendInputEvent(event);
        }
      }, 100);
    },
    { isMac },
  );
}
