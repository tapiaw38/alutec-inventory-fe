// The session lives in localStorage so a refresh does not log the user out.
// It is read by the axios interceptor as well as the router guard, which is
// why it sits here instead of inside the store.
const STORAGE_KEY = 'alutec.session';

export interface StoredSession {
  token: string;
  email: string;
}

export function readSession(): StoredSession | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      typeof (parsed as StoredSession).token === 'string'
    ) {
      return parsed as StoredSession;
    }
  } catch {
    // Corrupt entry: treat it as no session rather than breaking startup.
  }

  localStorage.removeItem(STORAGE_KEY);
  return null;
}

export function writeSession(session: StoredSession): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEY);
}
