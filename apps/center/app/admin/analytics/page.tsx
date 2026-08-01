import { Card } from '@velnox/ui';
import { adminShops, revenueByMonth } from '@/lib/mock-data';

const maxRevenue = Math.max(...revenueByMonth.map((r) => r.amount));
const topShops = [...adminShops].sort((a, b) => b.rating - a.rating).slice(0, 5);

const categoryShare = [
  { name: 'อิเล็กทรอนิกส์', pct: 32, color: 'bg-teal-600' },
  { name: 'แฟชั่น', pct: 24, color: 'bg-orange-500' },
  { name: 'ความงาม', pct: 18, color: 'bg-sky-500' },
  { name: 'บ้านและสวน', pct: 14, color: 'bg-amber-500' },
  { name: 'อื่นๆ', pct: 12, color: 'bg-slate-400' },
];

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">วิเคราะห์ข้อมูลแพลตฟอร์ม</h1>
        <p className="text-sm text-slate-500">แนวโน้มและข้อมูลเชิงลึกระดับแพลตฟอร์ม</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <p className="mb-4 text-sm font-semibold text-slate-900">แนวโน้มมูลค่าซื้อขายรวม (ล้านบาท)</p>
          <div className="flex h-52 items-end gap-4">
            {revenueByMonth.map((r) => (
              <div key={r.month} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-teal-700 to-teal-400"
                  style={{ height: `${(r.amount / maxRevenue) * 100}%` }}
                />
                <span className="text-xs text-slate-500">{r.month}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <p className="mb-4 text-sm font-semibold text-slate-900">สัดส่วนยอดขายตามหมวดหมู่</p>
          <div className="flex flex-col gap-3">
            {categoryShare.map((c) => (
              <div key={c.name}>
                <div className="mb-1 flex justify-between text-xs text-slate-600">
                  <span>{c.name}</span>
                  <span>{c.pct}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full ${c.color}`} style={{ width: `${c.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <p className="mb-4 text-sm font-semibold text-slate-900">ร้านค้าคะแนนสูงสุด</p>
        <div className="grid gap-3 sm:grid-cols-5">
          {topShops.map((s) => (
            <div key={s.id} className="rounded-lg border border-slate-100 p-3 text-center">
              <p className="truncate text-sm font-medium text-slate-800">{s.name}</p>
              <p className="mt-1 text-xs text-amber-500">⭐ {s.rating}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
