import type { ChartSerie } from '@shared/chart/ChartSerie';
import type { AllowedFileStructure } from '@shared/AllowedFileStructure';

export function mapAllowedFileStructure(data: AllowedFileStructure): ChartSerie[] {
  const xValues = data?.x?.values ?? [];
  const series = Array.isArray(data?.series) ? data.series : [];

  if (!xValues.length || !series.length) {
    return [];
  }

  return series.reduce<ChartSerie[]>((acc, serie) => {
    const points: [number, number][] = xValues.reduce(
      (coordinates, xValue, index) => {
        const yValue = serie.values?.[index];

        if (typeof yValue !== 'number') {
          return coordinates;
        }

        coordinates.push([xValue, yValue]);
        return coordinates;
      },
      [] as [number, number][],
    );

    if (!points.length) {
      return acc;
    }

    acc.push({
      name: serie.label ?? serie.id,
      type: 'line',
      data: points,
    });

    return acc;
  }, []);
}

