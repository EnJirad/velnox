import { Badge } from '@velnox/ui';
import { adminShops } from '@/lib/mock-data';

const statusTone = { ACTIVE: 'success', INACTIVE: 'neutral', SUSPENDED: 'danger' } as const;
const statusLabel = { ACTIVE: 'เปิดใช้งาน', INACTIVE: 'ปิดชั่วคราว', SUSPENDED: 'ถูกระงับ' } as const;

export default function ShopsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">หน้าร้านค้าทั้งหมด</h1>
        <p className="text-sm text-slate-500">ภาพรวมหน้าร้านที่เปิดขายบน VelShop</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {adminShops.map((s) => (
          <div key={s.id} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 text-sm font-semibold text-teal-700">
                {s.name.slice(0, 2).toUpperCase()}
              </span>
              <Badge tone={statusTone[s.status]}>{statusLabel[s.status]}</Badge>
            </div>
            <p className="text-sm font-semibold text-slate-900">{s.name}</p>
            <p className="text-xs text-slate-500">{s.category}</p>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
              <span>⭐ {s.rating}</span>
              <span>{s.productsCount} สินค้า</span>
            </div>
            <button className="mt-3 w-full rounded-md border border-slate-300 py-1.5 text-xs font-medium hover:bg-slate-50">
              ดูรายละเอียดร้านค้า
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
