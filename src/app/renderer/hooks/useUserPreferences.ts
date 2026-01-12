import { useEffect } from 'react';

import { useUserPreferencesActions } from '@renderer/store/UserPreferencesStore';

export function useUserPreferences(): void {
  const { setChartSeriesPalette, setDyntoolsPath, setPythonPath } = useUserPreferencesActions();

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const [palette, dyntoolsPath, pythonPath] = await Promise.all([
        window.userPreferences.getChartSeriesPalette(),
        window.userPreferences.getDyntoolsPath(),
        window.userPreferences.getPythonPath(),
      ]);
      if (isMounted) {
        setChartSeriesPalette(palette);
        setDyntoolsPath(dyntoolsPath);
        setPythonPath(pythonPath);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [setChartSeriesPalette, setDyntoolsPath, setPythonPath]);

  useEffect(() => {
    const unsubscribeChartSeriesPalette = window.userPreferences.onChangedChartSeriesPalette(
      (preferences) => {
        setChartSeriesPalette(preferences.chartSeriesPalette);
      },
    );
    const unsubscribeDyntoolsPath = window.userPreferences.onChangeDyntoolsPath((path) => {
      setDyntoolsPath(path);
    });
    const unsubscribePythonPath = window.userPreferences.onChangePythonPath((path) => {
      setPythonPath(path);
    });

    return () => {
      unsubscribeChartSeriesPalette();
      unsubscribeDyntoolsPath();
      unsubscribePythonPath();
    };
  }, [setChartSeriesPalette, setDyntoolsPath, setPythonPath]);
}
