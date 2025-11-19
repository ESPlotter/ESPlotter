import { app, BrowserWindow, Menu, type MenuItemConstructorOptions } from 'electron';

import { webContentsBroadcast } from '@main/shared/infrastructure/ipc/webContentsBroadcast';

export function registerMainMenu(): void {
  const isMac = process.platform === 'darwin';
  const template: MenuItemConstructorOptions[] = [
    ...(isMac ? [buildMacAppMenu()] : []),
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
        {
          label: 'Open File (.out)',
          click: async () => {
            const win = BrowserWindow.getFocusedWindow();
            if (!win) {
              return;
            }
            const selected = await showOpenFileDialog(win);
            if (!selected) {
              return;
            }
            await addPSSESOutFilePath(selected);
          },
        },
        ...(isMac
          ? []
          : [{ type: 'separator' } as MenuItemConstructorOptions, createPreferencesMenuItem()]),
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function buildMacAppMenu(): MenuItemConstructorOptions {
  return {
    label: app.name,
    submenu: [createPreferencesMenuItem(), { type: 'separator' }, { role: 'quit' }],
  };
}

function createPreferencesMenuItem(): MenuItemConstructorOptions {
  return {
    label: 'Preferences',
    accelerator: 'CmdOrCtrl+,',
    click: () => {
      webContentsBroadcast('userPreferencesOpenRequested', undefined);
    },
  };
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
  const { stateRepository, channelFileService } = await createChannelFileDependencies();
  const saveChannelFilePath = new (
    await import('@main/channel-file/application/use-cases/SaveChannelFilePath')
  ).SaveChannelFilePath(stateRepository, channelFileService);
  try {
    await saveChannelFilePath.run(path);
  } catch {
    // file has invalid structure
  }
}

async function addPSSESOutFilePath(path: string): Promise<void> {
  const { stateRepository, psseOutFileService } = await createIngestionDependencies();
  const savePsseOutFilePath = new (
    await import('@main/channel-file/application/use-cases/IngestPsseOutFilePath')
  ).IngestPsseOutFilePath(stateRepository, psseOutFileService);

  await savePsseOutFilePath.run(path);
}

async function createChannelFileDependencies() {
  const { ChannelFileStructureChecker } = await import(
    '@main/channel-file/domain/services/ChannelFileStructureChecker'
  );
  const { NodeChannelFileService } = await import(
    '@main/channel-file/infrastructure/services/NodeChannelFileService'
  );
  const { ElectronStoreChannelFileStateRepository } = await import(
    '@main/channel-file/infrastructure/repositories/ElectronStoreChannelFileStateRepository'
  );

  const structureChecker = new ChannelFileStructureChecker();
  const channelFileService = new NodeChannelFileService(structureChecker);
  const stateRepository = new ElectronStoreChannelFileStateRepository(channelFileService);

  return { channelFileService, stateRepository };
}

async function createIngestionDependencies() {
  const { stateRepository } = await createChannelFileDependencies();
  const { NodePsseOutFileService } = await import(
    '@main/channel-file/infrastructure/services/NodePsseOutFileService'
  );

  const psseOutFileService = new NodePsseOutFileService();

  return { psseOutFileService, stateRepository };
}
