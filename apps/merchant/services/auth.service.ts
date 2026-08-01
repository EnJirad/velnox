import { apiClient, setAccessToken } from '@/lib/api-client';
import type { AuthenticatedUser } from '@velnox/types';

export const authService = {
  login(payload: { email: string; password: string }) {
    return apiClient.post<AuthenticatedUser>('/auth/login', payload, { skipAuth: true });
  },

  refresh(refreshToken: string) {
    return apiClient.post<AuthenticatedUser>('/auth/refresh', { refreshToken }, { skipAuth: true });
  },

  logout() {
    return apiClient.post<{ success: boolean }>('/auth/logout');
  },

  setSessionToken: setAccessToken,
};
