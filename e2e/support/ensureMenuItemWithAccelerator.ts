import { ElectronApplication } from '@playwright/test';
import { Menu as ElectronMenu, MenuItem as ElectronMenuItem } from 'electron';

export async function ensureMenuItemWithAccelerator(
  app: ElectronApplication,
  labels: string[],
  expectedAccelerator: string,
): Promise<void> {
  return app.evaluate(
    ({ Menu }, { labels, expectedAccelerator }) => {
      const menu = Menu.getApplicationMenu();
      if (!menu) {
        throw new Error('Application menu is not registered');
      }

      function findMenuItem(currentMenu: ElectronMenu, path: string[]): ElectronMenuItem | null {
        let current = currentMenu;
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

      const item = findMenuItem(menu, labels);
      if (!item) {
        throw new Error(`Menu item path "${labels.join(' > ')}" was not found`);
      }

      if (typeof item.click !== 'function') {
        throw new Error(`Menu item "${labels.at(-1) ?? ''}" is not clickable`);
      }

      if (item.accelerator !== expectedAccelerator) {
        throw new Error(
          `Menu item "${labels.at(-1) ?? ''}" has accelerator "${item.accelerator}", expected "${expectedAccelerator}"`,
        );
      }
    },
    { labels, expectedAccelerator },
  );
}
