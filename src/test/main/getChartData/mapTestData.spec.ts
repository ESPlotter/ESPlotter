import { mapTestData } from '@main/getChartData/mapTestData';
import { describe, expect, test } from 'vitest';
import { TestDataMother } from './TestDataMother';

describe('mapTestData', () => {
  test('should map test data with one serie', () => {
    const testData = TestDataMother.with({
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

    const result = mapTestData(testData);

    expect(result).toEqual([
      {
        name: 'Voltage',
        type: 'line',
        data: [
          [1, 10],
          [2, 20],
          [3, 30],
          [4, 40],
        ],
      },
    ]);
  });

  test('should map test data with one serie', () => {
    const testData = TestDataMother.with({
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

    const result = mapTestData(testData);

    expect(result).toEqual([
      {
        name: 'Voltage',
        type: 'line',
        data: [
          [1, 10],
          [2, 20],
          [3, 30],
          [4, 40],
        ],
      },
      {
        name: 'Frequency',
        type: 'line',
        data: [
          [1, 100],
          [2, 200],
          [3, 300],
          [4, 400],
        ],
      },
    ]);
  });
});
