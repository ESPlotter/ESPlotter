import { test, type ElectronApplication, type Page } from '@playwright/test';

import { MainPageTestObject } from './support/MainPageTestObject';
import { setupE2eTestEnvironment } from './support/setupE2eTestEnvironment';

test.describe('Dyntools path preferences', () => {
  let electronApp: ElectronApplication;
  let mainPage: Page;
  let mainPageTest: MainPageTestObject;

  test.beforeEach(async () => {
    ({ electronApp, mainPage } = await setupE2eTestEnvironment());
    mainPageTest = new MainPageTestObject(electronApp, mainPage);
  });

  test.afterEach(async () => {
    await electronApp.close();
  });

  test('persists dyntools and python path updates to the state file', async () => {
    const newDyntoolsPath = 'D:\\PSSE\\PSSPY313';
    const newPythonPath = 'C:\\Python311\\python.exe';

    await mainPageTest.preferences.open();
    await mainPageTest.preferences.updatePaths(newDyntoolsPath, newPythonPath);
    await mainPageTest.preferences.expectPersistedPaths(newDyntoolsPath, newPythonPath);
  });
});
