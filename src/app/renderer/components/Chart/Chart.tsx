import { useMemo } from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { EChartsOption } from 'echarts';
import { ChartSerie } from './ChartSerie';

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LineChart,
  CanvasRenderer,
  LegendComponent,
]);

export function Chart({ series }: { series: ChartSerie[] }) {
  const options = useMemo(() => mergeSeriesWithDefaultParams(series), [series]);

  return <ReactEChartsCore echarts={echarts} option={options} notMerge={true} lazyUpdate={true} />;
}

function mergeSeriesWithDefaultParams(series: ChartSerie[]): EChartsOption {
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
    series: series.map((s) => ({
      ...s,
      showSymbol: false,
    })),
  };
}
