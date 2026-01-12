import * as echarts from 'echarts/core';

import {
  buildChartImageWithTitle,
  createChartTitleStyleFromElement,
  DEFAULT_CHART_TITLE_STYLE,
  resolveChartTitle,
  type ChartTitleStyle,
  type ChartTitleStyleOptions,
  CHART_IMAGE_BACKGROUND,
  CHART_TITLE_PADDING_X,
  CHART_TITLE_PADDING_Y,
} from './chartImage';

import type { EChartsType } from 'echarts';

const CHART_CAPTURE_PIXEL_RATIO = 2;
const TITLE_STYLE_OPTIONS: ChartTitleStyleOptions = {
  backgroundColor: CHART_IMAGE_BACKGROUND,
  paddingX: CHART_TITLE_PADDING_X,
  paddingY: CHART_TITLE_PADDING_Y,
};

export function getChartInstanceFromElement(element: HTMLElement): EChartsType | null {
  return (echarts.getInstanceByDom(element) as unknown as EChartsType | null) ?? null;
}

export function getChartTitleElement(container: HTMLElement): HTMLElement | null {
  return container.querySelector<HTMLElement>('[data-chart-title]');
}

export function getChartTitleText(titleElement: HTMLElement | null): string {
  if (!titleElement) {
    return '';
  }
  if (titleElement instanceof HTMLInputElement) {
    return titleElement.value;
  }
  return titleElement.textContent ?? '';
}

export function resolveChartTitleStyle(titleElement: HTMLElement | null): ChartTitleStyle {
  if (!titleElement) {
    return DEFAULT_CHART_TITLE_STYLE;
  }
  return createChartTitleStyleFromElement(titleElement, TITLE_STYLE_OPTIONS);
}

export function getChartDataUrl(chart: EChartsType): string {
  return chart.getDataURL({
    type: 'png',
    pixelRatio: CHART_CAPTURE_PIXEL_RATIO,
    backgroundColor: CHART_IMAGE_BACKGROUND,
  });
}

export async function buildChartClipboardImage(
  chart: EChartsType,
  title: string,
  titleStyle?: ChartTitleStyle,
): Promise<string> {
  const dataUrl = getChartDataUrl(chart);
  const resolvedTitle = resolveChartTitle(title);
  return buildChartImageWithTitle(dataUrl, resolvedTitle, titleStyle ?? DEFAULT_CHART_TITLE_STYLE);
}
