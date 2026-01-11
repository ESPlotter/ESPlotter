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
        const name = getNextChartName(state.charts);
        return {
          charts: {
            ...state.charts,
            [chartId]: {
              name: name,
              channels: {},
            },
          },
          selectedChartId: chartId,
        };
      }),
    removeChart: (chartId: string) =>
      set((state) => {
        const { [chartId]: _removedChart, ...remainingCharts } = state.charts;
      
        const nextSelectedChartId =
          state.selectedChartId === chartId
            ? Object.keys(remainingCharts)[0] ?? null
            : state.selectedChartId;
      
        return {
          charts: remainingCharts,
          selectedChartId: nextSelectedChartId,
        };
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getNextChartName(charts: Record<string, any>): string {
  const existingNumbers = Object.values(charts)
    .map((c) => {
      const match = c.name.match(/^Chart (\d+)$/);
      return match ? Number(match[1]) : null;
    })
    .filter(Boolean) as number[];

  let i = 1;
  while (existingNumbers.includes(i)) i++;
  return `Chart ${i}`;
}

