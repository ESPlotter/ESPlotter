import { test, type ElectronApplication, type Page } from '@playwright/test';

import { MainPageTestObject } from './support/MainPageTestObject';
import { setupE2eTestEnvironment } from './support/setupE2eTestEnvironment';

let electronApp: ElectronApplication;
let mainPage: Page;
let mainPageTest: MainPageTestObject;

test.describe('Import flow', () => {
  test.beforeEach(async () => {
    ({ electronApp, mainPage } = await setupE2eTestEnvironment());
    mainPageTest = new MainPageTestObject(electronApp, mainPage);
  });

  test.afterEach(async () => {
    await electronApp.close();
  });

  test('imports a valid file (test3.json)', async () => {
    await mainPageTest.openFixtureViaImportMenu('test3.json');
    await mainPageTest.sidebar.expectFileVisible('test3');
  });

  test('assigns shortcut only to Open File (.out)', async () => {
    await mainPageTest.menu.expectMenuItemWithoutAccelerator(['File', 'Import']);
    await mainPageTest.menu.expectMenuItemAccelerator(['File', 'Open File (.out)'], 'CmdOrCtrl+O');
  });

  test('fails to open invalid format (test1.json)', async () => {
    await mainPageTest.attemptImportFixture('test1.json');
    await mainPageTest.sidebar.expectFileNotVisible('test3');
  });

  test('fails to open not found path', async () => {
    await mainPageTest.attemptImportFixture('does-not-exist.json');
    await mainPageTest.sidebar.expectFileNotVisible('test3');
  });
});
