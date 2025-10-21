import { BrowserWindow, Menu, type MenuItemConstructorOptions } from 'electron';

export function registerMainMenu(): void {
  const template: MenuItemConstructorOptions[] = [
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
  const { stateRepository, fileService } = await createChannelFileDependencies();
  const saveChannelFilePath = new (
    await import('@main/channel-file/application/use-cases/SaveChannelFilePath')
  ).SaveChannelFilePath(stateRepository, fileService);
  try {
    await saveChannelFilePath.run(path);
  } catch {
    // file has invalid structure
  }
}

async function createChannelFileDependencies() {
  const { ChannelFileStructureChecker } = await import(
    '@main/channel-file/domain/services/ChannelFileStructureChecker'
  );
  const { NodeFileService } = await import(
    '@main/channel-file/infrastructure/services/NodeFileService'
  );
  const { ElectronStoreStateRepository } = await import(
    '@main/channel-file/infrastructure/repositories/ElectronStoreStateRepository'
  );

  const structureChecker = new ChannelFileStructureChecker();
  const fileService = new NodeFileService(structureChecker);
  const stateRepository = new ElectronStoreStateRepository(fileService);

  return { fileService, stateRepository };
}
