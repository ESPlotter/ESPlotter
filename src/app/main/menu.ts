import { BrowserWindow, Menu } from 'electron';
import { SaveChannelFilePath } from './channel-file/application/use-cases/SaveChannelFile';

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
            if (!win) {
              return;
            }
            const selected = await showOpenFileDialog(win);
            if (!selected) {
              return;
            }
            await addNewOpenedFilePath(selected);
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

async function showOpenFileDialog(win: BrowserWindow): Promise<string | null> {
  if (process.env.CI && process.env.UNIPLOT_E2E_OPEN_PATH) {
    return process.env.UNIPLOT_E2E_OPEN_PATH;
  }

  const { dialog } = await import('electron');
  const { canceled, filePaths } = await dialog.showOpenDialog(win, { properties: ['openFile'] });
  if (canceled) return null;
  return filePaths[0] ?? null;
}

async function addNewOpenedFilePath(path: string): Promise<void> {
  const saveChannelFilePath = new SaveChannelFilePath(
    new (
      await import('@main/channel-file/infrastructure/repositories/ElectronStoreStateRepository')
    ).ElectronStoreStateRepository(),
    new (
      await import('@main/channel-file/infrastructure/services/NodeFileService')
    ).NodeFileService(),
    new (
      await import('@main/channel-file/domain/services/ChannelFileStructureChecker')
    ).ChannelFileStructureChecker(),
  );
  try {
    await saveChannelFilePath.run(path);
  } catch {
    // file has invalid structure
  }
}
