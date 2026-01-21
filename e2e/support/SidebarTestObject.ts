import { expect, type Locator, type Page } from '@playwright/test';

export class SidebarTestObject {
  constructor(private readonly page: Page) {}

  async expandChannelFile(fileLabel: string): Promise<void> {
    const fileTrigger = this.getFileTrigger(fileLabel);
    await fileTrigger.waitFor({ state: 'visible' });
    await fileTrigger.click();
  }

  async expandFirstFile(): Promise<void> {
    const fileHeading = this.page.getByRole('heading', { level: 3 }).first();
    await fileHeading.waitFor({ state: 'visible' });
    await fileHeading.click();
  }

  async toggleChannel(channelLabel: string, fileLabel?: string): Promise<void> {
    const channelButton = this.getChannelButton(channelLabel, fileLabel);
    await channelButton.waitFor({ state: 'visible', timeout: 5000 });
    await channelButton.click();
  }

  async closeChannelFile(fileLabel: string): Promise<void> {
    const fileTrigger = this.getFileTrigger(fileLabel);
    const closeButton = fileTrigger
      .locator('xpath=ancestor::*[@data-slot="accordion-item"]')
      .getByRole('button', { name: /close file/i })
      .first();

    await closeButton.click();
  }

  async expectFileVisible(fileLabel: string): Promise<void> {
    await expect(this.getFileTrigger(fileLabel)).toBeVisible();
  }

  async expectFileNotVisible(fileLabel: string): Promise<void> {
    await expect(this.getFileTrigger(fileLabel)).not.toBeVisible();
  }

  async expectChannelsVisible(channelNames: string[]): Promise<void> {
    for (const channelName of channelNames) {
      await expect(this.page.getByRole('button', { name: channelName, exact: true })).toBeVisible();
    }
  }

  async getFirstChannelLabel(): Promise<string> {
    const channelButton = await this.getFirstChannelButton();
    return (await channelButton.innerText()).trim();
  }

  async selectFirstChannel(): Promise<string> {
    const channelButton = await this.getFirstChannelButton();
    const channelLabel = (await channelButton.innerText()).trim();
    await channelButton.click();
    return channelLabel;
  }

  async expectChannelLabelVisible(channelLabel: string): Promise<void> {
    await expect(this.page.getByRole('button', { name: channelLabel })).toBeVisible();
  }

  async getContainerWidth(): Promise<number> {
    return this.getElementWidth(this.getSidebarContainer());
  }

  async getGapWidth(): Promise<number> {
    return this.getElementWidth(this.getSidebarGap());
  }

  async dragRail(deltaX: number): Promise<void> {
    const rail = this.getSidebarRail();
    const railBox = await rail.boundingBox();
    if (!railBox) {
      throw new Error('Sidebar rail is not visible');
    }

    const startX = railBox.x + railBox.width / 2;
    const startY = railBox.y + railBox.height / 2;

    await this.page.mouse.move(startX, startY);
    await this.page.mouse.down();
    await this.page.mouse.move(startX + deltaX, startY, { steps: 5 });
    await this.page.mouse.up();
  }

  async toggleVisibility(): Promise<void> {
    await this.getSidebarRail().click();
  }

  async expectContainerWidthGreaterThan(width: number): Promise<void> {
    await expect.poll(() => this.getContainerWidth()).toBeGreaterThan(width);
  }

  async expectContainerWidthLessThan(width: number): Promise<void> {
    await expect.poll(() => this.getContainerWidth()).toBeLessThan(width);
  }

  async expectGapWidthLessThan(width: number): Promise<void> {
    await expect.poll(() => this.getGapWidth()).toBeLessThan(width);
  }

  async expectGapWidthGreaterThan(width: number): Promise<void> {
    await expect.poll(() => this.getGapWidth()).toBeGreaterThan(width);
  }

  async expectOffcanvas(): Promise<void> {
    await expect(this.getSidebarRoot()).toHaveAttribute('data-collapsible', 'offcanvas');
  }

  async expectExpanded(): Promise<void> {
    await expect(this.getSidebarRoot()).toHaveAttribute('data-collapsible', '');
  }

  async expectHeaderVisible(): Promise<void> {
    await expect(this.page.getByText('CHANNELS')).toBeVisible();
  }

  private getFileTrigger(fileLabel: string): Locator {
    return this.page.getByRole('button', { name: fileLabel });
  }

  private getChannelButton(channelLabel: string, fileLabel?: string): Locator {
    if (fileLabel) {
      const fileTrigger = this.getFileTrigger(fileLabel);
      return fileTrigger
        .locator('xpath=ancestor::*[@data-slot="accordion-item"]')
        .getByRole('button', { name: channelLabel })
        .first();
    }
    return this.page.getByRole('button', { name: channelLabel }).first();
  }

  private async getFirstChannelButton(): Promise<Locator> {
    const channelButtons = this.page.locator('[data-sidebar="menu-button"]');
    await expect.poll(async () => channelButtons.count()).toBeGreaterThan(0);
    return channelButtons.first();
  }

  private getSidebarContainer(): Locator {
    return this.page.locator('[data-slot="sidebar-container"]');
  }

  private getSidebarGap(): Locator {
    return this.page.locator('[data-slot="sidebar-gap"]');
  }

  private getSidebarRoot(): Locator {
    return this.page.locator('[data-slot="sidebar"]');
  }

  private getSidebarRail(): Locator {
    return this.page.locator('[data-slot="sidebar-rail"]');
  }

  private async getElementWidth(locator: Locator): Promise<number> {
    const box = await locator.boundingBox();
    if (!box) {
      throw new Error('Sidebar container is not visible');
    }

    return box.width;
  }
}
