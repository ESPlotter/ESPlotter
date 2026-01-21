import { test } from '@playwright/test';

import { MainPageTestObject } from './support/MainPageTestObject';

let mainPageTest: MainPageTestObject;

test.describe('Import CSV/TXT files', () => {
  test.beforeEach(async () => {
    mainPageTest = await MainPageTestObject.create();
  });

  test.afterEach(async () => {
    await mainPageTest.close();
  });

  test('imports a valid TXT file (test1.txt) and renders channels', async () => {
    await mainPageTest.openFixtureViaImportMenu('test1.txt');

    await mainPageTest.sidebar.expectFileVisible('test1');
    await mainPageTest.sidebar.expandFile('test1');
    await mainPageTest.sidebar.expectChannelsVisible([
      'Voltage ()',
      'Active Power ()',
      'Reactive Power ()',
    ]);
  });

  test('imports a valid CSV file (test4.csv) and renders channels', async () => {
    await mainPageTest.openFixtureViaImportMenu('test4.csv');

    await mainPageTest.sidebar.expectFileVisible('test4');
    await mainPageTest.sidebar.expandFile('test4');
    await mainPageTest.sidebar.expectChannelsVisible([
      'Voltage ()',
      'Active Power ()',
      'Reactive Power ()',
    ]);
  });
});
