import { test } from '@playwright/test';

import { MainPageTestObject } from './support/MainPageTestObject';

let mainPageTest: MainPageTestObject;

test.describe('Open file flow', () => {
  test.beforeEach(async () => {
    mainPageTest = await MainPageTestObject.create();
  });

  test.afterEach(async () => {
    await mainPageTest.close();
  });

  test('opens a valid file (test3.json)', async () => {
    await mainPageTest.openChannelFile('test3.json');
    await mainPageTest.sidebar.expectFileVisible('test3');
  });

  test('shows a loading spinner while opening a file', async () => {
    const fixtureName = 'test1.txt';
    const fileLabel = 'test1';

    await mainPageTest.prepareNextOpenFixturePath(fixtureName);

    const spinnerPromise = mainPageTest.sidebar.waitForFileSpinner(fileLabel);
    const openStartedPromise = mainPageTest.waitForChannelFileOpenStarted();
    const openCompletedPromise = mainPageTest.waitForChannelFileOpened();

    await mainPageTest.menu.openFileMenu();
    await openStartedPromise;
    await spinnerPromise;
    await openCompletedPromise;
    await mainPageTest.sidebar.expectFileSpinnerHidden(fileLabel);
  });

  test('assigns shortcut to Open File', async () => {
    await mainPageTest.menu.expectMenuItemAccelerator(['File', 'Open File'], 'CmdOrCtrl+O');
  });

  test('fails to open invalid format (test1.json)', async () => {
    await mainPageTest.attemptOpenFixture('test1.json');
    await mainPageTest.sidebar.expectFileNotVisible('test1');
  });

  test('fails to open not found path', async () => {
    await mainPageTest.attemptOpenFixture('does-not-exist.json');
    await mainPageTest.sidebar.expectFileNotVisible('does-not-exist');
  });
});
