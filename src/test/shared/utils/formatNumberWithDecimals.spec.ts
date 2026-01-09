import { describe, expect, it } from 'vitest';

import { formatNumberWithDecimals } from '@shared/utils/formatNumberWithDecimals';

describe('formatNumberWithDecimals', () => {
  it('formats number with fixed decimals', () => {
    expect(formatNumberWithDecimals(0.123, 6, true)).toBe('0.123000');
    expect(formatNumberWithDecimals(1.5, 3, true)).toBe('1.500');
    expect(formatNumberWithDecimals(42.706, 3, true)).toBe('42.706');
  });

  it('formats number without fixed decimals', () => {
    expect(formatNumberWithDecimals(0.123, 6, false)).toBe('0.123');
    expect(formatNumberWithDecimals(1.5, 3, false)).toBe('1.5');
    expect(formatNumberWithDecimals(42.706, 3, false)).toBe('42.706');
  });

  it('handles zero decimals', () => {
    expect(formatNumberWithDecimals(3.14159, 0, true)).toBe('3');
    expect(formatNumberWithDecimals(3.14159, 0, false)).toBe('3');
  });

  it('handles large decimal count', () => {
    expect(formatNumberWithDecimals(0.123456789, 10, true)).toBe('0.1234567890');
    expect(formatNumberWithDecimals(0.123456789, 10, false)).toBe('0.123456789');
  });

  it('handles negative numbers', () => {
    expect(formatNumberWithDecimals(-0.002, 3, true)).toBe('-0.002');
    expect(formatNumberWithDecimals(-500.065, 3, true)).toBe('-500.065');
  });
});
