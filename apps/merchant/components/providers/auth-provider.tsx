'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useAuthStore } from '@/stores/auth-store';

interface AuthContextValue {
  isInitializing: boolean;
}

const AuthContext = createContext<AuthContextValue>({ isInitializing: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isInitializing, setIsInitializing] = useState(true);
  const clearUser = useAuthStore((state) => state.clearUser);

  useEffect(() => {
    clearUser();
    setIsInitializing(false);
  }, [clearUser]);

  return <AuthContext.Provider value={{ isInitializing }}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  return useContext(AuthContext);
}
