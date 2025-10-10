import { BrowserWindow, Menu } from 'electron';
import { openByPathController } from '@main/controllers/fileOpenController';
import { showOpenFileDialog } from '@main/files/fileService';

export function setMainMenu() {
  const template: Array<Electron.MenuItemConstructorOptions | Electron.MenuItem> = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Open File',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            const win = BrowserWindow.getFocusedWindow();
            if (!win) return;
            const selected = await showOpenFileDialog(win);
            if (!selected) return;
            await openByPathController(selected);
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}
