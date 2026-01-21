import {
  IconEye,
  IconEyeOff,
  IconCamera,
  IconHandGrab,
  IconHome,
  IconLetterX,
  IconLetterY,
  IconZoomIn,
  IconTrash,
} from '@tabler/icons-react';
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

import { buildChartClipboardImage } from './chartCapture';
import { ChartSerie } from './ChartSerie';
import { notifyClipboardSuccess } from './clipboardToast';
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

const CLIPBOARD_MESSAGE_SUCCESS = 'Chart copied to clipboard.';

interface ChartProps {
  id: string;
  isSelected: boolean;
  series: ChartSerie[];
  title: string;
}

export function Chart({ id, isSelected, series, title }: ChartProps) {
  const [mode, setMode] = useState<ChartMode>('zoom');
  const [isTooltipVisible, setIsTooltipVisible] = useState(true);
  const chartSeriesPalette = useUserPreferencesChartSeriesPalette();
  const options = useMemo(
    () => mergeSeriesWithDefaultParams(series, chartSeriesPalette, isTooltipVisible),
    [series, chartSeriesPalette, isTooltipVisible],
  );
  const { setSelectedChartId, removeChart } = useChannelChartsActions();
  const chartInstanceRef = useRef<EChartsType | null>(null);

  useChartsHotkey(getChart, { key: 'Escape' }, () => resetZoom(), { active: isSelected });
  useChartsHotkey(getChart, { key: 'x' }, () => resetZoomX(), { active: isSelected });
  useChartsHotkey(getChart, { key: 'y' }, () => resetZoomY(), { active: isSelected });

  useChartsHotkey(
    getChart,
    (e) => e.code === 'Space',
    () => enablePan(),
    { active: isSelected },
  );

  useChartsHotkey(getChart, { key: 'z' }, () => enableZoomSelect(), { active: isSelected });
  useChartsHotkey(getChart, { key: 'h' }, handleToggleTooltipHotkey, { active: isSelected });
  useChartsHotkey(getChart, { key: 'Delete', ctrl: false }, handleDeleteChart, {
    active: isSelected,
  });
  useChartsHotkey(getChart, { key: 's', shift: false }, handleCopyChartImageHotkey, {
    active: isSelected,
  });

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

  function resetZoomX() {
    const chart = getChart();
    if (!chart) return;

    chart.dispatchAction({
      type: 'dataZoom',
      dataZoomId: 'datazoom-inside-x',
      start: 0,
      end: 100,
    });
  }

  function resetZoomY() {
    const chart = getChart();
    if (!chart) return;

    chart.dispatchAction({
      type: 'dataZoom',
      dataZoomId: 'datazoom-inside-y',
      start: 0,
      end: 100,
    });
  }

  function resetZoom() {
    resetZoomX();
    resetZoomY();
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

  async function copyChartImageToClipboard(): Promise<void> {
    const chart = getChart();
    if (!chart) return;

    try {
      const dataUrlWithTitle = await buildChartClipboardImage(chart, title);
      await window.clipboard.writeImage(dataUrlWithTitle);
      notifyClipboardSuccess(CLIPBOARD_MESSAGE_SUCCESS);
    } catch (error) {
      console.error('Failed to copy chart image', error);
    }
  }

  function handleCopyChartImage() {
    void copyChartImageToClipboard();
  }

  function handleCopyChartImageHotkey() {
    void copyChartImageToClipboard();
  }

  function handleSelectChart() {
    setSelectedChartId(id);
  }

  function handleDeleteChart() {
    removeChart(id);
  }
  function toggleTooltip() {
    setIsTooltipVisible((current) => !current);
  }

  function handleToggleTooltipHotkey() {
    toggleTooltip();
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
          onClick={resetZoomX}
          title="Reset zoom X (X Key)"
          aria-label="Reset zoom X"
        >
          <IconLetterX className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={resetZoomY}
          title="Reset zoom Y (Y Key)"
          aria-label="Reset zoom Y"
        >
          <IconLetterY className="size-4" />
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
        <Button
          variant={isTooltipVisible ? 'default' : 'outline'}
          size="icon-sm"
          onClick={toggleTooltip}
          title={isTooltipVisible ? 'Hide tooltip (H)' : 'Show tooltip (H)'}
          aria-label={isTooltipVisible ? 'Hide tooltip' : 'Show tooltip'}
        >
          {isTooltipVisible ? <IconEye className="size-4" /> : <IconEyeOff className="size-4" />}
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={handleCopyChartImage}
          title="Copy chart image (S)"
          aria-label="Copy chart image"
        >
          <IconCamera className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={handleDeleteChart}
          title="Delete chart (Delete key)"
        >
          <IconTrash className="size-4 text-red-600" />
        </Button>
      </div>
      <div
        className={`relative flex min-h-0 flex-1 rounded-sm border-2 ${isSelected ? 'border-slate-900/35' : 'border-transparent'}`}
        data-testid="chart-plot"
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

function mergeSeriesWithDefaultParams(
  series: ChartSerie[],
  palette: string[],
  isTooltipVisible: boolean,
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
      axisLabel: {
        fontSize: 10,
      },
      axisPointer: {
        show: true,
        label: {
          show: true,
        },
        triggerTooltip: isTooltipVisible,
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
      axisPointer: {
        show: true,
        label: {
          show: true,
        },
        triggerTooltip: isTooltipVisible,
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
      show: isTooltipVisible,
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
