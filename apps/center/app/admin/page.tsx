export default function AdminDashboard() {
  const stats = [
    { label: 'ยอดขายรวม (GMV)', value: '฿12,450,000', change: '+15.2%', color: 'text-[#319795]' },
    { label: 'ผู้ใช้งานทั้งหมด', value: '24,500', change: '+1,240', color: 'text-blue-600' },
    { label: 'ร้านค้าที่ใช้งาน', value: '1,240', change: '+12', color: 'text-purple-600' },
    { label: 'VelRepeat Subscriptions', value: '8,420', change: '+450', color: 'text-[#4FD1C5]' },
  ];

  return (
    <div className="flex flex-col gap-8 p-6 lg:p-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-[#2D3748]">Platform Overview</h1>
          <p className="text-slate-500 font-medium">ระบบบริหารจัดการกลาง Velnox Enterprise</p>
        </div>
        <div className="flex items-center gap-4 rounded-2xl bg-white p-2 shadow-sm border border-slate-100">
           <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-[#319795]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
           </div>
           <div className="pr-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">สรุปข้อมูลถึงวันที่</p>
              <p className="text-sm font-bold text-[#2D3748]">31 กรกฎาคม 2026</p>
           </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="group relative overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-sm border border-slate-50 transition-all hover:shadow-xl hover:-translate-y-1">
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-slate-50 opacity-50 transition-transform group-hover:scale-150"></div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <div className="mt-4 flex items-end justify-between">
              <h3 className="text-2xl font-black text-[#2D3748]">{stat.value}</h3>
              <span className={`text-xs font-black ${stat.color}`}>{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Merchant Approval Queue */}
        <section className="lg:col-span-2 rounded-[2.5rem] bg-white p-8 shadow-sm border border-slate-50">
          <div className="mb-8 flex items-center justify-between">
            <div>
               <h2 className="text-xl font-black text-[#2D3748]">Merchant Approval</h2>
               <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">ร้านค้าที่รอการตรวจสอบ</p>
            </div>
            <button className="rounded-xl bg-slate-50 px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors">ดูทั้งหมด</button>
          </div>
          <div className="space-y-4">
            {[
              { name: 'Fresh Organic Farm', owner: 'สมเกียรติ มั่นคง', category: 'อาหารออร์แกนิค', date: '2 ชม. ที่แล้ว' },
              { name: 'Tech Gadget Store', owner: 'Wichai Tech', category: 'อุปกรณ์ไอที', date: '5 ชม. ที่แล้ว' },
              { name: 'Home Decor Studio', owner: 'อริสา แต่งบ้าน', category: 'ของใช้ในบ้าน', date: '1 วันที่แล้ว' },
            ].map((merchant) => (
              <div key={merchant.name} className="flex items-center justify-between rounded-3xl border border-slate-50 bg-slate-50/30 p-6 transition-all hover:border-[#4FD1C5] hover:bg-white hover:shadow-md">
                <div className="flex items-center gap-5">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm text-2xl">🏪</div>
                  <div>
                    <h4 className="font-black text-[#2D3748]">{merchant.name}</h4>
                    <p className="text-xs text-slate-500 font-medium">{merchant.owner} • {merchant.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                   <span className="text-[10px] font-bold text-slate-400">{merchant.date}</span>
                   <div className="flex gap-2">
                      <button className="rounded-xl bg-[#4FD1C5] px-4 py-2 text-xs font-black text-white shadow-lg shadow-teal-100 hover:bg-[#319795]">อนุมัติ</button>
                      <button className="rounded-xl bg-white border border-slate-200 px-4 py-2 text-xs font-bold text-slate-500 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all">ปฏิเสธ</button>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* System Health & Real-time Stats */}
        <section className="flex flex-col gap-8">
           <div className="rounded-[2.5rem] bg-[#2D3748] p-8 shadow-xl text-white">
              <h2 className="mb-6 text-xl font-black">System Health</h2>
              <div className="space-y-6">
                 {[
                   { name: 'API Services', status: 'Operational', health: 100 },
                   { name: 'Database Clusters', status: 'Operational', health: 99 },
                   { name: 'VelRepeat Engine', status: 'Processing', health: 100 },
                   { name: 'Payment Gateway', status: 'Operational', health: 100 },
                 ].map((s) => (
                   <div key={s.name} className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold">
                         <span className="text-slate-400">{s.name}</span>
                         <span className="text-[#4FD1C5]">{s.status}</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-white/10">
                         <div className="h-full rounded-full bg-[#4FD1C5]" style={{ width: `${s.health}%` }}></div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
           
           <div className="rounded-[2.5rem] bg-gradient-to-br from-[#4FD1C5] to-[#319795] p-8 shadow-xl text-white">
              <h2 className="mb-2 text-xl font-black">Real-time Users</h2>
              <p className="text-6xl font-black">1,284</p>
              <p className="mt-2 text-sm font-bold text-teal-100">ผู้ใช้งานที่กำลังออนไลน์ขณะนี้</p>
              <div className="mt-8 flex -space-x-3">
                 {[1,2,3,4,5].map(i => (
                   <div key={i} className="h-10 w-10 rounded-full border-2 border-[#319795] bg-slate-200"></div>
                 ))}
                 <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#319795] bg-white text-[10px] font-black text-[#319795]">+1.2k</div>
              </div>
           </div>
        </section>
      </div>
    </div>
  );
}
