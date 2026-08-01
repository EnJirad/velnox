'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useAuthStore } from '@/stores/auth-store';

interface AuthContextValue {
  isInitializing: boolean;
}

const AuthContext = createContext<AuthContextValue>({ isInitializing: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isInitializing, setIsInitializing] = useState(true);
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    // Demo shell: sign in as a platform admin so the RoleGuard-protected
    // admin UI is viewable. Replace with real session bootstrap per
    // docs/15_Security_Architecture.md when wiring the auth API.
    setUser({ id: 'demo-admin', email: 'admin@velnox.com', name: 'ผู้ดูแลระบบ', role: 'SUPER_ADMIN' });
    setIsInitializing(false);
  }, [setUser]);

  return <AuthContext.Provider value={{ isInitializing }}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  return useContext(AuthContext);
}
