import { Badge } from '@velnox/ui';
import { merchantProducts } from '@/lib/mock-data';

export default function InventoryPage() {
  const lowStock = merchantProducts.filter((p) => p.stock > 0 && p.stock <= 10);
  const outOfStock = merchantProducts.filter((p) => p.stock === 0);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">คลังสินค้า</h1>
        <p className="text-sm text-slate-500">ติดตามระดับสต็อกและรับการแจ้งเตือนล่วงหน้า</p>
      </div>

      {(lowStock.length > 0 || outOfStock.length > 0) && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          ⚠️ มีสินค้า {lowStock.length} รายการใกล้หมด และ {outOfStock.length} รายการหมดสต็อกแล้ว ควรเติมสต็อกโดยเร็ว
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs text-slate-500">
              <th className="px-4 py-3 font-medium">สินค้า</th>
              <th className="px-4 py-3 font-medium">สต็อกปัจจุบัน</th>
              <th className="px-4 py-3 font-medium">ระดับ</th>
              <th className="px-4 py-3 font-medium">สถานะ</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {merchantProducts.map((p) => {
              const pct = Math.min(100, (p.stock / 100) * 100);
              const tone = p.stock === 0 ? 'danger' : p.stock <= 10 ? 'warning' : 'success';
              const label = p.stock === 0 ? 'หมดสต็อก' : p.stock <= 10 ? 'ใกล้หมด' : 'ปกติ';
              const barColor = p.stock === 0 ? 'bg-red-500' : p.stock <= 10 ? 'bg-amber-500' : 'bg-emerald-500';
              return (
                <tr key={p.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 text-lg">{p.emoji}</span>
                      <span className="font-medium text-slate-800">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{p.stock} ชิ้น</td>
                  <td className="px-4 py-3">
                    <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-100">
                      <div className={`h-full ${barColor}`} style={{ width: `${pct}%` }} />
                    </div>
                  </td>
                  <td className="px-4 py-3"><Badge tone={tone}>{label}</Badge></td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-xs font-medium text-teal-700 hover:underline">เติมสต็อก</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
