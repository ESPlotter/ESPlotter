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

  function getChart(): EChartsType | null {
    const chart = chartInstanceRef.current;
    if (!chart || chart.isDisposed()) {
      return null;
    }
    return chart;
  }

  function applyMode(chart: EChartsType | null, nextMode: ChartMode) {
    if (!chart) return;
    setMode(nextMode);
    chart.dispatchAction({
      type: 'takeGlobalCursor',
      key: 'dataZoomSelect',
      dataZoomSelectActive: nextMode === 'zoom',
    });
    chart.getZr().setCursorStyle(nextMode === 'pan' ? 'grab' : 'crosshair');
  }

  function setInitZoomMode(chart: EChartsType) {
    chartInstanceRef.current = chart;
    applyMode(chart, 'zoom');
  }

  function restore() {
    const chart = getChart();
    if (!chart) return;

    chart.dispatchAction({ type: 'restore' });
    applyMode(chart, mode);
  }

  function enableZoomSelect() {
    const chart = getChart();
    applyMode(chart, 'zoom');
  }

  function enablePan() {
    const chart = getChart();
    applyMode(chart, 'pan');
  }

  function handleSelectChart() {
    setSelectedChartId(id);
  }

  return (
    <div
      className="flex h-full w-full flex-col gap-1"
      onPointerDownCapture={handleSelectChart}
      onFocus={handleSelectChart}
    >
      <div className="flex gap-1">
        <Button
          variant={mode === 'zoom' ? 'default' : 'outline'}
          size="icon-sm"
          onClick={enableZoomSelect}
          title="Zoom mode"
        >
          <IconZoomIn className="size-4" />
        </Button>
        <Button
          variant={mode === 'pan' ? 'default' : 'outline'}
          size="icon-sm"
          onClick={enablePan}
          title="Pan mode"
        >
          <IconHandGrab className="size-4" />
        </Button>
        <Button variant="outline" size="icon-sm" onClick={restore} title="Reset zoom">
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
          lazyUpdate={true}
          onChartReady={setInitZoomMode}
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
      show: false,
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
        id: 'datazoom-inside-x',
        type: 'inside',
        xAxisIndex: 0,
        zoomOnMouseWheel: true,
        moveOnMouseWheel: false,
        moveOnMouseMove: false,
        disabled: false,
      },
      {
        id: 'datazoom-inside-y',
        type: 'inside',
        yAxisIndex: 0,
        zoomOnMouseWheel: true,
        moveOnMouseWheel: false,
        moveOnMouseMove: false,
        disabled: false,
      },
      {
        id: 'datazoom-select',
        type: 'select',
        xAxisIndex: 0,
        yAxisIndex: 0,
        filterMode: 'filter',
        disabled: false,
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
