/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook, act } from '@testing-library/react';
import { vi, beforeEach, afterEach, describe, it, expect } from 'vitest';

// Mock the color generator before importing the store
vi.mock('@renderer/components/Chart/Chart', () => ({
  generateRandomHexColor: vi.fn(() => '#deadbe'),
}));
import { DEFAULT_CHART_SERIES_PALETTE } from '@shared/domain/constants/defaultChartSeriesPalette';

import {
  useUserPreferencesChartSeriesPalette,
  useUserPreferencesActions,
} from './UserPreferencesStore';

describe('UserPreferencesStore - chart series palette', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Provide a default window.userPreferences mock used by async actions
    (globalThis as any).window = {
      userPreferences: {
        updateChartSeriesPalette: vi.fn().mockResolvedValue(undefined),
      },
    };
  });

  afterEach(() => {
    delete (globalThis as any).window;
  });

  function hook() {
    return renderHook(() => ({
      palette: useUserPreferencesChartSeriesPalette(),
      actions: useUserPreferencesActions(),
    }));
  }

  it('initializes with default palette', () => {
    const { result } = hook();
    expect(result.current.palette).toEqual(DEFAULT_CHART_SERIES_PALETTE);
  });

  it('replaceColor updates palette and persists', async () => {
    const { result } = hook();

    await act(async () => {
      result.current.actions.setChartSeriesPalette(['#111111', '#222222', '#333333']);
      await result.current.actions.replaceColor(1, '#abcabc');
    });

    expect(result.current.palette).toEqual(['#111111', '#abcabc', '#333333']);
    expect((globalThis as any).window.userPreferences.updateChartSeriesPalette).toHaveBeenCalledWith([
      '#111111',
      '#abcabc',
      '#333333',
    ]);
  });

  it('addColor with explicit color appends and persists', async () => {
    const { result } = hook();

    await act(async () => {
      result.current.actions.setChartSeriesPalette(['#010101']);
      await result.current.actions.addColor('#123456');
    });

    expect(result.current.palette).toHaveLength(2);
    expect(result.current.palette[1]).toBe('#123456');
    expect((globalThis as any).window.userPreferences.updateChartSeriesPalette).toHaveBeenCalledWith(
      result.current.palette,
    );
  });

  it('addColor without color uses generateRandomHexColor and persists', async () => {
    const { result } = hook();

    await act(async () => {
      result.current.actions.setChartSeriesPalette(['#0a0a0a']);
      await result.current.actions.addColor();
    });

    expect(result.current.palette[result.current.palette.length - 1]).toBe('#deadbe');
    expect((globalThis as any).window.userPreferences.updateChartSeriesPalette).toHaveBeenCalledWith(
      result.current.palette,
    );
  });

  it('removeColor removes item and persists', async () => {
    const { result } = hook();

    await act(async () => {
      result.current.actions.setChartSeriesPalette(['#a1', '#a2', '#a3']);
      await result.current.actions.removeColor(1);
    });

    expect(result.current.palette).toEqual(['#a1', '#a3']);
    expect((globalThis as any).window.userPreferences.updateChartSeriesPalette).toHaveBeenCalledWith([
      '#a1',
      '#a3',
    ]);
  });

/*   it('removeColor with invalid index does nothing and does not persist', async () => {
    const { result } = hook();

    await act(async () => {
      result.current.actions.setChartSeriesPalette(['#f1', '#f2']);
      await result.current.actions.removeColor(10);
    });

    expect(result.current.palette).toEqual(['#f1', '#f2']);
    expect((globalThis as any).window.userPreferences.updateChartSeriesPalette).not.toHaveBeenCalled();
  }); */

  it('resetToDefaults restores DEFAULT_CHART_SERIES_PALETTE and does not persist', () => {
    const { result } = hook();

    act(() => {
      result.current.actions.setChartSeriesPalette(['#x', '#y', '#z']);
      result.current.actions.resetToDefaults();
    });

    expect(result.current.palette).toEqual(DEFAULT_CHART_SERIES_PALETTE);
    expect((globalThis as any).window.userPreferences.updateChartSeriesPalette).not.toHaveBeenCalled();
  });
});