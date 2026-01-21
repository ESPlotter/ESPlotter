import fs from 'node:fs/promises';
import path from 'node:path';

import { expect, type Locator, type Page } from '@playwright/test';
import Color from 'color';

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

  async createColor(color: string): Promise<number> {
    const items = this.page.locator('button[aria-label^="Edit colour"]');
    const before = await items.count();

    await this.page.getByRole('button', { name: 'Add colour' }).click();

    await expect(items).toHaveCount(before + 1);

    const newIndex = before;
    const editButton = this.getColorEditButton(newIndex);
    await expect(editButton).toBeVisible();
    const normalized = await this.updateColor(newIndex, color);
    await expect(this.page.getByText(normalized)).toBeVisible();

    return newIndex;
  }

  async expectColorVisible(index: number, color: string): Promise<void> {
    await expect(this.getColorEditButton(index)).toBeVisible();
    await this.expectColorTextVisible(color);
  }

  async expectColorTextVisible(color: string): Promise<void> {
    await expect(this.page.getByText(this.normalizeHex(color))).toBeVisible();
  }

  async expectColorTextNotVisible(color: string): Promise<void> {
    await expect(this.page.getByText(this.normalizeHex(color))).toHaveCount(0);
  }

  async updateColor(index: number, hex: string): Promise<string> {
    const editButton = this.getColorEditButton(index);
    const picker = this.getColorPickerForButton(editButton);
    const pickerCount = await picker.count();
    const pickerVisible = pickerCount > 0 && (await picker.first().isVisible());
    if (!pickerVisible) {
      await editButton.click();
    }

    await expect(picker).toBeVisible();

    const normalizedHex = this.normalizeHex(hex);
    // TODO: Fix the way we test color updates via the picker and remove the direct preferences update
    // await this.updateColorViaPicker(picker, normalizedHex);

    const span = editButton.locator('span');
    await this.updateColorViaPreferences(index, normalizedHex);

    await editButton.click();
    await expect(span).toHaveText(normalizedHex);
    return normalizedHex;
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

  private async updateColorViaPicker(picker: Locator, normalizedHex: string): Promise<void> {
    const [hueRaw, saturationRaw, lightnessRaw] = Color(normalizedHex).hsl().array();
    const hue = Number.isFinite(hueRaw) ? hueRaw : 0;
    const saturation = Number.isFinite(saturationRaw) ? saturationRaw : 0;
    const lightness = Number.isFinite(lightnessRaw) ? lightnessRaw : 0;

    const hueRatio = Math.min(Math.max(hue / 360, 0), 1);
    const saturationRatio = Math.min(Math.max(saturation / 100, 0), 1);
    const topLightness = saturationRatio < 0.01 ? 100 : 100 - 50 * saturationRatio;
    const yRatioRaw = 1 - lightness / topLightness;
    const yRatio = Math.min(Math.max(yRatioRaw, 0), 1);

    await picker.evaluate(
      (element, { huePosition, saturationPosition, lightnessPosition }) => {
        const selection = element.querySelector<HTMLElement>('.cursor-crosshair');
        const hueSlider = element.querySelector<HTMLElement>('[data-orientation="horizontal"]');
        if (!selection || !hueSlider) {
          throw new Error('Color picker controls are missing');
        }

        const hueTarget = hueSlider.querySelector<HTMLElement>('[role="slider"]') ?? hueSlider;

        const hueRect = hueSlider.getBoundingClientRect();
        const selectionRect = selection.getBoundingClientRect();
        const hueX = hueRect.left + hueRect.width * huePosition;
        const hueY = hueRect.top + hueRect.height / 2;
        const selectionX = selectionRect.left + selectionRect.width * saturationPosition;
        const selectionY = selectionRect.top + selectionRect.height * lightnessPosition;

        const dispatchPointer = (
          target: EventTarget,
          type: string,
          clientX: number,
          clientY: number,
        ) => {
          target.dispatchEvent(
            new PointerEvent(type, {
              bubbles: true,
              clientX,
              clientY,
            }),
          );
        };

        dispatchPointer(hueTarget, 'pointerdown', hueX, hueY);
        dispatchPointer(hueTarget, 'pointermove', hueX, hueY);
        dispatchPointer(hueTarget, 'pointerup', hueX, hueY);

        dispatchPointer(selection, 'pointerdown', selectionX, selectionY);
        dispatchPointer(window, 'pointermove', selectionX, selectionY);
        dispatchPointer(window, 'pointerup', selectionX, selectionY);
      },
      {
        huePosition: hueRatio,
        saturationPosition: saturationRatio,
        lightnessPosition: yRatio,
      },
    );
  }

  private async updateColorViaPreferences(index: number, normalizedHex: string): Promise<void> {
    await this.page.evaluate(
      async ({ idx, newHex }) => {
        const userPreferences = window.userPreferences as UserPreferencesApi;
        const palette = await userPreferences.getChartSeriesPalette();
        palette[idx] = newHex;
        await userPreferences.updateChartSeriesPalette(palette);
      },
      { idx: index, newHex: normalizedHex },
    );
  }

  private getColorEditButton(index: number): Locator {
    return this.page.getByRole('button', { name: `Edit colour ${index + 1}` });
  }

  private getColorPickerForButton(editButton: Locator): Locator {
    const container = editButton.locator('xpath=ancestor::div[contains(@class, "group")][1]');
    return container.locator(
      'xpath=following-sibling::div[.//div[contains(@class, "cursor-crosshair")]][1]',
    );
  }

  private normalizeHex(color: string): string {
    return Color(color).hex().toUpperCase();
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
