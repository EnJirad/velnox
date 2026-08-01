import { formatCurrency, formatDate } from '@velnox/utils';
import { Badge, Card } from '@velnox/ui';
import { adminMerchants, orderStatusLabel, orderStatusTone, platformOrders, platformStats, revenueByMonth } from '@/lib/mock-data';

const maxRevenue = Math.max(...revenueByMonth.map((r) => r.amount));

export default function AdminOverviewPage() {
  const pendingMerchants = adminMerchants.filter((m) => m.status === 'PENDING');

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">ภาพรวมแพลตฟอร์ม</h1>
        <p className="text-sm text-slate-500">สรุปสถานะการดำเนินงานของ Velnox ทั้งหมด</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-xs text-slate-500">มูลค่าซื้อขายรวม (GMV) เดือนนี้</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{formatCurrency(platformStats.gmv)}</p>
          <p className="mt-1 text-xs font-medium text-emerald-600">▲ {platformStats.gmvGrowth}% จากเดือนก่อน</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">ผู้ใช้งานที่ใช้งานอยู่</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{platformStats.activeUsers.toLocaleString('th-TH')}</p>
          <p className="mt-1 text-xs font-medium text-emerald-600">▲ {platformStats.activeUsersGrowth}% จากเดือนก่อน</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">ร้านค้าที่เปิดใช้งาน</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{platformStats.activeMerchants}</p>
          <p className="mt-1 text-xs text-amber-600">รออนุมัติ {platformStats.pendingMerchants} ร้าน</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">คำสั่งซื้อที่ยังไม่เสร็จสิ้น</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{platformStats.openOrders}</p>
          <p className="mt-1 text-xs text-slate-400">กำลังดำเนินการอยู่</p>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <p className="mb-4 text-sm font-semibold text-slate-900">มูลค่าซื้อขายรวมรายเดือน (ล้านบาท)</p>
          <div className="flex h-48 items-end gap-4">
            {revenueByMonth.map((r) => (
              <div key={r.month} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-[10px] text-slate-400">฿{r.amount}M</span>
                <div className="w-full rounded-t-md bg-teal-600" style={{ height: `${(r.amount / maxRevenue) * 100}%` }} />
                <span className="text-xs text-slate-500">{r.month}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <p className="mb-4 text-sm font-semibold text-slate-900">ร้านค้ารออนุมัติ</p>
          <ul className="flex flex-col gap-3">
            {pendingMerchants.length === 0 && <li className="text-sm text-slate-400">ไม่มีร้านค้ารออนุมัติ</li>}
            {pendingMerchants.map((m) => (
              <li key={m.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-slate-800">{m.shopName}</p>
                  <p className="text-xs text-slate-400">{m.ownerName}</p>
                </div>
                <Badge tone="warning">รอตรวจสอบ</Badge>
              </li>
            ))}
          </ul>
          <a href="/admin/merchants" className="mt-4 block text-center text-xs font-medium text-teal-700 hover:underline">
            จัดการร้านค้าทั้งหมด →
          </a>
        </Card>
      </div>

      <Card className="p-0">
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <p className="text-sm font-semibold text-slate-900">คำสั่งซื้อล่าสุดในระบบ</p>
          <a href="/admin/orders" className="text-xs font-medium text-teal-700 hover:underline">ดูทั้งหมด →</a>
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
            {platformOrders.map((o) => (
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
