import fs from 'node:fs/promises';
import path from 'node:path';

import { expect, test, type ElectronApplication, type Page } from '@playwright/test';

import { setupE2eTestEnvironment } from './support/setupE2eTestEnvironment';
import { triggerPreferencesMenu } from './support/triggerPreferencesMenu';

test.describe('Dyntools path preferences', () => {
  let electronApp: ElectronApplication;
  let mainPage: Page;

  test.beforeEach(async () => {
    ({ electronApp, mainPage } = await setupE2eTestEnvironment());
  });

  test.afterEach(async () => {
    await electronApp.close();
  });

  test('persists dyntools and python path updates to the state file', async () => {
    await triggerPreferencesMenu(electronApp, mainPage);

    const dyntoolsInput = mainPage.getByLabel('DynTools path');
    const pythonInput = mainPage.getByLabel('Python path');
    const newDyntoolsPath = 'D:\\PSSE\\PSSPY313';
    const newPythonPath = 'C:\\Python311\\python.exe';
    await dyntoolsInput.fill(newDyntoolsPath);
    await mainPage.getByRole('button', { name: 'Save' }).first().click();
    await pythonInput.fill(newPythonPath);
    await mainPage.getByRole('button', { name: 'Save' }).nth(1).click();

    const stateDir = process.env.ESPLOTTER_STATE_CWD;
    if (!stateDir) {
      throw new Error('ESPLOTTER_STATE_CWD is not set');
    }

    const stateFile = path.join(stateDir, 'settings.json');

    await expect
      .poll(async () => {
        const contents = await fs.readFile(stateFile, 'utf-8');
        const parsed = JSON.parse(contents) as {
          general?: { paths?: { dyntoolsPath?: string; pythonPath?: string } };
        };
        return {
          dyntoolsPath: parsed.general?.paths?.dyntoolsPath,
          pythonPath: parsed.general?.paths?.pythonPath,
        };
      })
      .toEqual({
        dyntoolsPath: newDyntoolsPath,
        pythonPath: newPythonPath,
      });
  });
});
