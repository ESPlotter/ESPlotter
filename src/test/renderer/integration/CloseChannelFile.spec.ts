import { describe, expect, test, beforeEach } from 'vitest';

import { ChartSerie } from '@renderer/components/Chart/ChartSerie';
import { useChannelChartsStore } from '@renderer/store/ChannelChartsStore';
import { useChannelFilesStore } from '@renderer/store/ChannelFilesStore';
import { ChannelFilePrimitive } from '@shared/domain/primitives/ChannelFilePrimitive';

function createMockSerie(name: string): ChartSerie {
  return {
    name,
    type: 'line',
    data: [
      [1, 10],
      [2, 20],
    ],
  };
}

function createMockChannelFile(path: string): ChannelFilePrimitive {
  return {
    path,
    content: {
      schemaVersion: 1,
      metadata: {
        type: 'csv',
      },
      x: {
        id: 'time',
        label: 'Time',
        unit: 's',
        values: [0, 1, 2],
      },
      series: [
        {
          id: 'channel-1',
          label: 'Voltage',
          unit: 'V',
          values: [10, 20, 30],
        },
        {
          id: 'channel-2',
          label: 'Current',
          unit: 'A',
          values: [1, 2, 3],
        },
      ],
    },
  };
}

describe('Close Channel File Integration', () => {
  beforeEach(() => {
    useChannelFilesStore.setState({
      files: [],
      actions: useChannelFilesStore.getState().actions,
    });
    useChannelChartsStore.setState({
      charts: {},
      chartCounter: 0,
      selectedChartId: null,
      actions: useChannelChartsStore.getState().actions,
    });
  });

  test('should remove file and its channels from charts when closing a file', () => {
    const chartActions = useChannelChartsStore.getState().actions;
    const fileActions = useChannelFilesStore.getState().actions;

    // Setup: Add files
    const file1 = createMockChannelFile('/path/to/file1.csv');
    const file2 = createMockChannelFile('/path/to/file2.csv');
    fileActions.addFile(file1);
    fileActions.addFile(file2);

    // Setup: Create chart and add channels
    chartActions.addChart('chart-1');
    chartActions.addChannelToChart(
      'chart-1',
      '/path/to/file1.csv::channel-1',
      createMockSerie('File1 Channel1'),
    );
    chartActions.addChannelToChart(
      'chart-1',
      '/path/to/file1.csv::channel-2',
      createMockSerie('File1 Channel2'),
    );
    chartActions.addChannelToChart(
      'chart-1',
      '/path/to/file2.csv::channel-1',
      createMockSerie('File2 Channel1'),
    );

    // Verify setup
    expect(useChannelFilesStore.getState().files).toHaveLength(2);
    expect(Object.keys(useChannelChartsStore.getState().charts['chart-1'].channels)).toHaveLength(
      3,
    );

    // Action: Close file1
    chartActions.removeChannelsFromAllCharts('/path/to/file1.csv');
    fileActions.removeFile('/path/to/file1.csv');

    // Verify: File is removed from files list
    const { files } = useChannelFilesStore.getState();
    expect(files).toHaveLength(1);
    expect(files[0].path).toBe('/path/to/file2.csv');

    // Verify: Channels from file1 are removed from chart
    const { charts } = useChannelChartsStore.getState();
    const chartChannels = charts['chart-1'].channels;
    expect(Object.keys(chartChannels)).toHaveLength(1);
    expect(chartChannels['/path/to/file1.csv::channel-1']).toBeUndefined();
    expect(chartChannels['/path/to/file1.csv::channel-2']).toBeUndefined();
    expect(chartChannels['/path/to/file2.csv::channel-1']).toBeDefined();
  });

  test('should remove channels from multiple charts when closing a file', () => {
    const chartActions = useChannelChartsStore.getState().actions;
    const fileActions = useChannelFilesStore.getState().actions;

    // Setup: Add file
    const file1 = createMockChannelFile('/path/to/file1.csv');
    fileActions.addFile(file1);

    // Setup: Create multiple charts with channels from same file
    chartActions.addChart('chart-1');
    chartActions.addChart('chart-2');
    chartActions.addChannelToChart(
      'chart-1',
      '/path/to/file1.csv::channel-1',
      createMockSerie('Channel1'),
    );
    chartActions.addChannelToChart(
      'chart-2',
      '/path/to/file1.csv::channel-2',
      createMockSerie('Channel2'),
    );

    // Verify setup
    expect(Object.keys(useChannelChartsStore.getState().charts['chart-1'].channels)).toHaveLength(
      1,
    );
    expect(Object.keys(useChannelChartsStore.getState().charts['chart-2'].channels)).toHaveLength(
      1,
    );

    // Action: Close file
    chartActions.removeChannelsFromAllCharts('/path/to/file1.csv');
    fileActions.removeFile('/path/to/file1.csv');

    // Verify: Channels removed from all charts
    const { charts } = useChannelChartsStore.getState();
    expect(Object.keys(charts['chart-1'].channels)).toHaveLength(0);
    expect(Object.keys(charts['chart-2'].channels)).toHaveLength(0);
  });

  test('should not affect other files or charts when closing a specific file', () => {
    const chartActions = useChannelChartsStore.getState().actions;
    const fileActions = useChannelFilesStore.getState().actions;

    // Setup: Add multiple files
    const file1 = createMockChannelFile('/path/to/file1.csv');
    const file2 = createMockChannelFile('/path/to/file2.csv');
    const file3 = createMockChannelFile('/path/to/file3.csv');
    fileActions.addFile(file1);
    fileActions.addFile(file2);
    fileActions.addFile(file3);

    // Setup: Create chart with channels from different files
    chartActions.addChart('chart-1');
    chartActions.addChannelToChart(
      'chart-1',
      '/path/to/file1.csv::channel-1',
      createMockSerie('File1'),
    );
    chartActions.addChannelToChart(
      'chart-1',
      '/path/to/file2.csv::channel-1',
      createMockSerie('File2'),
    );
    chartActions.addChannelToChart(
      'chart-1',
      '/path/to/file3.csv::channel-1',
      createMockSerie('File3'),
    );

    // Action: Close file2
    chartActions.removeChannelsFromAllCharts('/path/to/file2.csv');
    fileActions.removeFile('/path/to/file2.csv');

    // Verify: Only file2 is removed from files
    const { files } = useChannelFilesStore.getState();
    expect(files).toHaveLength(2);
    expect(files.map((f) => f.path)).toContain('/path/to/file1.csv');
    expect(files.map((f) => f.path)).toContain('/path/to/file3.csv');

    // Verify: Only file2 channels are removed from chart
    const { charts } = useChannelChartsStore.getState();
    const chartChannels = charts['chart-1'].channels;
    expect(Object.keys(chartChannels)).toHaveLength(2);
    expect(chartChannels['/path/to/file1.csv::channel-1']).toBeDefined();
    expect(chartChannels['/path/to/file2.csv::channel-1']).toBeUndefined();
    expect(chartChannels['/path/to/file3.csv::channel-1']).toBeDefined();
  });
});
