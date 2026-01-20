import { create } from 'zustand';

import { ChartSerie } from '@renderer/components/Chart/ChartSerie';

const DEFAULT_CHART_NAME_PATTERN = /^Chart \d+$/;

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
    setSelectedChartId: (chartId: string | null) => void;
    addChart: (chartId: string) => void;
    removeChart: (chartId: string) => void;
    addChannelToChart: (chartId: string, channelId: string, serie: ChartSerie) => void;
    removeChannelFromChart: (chartId: string, channelId: string) => void;
    removeChannelsFromAllCharts: (filePath: string) => void;
    changeNameOfChart: (chartId: string, newName: string) => void;
  };
}

export const useChannelChartsStore = create<ChannelChartsState>()((set) => ({
  charts: {},
  chartCounter: 0,
  selectedChartId: null,
  actions: {
    setSelectedChartId: (chartId: string | null) =>
      set(() => ({
        selectedChartId: chartId,
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
          selectedChartId: chartId,
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
        const hasDefaultName = DEFAULT_CHART_NAME_PATTERN.test(chart.name);

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
    removeChannelsFromAllCharts: (filePath: string) =>
      set((state) => {
        const prefix = `${filePath}::`;
        const updatedCharts = Object.fromEntries(
          Object.entries(state.charts).map(([chartId, chart]) => {
            // Get channels being removed and remaining channels
            const removedChannels = Object.entries(chart.channels).filter(([channelKey]) =>
              channelKey.startsWith(prefix),
            );
            const remainingChannels = Object.fromEntries(
              Object.entries(chart.channels).filter(([channelKey]) => !channelKey.startsWith(prefix)),
            );

            // Determine new chart name
            let newName = chart.name;
            
            // Check if any removed channel name matches the chart title
            const removedChannelNames = removedChannels.map(([_, serie]) => serie.name);
            const chartTitleMatchesRemovedChannel = removedChannelNames.includes(chart.name);

            if (chartTitleMatchesRemovedChannel) {
              const remainingChannelsList = Object.values(remainingChannels);
              
              if (remainingChannelsList.length === 0) {
                // Chart is now empty, reset to default name
                // Find the chart's position (1-indexed) based on when it was created
                const chartEntries = Object.entries(state.charts);
                const chartIndex = chartEntries.findIndex(([id]) => id === chartId);
                const chartPosition = chartIndex + 1;
                newName = `Chart ${chartPosition}`;
              } else {
                // Chart still has channels, use the first remaining channel's name
                newName = remainingChannelsList[0].name;
              }
            }

            return [chartId, { ...chart, name: newName, channels: remainingChannels }];
          }),
        );
        return { charts: updatedCharts };
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
