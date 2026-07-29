'use client';

import type { ReactNode } from 'react';
import type { UserRole } from '@velnox/types';
import { useAuthStore } from '@/stores/auth-store';

interface RoleGuardProps {
  allow: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Client-side role gate for VelCenter admin screens.
 * The backend RolesGuard remains the source of truth for authorization —
 * this component only controls what the admin UI renders.
 */
export function RoleGuard({ allow, children, fallback = null }: RoleGuardProps) {
  const hasRole = useAuthStore((state) => state.hasRole);

  if (!hasRole(allow)) {
    return <>{fallback ?? <p className="text-sm text-red-600">You do not have access to this section.</p>}</>;
  }

  return <>{children}</>;
}
