import { IconHandGrab, IconHome, IconZoomIn } from '@tabler/icons-react';
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
import { useMemo, useRef, useCallback, useState } from 'react';

import { useChannelChartsActions } from '@renderer/store/ChannelChartsStore';
import { Button } from '@shadcn/components/ui/button';

import { ChartSerie } from './ChartSerie';

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LineChart,
  CanvasRenderer,
  LegendComponent,
]);

const DRAG_THRESHOLD_PIXELS = 10;

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
  const { toggleSelectedChartId } = useChannelChartsActions();
  const chartRef = useRef<ReactEChartsCore>(null);
  const dragStartRef = useRef<{ x: number; y: number; pixelX: number; pixelY: number } | null>(
    null,
  );
  const isDraggingRef = useRef(false);
  const hadDragMovementRef = useRef(false);
  const lastPanPositionRef = useRef<{ x: number; y: number } | null>(null);
  const panUpdateScheduledRef = useRef(false);
  const pendingPanUpdateRef = useRef<{ pixelX: number; pixelY: number } | null>(null);
  const [mode, setMode] = useState<ChartMode>('zoom');
  const [zoomRect, setZoomRect] = useState<{
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  } | null>(null);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  const applyPanUpdate = useCallback(() => {
    const chartInstance = chartRef.current?.getEchartsInstance();
    const pending = pendingPanUpdateRef.current;

    if (!chartInstance || !pending) {
      panUpdateScheduledRef.current = false;
      return;
    }

    const currentPoint = chartInstance.convertFromPixel({ gridIndex: 0 }, [
      pending.pixelX,
      pending.pixelY,
    ]);

    if (currentPoint && lastPanPositionRef.current) {
      const deltaX = lastPanPositionRef.current.x - currentPoint[0];
      const deltaY = lastPanPositionRef.current.y - currentPoint[1];

      const option = chartInstance.getOption();
      const xAxis = option.xAxis?.[0];
      const yAxis = option.yAxis?.[0];

      if (xAxis && yAxis) {
        const currentXMin = typeof xAxis.min === 'number' ? xAxis.min : null;
        const currentXMax = typeof xAxis.max === 'number' ? xAxis.max : null;
        const currentYMin = typeof yAxis.min === 'number' ? yAxis.min : null;
        const currentYMax = typeof yAxis.max === 'number' ? yAxis.max : null;

        if (
          currentXMin !== null &&
          currentXMax !== null &&
          currentYMin !== null &&
          currentYMax !== null
        ) {
          chartInstance.setOption({
            xAxis: {
              min: currentXMin + deltaX,
              max: currentXMax + deltaX,
            },
            yAxis: {
              min: currentYMin + deltaY,
              max: currentYMax + deltaY,
            },
          });
        }
      }

      lastPanPositionRef.current = { x: currentPoint[0], y: currentPoint[1] };
    }

    panUpdateScheduledRef.current = false;
    pendingPanUpdateRef.current = null;
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 0 && mode === 'zoom') {
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
      } else if (e.button === 0 && mode === 'pan') {
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
          lastPanPositionRef.current = {
            x: pointInGrid[0],
            y: pointInGrid[1],
          };
          isDraggingRef.current = true;
        }
      }
    },
    [mode],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDraggingRef.current && dragStartRef.current) {
        if ((mode === 'zoom' && e.buttons === 1) || (mode === 'pan' && e.buttons === 1)) {
          e.preventDefault();

          const rect = e.currentTarget.getBoundingClientRect();
          const endPixelX = e.clientX - rect.left;
          const endPixelY = e.clientY - rect.top;

          const deltaX = Math.abs(endPixelX - dragStartRef.current.pixelX);
          const deltaY = Math.abs(endPixelY - dragStartRef.current.pixelY);

          if (deltaX > 2 || deltaY > 2) {
            hadDragMovementRef.current = true;
          }

          if (mode === 'zoom') {
            setZoomRect({
              startX: dragStartRef.current.pixelX,
              startY: dragStartRef.current.pixelY,
              endX: endPixelX,
              endY: endPixelY,
            });
          } else if (mode === 'pan') {
            // Store the pending update and schedule it with requestAnimationFrame
            pendingPanUpdateRef.current = {
              pixelX: endPixelX,
              pixelY: endPixelY,
            };

            if (!panUpdateScheduledRef.current) {
              panUpdateScheduledRef.current = true;
              requestAnimationFrame(applyPanUpdate);
            }
          }
        }
      }
    },
    [mode, applyPanUpdate],
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (dragStartRef.current && isDraggingRef.current) {
        if (e.button === 0 && mode === 'zoom') {
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
            const endPoint = chartInstance.convertFromPixel({ gridIndex: 0 }, [
              endPixelX,
              endPixelY,
            ]);

            if (endPoint) {
              const startX = Math.min(dragStartRef.current.x, endPoint[0]);
              const endX = Math.max(dragStartRef.current.x, endPoint[0]);
              const startY = Math.min(dragStartRef.current.y, endPoint[1]);
              const endY = Math.max(dragStartRef.current.y, endPoint[1]);

              chartInstance.setOption({
                xAxis: {
                  min: startX,
                  max: endX,
                },
                yAxis: {
                  min: startY,
                  max: endY,
                },
              });
            }
          }

          dragStartRef.current = null;
          setZoomRect(null);
          setTimeout(() => {
            isDraggingRef.current = false;
            hadDragMovementRef.current = false;
          }, 0);
        } else if (e.button === 0 && mode === 'pan') {
          e.preventDefault();
          e.stopPropagation();

          dragStartRef.current = null;
          lastPanPositionRef.current = null;
          pendingPanUpdateRef.current = null;
          panUpdateScheduledRef.current = false;
          setTimeout(() => {
            isDraggingRef.current = false;
            hadDragMovementRef.current = false;
          }, 0);
        }
      }
    },
    [mode],
  );

  const handleClick = useCallback(() => {
    if (!hadDragMovementRef.current) {
      toggleSelectedChartId(id);
    }
  }, [id, toggleSelectedChartId]);

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
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ cursor: mode === 'pan' ? 'grab' : 'default' }}
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
        {zoomRect && mode === 'zoom' && (
          <div
            style={{
              position: 'absolute',
              left: `${Math.min(zoomRect.startX, zoomRect.endX)}px`,
              top: `${Math.min(zoomRect.startY, zoomRect.endY)}px`,
              width: `${Math.abs(zoomRect.endX - zoomRect.startX)}px`,
              height: `${Math.abs(zoomRect.endY - zoomRect.startY)}px`,
              border: '1px dashed black',
              pointerEvents: 'none',
              backgroundColor: 'transparent',
            }}
          />
        )}
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
      interval: 0.2,
      axisLabel: {
        fontSize: 10,
        formatter: (value: number) => {
          if (value === 0) return '0';
          
          const absValue = Math.abs(value);
          
          // For very small numbers, use scientific notation
          if (absValue < 0.0001 && absValue > 0) {
            return value.toExponential(2);
          }
          
          // For very large numbers, use scientific notation
          if (absValue >= 1e6) {
            return value.toExponential(2);
          }
          
          // Determine appropriate decimal places based on magnitude
          let decimalPlaces;
          if (absValue >= 100) {
            decimalPlaces = 1;
          } else if (absValue >= 10) {
            decimalPlaces = 2;
          } else if (absValue >= 1) {
            decimalPlaces = 3;
          } else if (absValue >= 0.01) {
            decimalPlaces = 4;
          } else {
            decimalPlaces = 5;
          }
          
          // Format the number and remove trailing zeros
          const formatted = value.toFixed(decimalPlaces);
          return formatted.replace(/\.?0+$/, '');
        },
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontSize: 10,
        formatter: (value: number) => {
          if (value === 0) return '0';
          
          const absValue = Math.abs(value);
          
          // For very small numbers, use scientific notation
          if (absValue < 0.0001 && absValue > 0) {
            return value.toExponential(2);
          }
          
          // For very large numbers, use scientific notation
          if (absValue >= 1e6) {
            return value.toExponential(2);
          }
          
          // Determine appropriate decimal places based on magnitude
          let decimalPlaces;
          if (absValue >= 100) {
            decimalPlaces = 1;
          } else if (absValue >= 10) {
            decimalPlaces = 2;
          } else if (absValue >= 1) {
            decimalPlaces = 3;
          } else if (absValue >= 0.01) {
            decimalPlaces = 4;
          } else {
            decimalPlaces = 5;
          }
          
          // Format the number and remove trailing zeros
          const formatted = value.toFixed(decimalPlaces);
          return formatted.replace(/\.?0+$/, '');
        },
      },
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
