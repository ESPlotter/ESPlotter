import { nanoid } from 'nanoid';
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
    removeAllCharts: () => void;
  };
}

export const useChannelChartsStore = create<ChannelChartsState>()((set) => {
  const defaultChartId = nanoid();
  return {
    charts: {
      [defaultChartId]: {
        name: 'Chart 1',
        channels: {},
      },
    },
    chartCounter: 1,
    selectedChartId: defaultChartId,
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
                name,
                channels: {},
              },
            },
            selectedChartId: chartId,
          };
        }),

      removeChart: (chartId: string) =>
        set((state) => {
          const { [chartId]: removedChart, ...remainingCharts } = state.charts;

          const newCharts: typeof remainingCharts = {};

          const deletedNumber =
            removedChart && /^Chart \d+$/.test(removedChart.name)
              ? Number(removedChart.name.replace('Chart ', ''))
              : null;

          Object.entries(remainingCharts).forEach(([id, chart], index) => {
            if (!/^Chart \d+$/.test(chart.name)) {
              newCharts[id] = chart;
              return;
            }

            const currentNumber = Number(chart.name.replace('Chart ', ''));
            let newNumber: number;

            if (deletedNumber) {
              // borrado automático → solo bajan los posteriores
              newNumber = currentNumber > deletedNumber ? currentNumber - 1 : currentNumber;
            } else {
              newNumber = index + 1;
            }

            newCharts[id] = { ...chart, name: `Chart ${newNumber}` };
          });
          const nextSelectedChartId =
            state.selectedChartId === chartId
              ? (Object.keys(newCharts)[Object.keys(newCharts).length - 1] ?? null)
              : state.selectedChartId;

          return {
            charts: newCharts,
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
                Object.entries(chart.channels).filter(
                  ([channelKey]) => !channelKey.startsWith(prefix),
                ),
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

      removeAllCharts: () =>
        set(() => {
          const defaultChartId = nanoid();
          return {
            charts: {
              [defaultChartId]: {
                name: 'Chart 1',
                channels: {},
              },
            },
            selectedChartId: defaultChartId,
          };
        }),
    },
  };
});

export const useSelectedChartId = () => useChannelChartsStore((state) => state.selectedChartId);
export const useCharts = () => useChannelChartsStore((state) => state.charts);
export const useChannelChartsActions = () => useChannelChartsStore((state) => state.actions);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getNextChartName(charts: Record<string, any>): string {
  return `Chart ${Object.keys(charts).length + 1}`;
}
