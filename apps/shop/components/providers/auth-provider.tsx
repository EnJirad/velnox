'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useAuthStore } from '@/stores/auth-store';

interface AuthContextValue {
  isInitializing: boolean;
}

const AuthContext = createContext<AuthContextValue>({ isInitializing: true });

/**
 * Bootstraps auth state on first load. The Foundation only wires the
 * client-side session shell; token persistence/refresh strategy (cookie vs
 * storage) is left to feature work per docs/15_Security_Architecture.md.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [isInitializing, setIsInitializing] = useState(true);
  const clearUser = useAuthStore((state) => state.clearUser);

  useEffect(() => {
    // Foundation stub: no persisted session yet, so start signed out.
    clearUser();
    setIsInitializing(false);
  }, [clearUser]);

  return (
    <AuthContext.Provider value={{ isInitializing }}>{children}</AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
