import { describe, it, expect } from 'vitest';
import { fittedBarWidth, MIN_BAR_WIDTH } from './barcode';

const PREFERRED = 1.6;
const MAX_WIDTH = 280;

function renderedWidth(value: string, barWidth: number): number {
  return (value.length * 11 + 35) * barWidth;
}

describe('fittedBarWidth', () => {
  it('leaves a short code at the preferred bar width', () => {
    expect(fittedBarWidth('MAD-A1B2', PREFERRED, MAX_WIDTH)).toBe(PREFERRED);
  });

  it('fits a generated SKU, the longest code buildSku can produce', () => {
    const value = 'CAR-VENTA-CORRE-A1B2'; // 20 chars
    const width = fittedBarWidth(value, PREFERRED, MAX_WIDTH);

    expect(width).toBeGreaterThanOrEqual(MIN_BAR_WIDTH);
    expect(renderedWidth(value, width)).toBeLessThanOrEqual(MAX_WIDTH);
  });

  it('thins the bars as the code grows', () => {
    const short = fittedBarWidth('MAD-A1B2', PREFERRED, MAX_WIDTH);
    const long = fittedBarWidth('CARPINTERIA-VENTANA-CORREDIZA-X9Z8', PREFERRED, MAX_WIDTH);

    expect(long).toBeLessThan(short);
  });

  // Past this point the value cannot fit and stay scannable; the SVG is scaled
  // down by CSS instead of rendering bars too thin to read.
  it('stops at the scannable floor rather than thinning indefinitely', () => {
    expect(fittedBarWidth('X'.repeat(500), PREFERRED, MAX_WIDTH)).toBe(MIN_BAR_WIDTH);
  });

  it('never widens past the preferred width when there is room to spare', () => {
    expect(fittedBarWidth('AB', PREFERRED, 2000)).toBe(PREFERRED);
  });
});
