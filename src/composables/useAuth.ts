import { storeToRefs } from 'pinia';
import { useQuasar } from 'quasar';
import { inventoryApi } from '@/api/request/server';
import { AuthService, type LoginParams } from '@/services/auth/authService';
import { useAuthStore } from '@/stores/authStore';

export const useAuth = () => {
  const $q = useQuasar();
  const service = new AuthService(inventoryApi);
  const store = useAuthStore(service)();
  const { token, email, loading } = storeToRefs(store);

  const login = async (params: LoginParams) => {
    try {
      return await store.login(params);
    } catch (error) {
      const status = (error as { response?: { status?: number } }).response?.status;
      $q.notify({
        type: 'negative',
        message: status === 401 ? 'Email o contraseña incorrectos' : 'No se pudo iniciar sesión',
      });
      throw new Error('login-failed', { cause: error });
    }
  };

  return { token, email, loading, login, logout: store.logout };
};
