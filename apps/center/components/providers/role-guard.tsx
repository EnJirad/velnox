'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { UserRole } from '@velnox/types';
import { useAuthStore } from '@/stores/auth-store';
import { useAuthContext } from '@/components/providers/auth-provider';
import { LoadingScreen } from '@/components/layout/loading-screen';

interface RoleGuardProps {
  allow: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Client-side role gate for VelCenter admin screens.
 * Waits for auth bootstrap before deciding access.
 */
export function RoleGuard({ allow, children, fallback = null }: RoleGuardProps) {
  const router = useRouter();
  const { isInitializing } = useAuthContext();
  const user = useAuthStore((state) => state.user);
  const hasRole = useAuthStore((state) => state.hasRole);

  useEffect(() => {
    if (isInitializing) return;
    if (!user) {
      router.push('/login');
    }
  }, [isInitializing, user, router]);

  if (isInitializing || !user) {
    return <LoadingScreen />;
  }

  if (!hasRole(allow)) {
    return (
      <>
        {fallback ?? (
          <p className="p-6 text-sm text-red-600">You do not have access to this section.</p>
        )}
      </>
    );
  }

  return <>{children}</>;
}