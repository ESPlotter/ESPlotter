import { ChannelFileContentSeriePrimitive } from '@shared/domain/primitives/ChannelFileContentSeriePrimitive';

import { ChartSerie } from './ChartSerie';

export function mapToChartSerie(
  channel: ChannelFileContentSeriePrimitive,
  xValues: number[],
  timeOffset: number = 0,
  gain: number = 1,
  channelOffset: number = 0,
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

    acc.push([xValue + timeOffset, yValue * gain + channelOffset]);
    return acc;
  }, []);

  if (!points.length) {
    return null;
  }

  return {
    name: channel.label || channel.id,
    type: 'line',
    data: points,
  };
}
