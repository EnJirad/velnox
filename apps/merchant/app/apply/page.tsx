'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';
import { useAuthContext } from '@/components/providers/auth-provider';

interface MerchantApplication {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
}

const statusCopy: Record<MerchantApplication['status'], { title: string; desc: string; tone: string }> = {
  PENDING: {
    title: '⏳ คำขอของคุณอยู่ระหว่างการตรวจสอบ',
    desc: 'ทีมงานจะตรวจสอบและแจ้งผลภายใน 1-2 วันทำการ',
    tone: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  APPROVED: {
    title: '✅ ร้านค้าของคุณได้รับการอนุมัติแล้ว',
    desc: 'เข้าสู่แดชบอร์ดเพื่อเริ่มตั้งค่าร้านค้าและลงขายสินค้าได้เลย',
    tone: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  REJECTED: {
    title: '❌ คำขอของคุณไม่ได้รับการอนุมัติ',
    desc: 'กรุณาติดต่อฝ่ายสนับสนุนสำหรับข้อมูลเพิ่มเติม',
    tone: 'bg-red-50 text-red-800 border-red-200',
  },
  SUSPENDED: {
    title: '⚠️ บัญชีร้านค้าของคุณถูกระงับ',
    desc: 'กรุณาติดต่อฝ่ายสนับสนุนเพื่อดำเนินการต่อ',
    tone: 'bg-red-50 text-red-800 border-red-200',
  },
};

export default function ApplyPage() {
  const router = useRouter();
  const { isInitializing } = useAuthContext();
  const user = useAuthStore((s) => s.user);
  const [application, setApplication] = useState<MerchantApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isInitializing) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role === 'MERCHANT') {
      router.push('/dashboard');
      return;
    }
    apiClient
      .get<MerchantApplication>('/merchants/me')
      .then(setApplication)
      .catch(() => setApplication(null))
      .finally(() => setLoading(false));
  }, [isInitializing, user, router]);

  async function handleApply() {
    setSubmitting(true);
    setError(null);
    try {
      const app = await apiClient.post<MerchantApplication>('/merchants/apply');
      setApplication(app);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ส่งคำขอไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  }

  if (isInitializing || loading) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-slate-400">กำลังโหลด...</div>;
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-700 text-xl font-bold text-white">V</div>

      {!application ? (
        <div className="flex flex-col gap-4">
          <h1 className="text-xl font-semibold text-slate-900">สมัครเปิดร้านค้ากับ Velnox</h1>
          <p className="text-sm text-slate-500">
            บัญชีของคุณพร้อมแล้ว กดยืนยันเพื่อส่งคำขอเปิดร้านค้า ทีมงานจะตรวจสอบและอนุมัติให้เร็วที่สุด
          </p>
          {error && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}
          <button
            onClick={handleApply}
            disabled={submitting}
            className="rounded-md bg-teal-700 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
          >
            {submitting ? 'กำลังส่งคำขอ...' : 'ส่งคำขอเปิดร้านค้า'}
          </button>
        </div>
      ) : (
        <div className={`flex flex-col gap-2 rounded-xl border p-6 text-left ${statusCopy[application.status].tone}`}>
          <p className="font-semibold">{statusCopy[application.status].title}</p>
          <p className="text-sm">{statusCopy[application.status].desc}</p>
        </div>
      )}

      <Link href="/" className="mt-6 text-sm text-slate-500 hover:underline">
        ← กลับหน้าแรก
      </Link>
    </div>
  );
}
