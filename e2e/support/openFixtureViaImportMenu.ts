import { type ElectronApplication, type Page } from '@playwright/test';

import { setNextOpenFixturePath } from './setNextOpenFixturePath';
import { triggerImportMenu } from './triggerImportMenu';
import { waitForLastOpenedChannelFileChanged } from './waitForLastOpenedChannelFileChanged';

export async function openFixtureViaImportMenu(
  app: ElectronApplication,
  page: Page,
  fixtureName: string,
): Promise<void> {
  await setNextOpenFixturePath(app, fixtureName);

  const parsedPromise = waitForLastOpenedChannelFileChanged(page);
  await triggerImportMenu(app, page);
  await parsedPromise;
}
