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
  selectedChartId: string | null;
  toggleSelectedChartId: (chartId: string) => void;
  addChart: (chartId: string) => void;
  removeChart: (chartId: string) => void;
  addChannelToChart: (chartId: string, channelId: string, serie: ChartSerie) => void;
  removeChannelFromChart: (chartId: string, channelId: string) => void;
  changeNameOfChart: (chartId: string, newName: string) => void;
}

export const useChannelChartsStore = create<ChannelChartsState>()((set) => ({
  charts: {},
  selectedChartId: null,
  toggleSelectedChartId: (chartId: string) =>
    set((state) => ({
      selectedChartId: state.selectedChartId === chartId ? null : chartId,
    })),
  addChart: (chartId: string) =>
    set((state) => {
      if (state.charts[chartId]) {
        throw new Error(`Chart with id ${chartId} already exists.`);
      }
      return {
        charts: {
          ...state.charts,
          [chartId]: {
            name: `Chart: ${chartId}`,
            channels: {},
          },
        },
      };
    }),
  removeChart: (chartId: string) =>
    set((state) => {
      const { [chartId]: _removedChart, ...remainingCharts } = state.charts;
      return { charts: remainingCharts };
    }),
  addChannelToChart: (chartId: string, channelId: string, serie: ChartSerie) =>
    set((state) => {
      const chart = state.charts[chartId] || {};
      if (!chart) {
        throw new Error(`Chart with id ${chartId} does not exist.`);
      }
      return {
        charts: {
          ...state.charts,
          [chartId]: {
            ...chart,
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
      const chart = state.charts[chartId] || {};
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
}));
