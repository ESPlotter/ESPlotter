import fs from 'node:fs/promises';
import path from 'node:path';

import { expect, type Page } from '@playwright/test';

import { MenuTestObject } from './MenuTestObject';

interface UserPreferencesApi {
  getChartSeriesPalette: () => Promise<string[]>;
  updateChartSeriesPalette: (palette: string[]) => Promise<unknown>;
}

export class PreferencesTestObject {
  constructor(
    private readonly menu: MenuTestObject,
    private readonly page: Page,
  ) {}

  async open(): Promise<void> {
    await this.menu.openPreferencesMenu();
  }

  async openColorPalette(): Promise<void> {
    await this.open();
    await this.page.getByText('Colors', { exact: true }).click();
    await expect(this.page.getByRole('button', { name: 'Add colour' })).toBeVisible();
  }

  async createColor(): Promise<{ index: number; color: string | null }> {
    const items = this.page.locator('button[aria-label^="Edit colour"]');
    const before = await items.count();

    await this.page.getByRole('button', { name: 'Add colour' }).click();

    await expect(items).toHaveCount(before + 1);

    const newIndex = before;
    const editButton = this.page.getByRole('button', { name: `Edit colour ${newIndex + 1}` });
    await expect(editButton).toBeVisible();
    const span = editButton.locator('span');
    const colorText = (await span.textContent())?.trim() ?? null;
    return { index: newIndex, color: colorText };
  }

  async expectColorVisible(index: number, color: string | null): Promise<void> {
    await expect(this.page.getByRole('button', { name: `Edit colour ${index + 1}` })).toBeVisible();
    if (color) {
      await expect(this.page.getByText(color)).toBeVisible();
    }
  }

  async expectColorTextVisible(color: string): Promise<void> {
    await expect(this.page.getByText(color)).toBeVisible();
  }

  async expectColorTextNotVisible(color: string): Promise<void> {
    await expect(this.page.getByText(color)).toHaveCount(0);
  }

  async updateColorViaPreferences(index: number, hex: string): Promise<void> {
    await this.page.evaluate(
      async ({ idx, newHex }) => {
        const userPreferences = window.userPreferences as UserPreferencesApi;
        const palette = await userPreferences.getChartSeriesPalette();
        palette[idx] = newHex;
        await userPreferences.updateChartSeriesPalette(palette);
      },
      { idx: index, newHex: hex },
    );
  }

  async removeColor(index: number): Promise<void> {
    await this.page.evaluate((idx) => {
      const edits = Array.from(
        document.querySelectorAll<HTMLButtonElement>('button[aria-label^="Edit colour"]'),
      );
      const edit = edits[idx];
      if (!edit) {
        throw new Error('Edit button not found');
      }
      const container = edit.closest('div');
      const remove = container?.querySelector<HTMLButtonElement>(
        'button[aria-label="Remove colour"]',
      );
      if (!remove) {
        throw new Error('Remove button not found');
      }
      remove.click();
    }, index);
  }

  async updatePaths(dyntoolsPath: string, pythonPath: string): Promise<void> {
    await this.page.getByLabel('DynTools path').fill(dyntoolsPath);
    await this.page.getByRole('button', { name: 'Save' }).first().click();
    await this.page.getByLabel('Python path').fill(pythonPath);
    await this.page.getByRole('button', { name: 'Save' }).nth(1).click();
  }

  async expectPersistedPaths(dyntoolsPath: string, pythonPath: string): Promise<void> {
    const stateDir = process.env.ESPLOTTER_STATE_CWD;
    if (!stateDir) {
      throw new Error('ESPLOTTER_STATE_CWD is not set');
    }

    const stateFile = path.join(stateDir, 'settings.json');

    await expect
      .poll(async () => {
        const contents = await fs.readFile(stateFile, 'utf-8');
        const parsed = JSON.parse(contents) as {
          general?: { paths?: { dyntoolsPath?: string; pythonPath?: string } };
        };
        return {
          dyntoolsPath: parsed.general?.paths?.dyntoolsPath,
          pythonPath: parsed.general?.paths?.pythonPath,
        };
      })
      .toEqual({
        dyntoolsPath,
        pythonPath,
      });
  }
}
