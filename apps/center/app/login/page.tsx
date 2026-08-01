'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@velnox/ui';
import { useAuth } from '@/hooks/use-auth';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await login(email, password);
      router.push('/admin');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm rounded-lg border border-white/10 bg-white p-6">
        <h1 className="font-display text-xl font-bold text-ink">เข้าสู่ระบบผู้ดูแล</h1>
        <p className="mt-1 text-sm text-ink/60">สำหรับทีมงาน Velnox เท่านั้น</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <Input label="อีเมล" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input
            label="รหัสผ่าน"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-sm text-brick">{error}</p>}
          <Button type="submit" isLoading={isLoading}>
            เข้าสู่ระบบ
          </Button>
        </form>
        <p className="mt-4 text-center text-xs text-ink/40">
          ทดลองใช้: admin@velnox.dev / Admin@12345
        </p>
      </div>
    </div>
  );
}
