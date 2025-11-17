import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useUserPreferencesActions } from '@renderer/store/UserPreferencesStore';
import { DEFAULT_CHART_SERIES_PALETTE } from '@shared/domain/constants/defaultChartSeriesPalette';

import { UserPreferencesDialog } from './UserPreferencesDialog';

declare global {
  interface Window {
    userPreferences: {
      getChartSeriesPalette: () => Promise<string[]>;
      updateChartSeriesPalette: (palette: string[]) => Promise<{ chartSeriesPalette: string[] }>;
      onChangedChartSeriesPalette: (
        listener: (preferences: { chartSeriesPalette: string[] }) => void,
      ) => () => void;
      onOpenRequested: (listener: () => void) => () => void;
    };
  }
}

describe('UserPreferencesDialog', () => {
  const userPreferencesMock = {
    getChartSeriesPalette: vi.fn(),
    updateChartSeriesPalette: vi.fn(),
    onChangedChartSeriesPalette: vi.fn(),
    onOpenRequested: vi.fn(),
  };

  beforeEach(() => {
    userPreferencesMock.getChartSeriesPalette.mockResolvedValue(DEFAULT_CHART_SERIES_PALETTE);
    userPreferencesMock.updateChartSeriesPalette.mockResolvedValue({
      chartSeriesPalette: DEFAULT_CHART_SERIES_PALETTE,
    });
    userPreferencesMock.onChangedChartSeriesPalette.mockReturnValue(() => {});
    userPreferencesMock.onOpenRequested.mockReturnValue(() => {});
    window.userPreferences = userPreferencesMock as unknown as Window['userPreferences'];
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('disables save when there are validation errors', async () => {
    render(<UserPreferencesDialog />);
    const { result } = renderHook(() => useUserPreferencesActions());

    act(() => {
      result.current.openDialog();
    });

    const inputs = await screen.findAllByLabelText(/Colour/);
    fireEvent.change(inputs[0], { target: { value: 'invalid-colour' } });

    const saveButton = screen.getByRole('button', { name: /save/i });
    expect(saveButton).toBeDisabled();
  });

  it('keeps the custom colour controls open while adjusting values', async () => {
    render(<UserPreferencesDialog />);
    const { result } = renderHook(() => useUserPreferencesActions());

    act(() => {
      result.current.openDialog();
    });

    const swatch = await screen.findByLabelText('Pick colour 1');
    fireEvent.click(swatch);

    expect(screen.getByText('Red')).toBeInTheDocument();

    const slider = screen.getByLabelText('Red');
    fireEvent.change(slider, { target: { value: '120' } });

    expect(screen.getByText('Red')).toBeInTheDocument();
  });

  it('persists the palette through the preload API', async () => {
    render(<UserPreferencesDialog />);
    const { result } = renderHook(() => useUserPreferencesActions());

    act(() => {
      result.current.openDialog();
    });

    const saveButton = await screen.findByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    expect(userPreferencesMock.updateChartSeriesPalette).toHaveBeenCalledWith(
      DEFAULT_CHART_SERIES_PALETTE,
    );

    expect(userPreferencesMock.updateChartSeriesPalette).toHaveBeenCalledTimes(1);
  });
});
