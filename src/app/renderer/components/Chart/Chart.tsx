import { EChartsOption } from 'echarts';
import { LineChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
  ToolboxComponent,
  DataZoomComponent,
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
]);

const DRAG_THRESHOLD_PIXELS = 10;

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
  const dragStartRef = useRef<{ x: number; y: number; pixelX: number; pixelY: number } | null>(
    null,
  );
  const isDraggingRef = useRef(false);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 2) {
      e.preventDefault();
      e.stopPropagation();
      const chartInstance = chartRef.current?.getEchartsInstance();
      if (!chartInstance) {
        return;
      }

      const rect = e.currentTarget.getBoundingClientRect();
      const pixelX = e.clientX - rect.left;
      const pixelY = e.clientY - rect.top;

      const pointInGrid = chartInstance.convertFromPixel({ gridIndex: 0 }, [pixelX, pixelY]);
      if (pointInGrid) {
        dragStartRef.current = {
          x: pointInGrid[0],
          y: pointInGrid[1],
          pixelX,
          pixelY,
        };
        isDraggingRef.current = true;
      }
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDraggingRef.current && dragStartRef.current && e.buttons === 2) {
      e.preventDefault();
    }
  }, []);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (e.button === 2 && dragStartRef.current && isDraggingRef.current) {
      e.preventDefault();
      e.stopPropagation();

      const chartInstance = chartRef.current?.getEchartsInstance();
      if (!chartInstance) {
        dragStartRef.current = null;
        isDraggingRef.current = false;
        return;
      }

      const rect = e.currentTarget.getBoundingClientRect();
      const endPixelX = e.clientX - rect.left;
      const endPixelY = e.clientY - rect.top;

      const deltaX = endPixelX - dragStartRef.current.pixelX;

      if (deltaX < -DRAG_THRESHOLD_PIXELS) {
        chartInstance.dispatchAction({
          type: 'restore',
        });
      } else if (deltaX > DRAG_THRESHOLD_PIXELS) {
        const endPoint = chartInstance.convertFromPixel({ gridIndex: 0 }, [endPixelX, endPixelY]);

        if (endPoint) {
          const startX = Math.min(dragStartRef.current.x, endPoint[0]);
          const endX = Math.max(dragStartRef.current.x, endPoint[0]);
          const startY = Math.min(dragStartRef.current.y, endPoint[1]);
          const endY = Math.max(dragStartRef.current.y, endPoint[1]);

          const option = chartInstance.getOption();
          const xAxis = option.xAxis?.[0];
          const yAxis = option.yAxis?.[0];

          if (xAxis && yAxis) {
            const xMin = typeof xAxis.min === 'number' ? xAxis.min : startX;
            const xMax = typeof xAxis.max === 'number' ? xAxis.max : endX;
            const yMin = typeof yAxis.min === 'number' ? yAxis.min : startY;
            const yMax = typeof yAxis.max === 'number' ? yAxis.max : endY;

            const xRange = xMax - xMin;
            const yRange = yMax - yMin;

            if (xRange > 0 && yRange > 0) {
              const startPercent = ((startX - xMin) / xRange) * 100;
              const endPercent = ((endX - xMin) / xRange) * 100;
              const startYPercent = ((startY - yMin) / yRange) * 100;
              const endYPercent = ((endY - yMin) / yRange) * 100;

              chartInstance.dispatchAction({
                type: 'dataZoom',
                dataZoomIndex: 0,
                start: Math.max(0, Math.min(100, startPercent)),
                end: Math.max(0, Math.min(100, endPercent)),
              });

              chartInstance.dispatchAction({
                type: 'dataZoom',
                dataZoomIndex: 1,
                start: Math.max(0, Math.min(100, startYPercent)),
                end: Math.max(0, Math.min(100, endYPercent)),
              });
            }
          }
        }
      }

      dragStartRef.current = null;
      isDraggingRef.current = false;
    }
  }, []);

  const handleClick = useCallback(() => {
    if (!isDraggingRef.current) {
      toggleSelectedChartId(id);
    }
  }, [id, toggleSelectedChartId]);

  return (
    <div
      className={`flex h-full w-full rounded-sm border-2 ${isSelected ? 'border-slate-900/35' : 'border-transparent'}`}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
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
      },
      {
        type: 'inside',
        yAxisIndex: [0],
        filterMode: 'none',
      },
    ],
    series: series.map((s) => ({
      ...s,
      showSymbol: false,
    })),
  };
}
