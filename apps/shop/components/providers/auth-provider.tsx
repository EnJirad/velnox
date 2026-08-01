'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getAccessToken } from '@/lib/api-client';
import { useAuth } from '@/hooks/use-auth';

interface AuthContextValue {
  isInitializing: boolean;
}

const AuthContext = createContext<AuthContextValue>({ isInitializing: true });

/** Bootstraps the session from a persisted token on first load. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [isInitializing, setIsInitializing] = useState(true);
  const { refreshProfile } = useAuth();

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setIsInitializing(false);
      return;
    }
    refreshProfile().finally(() => setIsInitializing(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <AuthContext.Provider value={{ isInitializing }}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  return useContext(AuthContext);
}
