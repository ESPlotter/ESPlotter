import { EChartsOption } from 'echarts';
import { LineChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
  ToolboxComponent,
  DataZoomComponent,
  BrushComponent,
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import { useMemo, useRef, useCallback } from 'react';

import { useChannelChartsActions } from '@renderer/store/ChannelChartsStore';

import { ChartSerie } from './ChartSerie';

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LineChart,
  CanvasRenderer,
  LegendComponent,
  ToolboxComponent,
  DataZoomComponent,
  BrushComponent,
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
  const options = useMemo(() => mergeSeriesWithDefaultParams(series), [series]);
  const { toggleSelectedChartId } = useChannelChartsActions();
  const chartRef = useRef<ReactEChartsCore>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 2) {
      e.preventDefault();
      const rect = e.currentTarget.getBoundingClientRect();
      dragStartRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  }, []);

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 2 && dragStartRef.current) {
        e.preventDefault();
        const rect = e.currentTarget.getBoundingClientRect();
        const endX = e.clientX - rect.left;
        const startX = dragStartRef.current.x;
        const deltaX = endX - startX;

        const chartInstance = chartRef.current?.getEchartsInstance();
        if (!chartInstance) {
          dragStartRef.current = null;
          return;
        }

        if (deltaX < -10) {
          chartInstance.dispatchAction({
            type: 'dataZoom',
            start: 0,
            end: 100,
          });
          chartInstance.dispatchAction({
            type: 'restore',
          });
        }

        dragStartRef.current = null;
      }
    },
    [chartRef],
  );

  return (
    <div
      className={`flex h-full w-full rounded-sm border-2 ${isSelected ? 'border-slate-900/35' : 'border-transparent'}`}
      onClick={() => toggleSelectedChartId(id)}
      onContextMenu={handleContextMenu}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <ReactEChartsCore
        ref={chartRef}
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
    toolbox: {
      show: true,
      feature: {
        dataZoom: {
          yAxisIndex: 'none',
          title: {
            zoom: 'Zoom In',
            back: 'Zoom Out',
          },
        },
        restore: {
          title: 'Reset',
        },
      },
      right: 10,
      top: 0,
    },
    dataZoom: [
      {
        type: 'inside',
        xAxisIndex: [0],
        filterMode: 'none',
        disabled: true,
      },
      {
        type: 'inside',
        yAxisIndex: [0],
        filterMode: 'none',
        disabled: true,
      },
    ],
    brush: {
      toolbox: ['rect'],
      xAxisIndex: 0,
      yAxisIndex: 0,
      brushMode: 'single',
      transformable: false,
      throttleType: 'debounce',
      throttleDelay: 300,
    },
    series: series.map((s) => ({
      ...s,
      showSymbol: false,
    })),
  };
}
