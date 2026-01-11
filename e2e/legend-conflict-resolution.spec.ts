import { test, expect, type ElectronApplication, type Page } from '@playwright/test';

import { clickSidebarChannel } from './support/clickSidebarChannel';
import { createAndSelectChart } from './support/createAndSelectChart';
import { getRenderedSeriesSummary } from './support/getRenderedSeriesSummary';
import { openFixtureAndExpandInSidebar } from './support/openFixtureAndExpandInSidebar';
import { setupE2eTestEnvironment } from './support/setupE2eTestEnvironment';

let electronApp: ElectronApplication;
let mainPage: Page;

test.describe('Legend names with conflicts from different tests', () => {
  test.beforeEach(async () => {
    ({ electronApp, mainPage } = await setupE2eTestEnvironment());
  });

  test.afterEach(async () => {
    await electronApp.close();
  });

  test('shows channel names without test names when no conflicts exist', async () => {
    await openFixtureAndExpandInSidebar(electronApp, mainPage, 'test2.json', 'test2');
    await createAndSelectChart(mainPage);

    // Add Voltage from test2
    await clickSidebarChannel(mainPage, 'Voltage (V)');
    
    // Add Frequency from test2
    await clickSidebarChannel(mainPage, 'Frequency (Hz)');

    const series = await getRenderedSeriesSummary(mainPage, 'Voltage');
    
    // Should show base names without test names since all from same test
    expect(series).toHaveLength(2);
    expect(series.map(s => s.name).sort()).toEqual(['Frequency', 'Voltage']);
  });

  test('appends test names when same channel from different tests are added', async () => {
    // Open test2
    await openFixtureAndExpandInSidebar(electronApp, mainPage, 'test2.json', 'test2');
    
    // Open test3
    await openFixtureAndExpandInSidebar(electronApp, mainPage, 'test3.json', 'test3');
    
    await createAndSelectChart(mainPage);

    // Add Voltage from test2
    await clickSidebarChannel(mainPage, 'Voltage (V)');
    
    // At this point, only one Voltage, should not have test name
    let series = await getRenderedSeriesSummary(mainPage, 'Voltage');
    expect(series).toHaveLength(1);
    expect(series[0].name).toBe('Voltage');

    // Add Voltage from test3 - this creates a conflict
    await clickSidebarChannel(mainPage, 'Voltage (V)');
    
    // Now both Voltage series should have test names appended
    series = await getRenderedSeriesSummary(mainPage, 'Voltage');
    expect(series).toHaveLength(2);
    expect(series.map(s => s.name).sort()).toEqual(['Voltage (test2)', 'Voltage (test3)']);
  });

  test('handles mixed scenario: some conflicts, some unique channels', async () => {
    // Open test2
    await openFixtureAndExpandInSidebar(electronApp, mainPage, 'test2.json', 'test2');
    
    // Open test3
    await openFixtureAndExpandInSidebar(electronApp, mainPage, 'test3.json', 'test3');
    
    await createAndSelectChart(mainPage);

    // Add Voltage from test2
    await clickSidebarChannel(mainPage, 'Voltage (V)');
    
    // Add Voltage from test3 - creates conflict
    await clickSidebarChannel(mainPage, 'Voltage (V)');
    
    // Add Frequency from test2 - no conflict (only one Frequency)
    await clickSidebarChannel(mainPage, 'Frequency (Hz)');

    const series = await getRenderedSeriesSummary(mainPage, 'Voltage');
    expect(series).toHaveLength(3);
    
    const names = series.map(s => s.name).sort();
    // Voltage channels have conflicts, so they get test names
    // Frequency is unique, so it doesn't get test name
    expect(names).toEqual(['Frequency', 'Voltage (test2)', 'Voltage (test3)']);
  });

  test('handles conflicts with both Voltage and Frequency from two tests', async () => {
    // Open test2
    await openFixtureAndExpandInSidebar(electronApp, mainPage, 'test2.json', 'test2');
    
    // Open test3
    await openFixtureAndExpandInSidebar(electronApp, mainPage, 'test3.json', 'test3');
    
    await createAndSelectChart(mainPage);

    // Add all channels from both tests
    await clickSidebarChannel(mainPage, 'Voltage (V)'); // test2
    await clickSidebarChannel(mainPage, 'Frequency (Hz)'); // test2
    await clickSidebarChannel(mainPage, 'Voltage (V)'); // test3
    await clickSidebarChannel(mainPage, 'Frequency (Hz)'); // test3

    const series = await getRenderedSeriesSummary(mainPage, 'Voltage');
    expect(series).toHaveLength(4);
    
    const names = series.map(s => s.name).sort();
    // All channels have conflicts, so all get test names
    expect(names).toEqual([
      'Frequency (test2)',
      'Frequency (test3)',
      'Voltage (test2)',
      'Voltage (test3)',
    ]);
  });

  test('resolves conflicts when channel is removed', async () => {
    // Open test2 and test3
    await openFixtureAndExpandInSidebar(electronApp, mainPage, 'test2.json', 'test2');
    await openFixtureAndExpandInSidebar(electronApp, mainPage, 'test3.json', 'test3');
    
    await createAndSelectChart(mainPage);

    // Add Voltage from both tests - creates conflict
    await clickSidebarChannel(mainPage, 'Voltage (V)'); // test2
    await clickSidebarChannel(mainPage, 'Voltage (V)'); // test3

    let series = await getRenderedSeriesSummary(mainPage, 'Voltage');
    expect(series).toHaveLength(2);
    expect(series.map(s => s.name).sort()).toEqual(['Voltage (test2)', 'Voltage (test3)']);

    // Remove one Voltage - should remove conflict
    await clickSidebarChannel(mainPage, 'Voltage (V)'); // Remove test3 Voltage

    series = await getRenderedSeriesSummary(mainPage, 'Voltage');
    expect(series).toHaveLength(1);
    // No more conflict, should show base name
    expect(series[0].name).toBe('Voltage');
  });
});
