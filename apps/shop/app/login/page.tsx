'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-12 max-w-lg">
      <div className="overflow-hidden rounded-[3rem] bg-white shadow-2xl border border-slate-50">
        <div className="bg-[#2D3748] p-12 text-center text-white relative">
           <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#4FD1C5] opacity-20 blur-2xl"></div>
           <div className="relative z-10">
              <h1 className="text-3xl font-black mb-2">ยินดีต้อนรับกลับมา</h1>
              <p className="text-slate-400 font-medium">เข้าสู่ระบบเพื่อจัดการการช้อปปิ้งของคุณ</p>
           </div>
        </div>
        
        <div className="p-12">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {error && (
              <div className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-600">
                {error}
              </div>
            )}

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">อีเมล</label>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-6 py-4 text-sm font-bold text-[#2D3748] outline-none focus:border-[#4FD1C5] focus:bg-white focus:ring-4 focus:ring-teal-50 transition-all"
                required
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">รหัสผ่าน</label>
                <a href="#" className="text-xs font-bold text-[#4FD1C5] hover:underline">ลืมรหัสผ่าน?</a>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-6 py-4 text-sm font-bold text-[#2D3748] outline-none focus:border-[#4FD1C5] focus:bg-white focus:ring-4 focus:ring-teal-50 transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-4 w-full rounded-2xl bg-[#4FD1C5] py-4 text-lg font-black text-white shadow-xl shadow-teal-100 transition-all hover:bg-[#319795] disabled:opacity-50"
            >
              {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
          </form>

          <p className="mt-10 text-center text-sm font-bold text-slate-500">
            ยังไม่มีบัญชี? <Link href="/register" className="text-[#4FD1C5] hover:underline">สมัครสมาชิกใหม่</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
