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
  BrushComponent,
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import { useMemo, useRef, useState } from 'react';

import { useChannelChartsActions } from '@renderer/store/ChannelChartsStore';
import { Button } from '@shadcn/components/ui/button';

import { ChartSerie } from './ChartSerie';
import { useChartsHotkey } from './useChartHotKey';

import type { EChartsType } from 'echarts';

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LineChart,
  CanvasRenderer,
  LegendComponent,
  DataZoomComponent,
  ToolboxComponent,
  BrushComponent,
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
  const [mode, setMode] = useState<ChartMode>('zoom');
  const options = useMemo(() => mergeSeriesWithDefaultParams(series), [series]);
  const { setSelectedChartId } = useChannelChartsActions();
  const chartInstanceRef = useRef<EChartsType | null>(null);

  useChartsHotkey(getChart, { key: 'Escape' }, () => resetZoom(), { active: isSelected });

  useChartsHotkey(
    getChart,
    (e) => e.code === 'Space',
    () => enablePan(),
    { active: isSelected },
  );

  useChartsHotkey(getChart, { key: 'z' }, () => enableZoomSelect(), { active: isSelected });

  function getChart(): EChartsType | null {
    const chart = chartInstanceRef.current;
    if (!chart || chart.isDisposed()) {
      return null;
    }
    return chart;
  }

  function initChart(chart: EChartsType) {
    chartInstanceRef.current = chart;
    enableZoomSelect();
  }

  function resetZoom() {
    const chart = getChart();
    if (!chart) return;

    chart.dispatchAction({
      type: 'dataZoom',
      dataZoomId: 'datazoom-inside-x',
      start: 0,
      end: 100,
    });

    chart.dispatchAction({
      type: 'dataZoom',
      dataZoomId: 'datazoom-inside-y',
      start: 0,
      end: 100,
    });
  }

  function enableZoomSelect() {
    applyMode('zoom');
  }

  function enablePan() {
    applyMode('pan');
  }

  function applyMode(nextMode: ChartMode) {
    const chart = getChart();
    if (!chart) return;

    setMode(nextMode);
    chart.dispatchAction({
      type: 'takeGlobalCursor',
      key: 'dataZoomSelect',
      dataZoomSelectActive: nextMode === 'zoom',
    });
    chart.getZr().setCursorStyle(nextMode === 'pan' ? 'grab' : 'crosshair');
  }

  function handleSelectChart() {
    setSelectedChartId(id);
  }

  return (
    <div
      className="flex h-full w-full flex-col gap-1"
      onPointerDown={handleSelectChart}
      onFocus={handleSelectChart}
    >
      <div className="flex gap-1">
        <Button
          variant={mode === 'zoom' ? 'default' : 'outline'}
          size="icon-sm"
          onClick={enableZoomSelect}
          title="Zoom mode (Z key)"
          aria-label="Zoom mode"
        >
          <IconZoomIn className="size-4" />
        </Button>
        <Button
          variant={mode === 'pan' ? 'default' : 'outline'}
          size="icon-sm"
          onClick={enablePan}
          title="Pan mode (Space)"
          aria-label="Pan mode"
        >
          <IconHandGrab className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={resetZoom}
          title="Reset zoom (Escape)"
          aria-label="Reset zoom"
        >
          <IconHome className="size-4" />
        </Button>
      </div>
      <div
        className={`relative flex min-h-0 flex-1 rounded-sm border-2 ${isSelected ? 'border-slate-900/35' : 'border-transparent'}`}
      >
        <ReactEChartsCore
          className="h-full w-full"
          echarts={echarts}
          option={options}
          replaceMerge={['series']}
          lazyUpdate={true}
          onChartReady={initChart}
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
      scale: true,
      min: (v: { min: number; max: number }) => {
        if (v.min >= 0) {
          return 0;
        }
        const padding = (v.max - v.min) * 0.5;
        return v.min - padding;
      },
      max: (v: { min: number; max: number }) => v.max + (v.max - v.min) * 0.5,
      axisLabel: {
        fontSize: 10,
      },
    },
    legend: {
      show: true,
    },
    toolbox: {
      show: true,
      left: -9999, // Hide default toolbox UI
      top: -9999, // Hide default toolbox UI
      feature: {
        dataZoom: {
          xAxisIndex: 0,
          yAxisIndex: 0,
          brushStyle: {
            color: 'rgba(0,0,0,0)',
            borderColor: '#000',
            borderWidth: 2,
            borderType: 'dashed',
          },
        },
        restore: {},
      },
    },
    dataZoom: [
      {
        id: 'datazoom-inside-x',
        type: 'inside',
        xAxisIndex: 0,
        zoomOnMouseWheel: true,
        moveOnMouseMove: false,
      },
      {
        id: 'datazoom-inside-y',
        type: 'inside',
        yAxisIndex: 0,
        zoomOnMouseWheel: true,
        moveOnMouseMove: false,
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
