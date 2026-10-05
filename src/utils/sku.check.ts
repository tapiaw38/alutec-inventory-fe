// Run: node --experimental-strip-types src/utils/sku.check.ts
import assert from 'node:assert/strict';
import { buildSku } from './sku.ts';

// The case that motivated the length caps: a long name used to produce a
// barcode too wide to fit on a label.
const long = buildSku('Carpintería de Aluminio', 'Ventana Corrediza Doble Vidriado Hermético', 'A1B2');
assert.equal(long, 'CAR-VENTA-CORRE-A1B2');
assert.ok(long.length <= 20, `too long for a label: ${long}`);

// Accents and punctuation never reach the barcode value.
assert.equal(buildSku('Perfilería', 'Ángulo 20x20', 'C3D4'), 'PER-ANGUL-20X20-C3D4');

// Stop words are skipped so the code keeps meaningful words.
assert.equal(buildSku('Herramientas', 'Caja de Herramientas', 'E5F6'), 'HER-CAJA-HERRA-E5F6');

// Missing pieces degrade instead of producing a stray separator.
assert.equal(buildSku('', 'Tornillo', 'G7H8'), 'GEN-TORNI-G7H8');
assert.equal(buildSku('Maderas', '', 'I9J0'), 'MAD-I9J0');

console.log('sku checks passed');
