/**
 * Format time value for display.
 * Integer → "3타임", Decimal → "3.5타임"
 * Code variables stay as "hours", only display strings change.
 */
export function formatTimes(n: number): string {
  const isWhole = Number.isInteger(n);
  return `${isWhole ? n : n.toFixed(1)}타임`;
}
