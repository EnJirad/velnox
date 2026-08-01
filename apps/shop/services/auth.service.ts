import { apiClient, setTokens } from '@/lib/api-client';
import type { AuthenticatedUser } from '@velnox/types';

export const authService = {
  register(payload: { email: string; password: string; name: string; phone?: string }) {
    return apiClient.post<AuthenticatedUser>('/auth/register', payload, { skipAuth: true });
  },

  login(payload: { email: string; password: string }) {
    return apiClient.post<AuthenticatedUser>('/auth/login', payload, { skipAuth: true });
  },

  async logout() {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      setTokens(null, null);
    }
  },

  me() {
    return apiClient.get('/users/profile');
  },

  persistSession(result: AuthenticatedUser) {
    setTokens(result.accessToken, result.refreshToken);
  },
};
