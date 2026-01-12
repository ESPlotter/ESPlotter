import { Suspense, lazy, useMemo } from 'react';

import { ChartTitle } from '@renderer/components/Chart/ChartTitle';

import type { ChartSerie } from '../Chart/ChartSerie';

const LazyChart = lazy(async () => {
  const module = await import('@renderer/components/Chart/Chart');
  return { default: module.Chart };
});

interface ChannelChartProps {
  chartId: string;
  name: string;
  channels: Record<string, ChartSerie>;
  isSelected: boolean;
}

export function ChannelChart({ chartId, name, channels, isSelected }: ChannelChartProps) {
  const series = useMemo(() => Object.values(channels), [channels]);

  return (
    <article className="flex min-h-2/4 flex-col gap-2 h-full">
      <ChartTitle chartId={chartId} name={name} />
      <div className="flex min-h-0 flex-1">
        <Suspense
          fallback={
            <div className="flex h-full w-full items-center justify-center text-sm text-slate-500">
              Loading chart...
            </div>
          }
        >
          <LazyChart id={chartId} isSelected={isSelected} series={series} />
        </Suspense>
      </div>
    </article>
  );
}
