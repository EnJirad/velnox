'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Input } from '@velnox/ui';
import { useAuth } from '@/hooks/use-auth';

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
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
      router.push(searchParams.get('next') || '/');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="font-display text-2xl font-bold text-ink">เข้าสู่ระบบ</h1>
      <p className="mt-1 text-sm text-ink/60">ยินดีต้อนรับกลับสู่ VelShop</p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <Input
          label="อีเมล"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
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

      <p className="mt-6 text-center text-sm text-ink/60">
        ยังไม่มีบัญชี?{' '}
        <Link href="/register" className="font-medium text-teal hover:underline">
          สมัครสมาชิก
        </Link>
      </p>
      <p className="mt-2 text-center text-xs text-ink/40">
        ทดลองใช้: merchant@velnox.dev / Merchant@12345
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
