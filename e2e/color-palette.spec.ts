import { test, type ElectronApplication, type Page } from '@playwright/test';

import { MainPageTestObject } from './support/MainPageTestObject';
import { setupE2eTestEnvironment } from './support/setupE2eTestEnvironment';

let electronApp: ElectronApplication;
let mainPage: Page;
let mainPageTest: MainPageTestObject;

test.describe('Color palette', () => {
  test.beforeEach(async () => {
    ({ electronApp, mainPage } = await setupE2eTestEnvironment());
    mainPageTest = new MainPageTestObject(electronApp, mainPage);
  });

  test.afterEach(async () => {
    await electronApp.close();
  });

  test('creates a new color in the palette', async () => {
    await mainPageTest.preferences.openColorPalette();
    const color = '#00ffff';
    const index = await mainPageTest.preferences.createColor(color);
    await mainPageTest.preferences.expectColorVisible(index, color);
  });

  test('changes an existing color value', async () => {
    await mainPageTest.preferences.openColorPalette();
    const index = await mainPageTest.preferences.createColor('#ff0000');

    const newColor = '#00ffff';
    await mainPageTest.preferences.updateColor(index, newColor);
    await mainPageTest.preferences.expectColorTextVisible(newColor);
  });

  test('removes a color from the palette', async () => {
    await mainPageTest.preferences.openColorPalette();
    const color = '#ffa500';
    const index = await mainPageTest.preferences.createColor(color);

    await mainPageTest.preferences.removeColor(index);
    await mainPageTest.preferences.expectColorTextNotVisible(color);
  });
});
