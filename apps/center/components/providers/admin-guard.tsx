'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getAccessToken } from '@/lib/api-client';
import { useAuth } from '@/hooks/use-auth';

const ALLOWED_ROLES = ['ADMIN', 'SUPER_ADMIN'];

export function AdminGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.replace('/login');
      return;
    }
    refreshProfile().finally(() => setIsChecking(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isChecking) {
    return <div className="flex min-h-screen items-center justify-center text-ink/50">กำลังโหลด...</div>;
  }

  if (!user || !ALLOWED_ROLES.includes(user.role)) {
    return (
      <div className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center gap-3 px-4 text-center">
        <span className="text-3xl">🔒</span>
        <h1 className="font-display text-xl font-bold text-ink">ไม่มีสิทธิ์เข้าถึง</h1>
        <p className="text-sm text-ink/60">บัญชีนี้ไม่มีสิทธิ์เข้าใช้งาน VelCenter</p>
      </div>
    );
  }

  return <>{children}</>;
}
