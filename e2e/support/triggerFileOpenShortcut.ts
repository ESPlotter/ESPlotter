import { ElectronApplication, Page } from '@playwright/test';
import { KeyboardInputEvent } from 'electron';

import { clickMenuItem } from './clickMenuItem';
import { ensureMenuItemWithAccelerator } from './ensureMenuItemWithAccelerator';

export async function triggerFileOpenShortcut(
  app: ElectronApplication,
  mainPage: Page,
): Promise<void> {
  await mainPage.bringToFront();

  // On Github Actions macOS runners, simulating keyboard events does not work as expected.
  // Therefore, we trigger the shortcut via the menu accelerator instead.
  // This is a workaround for the issue. We have to improve this in the future doing the same as Windows/Linux.
  const isMac = process.platform === 'darwin';
  if (isMac) {
    await triggerShortcutUsingMenuAccelerator(app);
    return;
  }

  await app.evaluate(({ BrowserWindow }) => {
    const win = BrowserWindow.getFocusedWindow();
    if (!win) {
      throw new Error('No focused window to receive shortcut');
    }

    const events: KeyboardInputEvent[] = [
      { type: 'keyDown', keyCode: 'O', modifiers: ['control'] },
      { type: 'char', keyCode: 'o', modifiers: ['control'] },
      { type: 'keyUp', keyCode: 'O', modifiers: ['control'] },
    ];

    for (const event of events) {
      win.webContents.sendInputEvent(event);
    }
  });
}

async function triggerShortcutUsingMenuAccelerator(app: ElectronApplication): Promise<void> {
  const expectedAccelerator = 'CmdOrCtrl+O';
  const labelPath = ['File', 'Open File'];

  await ensureMenuItemWithAccelerator(app, labelPath, expectedAccelerator);
  await clickMenuItem(app, labelPath);
}
