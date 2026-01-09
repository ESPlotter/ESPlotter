import { useEffect } from 'react';

import { useDataTableFormatActions } from '@renderer/store/DataTableFormatStore';

export function useDataTableFormat() {
  const { setFormat } = useDataTableFormatActions();

  useEffect(() => {
    window.userPreferences.getDataTableFormat().then((format) => {
      setFormat(format.decimals, format.fixed);
    });
  }, [setFormat]);
}
