import { useCharts, useSelectedChartId } from '@renderer/store/ChannelChartsStore';

import { ChannelChart } from '../ChannelChart/ChannelChart';

export function ChannelChartGrid() {
  const charts = useCharts();
  const selectedChartId = useSelectedChartId();
  const chartIds = Object.keys(charts);
  const chartCount = chartIds.length;

  return (
    <div
      className={`grid gap-4 h-full ${chartCount <= 2 ? `grid-cols-${Math.max(1, chartCount)} grid-rows-[100%]` : 'grid-cols-2 grid-rows-[repeat(2,50%)] auto-rows-[50%]'}`}
      data-testid="chart-grid"
    >
      {chartIds.map((chartId) => {
        const chart = charts[chartId];
        return (
          <ChannelChart
            key={chartId}
            chartId={chartId}
            name={chart.name}
            channels={chart.channels}
            isSelected={selectedChartId === chartId}
          />
        );
      })}
    </div>
  );
}
