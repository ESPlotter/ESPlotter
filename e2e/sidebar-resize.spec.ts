import { test } from '@playwright/test';

import { MainPageTestObject } from './support/MainPageTestObject';

test.describe('Sidebar resize', () => {
  let mainPageTest: MainPageTestObject;

  test.beforeEach(async () => {
    mainPageTest = await MainPageTestObject.create();
  });

  test.afterEach(async () => {
    await mainPageTest.close();
  });

  test('resizes sidebar width on drag', async () => {
    const initialWidth = await mainPageTest.sidebar.getContainerWidth();
    await mainPageTest.sidebar.dragRail(80);
    await mainPageTest.sidebar.expectContainerWidthGreaterThan(initialWidth);

    const expandedWidth = await mainPageTest.sidebar.getContainerWidth();
    await mainPageTest.sidebar.dragRail(-60);
    await mainPageTest.sidebar.expectContainerWidthLessThan(expandedWidth);
  });

  test('toggles sidebar visibility on rail click', async () => {
    const initialGapWidth = await mainPageTest.sidebar.getGapWidth();

    await mainPageTest.sidebar.toggleVisibility();
    await mainPageTest.sidebar.expectOffcanvas();
    await mainPageTest.sidebar.expectGapWidthLessThan(initialGapWidth);

    await mainPageTest.sidebar.toggleVisibility();
    await mainPageTest.sidebar.expectExpanded();
    await mainPageTest.sidebar.expectGapWidthGreaterThan(0);
  });
});
