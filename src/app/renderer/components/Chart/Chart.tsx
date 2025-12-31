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
import { generateRandomHexColor } from '@shared/utils/generateRandomHexColor';

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
      className={`flex h-full w-full rounded-sm border-2 ${isSelected ? 'border-slate-900/35' : 'border-transparent'}`}
      onClick={() => toggleSelectedChartId(id)}
    >
      <ReactEChartsCore
        className="h-full w-full"
        echarts={echarts}
        option={options}
        notMerge={true}
        lazyUpdate={true}
        style={{ height: '100%', width: '100%' }}
      />
    </div>
  );
}

function mergeSeriesWithDefaultParams(series: ChartSerie[], palette: string[]): EChartsOption {
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
  return series.map((serie, index) => {
    const existing = palette[index];
    if (existing) {
      return existing;
    }
    return generateRandomHexColor();
  });
}
