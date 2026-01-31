import { expect, test } from '@playwright/test';

import { mapToChartSerie } from '@renderer/components/Chart/mapToChartSerie';

import test3Fixture from '../fixtures/test3.json';

import { MainPageTestObject } from './support/MainPageTestObject';

import type { ChannelFileContentSeriePrimitive } from '@shared/domain/primitives/ChannelFileContentSeriePrimitive';

const timeValues = test3Fixture.x.values as number[];
const [voltageChannel] = test3Fixture.series as ChannelFileContentSeriePrimitive[];

let mainPageTest: MainPageTestObject;

test.describe('Channel file gains', () => {
  test.beforeEach(async () => {
    mainPageTest = await MainPageTestObject.create();
    await mainPageTest.openChannelFileAndExpandInSidebar('test3.json');
  });

  test.afterEach(async () => {
    await mainPageTest.close();
  });

  test('should open channel context menu', async () => {
    await mainPageTest.sidebar.openChannelContextMenu('Voltage (V)');
    await expect(mainPageTest.mainPage.getByRole('spinbutton', { name: 'Gain' })).toBeVisible();
  });

  test('should apply gain to channel data', async () => {
    await mainPageTest.charts.createAndSelectChart();
    await mainPageTest.sidebar.toggleChannel('Voltage (V)');

    const expectedSerieWithGain = mapToChartSerie(voltageChannel, timeValues, 0, 2);
    if (!expectedSerieWithGain) {
      throw new Error('Failed to map series with gain');
    }

    await mainPageTest.sidebar.setChannelGain('Voltage (V)', 2);

    await mainPageTest.charts.expectSeriesSummary('Voltage', [
      {
        name: expectedSerieWithGain.name,
        dataLength: expectedSerieWithGain.data.length,
        firstPoint: expectedSerieWithGain.data[0] ?? null,
        lastPoint: expectedSerieWithGain.data.at(-1) ?? null,
      },
    ]);
  });

  test('should update all charts when gain changes', async () => {
    const chartA = await mainPageTest.charts.createAndSelectChart();
    await mainPageTest.charts.renameChartTitle(chartA, 'Chart A');
    await mainPageTest.sidebar.toggleChannel('Voltage (V)');

    const chartB = await mainPageTest.charts.createAndSelectChart();
    await mainPageTest.charts.renameChartTitle(chartB, 'Chart B');
    await mainPageTest.sidebar.toggleChannel('Voltage (V)');

    const expectedSerieWithGain = mapToChartSerie(voltageChannel, timeValues, 0, 1.5);
    if (!expectedSerieWithGain) {
      throw new Error('Failed to map series with gain');
    }

    await mainPageTest.sidebar.setChannelGain('Voltage (V)', 1.5);

    const expectedSummary = {
      name: expectedSerieWithGain.name,
      dataLength: expectedSerieWithGain.data.length,
      firstPoint: expectedSerieWithGain.data[0] ?? null,
      lastPoint: expectedSerieWithGain.data.at(-1) ?? null,
    };

    await mainPageTest.charts.expectSeriesSummary('Chart B', [expectedSummary]);
    await mainPageTest.charts.selectChartByTitle('Chart A');
    await mainPageTest.charts.expectSeriesSummary('Chart A', [expectedSummary]);
  });

  test('should reset gain to 1', async () => {
    await mainPageTest.charts.createAndSelectChart();
    await mainPageTest.sidebar.toggleChannel('Voltage (V)');

    await mainPageTest.sidebar.setChannelGain('Voltage (V)', 2);
    await mainPageTest.sidebar.setChannelGain('Voltage (V)', 1);

    const originalSerie = mapToChartSerie(voltageChannel, timeValues);
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

  test('should apply channel offset', async () => {
    await mainPageTest.charts.createAndSelectChart();
    await mainPageTest.sidebar.toggleChannel('Voltage (V)');

    const expectedSerieWithOffset = mapToChartSerie(voltageChannel, timeValues, 0, 1, 10);
    if (!expectedSerieWithOffset) {
      throw new Error('Failed to map series with offset');
    }

    await mainPageTest.sidebar.setChannelOffset('Voltage (V)', 10);

    await mainPageTest.charts.expectSeriesSummary('Voltage', [
      {
        name: expectedSerieWithOffset.name,
        dataLength: expectedSerieWithOffset.data.length,
        firstPoint: expectedSerieWithOffset.data[0] ?? null,
        lastPoint: expectedSerieWithOffset.data.at(-1) ?? null,
      },
    ]);
  });

  test('should apply both gain and offset to channel data', async () => {
    await mainPageTest.charts.createAndSelectChart();
    await mainPageTest.sidebar.toggleChannel('Voltage (V)');

    const expectedSerieWithBoth = mapToChartSerie(voltageChannel, timeValues, 0, 2, 5);
    if (!expectedSerieWithBoth) {
      throw new Error('Failed to map series with both gain and offset');
    }

    await mainPageTest.sidebar.setChannelGain('Voltage (V)', 2);
    await mainPageTest.sidebar.setChannelOffset('Voltage (V)', 5);

    await mainPageTest.charts.expectSeriesSummary('Voltage', [
      {
        name: expectedSerieWithBoth.name,
        dataLength: expectedSerieWithBoth.data.length,
        firstPoint: expectedSerieWithBoth.data[0] ?? null,
        lastPoint: expectedSerieWithBoth.data.at(-1) ?? null,
      },
    ]);
  });

  test('should reset offset to 0', async () => {
    await mainPageTest.charts.createAndSelectChart();
    await mainPageTest.sidebar.toggleChannel('Voltage (V)');

    await mainPageTest.sidebar.setChannelOffset('Voltage (V)', 10);
    await mainPageTest.sidebar.setChannelOffset('Voltage (V)', 0);

    const originalSerie = mapToChartSerie(voltageChannel, timeValues);
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

