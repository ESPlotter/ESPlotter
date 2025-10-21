import { app } from 'electron';

import { webContentsBroadcast } from '@main/shared/ipc/webContentsBroadcast';

export async function registerChannelFileObservers(): Promise<void> {
  const { stateRepository } = await createChannelFileDependencies();

  const offLast = stateRepository.onLastOpenedChannelFileChange(async (file) => {
    if (!file) {
      return;
    }

    webContentsBroadcast('lastOpenedChannelFileChanged', file.toPrimitives());
  });

  app.on('will-quit', () => {
    try {
      offLast();
    } catch {}
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
