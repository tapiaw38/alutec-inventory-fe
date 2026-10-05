import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { IAuthService, LoginParams } from '@/services/auth/authService';
import { readSession, writeSession, clearSession } from '@/utils/session';

export const useAuthStore = (service: IAuthService) =>
  defineStore('auth', () => {
    const stored = readSession();
    const token = ref<string | null>(stored?.token ?? null);
    const email = ref<string | null>(stored?.email ?? null);
    const loading = ref(false);

    const login = async (params: LoginParams) => {
      loading.value = true;
      try {
        const session = await service.login(params);
        writeSession(session);
        token.value = session.token;
        email.value = session.email;
        return session;
      } finally {
        loading.value = false;
      }
    };

    const logout = () => {
      clearSession();
      token.value = null;
      email.value = null;
    };

    return { token, email, loading, login, logout };
  });
