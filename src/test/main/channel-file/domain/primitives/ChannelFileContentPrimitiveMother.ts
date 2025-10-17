import { faker } from '@faker-js/faker';
import { ChannelFileContentPrimitive } from '@shared/domain/primitives/ChannelFileContentPrimitive';
import { ChannelFileContentSeriePrimitive } from '@shared/domain/primitives/ChannelFileContentSeriePrimitive';
import { PartialDeep } from 'type-fest';

const DEFAULT_NUMBER_OF_POINTS = 5;

export class ChannelFileContentPrimitiveMother {
  static with(
    data: PartialDeep<ChannelFileContentPrimitive> = {},
  ): ChannelFileContentPrimitive {
    const metadataOverrides = (data.metadata ?? {}) as Record<string, unknown>;
    const metadataExtras = Object.entries(metadataOverrides).reduce<
      Record<string, string | number | boolean>
    >((acc, [key, value]) => {
      if (key === 'timestamp' || key === 'SCR') {
        return acc;
      }

      if (value === undefined || value === null) {
        return acc;
      }

      if (['string', 'number', 'boolean'].includes(typeof value)) {
        acc[key] = value as string | number | boolean;
      }

      return acc;
    }, {});
    const timestamp = metadataOverrides.timestamp;
    const scr = metadataOverrides.SCR;

    return {
      schemaVersion: data.schemaVersion ?? 1,
      metadata: {
        timestamp:
          typeof timestamp === 'string' ? timestamp : faker.date.recent().toISOString(),
        SCR:
          typeof scr === 'number'
            ? scr
            : faker.number.float({ min: 0, max: 50, fractionDigits: 2 }),
        ...metadataExtras,
      },
      x: ChannelFileContentSeriePrimitiveMother.with(
        (data.x as PartialDeep<ChannelFileContentSeriePrimitive>) ?? {},
      ),
      series: ChannelFileContentPrimitiveMother.resolveSeries(data.series),
    };
  }

  static random(): ChannelFileContentPrimitive {
    return ChannelFileContentPrimitiveMother.with();
  }

  private static resolveSeries(
    series: PartialDeep<ChannelFileContentSeriePrimitive[]> | undefined,
  ): ChannelFileContentPrimitive['series'] {
    if (Array.isArray(series) && series.length > 0) {
      return series.map((serie) =>
        ChannelFileContentSeriePrimitiveMother.with(serie ?? {}),
      );
    }

    const numberOfSeries = faker.number.int({ min: 1, max: 3 });

    return Array.from({ length: numberOfSeries }, () =>
      ChannelFileContentSeriePrimitiveMother.random(),
    );
  }
}

export class ChannelFileContentSeriePrimitiveMother {
  static with(
    data: PartialDeep<ChannelFileContentSeriePrimitive> = {},
  ): ChannelFileContentSeriePrimitive {
    return {
      id: data.id ?? faker.string.alphanumeric({ casing: 'upper' }),
      label: data.label ?? faker.science.unit().name,
      unit: data.unit ?? faker.science.unit().symbol,
      values:
        data.values ??
        Array.from({ length: DEFAULT_NUMBER_OF_POINTS }, () =>
          faker.number.float({ min: 0, max: 100, fractionDigits: 4 }),
        ),
    };
  }

  static random(): ChannelFileContentSeriePrimitive {
    return ChannelFileContentSeriePrimitiveMother.with();
  }
}
