import { expect, test, type ElectronApplication, type Page } from '@playwright/test';

import { createChart } from './support/createChart';
import { getChartTitles } from './support/getChartTitles';
import { selectChartByTitle } from './support/selectChartByTitle';
import { setupE2eTestEnvironment } from './support/setupE2eTestEnvironment';

let electronApp: ElectronApplication;
let mainPage: Page;

test.describe('Chart deletion', () => {
  test.beforeEach(async () => {
    ({ electronApp, mainPage } = await setupE2eTestEnvironment());
  });

  test.afterEach(async () => {
    await electronApp.close();
  });

  test('allows deleting a single chart using the delete button', async () => {
    const chart1Title = await createChart(mainPage);
    const chart2Title = await createChart(mainPage);

    const titlesBeforeDelete = await getChartTitles(mainPage);
    expect(titlesBeforeDelete).toContain(chart1Title);
    expect(titlesBeforeDelete).toContain(chart2Title);
    expect(titlesBeforeDelete).toHaveLength(2);

    // Select chart1 and delete it
    await selectChartByTitle(mainPage, chart1Title);

    // Find and click the delete button (trash icon) in the chart toolbar
    const chartContainer = mainPage.getByRole('main').getByRole('article').first();
    const deleteButton = chartContainer.getByRole('button', { name: 'Delete chart (Delete key)' });
    await deleteButton.click();

    // Verify that only chart2 remains (renumbered to Chart 1)
    const titlesAfterDelete = await getChartTitles(mainPage);
    expect(titlesAfterDelete).toHaveLength(1);
    expect(titlesAfterDelete[0]).toBe('Chart 1');
  });

  test('allows deleting a chart using the Delete key hotkey', async () => {
    const chart1Title = await createChart(mainPage);
    // eslint-disable-next-line unused-imports/no-unused-vars
    const chart2Title = await createChart(mainPage);

    // Select chart1 and delete using Delete key
    await selectChartByTitle(mainPage, chart1Title);
    await mainPage.keyboard.press('Delete');

    // Verify that only chart2 remains (renumbered to Chart 1)
    const titlesAfterDelete = await getChartTitles(mainPage);
    expect(titlesAfterDelete).toHaveLength(1);
    expect(titlesAfterDelete[0]).toBe('Chart 1');
  });

  test('deletes all charts using the delete all button', async () => {
    await createChart(mainPage);
    await createChart(mainPage);
    const chart3Title = await createChart(mainPage);

    let titles = await getChartTitles(mainPage);
    expect(titles).toHaveLength(3);

    // Click the delete all button (trash icon in header, visible when there are multiple charts)
    const deleteAllButton = mainPage
      .getByRole('main')
      .getByRole('button', { name: 'Delete all charts (Ctrl+Delete)' });
    await deleteAllButton.click();

    // Verify all charts are deleted and a new default chart is created
    titles = await getChartTitles(mainPage);
    expect(titles).not.toContain(chart3Title);
    expect(titles).toHaveLength(1);
    expect(titles[0]).toBe('Chart 1');
  });

  test('deletes all charts using the Ctrl+Delete hotkey', async () => {
    await createChart(mainPage);
    await createChart(mainPage);
    const chart3Title = await createChart(mainPage);

    let titles = await getChartTitles(mainPage);
    expect(titles).toHaveLength(3);

    // Use Ctrl+Delete hotkey to delete all charts
    await mainPage.keyboard.press('Control+Delete');

    // Verify all charts are deleted and a new default chart is created
    titles = await getChartTitles(mainPage);
    expect(titles).not.toContain(chart3Title);
    expect(titles).toHaveLength(1);
    expect(titles[0]).toBe('Chart 1');
  });

  test('renumbers remaining charts after deletion', async () => {
    const chart1Title = await createChart(mainPage);
    const chart2Title = await createChart(mainPage);
    const chart3Title = await createChart(mainPage);

    // Verify initial chart titles
    let titles = await getChartTitles(mainPage);
    expect(titles).toEqual([chart1Title, chart2Title, chart3Title]);

    // Delete chart2 (middle chart)
    await selectChartByTitle(mainPage, chart2Title);
    const chartContainer = mainPage.getByRole('main').getByRole('article').nth(1);
    const deleteButton = chartContainer.getByRole('button', { name: 'Delete chart (Delete key)' });
    await deleteButton.click();

    // Verify that remaining charts are renumbered correctly
    titles = await getChartTitles(mainPage);
    expect(titles).toHaveLength(2);
    expect(titles[0]).toBe('Chart 1');
    expect(titles[1]).toBe('Chart 2');
  });

  test('selects the last chart when deleting the currently selected chart', async () => {
    const chart1Title = await createChart(mainPage);
    // eslint-disable-next-line unused-imports/no-unused-vars
    const chart2Title = await createChart(mainPage);

    // Select chart1 and delete it
    await selectChartByTitle(mainPage, chart1Title);

    const chartContainer = mainPage.getByRole('main').getByRole('article').first();
    const deleteButton = chartContainer.getByRole('button', { name: 'Delete chart (Delete key)' });
    await deleteButton.click();

    // Verify that chart2 is now selected (it becomes the active and only chart)
    const selectedBorder = mainPage.getByRole('main').getByTestId('chart-plot');
    // The selected chart has a specific border style
    await expect(selectedBorder).toHaveClass(/border-slate-900/);
  });
});
