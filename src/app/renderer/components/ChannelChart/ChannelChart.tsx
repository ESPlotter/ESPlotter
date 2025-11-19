import { useMemo } from 'react';

import { Chart } from '@renderer/components/Chart/Chart';
import { ChartTitle } from '@renderer/components/Chart/ChartTitle';

import type { ChartSerie } from '../Chart/ChartSerie';

interface ChannelChartProps {
  chartId: string;
  name: string;
  channels: Record<string, ChartSerie>;
  isSelected: boolean;
}

export function ChannelChart({ chartId, name, channels, isSelected }: ChannelChartProps) {
  const series = useMemo(() => Object.values(channels), [channels]);

  return (
    <div className="flex min-h-2/4 flex-col gap-2 h-full">
      <ChartTitle chartId={chartId} name={name} />
      <div className="flex min-h-0 flex-1">
        <Chart id={chartId} isSelected={isSelected} series={series} />
      </div>
    </div>
  );
}
