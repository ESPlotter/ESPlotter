import { ElectronApplication, expect, Locator, Page, test } from '@playwright/test';

import { setupE2eTestEnvironment } from './support/setupE2eTestEnvironment';

test.describe('Sidebar resize', () => {
  let electronApp: ElectronApplication;
  let mainPage: Page;

  test.beforeEach(async () => {
    ({ electronApp, mainPage } = await setupE2eTestEnvironment());
  });

  test.afterEach(async () => {
    await electronApp.close();
  });

  test('resizes sidebar width on drag', async () => {
    const sidebar = mainPage.locator('[data-slot="sidebar-container"]');
    const rail = mainPage.locator('[data-slot="sidebar-rail"]');

    const initialWidth = await getElementWidth(sidebar);
    await dragRail(mainPage, rail, 80);

    const expandedWidth = await getElementWidth(sidebar);
    expect(expandedWidth).toBeGreaterThan(initialWidth);

    await dragRail(mainPage, rail, -60);

    const collapsedWidth = await getElementWidth(sidebar);
    expect(collapsedWidth).toBeLessThan(expandedWidth);
  });

  test('toggles sidebar visibility on rail click', async () => {
    const sidebarGap = mainPage.locator('[data-slot="sidebar-gap"]');
    const sidebarRoot = mainPage.locator('[data-slot="sidebar"]');
    const rail = mainPage.locator('[data-slot="sidebar-rail"]');

    const initialGapWidth = await getElementWidth(sidebarGap);

    await rail.click();

    await expect(sidebarRoot).toHaveAttribute('data-collapsible', 'offcanvas');
    await expect.poll(() => getElementWidth(sidebarGap)).toBeLessThan(initialGapWidth);

    await rail.click();

    await expect(sidebarRoot).toHaveAttribute('data-collapsible', '');
    await expect.poll(() => getElementWidth(sidebarGap)).toBeGreaterThan(0);
  });
});

async function dragRail(page: Page, rail: Locator, deltaX: number): Promise<void> {
  const railBox = await rail.boundingBox();
  if (!railBox) {
    throw new Error('Sidebar rail is not visible');
  }

  const startX = railBox.x + railBox.width / 2;
  const startY = railBox.y + railBox.height / 2;

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX + deltaX, startY, { steps: 5 });
  await page.mouse.up();
}

async function getElementWidth(locator: Locator): Promise<number> {
  const box = await locator.boundingBox();
  if (!box) {
    throw new Error('Sidebar container is not visible');
  }

  return box.width;
}
