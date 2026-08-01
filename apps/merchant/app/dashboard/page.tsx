import { formatCurrency, formatDate } from '@velnox/utils';
import { Badge, Card } from '@velnox/ui';
import { dashboardStats, merchantOrders, orderStatusLabel, orderStatusTone, salesByDay } from '@/lib/mock-data';

const maxSales = Math.max(...salesByDay.map((d) => d.amount));

export default function DashboardHomePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">ภาพรวมร้านค้า</h1>
        <p className="text-sm text-slate-500">สรุปข้อมูลสำคัญของร้านคุณวันนี้</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-xs text-slate-500">ยอดขายวันนี้</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{formatCurrency(dashboardStats.revenueToday)}</p>
          <p className="mt-1 text-xs font-medium text-emerald-600">▲ {dashboardStats.revenueGrowth}% จากเมื่อวาน</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">คำสั่งซื้อวันนี้</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{dashboardStats.ordersToday}</p>
          <p className="mt-1 text-xs font-medium text-emerald-600">▲ {dashboardStats.ordersGrowth}% จากเมื่อวาน</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">รอดำเนินการ</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{dashboardStats.pendingOrders}</p>
          <p className="mt-1 text-xs text-amber-600">ต้องยืนยัน/แพ็คสินค้า</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">สินค้าใกล้หมดสต็อก</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{dashboardStats.lowStockCount}</p>
          <p className="mt-1 text-xs text-red-600">ควรเติมสต็อกเร็วๆ นี้</p>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <p className="mb-4 text-sm font-semibold text-slate-900">ยอดขาย 7 วันล่าสุด</p>
          <div className="flex h-48 items-end gap-3">
            {salesByDay.map((d) => (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-md bg-teal-600"
                  style={{ height: `${(d.amount / maxSales) * 100}%` }}
                  title={formatCurrency(d.amount)}
                />
                <span className="text-xs text-slate-500">{d.day}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <p className="mb-4 text-sm font-semibold text-slate-900">สิ่งที่ต้องทำ</p>
          <ul className="flex flex-col gap-3 text-sm">
            <li className="flex items-center justify-between">
              <span className="text-slate-600">คำสั่งซื้อรอยืนยัน</span>
              <Badge tone="warning">{dashboardStats.pendingOrders}</Badge>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-slate-600">สินค้าใกล้หมด</span>
              <Badge tone="danger">{dashboardStats.lowStockCount}</Badge>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-slate-600">ข้อความจากลูกค้าใหม่</span>
              <Badge tone="info">3</Badge>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-slate-600">รีวิวที่ยังไม่ตอบกลับ</span>
              <Badge tone="neutral">5</Badge>
            </li>
          </ul>
        </Card>
      </div>

      <Card className="p-0">
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <p className="text-sm font-semibold text-slate-900">คำสั่งซื้อล่าสุด</p>
          <a href="/dashboard/orders" className="text-xs font-medium text-teal-700 hover:underline">ดูทั้งหมด →</a>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs text-slate-500">
              <th className="px-4 py-2 font-medium">คำสั่งซื้อ</th>
              <th className="px-4 py-2 font-medium">วันที่</th>
              <th className="px-4 py-2 font-medium">ยอดรวม</th>
              <th className="px-4 py-2 font-medium">สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {merchantOrders.slice(0, 5).map((o) => (
              <tr key={o.id} className="border-b border-slate-50 last:border-0">
                <td className="px-4 py-3 font-medium text-slate-800">#{o.orderNumber}</td>
                <td className="px-4 py-3 text-slate-500">{formatDate(o.createdAt)}</td>
                <td className="px-4 py-3 text-slate-800">{formatCurrency(o.total)}</td>
                <td className="px-4 py-3"><Badge tone={orderStatusTone[o.status]}>{orderStatusLabel[o.status]}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
