'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@velnox/ui';
import { useAuth } from '@/hooks/use-auth';

export default function RegisterPage() {
  const { registerAndApply } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    shopName: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await registerAndApply(form);
      router.push('/dashboard');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
      <h1 className="font-display text-2xl font-bold text-ink">สมัครเป็นผู้ขาย</h1>
      <p className="mt-1 text-sm text-ink/60">กรอกข้อมูลเพื่อเปิดร้านค้าบน Velnox</p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <Input
          label="ชื่อ-นามสกุล"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <Input
          label="อีเมล"
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <Input
          label="เบอร์โทรศัพท์"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <Input
          label="รหัสผ่าน"
          type="password"
          required
          minLength={8}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <div className="mt-2 border-t border-line pt-4 text-sm font-semibold uppercase tracking-wide text-ink/50">
          ข้อมูลร้านค้า
        </div>
        <Input
          label="ชื่อร้านค้า"
          required
          value={form.shopName}
          onChange={(e) => setForm({ ...form, shopName: e.target.value })}
        />
        <Input
          label="รายละเอียดร้านค้า"
          required
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        {error && <p className="text-sm text-brick">{error}</p>}
        <Button type="submit" isLoading={isLoading}>
          ส่งคำขอเปิดร้าน
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink/60">
        มีบัญชีอยู่แล้ว?{' '}
        <Link href="/login" className="font-medium text-teal hover:underline">
          เข้าสู่ระบบ
        </Link>
      </p>
    </div>
  );
}
