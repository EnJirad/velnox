'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Button, Card } from '@velnox/ui';

export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login?next=/profile');
  }, [isAuthenticated, router]);

  if (!user) {
    return <div className="mx-auto max-w-lg px-4 py-20 text-center text-ink/50">กำลังโหลด...</div>;
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="mb-6 font-display text-2xl font-bold text-ink">บัญชีของฉัน</h1>

      <Card>
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal font-display text-xl font-bold text-white">
            {user.name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div>
            <div className="font-semibold text-ink">{user.name}</div>
            <div className="text-sm text-ink/50">{user.email}</div>
          </div>
        </div>
      </Card>

      <Card className="mt-4">
        <h2 className="font-semibold text-ink">ขายของกับ Velnox</h2>
        <p className="mt-1 text-sm text-ink/60">
          เปิดร้านค้าของคุณเองบน VelMerchant และเข้าถึงลูกค้าทั่วประเทศ
        </p>
        <a href="http://localhost:3001" className="mt-3 inline-block">
          <Button variant="secondary">ไปที่ VelMerchant →</Button>
        </a>
      </Card>

      <div className="mt-6 flex gap-3">
        <Link href="/orders">
          <Button variant="outline">คำสั่งซื้อของฉัน</Button>
        </Link>
        <Button variant="ghost" onClick={() => logout()}>
          ออกจากระบบ
        </Button>
      </div>
    </div>
  );
}
