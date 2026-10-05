// SKU doubles as the CODE128 barcode value, and CODE128 grows ~11 modules per
// character, so a long SKU prints a barcode too wide for a label. Every part
// here is length-capped to keep the generated code around 20 characters.
const STOP_WORDS = new Set(['DE', 'DEL', 'LA', 'EL', 'LOS', 'LAS', 'UN', 'UNA', 'Y', 'CON', 'PARA', 'POR']);

const CATEGORY_CHARS = 3;
const WORD_CHARS = 5;
const MAX_WORDS = 2;

/** Strips accents and punctuation, leaving uppercase words separated by "-". */
function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-');
}

export function buildSku(categoryName: string, productName: string, suffix: string): string {
  const categoryPart = normalize(categoryName)
    .replace(/-/g, '')
    .slice(0, CATEGORY_CHARS);

  const namePart = normalize(productName)
    .split('-')
    .filter((word) => word && !STOP_WORDS.has(word))
    .slice(0, MAX_WORDS)
    .map((word) => word.slice(0, WORD_CHARS))
    .join('-');

  return [categoryPart || 'GEN', namePart, suffix].filter(Boolean).join('-');
}

export function randomSkuSuffix(): string {
  return crypto.randomUUID().slice(0, 4).toUpperCase();
}
