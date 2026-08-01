'use client';

import { useCallback } from 'react';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth-store';

export function useAuth() {
  const { user, isAuthenticated, setUser, clearUser, hasRole } = useAuthStore();

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await authService.login({ email, password });
      authService.setSessionToken(result.accessToken);
      setUser(result.user);
      return result;
    },
    [setUser],
  );

  const logout = useCallback(async () => {
    await authService.logout().catch(() => undefined);
    authService.setSessionToken(null);
    clearUser();
  }, [clearUser]);

  return { user, isAuthenticated, login, logout, hasRole };
}
