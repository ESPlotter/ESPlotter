import { mapToChartSerie } from '@renderer/components/Chart/mapToChartSerie';
import { describe, expect, test } from 'vitest';

import { ChannelFileContentPrimitiveMother } from 'src/test/shared/domain/primitives/ChannelFileContentPrimitiveMother';

describe('mapToChartSerie', () => {
  test('should map test data with one serie', () => {
    const testData = ChannelFileContentPrimitiveMother.with({
      x: {
        id: 'time',
        label: 'Time',
        unit: 's',
        values: [1, 2, 3, 4],
      },
      series: [
        {
          id: 'V',
          label: 'Voltage',
          unit: 'V',
          values: [10, 20, 30, 40],
        },
      ],
    });

    const result = mapToChartSerie(testData.series[0], testData.x.values);

    expect(result).toEqual({
      name: 'Voltage',
      type: 'line',
      data: [
        [1, 10],
        [2, 20],
        [3, 30],
        [4, 40],
      ],
    });
  });

  test('should map test data with one serie', () => {
    const testData = ChannelFileContentPrimitiveMother.with({
      x: {
        id: 'time',
        label: 'Time',
        unit: 's',
        values: [1, 2, 3, 4],
      },
      series: [
        {
          id: 'V',
          label: 'Voltage',
          unit: 'V',
          values: [10, 20, 30, 40],
        },
        {
          id: 'F',
          label: 'Frequency',
          unit: 'Hz',
          values: [100, 200, 300, 400],
        },
      ],
    });

    const firstSerie = mapToChartSerie(testData.series[0], testData.x.values);
    const secondSerie = mapToChartSerie(testData.series[1], testData.x.values);

    expect(firstSerie).toEqual({
      name: 'Voltage',
      type: 'line',
      data: [
        [1, 10],
        [2, 20],
        [3, 30],
        [4, 40],
      ],
    });

    expect(secondSerie).toEqual({
      name: 'Frequency',
      type: 'line',
      data: [
        [1, 100],
        [2, 200],
        [3, 300],
        [4, 400],
      ],
    });
  });
});
