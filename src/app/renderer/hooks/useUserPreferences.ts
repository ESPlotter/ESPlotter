import { useEffect } from 'react';

import { useUserPreferencesActions } from '@renderer/store/UserPreferencesStore';

export function useUserPreferences(): void {
  const { setChartSeriesPalette, openDialog } = useUserPreferencesActions();

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const palette = await window.userPreferences.getChartSeriesPalette();
      if (isMounted) {
        setChartSeriesPalette(palette);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [setChartSeriesPalette]);

  useEffect(() => {
    const unsubscribe = window.userPreferences.onChangedChartSeriesPalette((preferences) => {
      setChartSeriesPalette(preferences.chartSeriesPalette);
    });

    return () => {
      unsubscribe();
    };
  }, [setChartSeriesPalette]);

  useEffect(() => {
    const unsubscribe = window.userPreferences.onOpenRequested(() => {
      openDialog();
    });

    return () => {
      unsubscribe();
    };
  }, [openDialog]);
}
