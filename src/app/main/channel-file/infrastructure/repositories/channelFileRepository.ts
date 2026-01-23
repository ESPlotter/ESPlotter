import { ChannelFileStructureChecker } from '@main/channel-file/domain/services/ChannelFileStructureChecker';
import { NodeCsvChannelFileGetterService } from '@main/channel-file/infrastructure/services/NodeCsvChannelFileGetterService';
import { NodePsseOutFilePreviewService } from '@main/channel-file/infrastructure/services/NodePsseOutFilePreviewService';
import { GetUserPreferences } from '@main/user-preferences/application/use-cases/GetUserPreferences';
import { ElectronStoreUserPreferencesRepository } from '@main/user-preferences/infrastructure/repositories/ElectronStoreUserPreferencesRepository';
import { ElectronStoreStateRepository } from '@shared/infrastructure/repositories/ElectronStoreStateRepository';

import { NodeJsonChannelFileGetterService } from '../services/NodeJsonChannelFileGetterService';

import { FileChannelFileRepository } from './FileChannelFileRepository';

const structureChecker = new ChannelFileStructureChecker();
const jsonChannelFileGetterService = new NodeJsonChannelFileGetterService(structureChecker);
const csvChannelFileGetterService = new NodeCsvChannelFileGetterService();

const userPreferencesRepository = new ElectronStoreUserPreferencesRepository();
const getUserPreferences = new GetUserPreferences(userPreferencesRepository);
const stateRepository = new ElectronStoreStateRepository();

async function resolveOutFilePaths() {
  const preferences = await getUserPreferences.run();

  return {
    dyntoolsPath: preferences.general.paths.dyntoolsPath,
    pythonPath: preferences.general.paths.pythonPath,
  };
}

export const channelFileRepository = new FileChannelFileRepository(stateRepository);
export const psseOutFilePreviewService = new NodePsseOutFilePreviewService(resolveOutFilePaths);
export { jsonChannelFileGetterService, csvChannelFileGetterService };
