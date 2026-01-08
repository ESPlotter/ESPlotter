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
import { useUserPreferencesChartSeriesPalette } from '@renderer/store/UserPreferencesStore';
import { Button } from '@shadcn/components/ui/button';
import { generateRandomHexColor } from '@shared/utils/generateRandomHexColor';

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
  const chartSeriesPalette = useUserPreferencesChartSeriesPalette();
  const options = useMemo(
    () => mergeSeriesWithDefaultParams(series, chartSeriesPalette),
    [series, chartSeriesPalette],
  );
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
      onPointerDownCapture={handleSelectChart}
      onFocus={handleSelectChart}
    >
      <div className="flex gap-1">
        <Button
          variant={mode === 'zoom' ? 'default' : 'outline'}
          size="icon-sm"
          onClick={enableZoomSelect}
          title="Zoom mode (Z key)"
        >
          <IconZoomIn className="size-4" />
        </Button>
        <Button
          variant={mode === 'pan' ? 'default' : 'outline'}
          size="icon-sm"
          onClick={enablePan}
          title="Pan mode (Space)"
        >
          <IconHandGrab className="size-4" />
        </Button>
        <Button variant="outline" size="icon-sm" onClick={resetZoom} title="Reset zoom (Escape)">
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
      axisLabel: {
        fontSize: 10,
      },
    },
    yAxis: {
      type: 'value',
      scale: true,
      min: (v: { min: number; max: number }) => v.min - (v.max - v.min) * 0.5,
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
        moveOnMouseMove: true,
        filterMode: 'none',
      },
      {
        id: 'datazoom-inside-y',
        type: 'inside',
        yAxisIndex: 0,
        zoomOnMouseWheel: true,
        moveOnMouseMove: true,
        filterMode: 'none',
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
