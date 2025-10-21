import { ipcMainHandle } from '@main/shared/ipc/ipcMainHandle';

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
