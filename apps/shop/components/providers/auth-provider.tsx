'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { restoreSession } from '@/lib/auth';

interface AuthContextValue {
  isInitializing: boolean;
}

const AuthContext = createContext<AuthContextValue>({ isInitializing: true });

/**
 * Bootstraps auth state on first load: if a refresh token is stored from a
 * previous session, exchange it for a fresh access token + user profile so
 * the person stays signed in across page reloads.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [isInitializing, setIsInitializing] = useState(true);
  const setUser = useAuthStore((state) => state.setUser);
  const clearUser = useAuthStore((state) => state.clearUser);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const user = await restoreSession();
      if (cancelled) return;
      if (user) {
        setUser(user);
      } else {
        clearUser();
      }
      setIsInitializing(false);
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [setUser, clearUser]);

  return (
    <AuthContext.Provider value={{ isInitializing }}>{children}</AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
