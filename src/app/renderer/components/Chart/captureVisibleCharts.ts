import {
  buildChartClipboardImage,
  getChartInstanceFromElement,
  getChartTitleElement,
  getChartTitleText,
  resolveChartTitleStyle,
} from './chartCapture';
import { CHART_IMAGE_BACKGROUND, loadImage } from './chartImage';
import { notifyClipboardSuccess } from './clipboardToast';

const CLIPBOARD_MESSAGE_SUCCESS = 'Visible charts copied to clipboard.';
const CHART_SCROLL_CONTAINER_TEST_ID = 'chart-scroll-container';
const CHART_CARD_TEST_ID = 'chart-card';
const CHART_PLOT_TEST_ID = 'chart-plot';

export async function captureVisibleChartsToClipboard(): Promise<void> {
  const scrollContainer = document.querySelector<HTMLElement>(
    `[data-testid="${CHART_SCROLL_CONTAINER_TEST_ID}"]`,
  );
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
  notifyClipboardSuccess(CLIPBOARD_MESSAGE_SUCCESS);
}

interface VisibleChart {
  article: HTMLElement;
  rect: DOMRect;
}

function getVisibleChartArticles(container: HTMLElement, containerRect: DOMRect): VisibleChart[] {
  const articles = Array.from(
    container.querySelectorAll<HTMLElement>(`[data-testid="${CHART_CARD_TEST_ID}"]`),
  );
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
  const chartElement = chart.article.querySelector<HTMLElement>(
    `[data-testid="${CHART_PLOT_TEST_ID}"]`,
  );
  if (!chartElement) {
    return;
  }

  const instance = getChartInstanceFromElement(chartElement);
  if (!instance) {
    return;
  }

  const titleElement = getChartTitleElement(chart.article);
  const titleText = getChartTitleText(titleElement);
  const titleStyle = resolveChartTitleStyle(titleElement);
  const chartImageUrl = await buildChartClipboardImage(instance, titleText, titleStyle);
  const image = await loadImage(chartImageUrl);

  const x = Math.round(chart.rect.left - containerRect.left);
  const y = Math.round(chart.rect.top - containerRect.top);
  const width = Math.round(chart.rect.width);
  const height = Math.round(chart.rect.height);

  context.drawImage(image, x, y, width, height);
}
