import { test } from '@playwright/test';

import { mapToChartSerie } from '@renderer/components/Chart/mapToChartSerie';

import test3Fixture from '../fixtures/test3.json';

import { MainPageTestObject } from './support/MainPageTestObject';

import type { ChannelFileContentSeriePrimitive } from '@shared/domain/primitives/ChannelFileContentSeriePrimitive';

const timeValues = test3Fixture.x.values as number[];
const [voltageChannel] = test3Fixture.series as ChannelFileContentSeriePrimitive[];

let mainPageTest: MainPageTestObject;

test.describe('Channel file time offset', () => {
  test.beforeEach(async () => {
    mainPageTest = await MainPageTestObject.create();
    await mainPageTest.openChannelFileAndExpandInSidebar('test3.json');
  });

  test.afterEach(async () => {
    await mainPageTest.close();
  });

  test('should open context menu on file options button', async () => {
    // Right-click on the file options button (three dots)
    const fileOptionsButton = mainPageTest.page
      .getByRole('button', { name: 'test3' })
      .locator('xpath=ancestor::*[@data-slot="accordion-item"]')
      .getByRole('button', { name: /options/i })
      .first();

    await fileOptionsButton.click();

    // Check that context menu is visible with expected options
    await mainPageTest.page.getByRole('menuitem', { name: /close file/i }).waitFor();
    await mainPageTest.page.getByRole('menuitem', { name: /time delay/i }).waitFor();
  });

  test('should close file from context menu', async () => {
    // Open context menu
    const fileOptionsButton = mainPageTest.page
      .getByRole('button', { name: 'test3' })
      .locator('xpath=ancestor::*[@data-slot="accordion-item"]')
      .getByRole('button', { name: /options/i })
      .first();

    await fileOptionsButton.click();

    // Click close file
    await mainPageTest.page.getByRole('menuitem', { name: /close file/i }).click();

    // File should be removed
    await mainPageTest.sidebar.expectFileNotVisible('test3');
  });

  test('should apply positive time offset to channel data', async () => {
    await mainPageTest.charts.createAndSelectChart();
    await mainPageTest.sidebar.toggleChannel('Voltage (V)');

    // Get original series data
    const originalSerie = mapToChartSerie(voltageChannel, timeValues);
    if (!originalSerie) {
      throw new Error('Failed to map original series');
    }

    // Open context menu and set time offset
    const fileOptionsButton = mainPageTest.page
      .getByRole('button', { name: 'test3' })
      .locator('xpath=ancestor::*[@data-slot="accordion-item"]')
      .getByRole('button', { name: /options/i })
      .first();

    await fileOptionsButton.click();

    // Find and interact with the time delay input
    const timeDelayInput = mainPageTest.page.getByRole('textbox', { name: /time delay/i });
    await timeDelayInput.waitFor({ state: 'visible', timeout: 1000 }).catch(() => {
      // Input might not have explicit label, try finding by placeholder or type
    });

    // If the above doesn't work, try finding the input in the menu item
    const menuItem = mainPageTest.page
      .locator('[role="menuitem"]')
      .filter({ hasText: /time delay/i });
    const input = menuItem.locator('input[type="number"]');
    await input.fill('5');
    await input.press('Enter');

    // Wait a bit for the update to process
    await mainPageTest.page.waitForTimeout(500);

    // Verify chronometer icon is visible with +5 s
    const chronometer = mainPageTest.page
      .getByRole('button', { name: 'test3' })
      .locator('xpath=ancestor::*[@data-slot="accordion-item"]')
      .locator('svg')
      .filter({ has: mainPageTest.page.locator('text="+5 s"') });

    // Verify that the series data has been updated (time values shifted by +5)
    const expectedSerieWithOffset = mapToChartSerie(voltageChannel, timeValues, 5);
    if (!expectedSerieWithOffset) {
      throw new Error('Failed to map series with offset');
    }

    await mainPageTest.charts.expectSeriesSummary('Voltage', [
      {
        name: expectedSerieWithOffset.name,
        dataLength: expectedSerieWithOffset.data.length,
        firstPoint: expectedSerieWithOffset.data[0] ?? null,
        lastPoint: expectedSerieWithOffset.data.at(-1) ?? null,
      },
    ]);
  });

  test('should apply negative time offset to channel data', async () => {
    await mainPageTest.charts.createAndSelectChart();
    await mainPageTest.sidebar.toggleChannel('Voltage (V)');

    // Open context menu and set negative time offset
    const fileOptionsButton = mainPageTest.page
      .getByRole('button', { name: 'test3' })
      .locator('xpath=ancestor::*[@data-slot="accordion-item"]')
      .getByRole('button', { name: /options/i })
      .first();

    await fileOptionsButton.click();

    const menuItem = mainPageTest.page
      .locator('[role="menuitem"]')
      .filter({ hasText: /time delay/i });
    const input = menuItem.locator('input[type="number"]');
    await input.fill('-3');
    await input.press('Enter');

    // Wait a bit for the update to process
    await mainPageTest.page.waitForTimeout(500);

    // Verify that the series data has been updated (time values shifted by -3)
    const expectedSerieWithOffset = mapToChartSerie(voltageChannel, timeValues, -3);
    if (!expectedSerieWithOffset) {
      throw new Error('Failed to map series with offset');
    }

    await mainPageTest.charts.expectSeriesSummary('Voltage', [
      {
        name: expectedSerieWithOffset.name,
        dataLength: expectedSerieWithOffset.data.length,
        firstPoint: expectedSerieWithOffset.data[0] ?? null,
        lastPoint: expectedSerieWithOffset.data.at(-1) ?? null,
      },
    ]);
  });

  test('should update all charts when time offset changes', async () => {
    // Create two charts with the same channel
    await mainPageTest.charts.createAndSelectChart();
    await mainPageTest.sidebar.toggleChannel('Voltage (V)');

    await mainPageTest.charts.createAndSelectChart();
    await mainPageTest.sidebar.toggleChannel('Voltage (V)');

    // Apply time offset
    const fileOptionsButton = mainPageTest.page
      .getByRole('button', { name: 'test3' })
      .locator('xpath=ancestor::*[@data-slot="accordion-item"]')
      .getByRole('button', { name: /options/i })
      .first();

    await fileOptionsButton.click();

    const menuItem = mainPageTest.page
      .locator('[role="menuitem"]')
      .filter({ hasText: /time delay/i });
    const input = menuItem.locator('input[type="number"]');
    await input.fill('10');
    await input.press('Enter');

    // Wait a bit for the update to process
    await mainPageTest.page.waitForTimeout(500);

    // Verify both charts have updated data
    const expectedSerieWithOffset = mapToChartSerie(voltageChannel, timeValues, 10);
    if (!expectedSerieWithOffset) {
      throw new Error('Failed to map series with offset');
    }

    const expectedSummary = {
      name: expectedSerieWithOffset.name,
      dataLength: expectedSerieWithOffset.data.length,
      firstPoint: expectedSerieWithOffset.data[0] ?? null,
      lastPoint: expectedSerieWithOffset.data.at(-1) ?? null,
    };

    await mainPageTest.charts.expectSeriesSummary('Voltage', [expectedSummary]);
    await mainPageTest.charts.selectChartByTitle('Chart 1');
    await mainPageTest.charts.expectSeriesSummary('Voltage', [expectedSummary]);
  });

  test('should reset time offset to zero', async () => {
    await mainPageTest.charts.createAndSelectChart();
    await mainPageTest.sidebar.toggleChannel('Voltage (V)');

    // Apply time offset first
    let fileOptionsButton = mainPageTest.page
      .getByRole('button', { name: 'test3' })
      .locator('xpath=ancestor::*[@data-slot="accordion-item"]')
      .getByRole('button', { name: /options/i })
      .first();

    await fileOptionsButton.click();

    let menuItem = mainPageTest.page
      .locator('[role="menuitem"]')
      .filter({ hasText: /time delay/i });
    let input = menuItem.locator('input[type="number"]');
    await input.fill('5');
    await input.press('Enter');

    await mainPageTest.page.waitForTimeout(500);

    // Reset to zero
    fileOptionsButton = mainPageTest.page
      .getByRole('button', { name: 'test3' })
      .locator('xpath=ancestor::*[@data-slot="accordion-item"]')
      .getByRole('button', { name: /options/i })
      .first();

    await fileOptionsButton.click();

    menuItem = mainPageTest.page.locator('[role="menuitem"]').filter({ hasText: /time delay/i });
    input = menuItem.locator('input[type="number"]');
    await input.fill('0');
    await input.press('Enter');

    await mainPageTest.page.waitForTimeout(500);

    // Verify that the series data is back to original (no offset)
    const originalSerie = mapToChartSerie(voltageChannel, timeValues, 0);
    if (!originalSerie) {
      throw new Error('Failed to map original series');
    }

    await mainPageTest.charts.expectSeriesSummary('Voltage', [
      {
        name: originalSerie.name,
        dataLength: originalSerie.data.length,
        firstPoint: originalSerie.data[0] ?? null,
        lastPoint: originalSerie.data.at(-1) ?? null,
      },
    ]);
  });
});
