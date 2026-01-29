import { expect, test } from '@playwright/test';

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
    await mainPageTest.sidebar.openFileOptionsMenu('test3');
    await expect(mainPageTest.mainPage.getByRole('menuitem', { name: 'Close file' })).toBeVisible();
    await expect(
      mainPageTest.mainPage.getByRole('spinbutton', { name: 'Time delay' }),
    ).toBeVisible();
  });

  test('should close file from context menu', async () => {
    await mainPageTest.sidebar.closeChannelFile('test3');

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

    await mainPageTest.sidebar.setChannelFileTimeOffset('test3', 5);
    await mainPageTest.sidebar.expectFileTriggerContainsText('test3', '+5 s');

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

    await mainPageTest.sidebar.setChannelFileTimeOffset('test3', -3);
    await mainPageTest.sidebar.expectFileTriggerContainsText('test3', '-3 s');

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
    const chartA = await mainPageTest.charts.createAndSelectChart();
    await mainPageTest.charts.renameChartTitle(chartA, 'Chart A');
    await mainPageTest.sidebar.toggleChannel('Voltage (V)');

    const chartB = await mainPageTest.charts.createAndSelectChart();
    await mainPageTest.charts.renameChartTitle(chartB, 'Chart B');
    await mainPageTest.sidebar.toggleChannel('Voltage (V)');

    // Apply time offset
    await mainPageTest.sidebar.setChannelFileTimeOffset('test3', 10);
    await mainPageTest.sidebar.expectFileTriggerContainsText('test3', '+10 s');

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

    await mainPageTest.charts.expectSeriesSummary('Chart B', [expectedSummary]);
    await mainPageTest.charts.selectChartByTitle('Chart A');
    await mainPageTest.charts.expectSeriesSummary('Chart A', [expectedSummary]);
  });

  test('should reset time offset to zero', async () => {
    await mainPageTest.charts.createAndSelectChart();
    await mainPageTest.sidebar.toggleChannel('Voltage (V)');

    // Apply time offset first
    await mainPageTest.sidebar.setChannelFileTimeOffset('test3', 5);
    await mainPageTest.sidebar.expectFileTriggerContainsText('test3', '+5 s');

    // Reset to zero
    await mainPageTest.sidebar.setChannelFileTimeOffset('test3', 0);
    await mainPageTest.sidebar.expectFileTriggerNotContainsText('test3', /[+-]\d+(?:\.\d+)?\s*s/);

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
