'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { authService } from '@/services/auth.service';
import { Button } from '@velnox/ui';

interface MerchantInfo {
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  shops: { name: string }[];
}

export function MerchantGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [merchant, setMerchant] = useState<MerchantInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    authService
      .myMerchantStatus()
      .then((data) => setMerchant(data as MerchantInfo))
      .finally(() => setIsLoading(false));
  }, [isAuthenticated, router]);

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center text-ink/50">กำลังโหลด...</div>;
  }

  if (!merchant) {
    return (
      <div className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center gap-3 px-4 text-center">
        <h1 className="font-display text-xl font-bold text-ink">ยังไม่มีร้านค้า</h1>
        <p className="text-sm text-ink/60">บัญชีนี้ยังไม่ได้สมัครเป็นผู้ขายบน Velnox</p>
        <Button variant="ghost" onClick={() => logout()}>ออกจากระบบ</Button>
      </div>
    );
  }

  if (merchant.status === 'PENDING') {
    return (
      <div className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center gap-3 px-4 text-center">
        <span className="text-3xl">⏳</span>
        <h1 className="font-display text-xl font-bold text-ink">รอการตรวจสอบ</h1>
        <p className="text-sm text-ink/60">
          ร้านค้า “{merchant.shops[0]?.name}” ของคุณอยู่ระหว่างการตรวจสอบโดยทีมงาน Velnox
          จะใช้เวลาไม่เกิน 1-2 วันทำการ
        </p>
        <Button variant="ghost" onClick={() => logout()}>ออกจากระบบ</Button>
      </div>
    );
  }

  if (merchant.status === 'REJECTED' || merchant.status === 'SUSPENDED') {
    return (
      <div className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center gap-3 px-4 text-center">
        <span className="text-3xl">🚫</span>
        <h1 className="font-display text-xl font-bold text-ink">
          {merchant.status === 'REJECTED' ? 'คำขอไม่ได้รับการอนุมัติ' : 'ร้านค้าถูกระงับ'}
        </h1>
        <p className="text-sm text-ink/60">ติดต่อทีมงาน Velnox เพื่อขอข้อมูลเพิ่มเติม</p>
        <Button variant="ghost" onClick={() => logout()}>ออกจากระบบ</Button>
      </div>
    );
  }

  return <>{children}</>;
}
