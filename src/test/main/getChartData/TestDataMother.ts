import { TestData } from '@main/getChartData/TestData';
import { faker } from '@faker-js/faker';
import { PartialDeep } from 'type-fest';

const DEFAULT_NUMBER_OF_POINTS = 5;

export class TestDataMother {
  static with(data: PartialDeep<TestData> = {}): TestData {
    const defaultSeries = new Array(faker.number.int({ min: 1, max: 3 })).fill(
      TestDataSerieMother.random(),
    );

    const series = Array.isArray(data.series) ? (data.series as TestData['series']) : defaultSeries;

    return {
      schemaVersion: data.schemaVersion ?? 1,
      metadata: {
        timestamp: data.metadata?.timestamp ?? faker.date.recent().toISOString(),
        SCR: data.metadata?.SCR ?? faker.number.float({ min: 0, max: 50, fractionDigits: 2 }),
      },
      x: {
        id: data.x?.id ?? 'time',
        label: data.x?.label ?? 'Time',
        unit: data.x?.unit ?? 's',
        values:
          data.x?.values ??
          new Array(DEFAULT_NUMBER_OF_POINTS)
            .fill(0)
            .map(() => faker.number.float({ min: 0, max: 100, fractionDigits: 6 })),
      },
      series: series,
    };
  }
}

class TestDataSerieMother {
  static with(data: PartialDeep<TestData['series'][number]>): TestData['series'][number] {
    return {
      id: data.id ?? faker.string.alphanumeric({ casing: 'upper' }),
      label: data.label ?? faker.science.unit().name,
      unit: data.unit ?? faker.science.unit().symbol,
      values:
        data.values ??
        new Array(DEFAULT_NUMBER_OF_POINTS).fill(
          faker.number.float({ min: 0, max: 100, fractionDigits: 6 }),
        ),
    };
  }

  static random(): TestData['series'][number] {
    return TestDataSerieMother.with({});
  }
}
