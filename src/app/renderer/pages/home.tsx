import { ChannelChartGrid } from '@renderer/components/ChannelChartGrid/ChannelChartGrid';
import { Layout } from '@renderer/components/Layout/layout';

export function HomePage() {
  return (
    <Layout>
      <ChannelChartGrid />
    </Layout>
  );
}
