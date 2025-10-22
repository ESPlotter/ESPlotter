import { expect, test, type ElectronApplication, type Page } from '@playwright/test';

import { createChart } from './support/createChart';
import { setupE2eTestEnvironment } from './support/setupE2eTestEnvironment';

let electronApp: ElectronApplication;
let mainPage: Page;

test.describe('Chart rename', () => {
  test.beforeEach(async () => {
    ({ electronApp, mainPage } = await setupE2eTestEnvironment());
  });

  test.afterEach(async () => {
    await electronApp.close();
  });

  test('allows renaming a chart from its title', async () => {
    const defaultTitle = await createChart(mainPage);
    const newName = 'Custom chart name';

    await expect(mainPage.getByRole('button', { name: defaultTitle })).toBeVisible();

    await mainPage.getByRole('button', { name: defaultTitle }).click();

    const input = mainPage.getByRole('textbox', { name: 'Chart name' });
    await input.fill(newName);
    await input.press('Enter');

    await expect(mainPage.getByRole('button', { name: newName })).toBeVisible();
  });

  test('cancels title changes when pressing Escape', async () => {
    const defaultTitle = await createChart(mainPage);

    await mainPage.getByRole('button', { name: defaultTitle }).click();

    const input = mainPage.getByRole('textbox', { name: 'Chart name' });
    await input.fill('Temporary name');
    await input.press('Escape');

    await expect(mainPage.getByRole('button', { name: defaultTitle })).toBeVisible();
  });
});
