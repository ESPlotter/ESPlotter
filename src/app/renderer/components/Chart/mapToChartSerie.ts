import { ChannelFileContentSeriePrimitive } from '@shared/domain/primitives/ChannelFileContentSeriePrimitive';

import { ChartSerie } from './ChartSerie';

export function mapToChartSerie(
  channel: ChannelFileContentSeriePrimitive,
  xValues: number[],
): ChartSerie | null {
  const yValues = channel.values;

  if (!xValues.length || !yValues.length) {
    return null;
  }

  const points = xValues.reduce<[number, number][]>((acc, xValue, index) => {
    const yValue = yValues[index];

    if (typeof yValue !== 'number') {
      return acc;
    }

    acc.push([xValue, yValue]);
    return acc;
  }, []);

  if (!points.length) {
    return null;
  }

  const label = channel.label?.trim() || channel.id;
  const unit = channel.unit?.trim();
  const name = unit ? `${label} (${unit})` : label;

  return {
    name,
    type: 'line',
    data: points,
  };
}
