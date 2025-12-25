import { create } from 'zustand';

import { ChartSerie } from '@renderer/components/Chart/ChartSerie';

interface ChannelChartsState {
  charts: {
    [chartId: string]: {
      name: string;
      channels: {
        [channelId: string]: ChartSerie;
      };
    };
  };
  chartCounter: number;
  selectedChartId: string | null;
  actions: {
    toggleSelectedChartId: (chartId: string) => void;
    addChart: (chartId: string) => void;
    removeChart: (chartId: string) => void;
    addChannelToChart: (chartId: string, channelId: string, serie: ChartSerie) => void;
    removeChannelFromChart: (chartId: string, channelId: string) => void;
    changeNameOfChart: (chartId: string, newName: string) => void;
  };
}

const useChannelChartsStore = create<ChannelChartsState>()((set) => ({
  charts: {},
  chartCounter: 0,
  selectedChartId: null,
  actions: {
    toggleSelectedChartId: (chartId: string) =>
      set((state) => ({
        selectedChartId: state.selectedChartId === chartId ? null : chartId,
      })),
    addChart: (chartId: string) =>
      set((state) => {
        if (state.charts[chartId]) {
          throw new Error(`Chart with id ${chartId} already exists.`);
        }
        const nextCounter = state.chartCounter + 1;
        return {
          charts: {
            ...state.charts,
            [chartId]: {
              name: `Chart ${nextCounter}`,
              channels: {},
            },
          },
          chartCounter: nextCounter,
        };
      }),
    removeChart: (chartId: string) =>
      set((state) => {
        const { [chartId]: _removedChart, ...remainingCharts } = state.charts;
        return { charts: remainingCharts };
      }),
    addChannelToChart: (chartId: string, channelId: string, serie: ChartSerie) =>
      set((state) => {
        const chart = state.charts[chartId];
        if (!chart) {
          throw new Error(`Chart with id ${chartId} does not exist.`);
        }

        const channelCount = Object.keys(chart.channels).length;
        const isFirstChannel = channelCount === 0;
        const hasDefaultName = /^Chart \d+$/.test(chart.name);

        const shouldRenameChart = isFirstChannel && hasDefaultName;
        const newName = shouldRenameChart ? serie.name : chart.name;

        return {
          charts: {
            ...state.charts,
            [chartId]: {
              ...chart,
              name: newName,
              channels: {
                ...chart.channels,
                [channelId]: serie,
              },
            },
          },
        };
      }),
    removeChannelFromChart: (chartId: string, channelId: string) =>
      set((state) => {
        const chart = state.charts[chartId];
        if (!chart) {
          throw new Error(`Chart with id ${chartId} does not exist.`);
        }
        const { [channelId]: _removedChannel, ...remainingChannels } = chart.channels;
        return {
          charts: {
            ...state.charts,
            [chartId]: {
              ...chart,
              channels: remainingChannels,
            },
          },
        };
      }),
    changeNameOfChart: (chartId: string, newName: string) =>
      set((state) => {
        const chart = state.charts[chartId];
        if (!chart) {
          throw new Error(`Chart with id ${chartId} does not exist.`);
        }
        return {
          charts: {
            ...state.charts,
            [chartId]: { ...chart, name: newName },
          },
        };
      }),
  },
}));

export const useSelectedChartId = () => useChannelChartsStore((state) => state.selectedChartId);
export const useCharts = () => useChannelChartsStore((state) => state.charts);
export const useChannelChartsActions = () => useChannelChartsStore((state) => state.actions);
export { useChannelChartsStore };
