import { describe, it, expect, beforeEach, vi } from 'vitest';
import { readSession, writeSession, clearSession } from './session';

const store = new Map<string, string>();

vi.stubGlobal('localStorage', {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
});

describe('session storage', () => {
  beforeEach(() => store.clear());

  it('round-trips a session', () => {
    writeSession({ token: 'abc', email: 'admin@alutec.com.ar' });

    expect(readSession()).toEqual({ token: 'abc', email: 'admin@alutec.com.ar' });
  });

  it('reports no session when nothing is stored', () => {
    expect(readSession()).toBeNull();
  });

  it('forgets the session on logout', () => {
    writeSession({ token: 'abc', email: 'admin@alutec.com.ar' });
    clearSession();

    expect(readSession()).toBeNull();
  });

  // A corrupt entry must not take the whole app down on startup.
  it('discards an unreadable entry instead of throwing', () => {
    store.set('alutec.session', 'not json');
    expect(readSession()).toBeNull();

    store.set('alutec.session', JSON.stringify({ email: 'no token here' }));
    expect(readSession()).toBeNull();
  });
});
