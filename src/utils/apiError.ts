/**
 * Pulls the message the API sent, falling back when the failure never reached
 * it. Conflicts explain themselves ("3 productos la están usando"), so showing
 * a generic message instead would throw away the only useful part.
 */
export function apiMessage(error: unknown, fallback: string): string {
  const message = (error as { response?: { data?: { message?: unknown } } })?.response?.data
    ?.message;
  return typeof message === 'string' && message.length > 0 ? message : fallback;
}
