export interface ChartSerie {
  name: string;
  type: 'line';
  data: [number, number][];
  symbol?: string;
}
