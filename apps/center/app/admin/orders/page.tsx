import { formatCurrency, formatDate } from '@velnox/utils';
import { Badge } from '@velnox/ui';
import { orderStatusLabel, orderStatusTone, platformOrders } from '@/lib/mock-data';

export default function OrdersPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">คำสั่งซื้อทั้งแพลตฟอร์ม</h1>
        <p className="text-sm text-slate-500">ภาพรวมคำสั่งซื้อทั้งหมดบน VelShop</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs text-slate-500">
              <th className="px-4 py-3 font-medium">คำสั่งซื้อ</th>
              <th className="px-4 py-3 font-medium">วันที่</th>
              <th className="px-4 py-3 font-medium">ยอดรวม</th>
              <th className="px-4 py-3 font-medium">การชำระเงิน</th>
              <th className="px-4 py-3 font-medium">สถานะ</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {platformOrders.map((o) => (
              <tr key={o.id} className="border-b border-slate-50 last:border-0">
                <td className="px-4 py-3 font-medium text-slate-800">#{o.orderNumber}</td>
                <td className="px-4 py-3 text-slate-500">{formatDate(o.createdAt)}</td>
                <td className="px-4 py-3 text-slate-800">{formatCurrency(o.total)}</td>
                <td className="px-4 py-3 text-slate-500">
                  {o.paymentStatus === 'PAID' ? 'ชำระแล้ว' : o.paymentStatus === 'REFUNDED' ? 'คืนเงินแล้ว' : 'รอชำระ'}
                </td>
                <td className="px-4 py-3"><Badge tone={orderStatusTone[o.status]}>{orderStatusLabel[o.status]}</Badge></td>
                <td className="px-4 py-3 text-right">
                  <button className="text-xs font-medium text-teal-700 hover:underline">ดูรายละเอียด</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
