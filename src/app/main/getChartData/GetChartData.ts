import data from '../../../../fixtures/test3.json';
import { ChartSerie } from './ChartSerie';
import { mapTestData } from './mapTestData';

export async function getChartData(): Promise<ChartSerie[]> {
  return mapTestData(data);
}