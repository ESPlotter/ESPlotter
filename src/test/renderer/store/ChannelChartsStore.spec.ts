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

    test('should select the newly created chart', () => {
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
});
