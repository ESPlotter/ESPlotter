export interface ChartTitleStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  color: string;
  paddingX: number;
  paddingY: number;
  height: number;
  backgroundColor: string;
}

export interface ChartTitleStyleOptions {
  backgroundColor: string;
  paddingX: number;
  paddingY: number;
}

export const CHART_IMAGE_BACKGROUND = '#ffffff';
export const CHART_TITLE_PADDING_X = 12;
export const CHART_TITLE_PADDING_Y = 2;
const DEFAULT_CHART_TITLE_TEXT = 'Chart';

export const DEFAULT_CHART_TITLE_STYLE: ChartTitleStyle = {
  fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif',
  fontSize: 50,
  fontWeight: 700,
  color: '#0f172a',
  paddingX: CHART_TITLE_PADDING_X,
  paddingY: CHART_TITLE_PADDING_Y,
  height: 50 + CHART_TITLE_PADDING_Y * 2,
  backgroundColor: CHART_IMAGE_BACKGROUND,
};

export function resolveChartTitle(title: string): string {
  const trimmed = title.trim();
  return trimmed.length > 0 ? trimmed : DEFAULT_CHART_TITLE_TEXT;
}

export function createChartTitleStyleFromElement(
  element: HTMLElement,
  options: ChartTitleStyleOptions,
): ChartTitleStyle {
  const computedStyle = window.getComputedStyle(element);
  const fontSize = Number.parseFloat(computedStyle.fontSize || '16');
  const fontWeight = parseFontWeight(computedStyle.fontWeight);
  const height = element.getBoundingClientRect().height;

  return {
    fontFamily: computedStyle.fontFamily || DEFAULT_CHART_TITLE_STYLE.fontFamily,
    fontSize,
    fontWeight,
    color: computedStyle.color || DEFAULT_CHART_TITLE_STYLE.color,
    paddingX: options.paddingX,
    paddingY: options.paddingY,
    height: Math.max(height, fontSize + options.paddingY * 2),
    backgroundColor: options.backgroundColor,
  };
}

export async function buildChartImageWithTitle(
  chartDataUrl: string,
  title: string,
  style: ChartTitleStyle,
): Promise<string> {
  const chartImage = await loadImage(chartDataUrl);
  const titleHeight = Math.max(style.height, style.fontSize + style.paddingY * 2);
  const canvas = document.createElement('canvas');
  canvas.width = chartImage.width;
  canvas.height = chartImage.height + titleHeight;

  const context = canvas.getContext('2d');
  if (!context) {
    return chartDataUrl;
  }

  context.fillStyle = style.backgroundColor;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.textBaseline = 'top';
  context.fillStyle = style.color;
  context.font = `${style.fontWeight} ${style.fontSize}px ${style.fontFamily}`;

  const maxTitleWidth = canvas.width - style.paddingX * 2;
  const titleOffsetY = Math.max(style.paddingY, (titleHeight - style.fontSize) / 2);
  context.fillText(title, style.paddingX, titleOffsetY, maxTitleWidth);
  context.drawImage(chartImage, 0, titleHeight);

  return canvas.toDataURL('image/png');
}

function parseFontWeight(fontWeight: string): number {
  const parsed = Number.parseInt(fontWeight, 10);
  if (!Number.isNaN(parsed)) {
    return parsed;
  }
  if (fontWeight === 'bold') {
    return 700;
  }
  if (fontWeight === 'normal') {
    return 400;
  }
  return 500;
}

export function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Failed to load chart image'));
    image.src = dataUrl;
  });
}
