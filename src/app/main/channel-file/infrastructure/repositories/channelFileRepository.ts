import { ChannelFileStructureChecker } from '@main/channel-file/domain/services/ChannelFileStructureChecker';
import { NodeCsvChannelFileParserService } from '@main/channel-file/infrastructure/services/NodeCsvChannelFileParserService';
import { NodeOutChannelFileParserService } from '@main/channel-file/infrastructure/services/NodeOutChannelFileParserService';
import { GetUserPreferences } from '@main/user-preferences/application/use-cases/GetUserPreferences';
import { ElectronStoreUserPreferencesRepository } from '@main/user-preferences/infrastructure/repositories/ElectronStoreUserPreferencesRepository';
import { ElectronStoreStateRepository } from '@shared/infrastructure/repositories/ElectronStoreStateRepository';

import { NodeJsonChannelFileParserService } from '../services/NodeJsonChannelFileParserService';

import { FileChannelFileRepository } from './FileChannelFileRepository';

const structureChecker = new ChannelFileStructureChecker();
const jsonChannelFileGetterService = new NodeJsonChannelFileParserService(structureChecker);
const csvChannelFileGetterService = new NodeCsvChannelFileParserService();

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
export const psseOutFilePreviewService = new NodeOutChannelFileParserService(resolveOutFilePaths);
export { jsonChannelFileGetterService, csvChannelFileGetterService };
