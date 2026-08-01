'use client';

import { useCallback } from 'react';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth-store';
import type { User } from '@velnox/types';

export function useAuth() {
  const { user, isAuthenticated, setUser, clearUser } = useAuthStore();

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await authService.login({ email, password });
      authService.persistSession(result);
      setUser(result.user);
      return result;
    },
    [setUser],
  );

  const register = useCallback(
    async (payload: { email: string; password: string; name: string; phone?: string }) => {
      const result = await authService.register(payload);
      authService.persistSession(result);
      setUser(result.user);
      return result;
    },
    [setUser],
  );

  const logout = useCallback(async () => {
    await authService.logout().catch(() => undefined);
    clearUser();
  }, [clearUser]);

  const refreshProfile = useCallback(async () => {
    try {
      const profile = await authService.me();
      setUser(profile as unknown as Pick<User, 'id' | 'email' | 'name' | 'role'>);
      return profile;
    } catch {
      clearUser();
      return null;
    }
  }, [setUser, clearUser]);

  return { user, isAuthenticated, login, register, logout, refreshProfile };
}
