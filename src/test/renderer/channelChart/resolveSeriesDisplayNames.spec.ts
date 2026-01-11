import { describe, it, expect } from 'vitest';

import { resolveSeriesDisplayNames } from '../../../app/renderer/components/ChannelChart/resolveSeriesDisplayNames';
import { ChartSerie } from '../../../app/renderer/components/Chart/ChartSerie';

describe('resolveSeriesDisplayNames', () => {
  it('should not modify names when there are no conflicts', () => {
    const channels: Record<string, ChartSerie> = {
      '/path/to/test2.json::V': {
        name: 'Voltage',
        type: 'line',
        data: [[1, 2]],
      },
      '/path/to/test2.json::F': {
        name: 'Frequency',
        type: 'line',
        data: [[1, 3]],
      },
    };

    const result = resolveSeriesDisplayNames(channels);

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Voltage');
    expect(result[1].name).toBe('Frequency');
  });

  it('should append test names when there are conflicts from different tests', () => {
    const channels: Record<string, ChartSerie> = {
      '/path/to/test2.json::V': {
        name: 'Voltage',
        type: 'line',
        data: [[1, 2]],
      },
      '/path/to/test3.json::V': {
        name: 'Voltage',
        type: 'line',
        data: [[1, 3]],
      },
    };

    const result = resolveSeriesDisplayNames(channels);

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Voltage (test2)');
    expect(result[1].name).toBe('Voltage (test3)');
  });

  it('should append test names to ALL series when ANY conflict exists', () => {
    const channels: Record<string, ChartSerie> = {
      '/path/to/test2.json::V': {
        name: 'Voltage',
        type: 'line',
        data: [[1, 2]],
      },
      '/path/to/test3.json::V': {
        name: 'Voltage',
        type: 'line',
        data: [[1, 3]],
      },
      '/path/to/test2.json::F': {
        name: 'Frequency',
        type: 'line',
        data: [[1, 4]],
      },
    };

    const result = resolveSeriesDisplayNames(channels);

    expect(result).toHaveLength(3);

    // When ANY conflict exists (Voltage has conflict), ALL series should get test names
    const names = result.map((s) => s.name).sort();
    expect(names).toEqual(['Frequency (test2)', 'Voltage (test2)', 'Voltage (test3)']);
  });

  it('should handle conflicts with more than two tests', () => {
    const channels: Record<string, ChartSerie> = {
      '/path/to/test1.json::V': {
        name: 'Voltage',
        type: 'line',
        data: [[1, 1]],
      },
      '/path/to/test2.json::V': {
        name: 'Voltage',
        type: 'line',
        data: [[1, 2]],
      },
      '/path/to/test3.json::V': {
        name: 'Voltage',
        type: 'line',
        data: [[1, 3]],
      },
    };

    const result = resolveSeriesDisplayNames(channels);

    expect(result).toHaveLength(3);
    expect(result.map((s) => s.name).sort()).toEqual([
      'Voltage (test1)',
      'Voltage (test2)',
      'Voltage (test3)',
    ]);
  });

  it('should handle multiple conflicting names', () => {
    const channels: Record<string, ChartSerie> = {
      '/path/to/test2.json::V': {
        name: 'Voltage',
        type: 'line',
        data: [[1, 2]],
      },
      '/path/to/test3.json::V': {
        name: 'Voltage',
        type: 'line',
        data: [[1, 3]],
      },
      '/path/to/test2.json::F': {
        name: 'Frequency',
        type: 'line',
        data: [[1, 4]],
      },
      '/path/to/test3.json::F': {
        name: 'Frequency',
        type: 'line',
        data: [[1, 5]],
      },
    };

    const result = resolveSeriesDisplayNames(channels);

    expect(result).toHaveLength(4);

    const names = result.map((s) => s.name).sort();
    expect(names).toEqual([
      'Frequency (test2)',
      'Frequency (test3)',
      'Voltage (test2)',
      'Voltage (test3)',
    ]);
  });

  it('should handle empty channels', () => {
    const channels: Record<string, ChartSerie> = {};

    const result = resolveSeriesDisplayNames(channels);

    expect(result).toHaveLength(0);
  });

  it('should handle single channel', () => {
    const channels: Record<string, ChartSerie> = {
      '/path/to/test2.json::V': {
        name: 'Voltage',
        type: 'line',
        data: [[1, 2]],
      },
    };

    const result = resolveSeriesDisplayNames(channels);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Voltage');
  });

  it('should preserve all serie properties except name', () => {
    const channels: Record<string, ChartSerie> = {
      '/path/to/test2.json::V': {
        name: 'Voltage',
        type: 'line',
        data: [
          [1, 2],
          [2, 3],
        ],
        symbol: 'circle',
      },
      '/path/to/test3.json::V': {
        name: 'Voltage',
        type: 'line',
        data: [
          [1, 4],
          [2, 5],
        ],
        symbol: 'diamond',
      },
    };

    const result = resolveSeriesDisplayNames(channels);

    expect(result[0]).toMatchObject({
      name: 'Voltage (test2)',
      type: 'line',
      data: [
        [1, 2],
        [2, 3],
      ],
      symbol: 'circle',
    });

    expect(result[1]).toMatchObject({
      name: 'Voltage (test3)',
      type: 'line',
      data: [
        [1, 4],
        [2, 5],
      ],
      symbol: 'diamond',
    });
  });

  it('should handle Windows-style paths', () => {
    const channels: Record<string, ChartSerie> = {
      'C:\\path\\to\\test2.json::V': {
        name: 'Voltage',
        type: 'line',
        data: [[1, 2]],
      },
      'C:\\path\\to\\test3.json::V': {
        name: 'Voltage',
        type: 'line',
        data: [[1, 3]],
      },
    };

    const result = resolveSeriesDisplayNames(channels);

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Voltage (test2)');
    expect(result[1].name).toBe('Voltage (test3)');
  });

  it('should handle file paths without directory structure', () => {
    const channels: Record<string, ChartSerie> = {
      'test2.json::V': {
        name: 'Voltage',
        type: 'line',
        data: [[1, 2]],
      },
      'test3.json::V': {
        name: 'Voltage',
        type: 'line',
        data: [[1, 3]],
      },
    };

    const result = resolveSeriesDisplayNames(channels);

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Voltage (test2)');
    expect(result[1].name).toBe('Voltage (test3)');
  });
});
