// CODE128 spends ~11 modules per character plus ~35 for start, checksum and
// stop, so the symbol widens without bound as the value grows.
const MODULES_PER_CHAR = 11;
const FIXED_MODULES = 35;

/** Narrowest bar still reliably read by a handheld scanner. */
export const MIN_BAR_WIDTH = 1;

/**
 * Thins the bars just enough for the symbol to fit within maxWidth. Never wider
 * than preferred, never below the scannable floor — past that point the value
 * is simply too long for the given width.
 */
export function fittedBarWidth(value: string, preferred: number, maxWidth: number): number {
  const modules = value.length * MODULES_PER_CHAR + FIXED_MODULES;
  return Math.min(preferred, Math.max(MIN_BAR_WIDTH, maxWidth / modules));
}
