import { app } from 'electron';

import { webContentsBroadcast } from '@main/shared/infrastructure/ipc/webContentsBroadcast';

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
