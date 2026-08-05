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
 * ถ้าไม่มี session / role ไม่ตรง → ไป login (ไม่ค้างข้อความ You do not have access)
 */
export function RoleGuard({ allow, children, fallback = null }: RoleGuardProps) {
  const router = useRouter();
  const { isInitializing } = useAuthContext();
  const user = useAuthStore((state) => state.user);
  const hasRole = useAuthStore((state) => state.hasRole);

  useEffect(() => {
    if (isInitializing) return;
    if (!user || !hasRole(allow)) {
      router.replace('/login');
    }
  }, [isInitializing, user, router, hasRole, allow]);

  if (isInitializing || !user) {
    return <LoadingScreen />;
  }

  if (!hasRole(allow)) {
    return (
      <>
        {fallback ?? (
          <div className="p-6 text-sm text-slate-600">
            กำลังตรวจสอบสิทธิ์... ถ้าไม่เข้าสู่ระบบอัตโนมัติ กรุณา{' '}
            <a href="/login" className="font-medium text-teal-700 underline">
              เข้าสู่ระบบใหม่
            </a>
          </div>
        )}
      </>
    );
  }

  return <>{children}</>;
}
