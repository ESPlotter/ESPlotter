import { expect, test, type ElectronApplication, type Page } from '@playwright/test';

import { setupE2eTestEnvironment } from './support/setupE2eTestEnvironment';
import { triggerPreferencesMenu } from './support/triggerPreferencesMenu';

let electronApp: ElectronApplication;
let mainPage: Page;

// Use the Preferences menu and the actual component labels (British spelling)
async function openColorPalette(page: Page, app: ElectronApplication) {
  await triggerPreferencesMenu(app, page);
  await expect(page.getByRole('button', { name: 'Add colour' })).toBeVisible();
}

async function createColor(page: Page): Promise<{ index: number; color: string | null }> {
  const items = page.locator('button[aria-label^="Edit colour"]');
  const before = await items.count();

  await page.getByRole('button', { name: 'Add colour' }).click();

  await expect(items).toHaveCount(before + 1);

  const newIndex = before;
  const editButton = page.getByRole('button', { name: `Edit colour ${newIndex + 1}` });
  await expect(editButton).toBeVisible();
  const span = editButton.locator('span');
  const colorText = (await span.textContent())?.trim() ?? null;
  return { index: newIndex, color: colorText };
}

test.describe('Color palette', () => {
  test.beforeEach(async () => {
    ({ electronApp, mainPage } = await setupE2eTestEnvironment());
  });

  test.afterEach(async () => {
    await electronApp.close();
  });

  test('creates a new color in the palette', async () => {
    await openColorPalette(mainPage, electronApp);
    const { index, color } = await createColor(mainPage);
    await expect(mainPage.getByRole('button', { name: `Edit colour ${index + 1}` })).toBeVisible();
    if (color) await expect(mainPage.getByText(color)).toBeVisible();
  });

  test('changes an existing color value', async () => {
    await openColorPalette(mainPage, electronApp);
    const { index } = await createColor(mainPage);

    // update via preload API for reliability in e2e
    const newHex = '#00ffff';
    await mainPage.evaluate(
      ({ idx, hex }) =>
        window.userPreferences.getChartSeriesPalette().then((palette: string[]) => {
          palette[idx] = hex;
          return window.userPreferences.updateChartSeriesPalette(palette);
        }),
      { idx: index, hex: newHex },
    );

    await expect(mainPage.getByText(newHex)).toBeVisible();
  });

  test('removes a color from the palette', async () => {
    await openColorPalette(mainPage, electronApp);
    const { index, color } = await createColor(mainPage);

    await mainPage.evaluate((idx) => {
      const edits = Array.from(document.querySelectorAll('button[aria-label^="Edit colour"]'));
      const edit = edits[idx];
      if (!edit) throw new Error('Edit button not found');
      const container = edit.closest('div');
      const remove = container?.querySelector('button[aria-label="Remove colour"]') as HTMLElement | null;
      if (!remove) throw new Error('Remove button not found');
      remove.click();
    }, index);

    if (color) await expect(mainPage.getByText(color)).toHaveCount(0);
  });
});
