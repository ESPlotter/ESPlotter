import { Chart } from '@renderer/components/Chart/Chart';
import Layout from '@renderer/components/Layout/layout';
import { useCharts, useSelectedChartId } from '@renderer/store/ChannelChartsStore';

export function HomePage() {
  const charts = useCharts();
  const selectedChartId = useSelectedChartId();

  return (
    <Layout>
      <div className={`grid ${Object.keys(charts).length == 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
        {Object.keys(charts).map((chartId) => (
          <div key={chartId} className="p-4 w-full">
            <h2 className="text-2xl font-bold mb-4">Chart ID: {chartId}</h2>
            <Chart
              id={chartId}
              isSelected={selectedChartId === chartId}
              series={Object.values(charts[chartId].channels)}
            />
          </div>
        ))}
      </div>
    </Layout>
  );
}
