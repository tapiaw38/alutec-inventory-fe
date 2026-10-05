import axios from 'axios';
import type { AxiosError } from 'axios';
import { readSession, clearSession } from '@/utils/session';

export const inventoryApi = axios.create({
  baseURL: import.meta.env.QCLI_API_URL || 'http://localhost:8080/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

inventoryApi.interceptors.request.use((config) => {
  const session = readSession();
  if (session) config.headers.Authorization = `Bearer ${session.token}`;
  return config;
});

// An expired or revoked token can surface on any call, so drop the session and
// send the user back to the login screen from one place.
inventoryApi.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const isLoginAttempt = error.config?.url?.includes('/auth/login');
    if (error.response?.status === 401 && !isLoginAttempt) {
      clearSession();
      if (!window.location.hash.startsWith('#/login')) {
        window.location.hash = '#/login';
      }
    }
    return Promise.reject(error);
  },
);
