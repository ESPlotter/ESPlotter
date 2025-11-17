const RGB_PATTERN = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i;
const RGBA_PATTERN =
  /^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(0|1|0?\.\d+)\s*\)$/i;

export function normalizeChartSeriesColor(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return null;
  }

  const rgbMatch = trimmed.match(RGB_PATTERN);
  if (rgbMatch) {
    return formatRgb(rgbMatch);
  }

  const rgbaMatch = trimmed.match(RGBA_PATTERN);
  if (rgbaMatch) {
    return formatRgba(rgbaMatch);
  }

  return null;
}

function formatRgb(match: RegExpMatchArray): string | null {
  const [_, r, g, b] = match;
  const red = parseChannel(r);
  const green = parseChannel(g);
  const blue = parseChannel(b);
  if (red === null || green === null || blue === null) {
    return null;
  }
  return `rgb(${red}, ${green}, ${blue})`;
}

function formatRgba(match: RegExpMatchArray): string | null {
  const [_, r, g, b, a] = match;
  const red = parseChannel(r);
  const green = parseChannel(g);
  const blue = parseChannel(b);
  const alpha = parseAlpha(a);
  if (red === null || green === null || blue === null || alpha === null) {
    return null;
  }
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function parseChannel(value: string): number | null {
  const channel = Number.parseInt(value, 10);
  if (Number.isNaN(channel) || channel < 0 || channel > 255) {
    return null;
  }
  return channel;
}

function parseAlpha(value: string): string | null {
  const numeric = Number.parseFloat(value);
  if (Number.isNaN(numeric) || numeric < 0 || numeric > 1) {
    return null;
  }
  const rounded = Math.round(numeric * 1000) / 1000;
  return rounded.toString();
}
