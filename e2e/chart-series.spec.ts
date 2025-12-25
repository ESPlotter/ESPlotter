import { test, expect } from '@playwright/test';

test.describe('Chart Series Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('should add a new series', async ({ page }) => {
    // Click the "Add Series" button
    await page.click('button:has-text("Add Series")');

    // Verify that a new series input appears
    const seriesInputs = page.locator('input[placeholder="Series name"]');
    await expect(seriesInputs).toHaveCount(2); // Initially 1, now 2
  });

  test('should remove a series', async ({ page }) => {
    // Add a series first
    await page.click('button:has-text("Add Series")');

    // Get the remove button for the second series
    const removeButtons = page.locator('button:has-text("Remove")');
    await expect(removeButtons).toHaveCount(2);

    // Click the remove button for the second series
    await removeButtons.nth(1).click();

    // Verify that only one series input remains
    const seriesInputs = page.locator('input[placeholder="Series name"]');
    await expect(seriesInputs).toHaveCount(1);
  });

  test('should update series name', async ({ page }) => {
    // Get the first series input
    const seriesInput = page.locator('input[placeholder="Series name"]').first();

    // Clear and type a new name
    await seriesInput.fill('Temperature');

    // Verify the input value
    await expect(seriesInput).toHaveValue('Temperature');
  });

  test('should add data point to series', async ({ page }) => {
    // Get the add data button for the first series
    const addDataButton = page.locator('button:has-text("Add Data")').first();
    await addDataButton.click();

    // Verify that data point inputs appear
    const xInputs = page.locator('input[placeholder="X"]');
    const yInputs = page.locator('input[placeholder="Y"]');

    await expect(xInputs).toHaveCount(1);
    await expect(yInputs).toHaveCount(1);
  });

  test('should remove data point from series', async ({ page }) => {
    // Add a data point first
    const addDataButton = page.locator('button:has-text("Add Data")').first();
    await addDataButton.click();

    // Remove the data point
    const removeDataButton = page.locator('button:has-text("Remove Data")').first();
    await removeDataButton.click();

    // Verify that no data point inputs remain
    const xInputs = page.locator('input[placeholder="X"]');
    await expect(xInputs).toHaveCount(0);
  });

  test('should update chart title from first series name', async ({ page }) => {
    // Get the chart title element
    const chartTitleElement = page.locator('.chart-title');
    const updatedTitle = 'Temperature Data';

    // Update the first series name
    const seriesInput = page.locator('input[placeholder="Series name"]').first();
    await seriesInput.fill(updatedTitle);

    // Wait a bit for any debouncing
    await page.waitForTimeout(500);

    // Verify that the chart title is updated
    await expect(chartTitleElement).toHaveText(updatedTitle);
  });

  test('should not update chart title if manually changed', async ({ page }) => {
    // Manually set a chart title
    const chartTitleInput = page.locator('input[placeholder="Chart title"]');
    const chartTitle = 'My Custom Title';
    await chartTitleInput.fill(chartTitle);

    // Update the first series name
    const seriesInput = page.locator('input[placeholder="Series name"]').first();
    await seriesInput.fill('Temperature Data');

    // Wait a bit for any debouncing
    await page.waitForTimeout(500);

    // Verify that the chart title remains unchanged
    const chartTitleElement = page.locator('.chart-title');
    await expect(chartTitleElement).toHaveText(chartTitle);
  });
});
