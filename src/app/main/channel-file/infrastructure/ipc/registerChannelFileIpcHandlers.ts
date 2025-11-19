import { ipcMainHandle } from '@main/shared/infrastructure/ipc/ipcMainHandle';

export function registerChannelFileIpcHandlers(): void {
  ipcMainHandle('getLastOpenedChannelFile', async () => {
    const { stateRepository } = await createChannelFileDependencies();
    const getLastOpenedChannelFile = new (
      await import('@main/channel-file/application/use-cases/GetLastOpenedChannelFile')
    ).GetLastOpenedChannelFile(stateRepository);
    return getLastOpenedChannelFile.run();
  });
  ipcMainHandle('getOpenedChannelFiles', async () => {
    const { stateRepository } = await createChannelFileDependencies();
    const getOpenedChannelFiles = new (
      await import('@main/channel-file/application/use-cases/GetOpenedChannelFiles')
    ).GetOpenedChannelFiles(stateRepository);
    return getOpenedChannelFiles.run();
  });
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
  const fileService = new NodeChannelFileService(structureChecker);
  const stateRepository = new ElectronStoreChannelFileStateRepository(fileService);

  return { fileService, stateRepository };
}
