import { app, BrowserWindow, Menu } from 'electron';
import { saveFilePath } from './saveFilePath';

export function setMainMenu() {
  const isMac = process.platform === 'darwin';
  const template: Array<Electron.MenuItemConstructorOptions | Electron.MenuItem> = [
    // { role: 'appMenu' }
    // ...(isMac
    //   ? [
    //       {
    //         label: app.name,
    //         submenu: [
    //           { role: 'about' },
    //           { type: 'separator' },
    //           { role: 'services' },
    //           { type: 'separator' },
    //           { role: 'hide' },
    //           { role: 'hideOthers' },
    //           { role: 'unhide' },
    //           { type: 'separator' },
    //           { role: 'quit' },
    //         ],
    //       },
    //     ]
    //   : []),
    // { role: 'fileMenu' }
    {
      label: 'File',
      submenu: [
        {
          label: 'Open File',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            const { dialog } = await import('electron');
            const win = BrowserWindow.getFocusedWindow();
            if (!win) return;
            const { canceled, filePaths } = await dialog.showOpenDialog(win, {
              properties: ['openFile'],
            });

            if (canceled) return;

            await saveFilePath(filePaths[0]);
          },
        },
      ],
    },
    // { role: 'editMenu' }
    // {
    //   label: 'Edit',
    //   submenu: [
    //     { role: 'undo' },
    //     { role: 'redo' },
    //     { type: 'separator' },
    //     { role: 'cut' },
    //     { role: 'copy' },
    //     { role: 'paste' },
    //     ...(isMac
    //       ? [
    //           { role: 'pasteAndMatchStyle' },
    //           { role: 'delete' },
    //           { role: 'selectAll' },
    //           { type: 'separator' },
    //           {
    //             label: 'Speech',
    //             submenu: [{ role: 'startSpeaking' }, { role: 'stopSpeaking' }],
    //           },
    //         ]
    //       : [{ role: 'delete' }, { type: 'separator' }, { role: 'selectAll' }]),
    //   ],
    // },
    // { role: 'viewMenu' }
    // {
    //   label: 'View',
    //   submenu: [
    //     { role: 'reload' },
    //     { role: 'forceReload' },
    //     { role: 'toggleDevTools' },
    //     { type: 'separator' },
    //     { role: 'resetZoom' },
    //     { role: 'zoomIn' },
    //     { role: 'zoomOut' },
    //     { type: 'separator' },
    //     { role: 'togglefullscreen' },
    //   ],
    // },
    // { role: 'windowMenu' }
    // {
    //   label: 'Window',
    //   submenu: [
    //     { role: 'minimize' },
    //     { role: 'zoom' },
    //     ...(isMac
    //       ? [{ type: 'separator' }, { role: 'front' }, { type: 'separator' }, { role: 'window' }]
    //       : [{ role: 'close' }]),
    //   ],
    // },
    // {
    //   role: 'help',
    //   submenu: [
    //     {
    //       label: 'Learn More',
    //       click: async () => {
    //         const { shell } = await import('electron');
    //         await shell.openExternal('https://electronjs.org');
    //       },
    //     },
    //   ],
    // },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}
