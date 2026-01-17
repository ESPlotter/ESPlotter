import { describe, expect, test, beforeEach } from 'vitest';

import { ChartSerie } from '@renderer/components/Chart/ChartSerie';
import { useChannelChartsStore } from '@renderer/store/ChannelChartsStore';

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

describe('ChannelChartsStore', () => {
  beforeEach(() => {
    useChannelChartsStore.setState({
      charts: {},
      chartCounter: 0,
      selectedChartId: null,
      actions: useChannelChartsStore.getState().actions,
    });
  });

  describe('addChart', () => {
    test('should create first chart with name "Chart 1"', () => {
      const { addChart } = useChannelChartsStore.getState().actions;

      addChart('chart-id-1');

      const { charts } = useChannelChartsStore.getState();
      expect(charts['chart-id-1'].name).toBe('Chart 1');
    });

    test('should create multiple charts with incremental names', () => {
      const { addChart } = useChannelChartsStore.getState().actions;

      addChart('chart-id-1');
      addChart('chart-id-2');
      addChart('chart-id-3');

      const { charts } = useChannelChartsStore.getState();
      expect(charts['chart-id-1'].name).toBe('Chart 1');
      expect(charts['chart-id-2'].name).toBe('Chart 2');
      expect(charts['chart-id-3'].name).toBe('Chart 3');
    });

    test('should auto-select the newly created chart', () => {
      const { addChart } = useChannelChartsStore.getState().actions;

      addChart('chart-id-1');
      expect(useChannelChartsStore.getState().selectedChartId).toBe('chart-id-1');

      addChart('chart-id-2');
      expect(useChannelChartsStore.getState().selectedChartId).toBe('chart-id-2');
    });
  });

  describe('addChannelToChart', () => {
    test('should rename chart to channel name when adding first channel to chart with default name', () => {
      const { addChart, addChannelToChart } = useChannelChartsStore.getState().actions;

      addChart('chart-id-1');
      const voltageSerie = createMockSerie('Voltage');
      addChannelToChart('chart-id-1', 'channel-1', voltageSerie);

      const { charts } = useChannelChartsStore.getState();
      expect(charts['chart-id-1'].name).toBe('Voltage');
    });

    test('should not rename chart when adding second channel', () => {
      const { addChart, addChannelToChart } = useChannelChartsStore.getState().actions;

      addChart('chart-id-1');
      const voltageSerie = createMockSerie('Voltage');
      const frequencySerie = createMockSerie('Frequency');

      addChannelToChart('chart-id-1', 'channel-1', voltageSerie);
      addChannelToChart('chart-id-1', 'channel-2', frequencySerie);

      const { charts } = useChannelChartsStore.getState();
      expect(charts['chart-id-1'].name).toBe('Voltage');
    });

    test('should not rename chart if user has manually changed the name', () => {
      const { addChart, changeNameOfChart, addChannelToChart } =
        useChannelChartsStore.getState().actions;

      addChart('chart-id-1');
      changeNameOfChart('chart-id-1', 'My Custom Chart');

      const voltageSerie = createMockSerie('Voltage');
      addChannelToChart('chart-id-1', 'channel-1', voltageSerie);

      const { charts } = useChannelChartsStore.getState();
      expect(charts['chart-id-1'].name).toBe('My Custom Chart');
    });
  });

  describe('removeChannelsFromAllCharts', () => {
    test('should remove all channels from a specific file path', () => {
      const { addChart, addChannelToChart, removeChannelsFromAllCharts } =
        useChannelChartsStore.getState().actions;

      addChart('chart-id-1');
      const voltageSerie = createMockSerie('Voltage');
      const frequencySerie = createMockSerie('Frequency');

      addChannelToChart('chart-id-1', '/path/to/file1.csv::channel-1', voltageSerie);
      addChannelToChart('chart-id-1', '/path/to/file2.csv::channel-2', frequencySerie);

      removeChannelsFromAllCharts('/path/to/file1.csv');

      const { charts } = useChannelChartsStore.getState();
      expect(charts['chart-id-1'].channels['/path/to/file1.csv::channel-1']).toBeUndefined();
      expect(charts['chart-id-1'].channels['/path/to/file2.csv::channel-2']).toBeDefined();
    });

    test('should remove channels from multiple charts', () => {
      const { addChart, addChannelToChart, removeChannelsFromAllCharts } =
        useChannelChartsStore.getState().actions;

      addChart('chart-id-1');
      addChart('chart-id-2');
      const voltageSerie = createMockSerie('Voltage');
      const currentSerie = createMockSerie('Current');
      const frequencySerie = createMockSerie('Frequency');

      addChannelToChart('chart-id-1', '/path/to/file1.csv::channel-1', voltageSerie);
      addChannelToChart('chart-id-1', '/path/to/file2.csv::channel-2', frequencySerie);
      addChannelToChart('chart-id-2', '/path/to/file1.csv::channel-3', currentSerie);
      addChannelToChart('chart-id-2', '/path/to/file2.csv::channel-4', frequencySerie);

      removeChannelsFromAllCharts('/path/to/file1.csv');

      const { charts } = useChannelChartsStore.getState();
      expect(charts['chart-id-1'].channels['/path/to/file1.csv::channel-1']).toBeUndefined();
      expect(charts['chart-id-1'].channels['/path/to/file2.csv::channel-2']).toBeDefined();
      expect(charts['chart-id-2'].channels['/path/to/file1.csv::channel-3']).toBeUndefined();
      expect(charts['chart-id-2'].channels['/path/to/file2.csv::channel-4']).toBeDefined();
    });

    test('should preserve all channels when file path does not match', () => {
      const { addChart, addChannelToChart, removeChannelsFromAllCharts } =
        useChannelChartsStore.getState().actions;

      addChart('chart-id-1');
      const voltageSerie = createMockSerie('Voltage');
      const frequencySerie = createMockSerie('Frequency');

      addChannelToChart('chart-id-1', '/path/to/file1.csv::channel-1', voltageSerie);
      addChannelToChart('chart-id-1', '/path/to/file2.csv::channel-2', frequencySerie);

      removeChannelsFromAllCharts('/path/to/file3.csv');

      const { charts } = useChannelChartsStore.getState();
      expect(charts['chart-id-1'].channels['/path/to/file1.csv::channel-1']).toBeDefined();
      expect(charts['chart-id-1'].channels['/path/to/file2.csv::channel-2']).toBeDefined();
    });

    test('should handle charts with no channels', () => {
      const { addChart, removeChannelsFromAllCharts } = useChannelChartsStore.getState().actions;

      addChart('chart-id-1');
      removeChannelsFromAllCharts('/path/to/file1.csv');

      const { charts } = useChannelChartsStore.getState();
      expect(Object.keys(charts['chart-id-1'].channels)).toHaveLength(0);
    });
  });
});
