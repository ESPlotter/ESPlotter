import { ChannelChartGrid } from '@renderer/components/ChannelChartGrid/ChannelChartGrid';
import { MainLayout } from '@renderer/components/Layout/MainLayout';

export function HomePage() {
  return (
    <MainLayout>
      <ChannelChartGrid />
    </MainLayout>
  );
}
