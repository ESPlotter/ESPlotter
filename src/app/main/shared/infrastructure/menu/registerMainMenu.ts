import { app, BrowserWindow, Menu, type MenuItemConstructorOptions } from 'electron';

import { ChannelFileStructureChecker } from '@main/channel-file/domain/services/ChannelFileStructureChecker';
import { FileChannelFileRepository } from '@main/channel-file/infrastructure/repositories/FileChannelFileRepository';
import { NodeCsvChannelFileParserService } from '@main/channel-file/infrastructure/services/NodeCsvChannelFileParserService';
import { NodeJsonChannelFileParserService } from '@main/channel-file/infrastructure/services/NodeJsonChannelFileParserService';
import { NodeOutChannelFileParserService } from '@main/channel-file/infrastructure/services/NodeOutChannelFileParserService';
import { webContentsBroadcast } from '@main/shared/infrastructure/ipc/webContentsBroadcast';
import { webContentsSend } from '@main/shared/infrastructure/ipc/webContentsSend';
import { GetUserPreferences } from '@main/user-preferences/application/use-cases/GetUserPreferences';
import { ElectronStoreUserPreferencesRepository } from '@main/user-preferences/infrastructure/repositories/ElectronStoreUserPreferencesRepository';
import { ElectronStoreStateRepository } from '@shared/infrastructure/repositories/ElectronStoreStateRepository';

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
            await openChannelFile(win, selected);
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
  if (process.env.CI && process.env.ESPLOTTER_E2E_OPEN_PATH) {
    return process.env.ESPLOTTER_E2E_OPEN_PATH;
  }

  const { dialog } = await import('electron');
  const { canceled, filePaths } = await dialog.showOpenDialog(win, {
    properties: ['openFile'],
    filters: [{ name: 'Channel files', extensions: ['txt', 'json', 'csv', 'out'] }],
  });
  if (canceled) return null;
  return filePaths[0] ?? null;
}

async function openChannelFile(win: BrowserWindow, path: string): Promise<void> {
  webContentsSend(win, 'channelFileOpenStarted', { path });
  const extension = path.toLowerCase().split('.').pop();
  const stateRepository = new ElectronStoreStateRepository();
  const channelFileRepository = new FileChannelFileRepository(stateRepository);
  const outChannelFileParserService =
    extension === 'out' ? await createOutChannelFileParserService() : undefined;
  const openChannelFile = new (
    await import('@main/channel-file/application/use-cases/OpenChannelFile')
  ).OpenChannelFile(
    channelFileRepository,
    new NodeJsonChannelFileParserService(new ChannelFileStructureChecker()),
    new NodeCsvChannelFileParserService(),
    outChannelFileParserService,
  );

  try {
    const preview = await openChannelFile.run(path);
    webContentsSend(win, 'channelFileOpened', preview);
  } catch {
    // file has invalid structure
    webContentsSend(win, 'channelFileOpenFailed', { path });
  }
}

async function createOutChannelFileParserService(): Promise<NodeOutChannelFileParserService> {
  const userPreferencesRepository = new ElectronStoreUserPreferencesRepository();
  const getUserPreferences = new GetUserPreferences(userPreferencesRepository);
  const preferences = await getUserPreferences.run();

  return new NodeOutChannelFileParserService(preferences.general.paths);
}
