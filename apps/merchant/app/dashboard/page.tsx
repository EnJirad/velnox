export default function MerchantDashboard() {
  const stats = [
    { label: 'ยอดขายวันนี้', value: '฿12,450', change: '+12%', color: 'text-green-600' },
    { label: 'คำสั่งซื้อใหม่', value: '8', change: '+2', color: 'text-blue-600' },
    { label: 'VelRepeat Active', value: '45', change: '+5', color: 'text-indigo-600' },
    { label: 'สินค้าใกล้หมด', value: '3', change: '-1', color: 'text-red-600' },
  ];

  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">แผงควบคุมร้านค้า</h1>
          <p className="text-slate-500">ยินดีต้อนรับกลับมา, Velnox Demo Shop</p>
        </div>
        <button className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800">
          + เพิ่มสินค้าใหม่
        </button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <div className="mt-2 flex items-baseline justify-between">
              <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
              <span className={`text-xs font-semibold ${stat.color}`}>{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Recent Orders */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-slate-900">คำสั่งซื้อล่าสุด</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-3 font-semibold text-slate-600">ID</th>
                  <th className="pb-3 font-semibold text-slate-600">ลูกค้า</th>
                  <th className="pb-3 font-semibold text-slate-600">ยอดรวม</th>
                  <th className="pb-3 font-semibold text-slate-600">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {[
                  { id: '#ORD-1001', customer: 'สมชาย ใจดี', total: '฿199', status: 'กำลังจัดส่ง' },
                  { id: '#ORD-1002', customer: 'สมหญิง รักดี', total: '฿288', status: 'รอดำเนินการ' },
                  { id: '#ORD-1003', customer: 'มานะ ขยัน', total: '฿45', status: 'สำเร็จแล้ว' },
                ].map((order) => (
                  <tr key={order.id}>
                    <td className="py-3 font-medium">{order.id}</td>
                    <td className="py-3">{order.customer}</td>
                    <td className="py-3 font-semibold">{order.total}</td>
                    <td className="py-3">
                      <span className="rounded-full bg-teal-50 px-2 py-1 text-xs font-medium text-teal-700">
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Popular Products */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-slate-900">สินค้าขายดี</h2>
          <div className="flex flex-col gap-4">
            {[
              { name: 'ข้าวหอมมะลิ 5kg', sales: 120, stock: 45 },
              { name: 'น้ำดื่มแพ็ค 12 ขวด', sales: 85, stock: 112 },
              { name: 'สบู่อาบน้ำสมุนไพร', sales: 64, stock: 8 },
            ].map((product) => (
              <div key={product.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded bg-slate-100"></div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{product.name}</p>
                    <p className="text-xs text-slate-500">สต็อกคงเหลือ: {product.stock}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">{product.sales} ชิ้น</p>
                  <p className="text-xs text-slate-500">ขายแล้ว</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
