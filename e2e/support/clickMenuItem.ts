import type { ElectronApplication } from '@playwright/test';
import type { Menu as ElectronMenu, MenuItem as ElectronMenuItem } from 'electron';

export async function clickMenuItem(app: ElectronApplication, labels: string[]): Promise<void> {
  await app.evaluate(({ Menu, BrowserWindow }, labelPath) => {
    const menu = Menu.getApplicationMenu();
    if (!menu) {
      throw new Error('Application menu is not registered');
    }
    let currentMenu: ElectronMenu | undefined = menu;
    let item: ElectronMenuItem | undefined;

    for (let index = 0; index < labelPath.length; index += 1) {
      const label = labelPath[index];
      if (!currentMenu) {
        break;
      }
      item = currentMenu.items.find((entry) => entry.label === label);
      if (!item) {
        break;
      }
      const isLast = index === labelPath.length - 1;
      if (isLast) {
        break;
      }
      currentMenu = item.submenu ?? undefined;
    }

    if (!item) {
      throw new Error(`Menu item path \"${labelPath.join(' > ')}\" was not found`);
    }

    if (typeof item.click !== 'function') {
      throw new Error(`Menu item "${labelPath.at(-1) ?? ''}" is not clickable`);
    }
    const targetWindow = BrowserWindow.getFocusedWindow() ?? null;
    item.click(undefined, targetWindow, undefined);
  }, labels);
}

export async function triggerFileOpenMenu(app: ElectronApplication): Promise<void> {
  await clickMenuItem(app, ['File', 'Open File']);
}
