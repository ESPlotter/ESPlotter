export function formatNumberWithDecimals(value: number, decimals: number, fixed: boolean): string {
  if (fixed) {
    return value.toFixed(decimals);
  }
  const formatted = value.toFixed(decimals);
  return parseFloat(formatted).toString();
}
