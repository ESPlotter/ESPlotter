import type { CSSProperties } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Chart } from '@renderer/components/Chart/Chart';
import { ChartTitle } from '@renderer/components/Chart/ChartTitle';
import { Layout } from '@renderer/components/Layout/layout';
import { useCharts, useSelectedChartId } from '@renderer/store/ChannelChartsStore';

const SECTION_PADDING_PX = 16;
const GRID_GAP_PX = 16;
const GRID_BOTTOM_PADDING_PX = 16;
const DEFAULT_ROW_HEIGHT_PX = 320;

function getGridClasses(chartCount: number): string {
  const baseClasses = 'grid h-full gap-4 pb-4';
  if (chartCount === 0) {
    return `${baseClasses} grid-cols-1`;
  }
  if (chartCount === 1) {
    return `${baseClasses} grid-cols-1 auto-rows-fr`;
  }
  if (chartCount === 2) {
    return `${baseClasses} grid-cols-2 auto-rows-fr`;
  }
  return `${baseClasses} grid-cols-2`;
}

function getChartWrapperClasses(chartCount: number): string {
  if (chartCount === 0) {
    return 'flex min-h-0 flex-col gap-2';
  }
  return 'flex h-full min-h-0 flex-col gap-2';
}

function computeRowHeight(containerHeight: number): number {
  const contentHeight = containerHeight - SECTION_PADDING_PX * 2 - GRID_BOTTOM_PADDING_PX;
  const computed = (contentHeight - GRID_GAP_PX) / 2;
  if (!Number.isFinite(computed) || computed <= 0) {
    return DEFAULT_ROW_HEIGHT_PX;
  }
  return computed;
}

export function HomePage() {
  const charts = useCharts();
  const selectedChartId = useSelectedChartId();
  const chartIds = Object.keys(charts);
  const chartCount = chartIds.length;

  const gridClasses = getGridClasses(chartCount);
  const chartWrapperClasses = getChartWrapperClasses(chartCount);

  const gridRef = useRef<HTMLDivElement | null>(null);
  const [rowHeight, setRowHeight] = useState<number | null>(null);

  useEffect(() => {
    const gridElement = gridRef.current;
    const scrollContainer = gridElement?.parentElement;
    if (!gridElement || !scrollContainer) {
      setRowHeight(null);
      return;
    }

    const updateHeight = () => {
      if (chartCount < 3) {
        setRowHeight(null);
        return;
      }

      const containerHeight = scrollContainer.clientHeight;
      if (containerHeight <= 0) {
        setRowHeight(DEFAULT_ROW_HEIGHT_PX);
        return;
      }

      const nextHeight = computeRowHeight(containerHeight);
      setRowHeight(nextHeight);
    };

    updateHeight();

    if (typeof window !== 'undefined' && 'ResizeObserver' in window) {
      const observer = new window.ResizeObserver(() => updateHeight());
      observer.observe(scrollContainer);

      return () => {
        observer.disconnect();
      };
    }

    return undefined;
  }, [chartCount]);

  const gridStyles = useMemo<CSSProperties | undefined>(() => {
    if (chartCount < 3 || rowHeight === null) {
      return undefined;
    }
    const normalizedHeight = `${rowHeight}px`;
    return {
      gridTemplateRows: `repeat(2, ${normalizedHeight})`,
      gridAutoRows: normalizedHeight,
    };
  }, [chartCount, rowHeight]);

  const multiRowItemStyle = useMemo<CSSProperties | undefined>(() => {
    if (chartCount < 3 || rowHeight === null) {
      return undefined;
    }
    const normalizedHeight = `${rowHeight}px`;
    return {
      height: normalizedHeight,
      minHeight: normalizedHeight,
    };
  }, [chartCount, rowHeight]);

  return (
    <Layout>
      <div ref={gridRef} className={gridClasses} style={gridStyles}>
        {chartIds.map((chartId) => {
          const chart = charts[chartId];
          const series = Object.values(chart.channels);

          return (
            <div key={chartId} className={chartWrapperClasses} style={multiRowItemStyle}>
              <ChartTitle chartId={chartId} name={chart.name} />
              <div className="flex min-h-0 flex-1">
                <Chart id={chartId} isSelected={selectedChartId === chartId} series={series} />
              </div>
            </div>
          );
        })}
      </div>
    </Layout>
  );
}
