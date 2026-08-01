import { formatCurrency } from '@velnox/utils';
import { Card } from '@velnox/ui';
import { merchantProducts, salesByDay } from '@/lib/mock-data';

const maxSales = Math.max(...salesByDay.map((d) => d.amount));
const topProducts = [...merchantProducts].sort((a, b) => b.sold - a.sold).slice(0, 5);
const totalRevenue = salesByDay.reduce((sum, d) => sum + d.amount, 0);

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">วิเคราะห์ยอดขาย</h1>
        <p className="text-sm text-slate-500">ภาพรวมผลการดำเนินงานร้านค้าของคุณ</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs text-slate-500">ยอดขายรวม 7 วัน</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{formatCurrency(totalRevenue)}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">อัตราการแปลงยอดขาย</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">3.8%</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">มูลค่าเฉลี่ยต่อคำสั่งซื้อ</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{formatCurrency(958)}</p>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <p className="mb-4 text-sm font-semibold text-slate-900">แนวโน้มยอดขาย</p>
          <div className="flex h-56 items-end gap-3">
            {salesByDay.map((d) => (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-[10px] text-slate-400">{formatCurrency(d.amount)}</span>
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-teal-700 to-teal-400"
                  style={{ height: `${(d.amount / maxSales) * 100}%` }}
                />
                <span className="text-xs text-slate-500">{d.day}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <p className="mb-4 text-sm font-semibold text-slate-900">สินค้าขายดี</p>
          <ul className="flex flex-col gap-3">
            {topProducts.map((p, i) => (
              <li key={p.id} className="flex items-center gap-3">
                <span className="w-4 text-xs font-semibold text-slate-400">{i + 1}</span>
                <span className="text-lg">{p.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">{p.name}</p>
                  <p className="text-xs text-slate-400">ขายแล้ว {p.sold} ชิ้น</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
