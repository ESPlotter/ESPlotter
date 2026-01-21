import { expect, type ElectronApplication, type Page } from '@playwright/test';
import { Menu as ElectronMenu, MenuItem as ElectronMenuItem } from 'electron';

export class MenuTestObject {
  constructor(
    private readonly app: ElectronApplication,
    private readonly page: Page,
  ) {}

  async openImportMenu(): Promise<void> {
    await this.page.bringToFront();
    await this.clickMenuItem(['File', 'Import']);
  }

  async openOutFileMenu(): Promise<void> {
    await this.page.bringToFront();
    await this.clickMenuItem(['File', 'Open File (.out)']);
  }

  async openPreferencesMenu(): Promise<void> {
    await this.page.bringToFront();
    await this.app.evaluate(({ Menu, BrowserWindow }) => {
      const menu = Menu.getApplicationMenu();
      if (!menu) {
        throw new Error('Application menu is not registered');
      }

      function findItemByLabel(currentMenu: ElectronMenu, label: string): ElectronMenuItem | null {
        for (const item of currentMenu.items) {
          if (item.label === label) {
            return item;
          }
          if (item.submenu) {
            const found = findItemByLabel(item.submenu, label);
            if (found) {
              return found;
            }
          }
        }
        return null;
      }

      const item = findItemByLabel(menu, 'Preferences');
      if (!item) {
        throw new Error('Preferences menu item not found');
      }

      const targetWindow = BrowserWindow.getFocusedWindow() ?? null;
      item.click(undefined, targetWindow, undefined);
    });
  }

  async clickMenuItem(labels: string[]): Promise<void> {
    await this.app.evaluate(({ Menu, BrowserWindow }, labelPath) => {
      const menu = Menu.getApplicationMenu();
      if (!menu) {
        throw new Error('Application menu is not registered');
      }

      function findMenuItem(currentMenu: ElectronMenu, path: string[]): ElectronMenuItem | null {
        let current = currentMenu;
        for (let index = 0; index < path.length; index += 1) {
          const item = current.items.find((menuItem) => menuItem.label === path[index]);
          if (!item) {
            return null;
          }
          if (index === path.length - 1) {
            return item;
          }
          if (!item.submenu) {
            return null;
          }
          current = item.submenu;
        }
        return null;
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

  async expectMenuItemAccelerator(labels: string[], expectedAccelerator: string): Promise<void> {
    const accelerator = await this.getMenuItemAccelerator(labels);
    expect(accelerator).toBe(expectedAccelerator);
  }

  async expectMenuItemWithoutAccelerator(labels: string[]): Promise<void> {
    const accelerator = await this.getMenuItemAccelerator(labels);
    expect(accelerator).toBeNull();
  }

  private async getMenuItemAccelerator(labels: string[]): Promise<string | null> {
    return this.app.evaluate(({ Menu }, labelPath) => {
      const menu = Menu.getApplicationMenu();
      if (!menu) {
        throw new Error('Application menu is not registered');
      }

      function findMenuItem(currentMenu: ElectronMenu, path: string[]): ElectronMenuItem | null {
        let current = currentMenu;
        for (let index = 0; index < path.length; index += 1) {
          const item = current.items.find((menuItem) => menuItem.label === path[index]);
          if (!item) {
            return null;
          }
          if (index === path.length - 1) {
            return item;
          }
          if (!item.submenu) {
            return null;
          }
          current = item.submenu;
        }
        return null;
      }

      const item = findMenuItem(menu, labelPath);
      if (!item) {
        throw new Error(`Menu item path "${labelPath.join(' > ')}" was not found`);
      }

      return item.accelerator ?? null;
    }, labels);
  }
}
