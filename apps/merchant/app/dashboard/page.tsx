export default function MerchantDashboard() {
  const stats = [
    { label: 'ยอดขายวันนี้', value: '฿12,450', change: '+12.5%', isPositive: true },
    { label: 'คำสั่งซื้อใหม่', value: '8', change: '+2', isPositive: true },
    { label: 'VelRepeat Active', value: '45', change: '+5', isPositive: true },
    { label: 'อัตราการซื้อซ้ำ', value: '68%', change: '-2%', isPositive: false },
  ];

  return (
    <div className="flex flex-col gap-8 p-6 lg:p-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-[#2D3748]">Dashboard</h1>
          <p className="text-slate-500 font-medium">ภาพรวมร้านค้าของคุณประจำวันที่ 31 ก.ค. 2026</p>
        </div>
        <div className="flex gap-3">
          <button className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-[#2D3748] shadow-sm transition-all hover:bg-slate-50">
            ส่งออกรายงาน
          </button>
          <button className="rounded-2xl bg-[#4FD1C5] px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-teal-100 transition-all hover:bg-[#319795] hover:shadow-teal-200 active:scale-95">
            + เพิ่มสินค้าใหม่
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="group relative overflow-hidden rounded-[2rem] bg-white p-8 shadow-sm border border-slate-50 transition-all hover:shadow-xl hover:-translate-y-1">
            <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-5 transition-transform group-hover:scale-150 ${stat.isPositive ? 'bg-[#4FD1C5]' : 'bg-red-500'}`}></div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
            <div className="mt-4 flex items-end justify-between">
              <h3 className="text-3xl font-black text-[#2D3748]">{stat.value}</h3>
              <span className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-black ${stat.isPositive ? 'bg-teal-50 text-[#319795]' : 'bg-red-50 text-red-500'}`}>
                {stat.isPositive ? '↑' : '↓'} {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Sales Chart Placeholder */}
        <section className="lg:col-span-2 rounded-[2.5rem] bg-white p-8 shadow-sm border border-slate-50">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-xl font-black text-[#2D3748]">แนวโน้มยอดขาย</h2>
            <select className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-500 outline-none focus:border-[#4FD1C5]">
              <option>7 วันล่าสุด</option>
              <option>30 วันล่าสุด</option>
            </select>
          </div>
          <div className="flex h-64 items-end justify-between gap-2 px-4">
            {[40, 70, 45, 90, 65, 85, 100].map((height, i) => (
              <div key={i} className="group relative flex-1">
                <div 
                  className="w-full rounded-t-xl bg-gradient-to-t from-[#4FD1C5] to-[#B2F5EA] transition-all group-hover:to-[#319795]" 
                  style={{ height: `${height}%` }}
                ></div>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-[#2D3748] px-2 py-1 text-[10px] font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">
                  ฿{height * 200}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-between px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span>จ.</span><span>อ.</span><span>พ.</span><span>พฤ.</span><span>ศ.</span><span>ส.</span><span>อา.</span>
          </div>
        </section>

        {/* VelRepeat Insights */}
        <section className="rounded-[2.5rem] bg-[#2D3748] p-8 shadow-xl text-white">
          <h2 className="mb-6 text-xl font-black">VelRepeat Insights</h2>
          <div className="space-y-6">
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-md border border-white/10">
              <p className="text-xs font-bold text-teal-200 uppercase tracking-wider">รายได้ที่คาดการณ์ (เดือนหน้า)</p>
              <h4 className="mt-1 text-2xl font-black">฿84,200</h4>
            </div>
            <div className="space-y-4">
               <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400 font-medium">รายสัปดาห์</span>
                  <span className="font-bold">12 รายการ</span>
               </div>
               <div className="h-1.5 w-full rounded-full bg-white/10">
                  <div className="h-full w-[30%] rounded-full bg-[#4FD1C5]"></div>
               </div>
               <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400 font-medium">รายเดือน</span>
                  <span className="font-bold">33 รายการ</span>
               </div>
               <div className="h-1.5 w-full rounded-full bg-white/10">
                  <div className="h-full w-[70%] rounded-full bg-[#4FD1C5]"></div>
               </div>
            </div>
            <button className="w-full rounded-2xl bg-white py-3 text-sm font-black text-[#2D3748] transition-all hover:bg-teal-50 active:scale-95">
              ดูรายละเอียดสมาชิก
            </button>
          </div>
        </section>
      </div>

      {/* Recent Orders Table */}
      <section className="rounded-[2.5rem] bg-white p-8 shadow-sm border border-slate-50">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-xl font-black text-[#2D3748]">คำสั่งซื้อล่าสุด</h2>
          <button className="text-sm font-bold text-[#4FD1C5] hover:underline">ดูทั้งหมด</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <th className="pb-4 pl-4">ID Order</th>
                <th className="pb-4">ลูกค้า</th>
                <th className="pb-4">สินค้า</th>
                <th className="pb-4">ยอดรวม</th>
                <th className="pb-4">สถานะ</th>
                <th className="pb-4 pr-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {[
                { id: '#VEX-9921', customer: 'สมชาย ใจดี', product: 'ข้าวหอมมะลิ 5kg x2', total: '฿490', status: 'กำลังจัดส่ง', statusColor: 'bg-blue-50 text-blue-600' },
                { id: '#VEX-9922', customer: 'วิภาดา รักเรียน', product: 'น้ำดื่มแพ็ค 12 x5', total: '฿600', status: 'รอดำเนินการ', statusColor: 'bg-orange-50 text-orange-600' },
                { id: '#VEX-9923', customer: 'มานะ ขยันงาน', product: 'สบู่สมุนไพร x10', total: '฿1,890', status: 'สำเร็จแล้ว', statusColor: 'bg-teal-50 text-[#319795]' },
              ].map((order) => (
                <tr key={order.id} className="group transition-colors hover:bg-slate-50/50">
                  <td className="py-5 pl-4 font-bold text-[#2D3748]">{order.id}</td>
                  <td className="py-5 font-medium text-slate-600">{order.customer}</td>
                  <td className="py-5 text-slate-500">{order.product}</td>
                  <td className="py-5 font-black text-[#2D3748]">{order.total}</td>
                  <td className="py-5">
                    <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${order.statusColor}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-5 pr-4 text-right">
                    <button className="rounded-xl bg-slate-100 p-2 text-slate-400 transition-all hover:bg-[#4FD1C5] hover:text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
