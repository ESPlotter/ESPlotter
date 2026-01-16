export interface UserPreferencesPrimitive {
  chartSeriesPalette: string[];
  general: {
    paths: {
      dyntoolsPath: string;
      pythonPath: string;
    };
  };
}
