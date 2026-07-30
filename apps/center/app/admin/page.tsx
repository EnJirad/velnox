export default function AdminDashboard() {
  const stats = [
    { label: 'ยอดขายรวมทั้งหมด', value: '฿1,245,000', change: '+8.5%', color: 'text-green-600' },
    { label: 'ผู้ใช้งานทั้งหมด', value: '1,240', change: '+120', color: 'text-blue-600' },
    { label: 'ร้านค้าทั้งหมด', value: '85', change: '+3', color: 'text-indigo-600' },
    { label: 'คำสั่งซื้อรอดำเนินการ', value: '24', change: '-5', color: 'text-orange-600' },
  ];

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Velnox Admin Dashboard</h1>
        <p className="text-slate-500">ภาพรวมการดำเนินงานของแพลตฟอร์ม</p>
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

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Merchant Approval Queue */}
        <section className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-slate-900">ร้านค้าที่รอการอนุมัติ</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-3 font-semibold text-slate-600">ชื่อร้าน</th>
                  <th className="pb-3 font-semibold text-slate-600">อีเมลผู้สมัคร</th>
                  <th className="pb-3 font-semibold text-slate-600">วันที่สมัคร</th>
                  <th className="pb-3 font-semibold text-slate-600">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {[
                  { name: 'Organic Farm', email: 'farmer@email.com', date: '2026-07-28' },
                  { name: 'Gadget Store', email: 'tech@email.com', date: '2026-07-29' },
                  { name: 'Home Decor', email: 'decor@email.com', date: '2026-07-30' },
                ].map((merchant) => (
                  <tr key={merchant.name}>
                    <td className="py-3 font-medium">{merchant.name}</td>
                    <td className="py-3">{merchant.email}</td>
                    <td className="py-3 text-slate-500">{merchant.date}</td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button className="rounded bg-green-600 px-2 py-1 text-xs text-white hover:bg-green-700">อนุมัติ</button>
                        <button className="rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700">ปฏิเสธ</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* System Health */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-slate-900">สถานะระบบ</h2>
          <div className="flex flex-col gap-4">
            {[
              { service: 'API Server', status: 'Online', color: 'bg-green-500' },
              { service: 'Database', status: 'Online', color: 'bg-green-500' },
              { service: 'Storage', status: 'Online', color: 'bg-green-500' },
              { service: 'VelRepeat Engine', status: 'Online', color: 'bg-green-500' },
            ].map((s) => (
              <div key={s.service} className="flex items-center justify-between">
                <span className="text-sm text-slate-600">{s.service}</span>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${s.color}`}></div>
                  <span className="text-xs font-medium text-slate-900">{s.status}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 border-t border-slate-100 pt-4">
            <p className="text-xs text-slate-400 text-center">อัปเดตล่าสุด: 31 ก.ค. 2026 10:00</p>
          </div>
        </section>
      </div>
    </div>
  );
}
