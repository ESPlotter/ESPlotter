import { IconCheck } from '@tabler/icons-react';
import * as echarts from 'echarts/core';
import { createElement } from 'react';
import { toast } from 'sonner';

import {
  buildChartImageWithTitle,
  createChartTitleStyleFromElement,
  resolveChartTitle,
  type ChartTitleStyle,
} from './chartImage';

const CHART_IMAGE_BACKGROUND = '#ffffff';
const CHART_TITLE_PADDING_X = 12;
const CHART_TITLE_PADDING_Y = 2;
const CHART_TITLE_FALLBACK_STYLE: ChartTitleStyle = {
  fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif',
  fontSize: 24,
  fontWeight: 700,
  color: '#0f172a',
  paddingX: CHART_TITLE_PADDING_X,
  paddingY: CHART_TITLE_PADDING_Y,
  height: 28,
  backgroundColor: CHART_IMAGE_BACKGROUND,
};
const CLIPBOARD_MESSAGE_SUCCESS = 'Captura de gráficas copiada al portapapeles.';

export async function captureVisibleChartsToClipboard(): Promise<void> {
  const scrollContainer = document.querySelector<HTMLElement>('main > section');
  if (!scrollContainer) {
    return;
  }

  const containerRect = scrollContainer.getBoundingClientRect();
  const charts = getVisibleChartArticles(scrollContainer, containerRect);
  if (charts.length === 0) {
    return;
  }

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(containerRect.width);
  canvas.height = Math.round(containerRect.height);

  const context = canvas.getContext('2d');
  if (!context) {
    return;
  }

  context.fillStyle = CHART_IMAGE_BACKGROUND;
  context.fillRect(0, 0, canvas.width, canvas.height);

  for (const chart of charts) {
    await drawChartOnCanvas(context, chart, containerRect);
  }

  const dataUrl = canvas.toDataURL('image/png');
  await window.clipboard.writeImage(dataUrl);
  toast.success(CLIPBOARD_MESSAGE_SUCCESS, {
    icon: createElement(IconCheck, { className: 'size-4' }),
  });
}

interface VisibleChart {
  article: HTMLElement;
  rect: DOMRect;
}

function getVisibleChartArticles(container: HTMLElement, containerRect: DOMRect): VisibleChart[] {
  const articles = Array.from(container.querySelectorAll<HTMLElement>('article'));
  return articles
    .map((article) => ({ article, rect: article.getBoundingClientRect() }))
    .filter(({ rect }) => isRectVisible(rect, containerRect));
}

function isRectVisible(rect: DOMRect, containerRect: DOMRect): boolean {
  const verticallyVisible = rect.bottom > containerRect.top && rect.top < containerRect.bottom;
  const horizontallyVisible = rect.right > containerRect.left && rect.left < containerRect.right;
  return verticallyVisible && horizontallyVisible;
}

async function drawChartOnCanvas(
  context: CanvasRenderingContext2D,
  chart: VisibleChart,
  containerRect: DOMRect,
): Promise<void> {
  const chartElement = chart.article.querySelector<HTMLElement>('.echarts-for-react');
  if (!chartElement) {
    return;
  }

  const instance = echarts.getInstanceByDom(chartElement);
  if (!instance) {
    return;
  }

  const dataUrl = instance.getDataURL({
    type: 'png',
    pixelRatio: 2,
    backgroundColor: CHART_IMAGE_BACKGROUND,
  });

  const titleElement = getChartTitleElement(chart.article);
  const titleText = titleElement ? getTitleText(titleElement) : '';
  const resolvedTitle = resolveChartTitle(titleText);
  const titleStyle = titleElement
    ? createChartTitleStyleFromElement(titleElement, {
        backgroundColor: CHART_IMAGE_BACKGROUND,
        paddingX: CHART_TITLE_PADDING_X,
        paddingY: CHART_TITLE_PADDING_Y,
      })
    : CHART_TITLE_FALLBACK_STYLE;

  const chartImageUrl = await buildChartImageWithTitle(dataUrl, resolvedTitle, titleStyle);
  const image = await loadImage(chartImageUrl);

  const x = Math.round(chart.rect.left - containerRect.left);
  const y = Math.round(chart.rect.top - containerRect.top);
  const width = Math.round(chart.rect.width);
  const height = Math.round(chart.rect.height);

  context.drawImage(image, x, y, width, height);
}

function getChartTitleElement(article: HTMLElement): HTMLElement | null {
  return (
    article.querySelector<HTMLElement>('input[aria-label="Chart name"]') ??
    article.querySelector<HTMLElement>('h2')
  );
}

function getTitleText(titleElement: HTMLElement): string {
  if (titleElement instanceof HTMLInputElement) {
    return titleElement.value;
  }
  return titleElement.textContent ?? '';
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Failed to load chart image'));
    image.src = dataUrl;
  });
}
