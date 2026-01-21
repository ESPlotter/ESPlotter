import { test } from '@playwright/test';

import { MainPageTestObject } from './support/MainPageTestObject';

test.describe('Dyntools path preferences', () => {
  let mainPageTest: MainPageTestObject;

  test.beforeEach(async () => {
    mainPageTest = await MainPageTestObject.create();
  });

  test.afterEach(async () => {
    await mainPageTest.close();
  });

  test('persists dyntools and python path updates to the state file', async () => {
    const newDyntoolsPath = 'D:\\PSSE\\PSSPY313';
    const newPythonPath = 'C:\\Python311\\python.exe';

    await mainPageTest.preferences.open();
    await mainPageTest.preferences.updatePaths(newDyntoolsPath, newPythonPath);
    await mainPageTest.preferences.expectPersistedPaths(newDyntoolsPath, newPythonPath);
  });
});
