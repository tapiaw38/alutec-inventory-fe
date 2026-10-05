import { describe, it, expect } from 'vitest';
import { apiMessage } from './apiError';

const FALLBACK = 'No se pudo eliminar la categoría';

describe('apiMessage', () => {
  it('prefers the explanation the API sent', () => {
    const conflict = { response: { data: { message: '3 productos la están usando' } } };

    expect(apiMessage(conflict, FALLBACK)).toBe('3 productos la están usando');
  });

  it('falls back when the request never reached the API', () => {
    expect(apiMessage(new Error('Network Error'), FALLBACK)).toBe(FALLBACK);
  });

  it('falls back on a response without a usable message', () => {
    expect(apiMessage({ response: { data: {} } }, FALLBACK)).toBe(FALLBACK);
    expect(apiMessage({ response: { data: { message: '' } } }, FALLBACK)).toBe(FALLBACK);
    expect(apiMessage({ response: { data: { message: 42 } } }, FALLBACK)).toBe(FALLBACK);
  });

  it('survives null and undefined without throwing', () => {
    expect(apiMessage(null, FALLBACK)).toBe(FALLBACK);
    expect(apiMessage(undefined, FALLBACK)).toBe(FALLBACK);
  });
});
