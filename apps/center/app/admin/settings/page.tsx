'use client';

import { Badge, Card } from '@velnox/ui';
import { useAuth } from '@/hooks/use-auth';

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">ตั้งค่า</h1>
      <p className="mt-1 text-sm text-ink/60">ข้อมูลบัญชีผู้ดูแลระบบและแพลตฟอร์ม</p>

      <div className="mt-6 grid max-w-lg gap-4">
        <Card>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/50">บัญชีของฉัน</h2>
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink/60">ชื่อ</span>
            <span className="font-medium text-ink">{user?.name}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-ink/60">อีเมล</span>
            <span className="font-medium text-ink">{user?.email}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-ink/60">สิทธิ์การใช้งาน</span>
            <Badge tone="teal">{user?.role}</Badge>
          </div>
        </Card>

        <Card>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/50">แพลตฟอร์ม</h2>
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink/60">ชื่อแพลตฟอร์ม</span>
            <span className="font-medium text-ink">Velnox</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-ink/60">ค่าจัดส่งมาตรฐาน</span>
            <span className="font-mono text-ink">฿40.00</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-ink/60">สกุลเงิน</span>
            <span className="font-mono text-ink">THB</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
