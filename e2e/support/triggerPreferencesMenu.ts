/* eslint-disable @typescript-eslint/no-explicit-any */
import { ElectronApplication, Page } from '@playwright/test';

export async function triggerPreferencesMenu(
  app: ElectronApplication,
  mainPage: Page,
): Promise<void> {
  await mainPage.bringToFront();
  await app.evaluate(({ Menu, BrowserWindow }) => {
    const menu = Menu.getApplicationMenu();
    if (!menu) {
      throw new Error('Application menu is not registered');
    }

    function findItemByLabel(currentMenu: any, label: string): any | null {
      for (const item of currentMenu.items) {
        if (item.label === label) return item;
        if (item.submenu) {
          const found = findItemByLabel(item.submenu, label);
          if (found) return found;
        }
      }
      return null;
    }

    const item = findItemByLabel(menu, 'Preferences');
    if (!item) throw new Error('Preferences menu item not found');

    const targetWindow = BrowserWindow.getFocusedWindow() ?? null;
    item.click(undefined, targetWindow, undefined);
  });
}
