import { formatCurrency } from '@velnox/utils';
import { Badge } from '@velnox/ui';
import { adminProducts } from '@/lib/mock-data';

const statusTone = { PENDING_REVIEW: 'warning', ACTIVE: 'success', REJECTED: 'danger' } as const;
const statusLabel = { PENDING_REVIEW: 'รอตรวจสอบ', ACTIVE: 'อนุมัติแล้ว', REJECTED: 'ถูกปฏิเสธ' } as const;

export default function ProductsPage() {
  const pending = adminProducts.filter((p) => p.status === 'PENDING_REVIEW');

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">ตรวจสอบสินค้า</h1>
        <p className="text-sm text-slate-500">มีสินค้า {pending.length} รายการรอการตรวจสอบก่อนเผยแพร่</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs text-slate-500">
              <th className="px-4 py-3 font-medium">สินค้า</th>
              <th className="px-4 py-3 font-medium">ร้านค้า</th>
              <th className="px-4 py-3 font-medium">ราคา</th>
              <th className="px-4 py-3 font-medium">สถานะ</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {adminProducts.map((p) => (
              <tr key={p.id} className="border-b border-slate-50 last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 text-lg">{p.emoji}</span>
                    <span className="font-medium text-slate-800">{p.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-500">{p.shopName}</td>
                <td className="px-4 py-3 text-slate-600">{formatCurrency(p.price)}</td>
                <td className="px-4 py-3"><Badge tone={statusTone[p.status]}>{statusLabel[p.status]}</Badge></td>
                <td className="px-4 py-3 text-right">
                  {p.status === 'PENDING_REVIEW' ? (
                    <div className="flex justify-end gap-2">
                      <button className="rounded-md bg-teal-700 px-3 py-1 text-xs font-medium text-white hover:bg-teal-800">อนุมัติ</button>
                      <button className="rounded-md border border-red-300 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50">ปฏิเสธ</button>
                    </div>
                  ) : (
                    <button className="text-xs font-medium text-teal-700 hover:underline">ดูรายละเอียด</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
