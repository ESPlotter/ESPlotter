export interface AllowedFileStructure {
  schemaVersion: number;
  metadata: {
    timestamp: string;
    SCR: number;
    [key: string]: string | number | boolean;
  };
  x: {
    id: string;
    label: string;
    unit: string;
    values: number[];
  };
  series: {
    id: string;
    label: string;
    unit: string;
    values: number[];
  }[];
}

// Runtime validator and type guard
export function isAllowedFileStructure(value: unknown): value is AllowedFileStructure {
  const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
  const isNumArray = (v: unknown): v is number[] =>
    Array.isArray(v) && v.every((n) => typeof n === 'number' && Number.isFinite(n));

  if (!isObj(value)) return false;
  if (typeof value.schemaVersion !== 'number') return false;

  // metadata
  if (!isObj(value.metadata)) return false;
  if (typeof value.metadata.timestamp !== 'string') return false;
  if (typeof (value.metadata as Record<string, unknown>).SCR !== 'number') return false;

  // x axis
  if (!isObj(value.x)) return false;
  if (typeof value.x.id !== 'string') return false;
  if (typeof value.x.label !== 'string') return false;
  if (typeof value.x.unit !== 'string') return false;
  if (!isNumArray(value.x.values)) return false;

  // series
  if (!Array.isArray(value.series) || value.series.length === 0) return false;
  for (const s of value.series) {
    if (!isObj(s)) return false;
    if (typeof s.id !== 'string') return false;
    if (typeof s.label !== 'string') return false;
    if (typeof s.unit !== 'string') return false;
    if (!isNumArray(s.values)) return false;
  }

  return true;
}

export function parseAllowedFileStructure(json: string): AllowedFileStructure {
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    throw new Error('invalid_json');
  }
  if (!isAllowedFileStructure(data)) {
    throw new Error('invalid_format');
  }
  return data;
}
