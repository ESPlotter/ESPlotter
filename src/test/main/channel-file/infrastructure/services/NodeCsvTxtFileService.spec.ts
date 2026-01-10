import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { NodeCsvTxtFileService } from '@main/channel-file/infrastructure/services/NodeCsvTxtFileService';

describe('NodeCsvTxtFileService', () => {
  it('parses test1.txt fixture correctly', async () => {
    const service = new NodeCsvTxtFileService();
    const fixturePath = path.join(process.cwd(), 'fixtures', 'test1.txt');

    const channelFile = await service.transformToChannelFile(fixturePath);
    const primitives = channelFile.toPrimitives();

    expect(primitives.path).toBe(fixturePath);
    expect(primitives.content.metadata.shortTitle).toBe('test1');
    expect(primitives.content.x.label).toBe('Time');
    expect(primitives.content.x.values).toHaveLength(10000);
    expect(primitives.content.series).toHaveLength(3);

    const seriesLabels = primitives.content.series.map((s) => s.label);
    expect(seriesLabels).toEqual(['Voltage', 'Active Power', 'Reactive Power']);

    expect(primitives.content.x.values[0]).toBeCloseTo(0.001, 3);
    expect(primitives.content.series[0].values[0]).toBeCloseTo(1.07067, 3);
    expect(primitives.content.series[1].values[0]).toBeCloseTo(9.99997, 3);
    expect(primitives.content.series[2].values[0]).toBeCloseTo(-9.99997, 3);

    expect(primitives.content.x.values[9999]).toBeCloseTo(10.0, 3);
    expect(primitives.content.series[0].values[9999]).toBeCloseTo(1.07093, 3);
  });

  it('parses test4.csv fixture correctly', async () => {
    const service = new NodeCsvTxtFileService();
    const fixturePath = path.join(process.cwd(), 'fixtures', 'test4.csv');

    const channelFile = await service.transformToChannelFile(fixturePath);
    const primitives = channelFile.toPrimitives();

    expect(primitives.path).toBe(fixturePath);
    expect(primitives.content.metadata.shortTitle).toBe('test4');
    expect(primitives.content.x.label).toBe('Time');
    expect(primitives.content.x.values).toHaveLength(10000);
    expect(primitives.content.series).toHaveLength(3);

    const seriesLabels = primitives.content.series.map((s) => s.label);
    expect(seriesLabels).toEqual(['Voltage', 'Active Power', 'Reactive Power']);

    expect(primitives.content.x.values[0]).toBeCloseTo(0.001, 3);
    expect(primitives.content.series[0].values[0]).toBeCloseTo(1.07067, 3);
    expect(primitives.content.series[1].values[0]).toBeCloseTo(9.99997, 3);
    expect(primitives.content.series[2].values[0]).toBeCloseTo(-9.99997, 3);

    expect(primitives.content.x.values[9999]).toBeCloseTo(10.0, 3);
    expect(primitives.content.series[0].values[9999]).toBeCloseTo(1.07093, 3);
  });

  it('handles CSV format with comma-separated values', async () => {
    const service = new NodeCsvTxtFileService();
    const tmpPath = path.join(os.tmpdir(), `test-${Date.now()}.csv`);

    const csvContent = `Domain, Value1, Value2
1.0, 100.0, 200.0
2.0, 101.0, 201.0
3.0, 102.0, 202.0`;

    await fs.writeFile(tmpPath, csvContent, 'utf-8');

    try {
      const channelFile = await service.transformToChannelFile(tmpPath);
      const primitives = channelFile.toPrimitives();

      expect(primitives.content.x.label).toBe('Domain');
      expect(primitives.content.x.values).toEqual([1.0, 2.0, 3.0]);
      expect(primitives.content.series[0].label).toBe('Value1');
      expect(primitives.content.series[0].values).toEqual([100.0, 101.0, 102.0]);
      expect(primitives.content.series[1].label).toBe('Value2');
      expect(primitives.content.series[1].values).toEqual([200.0, 201.0, 202.0]);
    } finally {
      await fs.unlink(tmpPath).catch(() => {});
    }
  });

  it('throws error for file with insufficient columns', async () => {
    const service = new NodeCsvTxtFileService();
    const tmpPath = path.join(os.tmpdir(), `test-${Date.now()}.csv`);

    const csvContent = `Time
1.0
2.0`;

    await fs.writeFile(tmpPath, csvContent, 'utf-8');

    try {
      await expect(service.transformToChannelFile(tmpPath)).rejects.toThrow(
        'CSV/TXT file must have at least 2 columns',
      );
    } finally {
      await fs.unlink(tmpPath).catch(() => {});
    }
  });

  it('throws error for file with insufficient rows', async () => {
    const service = new NodeCsvTxtFileService();
    const tmpPath = path.join(os.tmpdir(), `test-${Date.now()}.csv`);

    const csvContent = `Time, Value1`;

    await fs.writeFile(tmpPath, csvContent, 'utf-8');

    try {
      await expect(service.transformToChannelFile(tmpPath)).rejects.toThrow(
        'CSV/TXT file must have at least a header row and one data row',
      );
    } finally {
      await fs.unlink(tmpPath).catch(() => {});
    }
  });
});
