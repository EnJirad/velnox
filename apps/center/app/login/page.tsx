'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login, clearSession } from '@/lib/auth';
import { useAuthStore } from '@/stores/auth-store';

export default function CenterLoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const auth = await login(email, password);
      if (auth.user.role !== 'ADMIN' && auth.user.role !== 'SUPER_ADMIN') {
        clearSession();
        setError('บัญชีนี้ไม่มีสิทธิ์เข้าถึงระบบผู้ดูแล');
        return;
      }
      setUser(auth.user);
      router.push('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center bg-slate-900 px-4 py-12 text-white">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-600 text-xl font-bold">V</div>
        <h1 className="text-xl font-semibold">เข้าสู่ระบบผู้ดูแล</h1>
        <p className="text-sm text-slate-400">สำหรับทีมงาน Velnox ที่ได้รับอนุญาตเท่านั้น</p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-800/50 p-6">
        {error && (
          <div className="rounded-md bg-red-950/50 px-3 py-2 text-sm text-red-300">{error}</div>
        )}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-300">อีเมลผู้ดูแลระบบ</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@velnox.dev"
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-teal-500"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-300">รหัสผ่าน</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-teal-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-teal-600 py-2.5 text-center text-sm font-semibold hover:bg-teal-500 disabled:opacity-60"
        >
          {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
        </button>
      </form>
    </div>
  );
}
