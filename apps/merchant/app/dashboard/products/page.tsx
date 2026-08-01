import { formatCurrency } from '@velnox/utils';
import { Badge } from '@velnox/ui';
import { merchantProducts } from '@/lib/mock-data';

const statusTone = { ACTIVE: 'success', DRAFT: 'neutral', INACTIVE: 'danger' } as const;
const statusLabel = { ACTIVE: 'เผยแพร่แล้ว', DRAFT: 'ฉบับร่าง', INACTIVE: 'ปิดการขาย' } as const;

export default function ProductsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">สินค้าของฉัน</h1>
          <p className="text-sm text-slate-500">จัดการรายการสินค้าในร้าน {merchantProducts.length} รายการ</p>
        </div>
        <button className="rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800">
          + เพิ่มสินค้าใหม่
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs text-slate-500">
              <th className="px-4 py-3 font-medium">สินค้า</th>
              <th className="px-4 py-3 font-medium">หมวดหมู่</th>
              <th className="px-4 py-3 font-medium">ราคา</th>
              <th className="px-4 py-3 font-medium">สต็อก</th>
              <th className="px-4 py-3 font-medium">ขายแล้ว</th>
              <th className="px-4 py-3 font-medium">สถานะ</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {merchantProducts.map((p) => (
              <tr key={p.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 text-xl">{p.emoji}</span>
                    <span className="font-medium text-slate-800">{p.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-500">{p.category}</td>
                <td className="px-4 py-3 text-slate-800">{formatCurrency(p.price)}</td>
                <td className="px-4 py-3">
                  <span className={p.stock === 0 ? 'font-medium text-red-600' : p.stock <= 10 ? 'font-medium text-amber-600' : 'text-slate-600'}>
                    {p.stock}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">{p.sold}</td>
                <td className="px-4 py-3"><Badge tone={statusTone[p.status]}>{statusLabel[p.status]}</Badge></td>
                <td className="px-4 py-3 text-right">
                  <button className="text-xs font-medium text-teal-700 hover:underline">แก้ไข</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
