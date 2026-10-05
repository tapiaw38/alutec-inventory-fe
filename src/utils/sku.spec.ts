import { describe, it, expect } from 'vitest';
import { buildSku } from './sku';

describe('buildSku', () => {
  it('keeps a long product name short enough to print on a label', () => {
    const sku = buildSku('Carpintería de Aluminio', 'Ventana Corrediza Doble Vidriado Hermético', 'A1B2');

    expect(sku).toBe('CAR-VENTA-CORRE-A1B2');
    expect(sku.length).toBeLessThanOrEqual(20);
  });

  it('caps length regardless of how long a single word is', () => {
    const sku = buildSku('Perfilería', 'Contramarco'.repeat(5), 'C3D4');

    expect(sku.length).toBeLessThanOrEqual(20);
  });

  it('strips accents and punctuation so the value stays CODE128-safe', () => {
    expect(buildSku('Perfilería', 'Ángulo 20x20', 'C3D4')).toBe('PER-ANGUL-20X20-C3D4');
    expect(buildSku('Maderas', 'Tabla 2" x 4"', 'E5F6')).toBe('MAD-TABLA-2-E5F6');
  });

  it('skips stop words so the code keeps meaningful words', () => {
    expect(buildSku('Herramientas', 'Caja de Herramientas', 'E5F6')).toBe('HER-CAJA-HERRA-E5F6');
  });

  it('degrades without leaving a stray separator when a part is missing', () => {
    expect(buildSku('', 'Tornillo', 'G7H8')).toBe('GEN-TORNI-G7H8');
    expect(buildSku('Maderas', '', 'I9J0')).toBe('MAD-I9J0');
  });

  it('takes the category prefix from letters, not from a leading space or symbol', () => {
    expect(buildSku('  Aluminio', 'Perfil', 'K1L2')).toBe('ALU-PERFI-K1L2');
  });
});
