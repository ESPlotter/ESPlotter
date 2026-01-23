import { app, BrowserWindow, Menu, type MenuItemConstructorOptions } from 'electron';

import {
  channelFileRepository,
  jsonChannelFileGetterService,
  csvChannelFileGetterService,
  psseOutFilePreviewService,
} from '@main/channel-file/infrastructure/repositories/channelFileRepository';
import { webContentsBroadcast } from '@main/shared/infrastructure/ipc/webContentsBroadcast';
import { webContentsSend } from '@main/shared/infrastructure/ipc/webContentsSend';

export function registerMainMenu(): void {
  const isMac = process.platform === 'darwin';
  const template: MenuItemConstructorOptions[] = [
    ...(isMac ? [buildMacAppMenu()] : []),
    {
      label: 'File',
      submenu: [
        {
          label: 'Import',
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
        {
          label: 'Open File (.out)',
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
  const { canceled, filePaths } = await dialog.showOpenDialog(win, { properties: ['openFile'] });
  if (canceled) return null;
  return filePaths[0] ?? null;
}

async function openChannelFile(win: BrowserWindow, path: string): Promise<void> {
  webContentsSend(win, 'channelFileOpenStarted', { path });
  const openChannelFile = new (
    await import('@main/channel-file/application/use-cases/OpenChannelFile')
  ).OpenChannelFile(
    channelFileRepository,
    jsonChannelFileGetterService,
    csvChannelFileGetterService,
    psseOutFilePreviewService,
  );

  try {
    const preview = await openChannelFile.run(path);
    webContentsSend(win, 'channelFileOpened', preview);
  } catch {
    // file has invalid structure
    webContentsSend(win, 'channelFileOpenFailed', { path });
  }
}
