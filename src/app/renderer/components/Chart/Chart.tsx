import { IconHandGrab, IconHome, IconZoomIn } from '@tabler/icons-react';
import { EChartsOption } from 'echarts';
import { LineChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
  DataZoomComponent,
  ToolboxComponent,
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import { useMemo, useRef, useCallback, useState, useEffect } from 'react';

import { useChannelChartsActions } from '@renderer/store/ChannelChartsStore';
import { Button } from '@shadcn/components/ui/button';

import { ChartSerie } from './ChartSerie';

import type { EChartsType } from 'echarts/core';

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LineChart,
  CanvasRenderer,
  LegendComponent,
  DataZoomComponent,
  ToolboxComponent,
]);

type ChartMode = 'zoom' | 'pan';

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
  const { setSelectedChartId } = useChannelChartsActions();
  const chartRef = useRef<ReactEChartsCore>(null);
  const [mode, setMode] = useState<ChartMode>('zoom');
  const pointerDownRef = useRef<{ x: number; y: number } | null>(null);
  const pointerMovedRef = useRef(false);

  const applyInteractionMode = useCallback((nextMode: ChartMode, instance?: EChartsType | null) => {
    const chartInstance = instance ?? chartRef.current?.getEchartsInstance();
    if (!chartInstance) {
      return;
    }

    chartInstance.dispatchAction({
      type: 'takeGlobalCursor',
      key: 'dataZoomSelect',
      dataZoomSelectActive: nextMode === 'zoom',
    });
  }, []);

  useEffect(() => {
    applyInteractionMode(mode);
  }, [applyInteractionMode, mode]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  const handleChartReady = useCallback(
    (instance: EChartsType) => {
      applyInteractionMode(mode, instance);
    },
    [applyInteractionMode, mode],
  );

  const handleClick = useCallback(() => {
    setSelectedChartId(id);
  }, [id, setSelectedChartId]);

  const handleMouseDownSelection = useCallback((e: React.MouseEvent) => {
    pointerDownRef.current = { x: e.clientX, y: e.clientY };
    pointerMovedRef.current = false;
  }, []);

  const handleMouseMoveSelection = useCallback((e: React.MouseEvent) => {
    if (!pointerDownRef.current) return;
    const dx = Math.abs(e.clientX - pointerDownRef.current.x);
    const dy = Math.abs(e.clientY - pointerDownRef.current.y);
    if (dx > 3 || dy > 3) {
      pointerMovedRef.current = true;
    }
  }, []);

  const handleMouseUpSelection = useCallback(() => {
    if (pointerDownRef.current && !pointerMovedRef.current) {
      handleClick();
    }
    pointerDownRef.current = null;
    pointerMovedRef.current = false;
  }, [handleClick]);

  const handleReset = useCallback(() => {
    const chartInstance = chartRef.current?.getEchartsInstance();
    if (chartInstance) {
      chartInstance.dispatchAction({
        type: 'restore',
      });
    }
  }, []);

  const handleZoomMode = useCallback(() => {
    setMode('zoom');
  }, []);

  const handlePanMode = useCallback(() => {
    setMode('pan');
  }, []);

  return (
    <div className="flex h-full w-full flex-col gap-1">
      <div className="flex gap-1">
        <Button
          variant={mode === 'zoom' ? 'default' : 'outline'}
          size="icon-sm"
          onClick={handleZoomMode}
          title="Zoom mode"
        >
          <IconZoomIn className="size-4" />
        </Button>
        <Button
          variant={mode === 'pan' ? 'default' : 'outline'}
          size="icon-sm"
          onClick={handlePanMode}
          title="Pan mode"
        >
          <IconHandGrab className="size-4" />
        </Button>
        <Button variant="outline" size="icon-sm" onClick={handleReset} title="Reset zoom">
          <IconHome className="size-4" />
        </Button>
      </div>
      <div
        className={`relative flex min-h-0 flex-1 rounded-sm border-2 ${isSelected ? 'border-slate-900/35' : 'border-transparent'}`}
        onContextMenu={handleContextMenu}
        onMouseDown={handleMouseDownSelection}
        onMouseMove={handleMouseMoveSelection}
        onMouseUp={handleMouseUpSelection}
        style={{ cursor: mode === 'pan' ? 'grab' : 'crosshair' }}
      >
        <ReactEChartsCore
          ref={chartRef}
          className="h-full w-full"
          echarts={echarts}
          option={options}
          notMerge={true}
          lazyUpdate={true}
          onChartReady={handleChartReady}
          style={{ height: '100%', width: '100%' }}
        />
      </div>
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
      axisLabel: {
        fontSize: 10,
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontSize: 10,
      },
    },
    legend: {
      show: true,
    },
    toolbox: {
      show: true,
      feature: {
        dataZoom: {
          xAxisIndex: 0,
          yAxisIndex: 0,
        },
        restore: {},
      },
    },
    dataZoom: [
      {
        type: 'inside',
        xAxisIndex: 0,
        zoomOnMouseWheel: true,
        moveOnMouseMove: true,
      },
      {
        type: 'inside',
        yAxisIndex: 0,
        zoomOnMouseWheel: true,
        moveOnMouseMove: true,
      },
    ],
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
