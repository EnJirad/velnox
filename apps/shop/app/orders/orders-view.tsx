import { formatCurrency, formatDate } from '@velnox/utils';
import { orders, orderStatusLabel, orderStatusTone } from '@/lib/mock-data';
import { Badge } from '@velnox/ui';

export function OrdersView() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-xl font-semibold text-slate-900">คำสั่งซื้อของฉัน</h1>

      {orders.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-12 text-center text-sm text-slate-500">
          คุณยังไม่มีคำสั่งซื้อ
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">คำสั่งซื้อ #{order.orderNumber}</p>
                  <p className="text-xs text-slate-500">สั่งซื้อเมื่อ {formatDate(order.createdAt)}</p>
                </div>
                <Badge tone={orderStatusTone[order.status]}>{orderStatusLabel[order.status]}</Badge>
              </div>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-slate-500">
                  ยอดรวม <span className="font-semibold text-teal-700">{formatCurrency(order.total)}</span>
                  {' · '}
                  การชำระเงิน{' '}
                  <span className={order.paymentStatus === 'PAID' ? 'font-medium text-emerald-600' : 'font-medium text-amber-600'}>
                    {order.paymentStatus === 'PAID' ? 'ชำระแล้ว' : order.paymentStatus === 'REFUNDED' ? 'คืนเงินแล้ว' : 'รอชำระ'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 rounded-md border border-slate-300 px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 sm:flex-none">
                    ดูรายละเอียด
                  </button>
                  {order.status === 'DELIVERED' && (
                    <button className="flex-1 rounded-md bg-teal-700 px-4 py-1.5 text-xs font-medium text-white hover:bg-teal-800 sm:flex-none">
                      ซื้ออีกครั้ง
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
