'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { restoreSession } from '@/lib/auth';

interface AuthContextValue {
  isInitializing: boolean;
}

const AuthContext = createContext<AuthContextValue>({ isInitializing: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isInitializing, setIsInitializing] = useState(true);
  const setUser = useAuthStore((state) => state.setUser);
  const clearUser = useAuthStore((state) => state.clearUser);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const restoredUser = await restoreSession();
      if (cancelled) return;
      if (restoredUser) {
        setUser(restoredUser);
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

  return <AuthContext.Provider value={{ isInitializing }}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  return useContext(AuthContext);
}
