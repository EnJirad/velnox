import { formatCurrency } from '@velnox/utils';
import { Card } from '@velnox/ui';
import { platformStats } from '@/lib/mock-data';

const REPORTS = [
  { title: 'รายงานยอดขายรายเดือน', desc: 'สรุปยอดขายและ GMV แยกตามหมวดหมู่', icon: '📈', updated: '31 ก.ค. 2026' },
  { title: 'รายงานร้านค้า', desc: 'สถานะและผลการดำเนินงานของร้านค้าทั้งหมด', icon: '🏬', updated: '30 ก.ค. 2026' },
  { title: 'รายงานพฤติกรรมผู้ใช้', desc: 'การเข้าใช้งาน อัตราการซื้อซ้ำ และการแปลงยอดขาย', icon: '👥', updated: '29 ก.ค. 2026' },
  { title: 'รายงานการคืนสินค้า/ข้อพิพาท', desc: 'สรุปเคสคืนสินค้าและข้อพิพาทที่เกิดขึ้น', icon: '↩️', updated: '28 ก.ค. 2026' },
];

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">รายงาน</h1>
        <p className="text-sm text-slate-500">ดาวน์โหลดรายงานสรุปการดำเนินงานของแพลตฟอร์ม</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs text-slate-500">GMV เดือนนี้</p>
          <p className="mt-1 text-xl font-bold text-slate-900">{formatCurrency(platformStats.gmv)}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">คำสั่งซื้อที่ค้างอยู่</p>
          <p className="mt-1 text-xl font-bold text-slate-900">{platformStats.openOrders}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">รายการรอตรวจสอบ</p>
          <p className="mt-1 text-xl font-bold text-slate-900">{platformStats.pendingMerchants + platformStats.pendingProducts}</p>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {REPORTS.map((r) => (
          <div key={r.title} className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5">
            <span className="text-3xl">{r.icon}</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900">{r.title}</p>
              <p className="mt-1 text-xs text-slate-500">{r.desc}</p>
              <p className="mt-2 text-[11px] text-slate-400">อัปเดตล่าสุด {r.updated}</p>
            </div>
            <button className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium hover:bg-slate-50">
              ดาวน์โหลด
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
