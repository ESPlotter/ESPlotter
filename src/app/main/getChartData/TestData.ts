export interface TestData {
  schemaVersion: number;
  metadata: {
    timestamp: string;
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
    yAxis?: {
      label?: string;
      unit?: string;
    };
  }[];
}
