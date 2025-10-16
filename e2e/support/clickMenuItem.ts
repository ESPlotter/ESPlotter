import type { ElectronApplication } from '@playwright/test';
import type { Menu as ElectronMenu, MenuItem as ElectronMenuItem } from 'electron';

export async function clickMenuItem(app: ElectronApplication, labels: string[]): Promise<void> {
  await app.evaluate(({ Menu, BrowserWindow }, labelPath) => {
    const menu = Menu.getApplicationMenu();
    if (!menu) {
      throw new Error('Application menu is not registered');
    }

    const item = findMenuItem(menu, labelPath);
    if (!item) {
      throw new Error(`Menu item path "${labelPath.join(' > ')}" was not found`);
    }

    if (typeof item.click !== 'function') {
      throw new Error(`Menu item "${labelPath.at(-1) ?? ''}" is not clickable`);
    }

    const targetWindow = BrowserWindow.getFocusedWindow() ?? null;
    item.click(undefined, targetWindow, undefined);
  }, labels);
}

function findMenuItem(menu: ElectronMenu, path: string[]): ElectronMenuItem | null {
  let current = menu;
  for (let i = 0; i < path.length; i++) {
    const item = current.items.find((it) => it.label === path[i]);
    if (!item) {
      return null;
    }
    if (i === path.length - 1) {
      return item;
    }
    if (!item.submenu) {
      return null;
    }
    current = item.submenu;
  }
  return null;
}
