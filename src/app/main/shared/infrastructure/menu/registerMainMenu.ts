import { BrowserWindow, Menu, type MenuItemConstructorOptions } from 'electron';

import { webContentsSend } from '@main/shared/infrastructure/ipc/webContentsSend';

export function registerMainMenu(): void {
  const template: MenuItemConstructorOptions[] = [
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
            await openPsseOutFile(win, selected);
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
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
  const { channelFileService } = await createChannelFileDependencies();
  const openChannelFile = new (
    await import('@main/channel-file/application/use-cases/OpenChannelFile')
  ).OpenChannelFile(channelFileService);

  try {
    const channelFile = await openChannelFile.run(path);
    webContentsSend(win, 'channelFileOpened', channelFile);
  } catch {
    // file has invalid structure
  }
}

async function openPsseOutFile(win: BrowserWindow, path: string): Promise<void> {
  const { psseOutFileService } = await createIngestionDependencies();
  const readPsseOutFilePath = new (
    await import('@main/channel-file/application/use-cases/ReadPsseOutFilePath')
  ).ReadPsseOutFilePath(psseOutFileService);

  try {
    const channelFile = await readPsseOutFilePath.run(path);
    webContentsSend(win, 'channelFileOpened', channelFile);
  } catch {
    // file has invalid structure or parsing failed
  }
}

async function createChannelFileDependencies() {
  const { ChannelFileStructureChecker } = await import(
    '@main/channel-file/domain/services/ChannelFileStructureChecker'
  );
  const { NodeChannelFileService } = await import(
    '@main/channel-file/infrastructure/services/NodeChannelFileService'
  );

  const structureChecker = new ChannelFileStructureChecker();
  const channelFileService = new NodeChannelFileService(structureChecker);

  return { channelFileService };
}

async function createIngestionDependencies() {
  const { NodePsseOutFileService } = await import(
    '@main/channel-file/infrastructure/services/NodePsseOutFileService'
  );

  const psseOutFileService = new NodePsseOutFileService();

  return { psseOutFileService };
}
