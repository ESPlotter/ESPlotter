import { render, screen } from '@testing-library/react';
import { useEffect, useRef } from 'react';
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

type HomePageModule = typeof import('./home');
type ChannelChartsStoreModule = typeof import('@renderer/store/ChannelChartsStore');

let HomePage: HomePageModule['HomePage'];
let channelChartsStore: ChannelChartsStoreModule;

const DEFAULT_ROW_HEIGHT = '320px';

beforeAll(() => {
  class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  (globalThis as { ResizeObserver: typeof ResizeObserverMock }).ResizeObserver = ResizeObserverMock;
});

beforeEach(async () => {
  vi.resetModules();
  ({ HomePage } = await import('./home'));
  channelChartsStore = await import('@renderer/store/ChannelChartsStore');
});

function SeedCharts({ chartIds }: { chartIds: string[] }) {
  if (!channelChartsStore) {
    throw new Error('ChannelChartsStore module not loaded.');
  }
  const { addChart } = channelChartsStore.useChannelChartsActions();
  const isSeededRef = useRef(false);

  useEffect(() => {
    if (isSeededRef.current) {
      return;
    }
    chartIds.forEach((chartId) => {
      addChart(chartId);
    });
    isSeededRef.current = true;
  }, [addChart, chartIds]);

  return null;
}

describe('HomePage layout behaviour', () => {
  test('renders base grid when there are no charts', () => {
    const { container } = render(<HomePage />);
    const scrollContainer = container.querySelector('main section');
    const grid = container.querySelector('.grid');

    expect(scrollContainer).not.toBeNull();
    expect(scrollContainer).toHaveClass('p-4');
    expect(grid).not.toBeNull();
    expect(grid).toHaveClass('grid-cols-1');
    expect(grid).toHaveClass('h-full');
    expect(grid).toHaveClass('pb-4');
    expect(grid?.style.gridTemplateRows).toBe('');
    expect(grid?.style.gridAutoRows).toBe('');
  });

  test('expands a single chart to occupy the full height', async () => {
    const { container } = render(
      <>
        <SeedCharts chartIds={['chart-single']} />
        <HomePage />
      </>,
    );

    await screen.findByText('Chart: chart-single');

    const scrollContainer = container.querySelector('main section');
    const grid = container.querySelector('.grid');
    expect(scrollContainer).not.toBeNull();
    expect(scrollContainer).toHaveClass('p-4');
    expect(grid).not.toBeNull();
    expect(grid).toHaveClass('grid-cols-1');
    expect(grid).toHaveClass('auto-rows-fr');
    expect(grid).toHaveClass('pb-4');
    expect(grid?.style.gridTemplateRows).toBe('');
    expect(grid?.style.gridAutoRows).toBe('');

    const titleButton = await screen.findByRole('button', { name: 'Chart: chart-single' });
    const wrapper = titleButton.parentElement;
    expect(wrapper).not.toBeNull();
    expect(wrapper).toHaveClass('h-full');
    expect(wrapper).toHaveClass('gap-2');
    expect(wrapper?.getAttribute('style') ?? '').not.toContain('height:');
  });

  test('keeps two charts at full height across the grid', async () => {
    const { container } = render(
      <>
        <SeedCharts chartIds={['chart-a', 'chart-b']} />
        <HomePage />
      </>,
    );

    await screen.findByText('Chart: chart-a');

    const scrollContainer = container.querySelector('main section');
    const grid = container.querySelector('.grid');
    expect(scrollContainer).not.toBeNull();
    expect(scrollContainer).toHaveClass('p-4');
    expect(grid).not.toBeNull();
    expect(grid).toHaveClass('grid-cols-2');
    expect(grid).toHaveClass('auto-rows-fr');
    expect(grid).toHaveClass('pb-4');
    expect(grid?.style.gridTemplateRows).toBe('');
    expect(grid?.style.gridAutoRows).toBe('');

    const firstChartButton = await screen.findByRole('button', { name: 'Chart: chart-a' });
    const secondChartButton = await screen.findByRole('button', { name: 'Chart: chart-b' });

    expect(firstChartButton.parentElement).not.toBeNull();
    expect(firstChartButton.parentElement).toHaveClass('h-full');
    expect(firstChartButton.parentElement).toHaveClass('gap-2');
    expect(firstChartButton.parentElement?.style.height).toBe('');
    expect(secondChartButton.parentElement).not.toBeNull();
    expect(secondChartButton.parentElement).toHaveClass('h-full');
    expect(secondChartButton.parentElement).toHaveClass('gap-2');
    expect(secondChartButton.parentElement?.style.height).toBe('');
  });

  test('limits grid rows to half height when there are many charts', async () => {
    const { container } = render(
      <>
        <SeedCharts chartIds={['chart-1', 'chart-2', 'chart-3']} />
        <HomePage />
      </>,
    );

    await screen.findByText('Chart: chart-1');

    const scrollContainer = container.querySelector('main section');
    const grid = container.querySelector('.grid');
    expect(scrollContainer).not.toBeNull();
    expect(scrollContainer).toHaveClass('p-4');
    expect(grid).not.toBeNull();
    expect(grid).toHaveClass('grid-cols-2');
    expect(grid).toHaveClass('pb-4');
    expect(grid?.style.gridTemplateRows).toBe(`repeat(2, ${DEFAULT_ROW_HEIGHT})`);
    expect(grid?.style.gridAutoRows).toBe(DEFAULT_ROW_HEIGHT);

    const firstChartButton = await screen.findByRole('button', { name: 'Chart: chart-1' });
    const secondChartButton = await screen.findByRole('button', { name: 'Chart: chart-2' });
    const thirdChartButton = await screen.findByRole('button', { name: 'Chart: chart-3' });

    [firstChartButton, secondChartButton, thirdChartButton].forEach((button) => {
      expect(button.parentElement).not.toBeNull();
      expect(button.parentElement).toHaveClass('h-full');
      expect(button.parentElement).toHaveClass('gap-2');
      expect(button.parentElement?.style.height).toBe(DEFAULT_ROW_HEIGHT);
      expect(button.parentElement?.style.minHeight).toBe(DEFAULT_ROW_HEIGHT);
    });
  });
});
