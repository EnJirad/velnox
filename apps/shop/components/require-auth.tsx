'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/components/providers/auth-provider';
import { useAuthStore } from '@/stores/auth-store';

/**
 * Wraps pages that require a logged-in customer. While the session is
 * still being restored it shows a loading state; once resolved, an
 * unauthenticated visitor is sent to the home page (where the header
 * always has a visible login button) instead of a page that silently
 * fails to load their data.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isInitializing } = useAuthContext();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!isInitializing && !user) {
      router.push('/');
    }
  }, [isInitializing, user, router]);

  if (isInitializing || !user) {
    return <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-400">กำลังโหลด...</div>;
  }

  return <>{children}</>;
}
