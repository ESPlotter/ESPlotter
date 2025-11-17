import { EChartsOption } from 'echarts';
import { LineChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import { useMemo } from 'react';

import { useChannelChartsActions } from '@renderer/store/ChannelChartsStore';
import { useUserPreferencesChartSeriesPalette } from '@renderer/store/UserPreferencesStore';
import { normalizeChartSeriesColor } from '@shared/domain/validators/normalizeChartSeriesColor';

import { ChartSerie } from './ChartSerie';

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LineChart,
  CanvasRenderer,
  LegendComponent,
]);

export function Chart({
  id,
  isSelected,
  series,
}: {
  id: string;
  isSelected: boolean;
  series: ChartSerie[];
}) {
  const chartSeriesPalette = useUserPreferencesChartSeriesPalette();
  const options = useMemo(
    () => mergeSeriesWithDefaultParams(series, chartSeriesPalette),
    [series, chartSeriesPalette],
  );
  const { toggleSelectedChartId } = useChannelChartsActions();

  return (
    <div
      className={`w-full p-4 border-2 rounded-sm ${isSelected ? 'border-slate-900/35' : 'border-transparent'}`}
      onClick={() => toggleSelectedChartId(id)}
    >
      <ReactEChartsCore echarts={echarts} option={options} notMerge={true} lazyUpdate={true} />
    </div>
  );
}

function mergeSeriesWithDefaultParams(
  series: ChartSerie[],
  palette: string[],
): EChartsOption {
  const colors = resolveSeriesColors(series, palette);
  return {
    animation: false,
    grid: {
      left: 1,
      right: 1,
      containLabel: false,
    },
    xAxis: {
      type: 'value',
      interval: 0.2,
      axisLabel: {
        fontSize: 10,
      },
    },
    yAxis: {
      type: 'value',
    },
    legend: {
      show: true,
    },
    tooltip: {
      show: true,
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          show: true,
        },
        animation: false,
      },
    },
    color: colors,
    series: series.map((s) => ({
      ...s,
      showSymbol: false,
    })),
  };
}

function resolveSeriesColors(series: ChartSerie[], palette: string[]): string[] {
  const normalizedPalette = palette.map((color) => normalizeChartSeriesColor(color));
  return series.map((serie, index) => {
    const existing = normalizedPalette[index];
    if (existing) {
      return existing;
    }
    return generateDeterministicColor(`${serie.name}-${index}`);
  });
}

function generateDeterministicColor(seed: string): string {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }
  const red = 64 + (hash & 0xff) % 192;
  const green = 64 + ((hash >> 8) & 0xff) % 192;
  const blue = 64 + ((hash >> 16) & 0xff) % 192;
  return `rgb(${red}, ${green}, ${blue})`;
}
