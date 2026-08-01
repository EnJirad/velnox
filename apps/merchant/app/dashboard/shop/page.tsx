'use client';

import { useEffect, useState } from 'react';
import { Button, Input, Badge } from '@velnox/ui';
import { shopService } from '@/services/merchant.service';

interface Shop {
  id: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  status: string;
  merchantStatus: string;
}

export default function ShopSettingsPage() {
  const [shop, setShop] = useState<Shop | null>(null);
  const [form, setForm] = useState({ name: '', description: '', logoUrl: '', bannerUrl: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'saved' | 'error'>('idle');

  useEffect(() => {
    shopService.getMine().then((data) => {
      const s = data as Shop;
      setShop(s);
      setForm({
        name: s.name,
        description: s.description ?? '',
        logoUrl: s.logoUrl ?? '',
        bannerUrl: s.bannerUrl ?? '',
      });
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    try {
      await shopService.updateMine(form);
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 1800);
    } catch {
      setStatus('error');
    }
  }

  if (!shop) {
    return <p className="text-sm text-ink/50">กำลังโหลด...</p>;
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <h1 className="font-display text-2xl font-bold text-ink">ตั้งค่าร้านค้า</h1>
        <Badge tone={shop.status === 'ACTIVE' ? 'success' : 'marigold'}>{shop.status}</Badge>
      </div>
      <p className="mt-1 text-sm text-ink/60">ข้อมูลนี้จะแสดงบนหน้าร้านของคุณใน VelShop</p>

      <form onSubmit={handleSubmit} className="mt-6 flex max-w-lg flex-col gap-4">
        <Input
          label="ชื่อร้านค้า"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-ink/80">คำอธิบายร้านค้า</label>
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="rounded-md border border-line bg-white px-3 py-2 text-sm outline-none focus:border-teal focus:ring-1 focus:ring-teal"
          />
        </div>
        <Input
          label="URL โลโก้ร้าน (ไม่บังคับ)"
          value={form.logoUrl}
          onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
        />
        <Input
          label="URL แบนเนอร์ร้าน (ไม่บังคับ)"
          value={form.bannerUrl}
          onChange={(e) => setForm({ ...form, bannerUrl: e.target.value })}
        />
        <Button type="submit" isLoading={status === 'loading'} className="mt-2 w-fit">
          {status === 'saved' ? 'บันทึกแล้ว ✓' : 'บันทึกการตั้งค่า'}
        </Button>
        {status === 'error' && <p className="text-sm text-brick">บันทึกไม่สำเร็จ ลองอีกครั้ง</p>}
      </form>
    </div>
  );
}
