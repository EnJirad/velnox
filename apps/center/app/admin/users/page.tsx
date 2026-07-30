export default function AdminUsersPage() {
  const users = [
    { id: 'U-001', name: 'สมชาย ใจดี', email: 'somchai@email.com', role: 'CUSTOMER', status: 'ACTIVE', joined: '2026-07-01' },
    { id: 'U-002', name: 'วิชัย เทค', email: 'wichai@tech.com', role: 'MERCHANT', status: 'ACTIVE', joined: '2026-07-05' },
    { id: 'U-003', name: 'แอดมิน พลัส', email: 'admin@velnox.dev', role: 'ADMIN', status: 'ACTIVE', joined: '2026-01-01' },
    { id: 'U-004', name: 'นพดล รักสัตว์', email: 'noppadol@email.com', role: 'CUSTOMER', status: 'BANNED', joined: '2026-07-10' },
  ];

  return (
    <div className="flex flex-col gap-8 p-6 lg:p-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-[#2D3748]">จัดการผู้ใช้งาน</h1>
          <p className="text-slate-500 font-medium">บริหารจัดการบัญชีผู้ใช้ สิทธิ์การเข้าถึง และสถานะการใช้งาน</p>
        </div>
        <button className="rounded-2xl bg-[#4FD1C5] px-6 py-3 text-sm font-black text-white shadow-lg shadow-teal-100 transition-all hover:bg-[#319795] active:scale-95">
          + เพิ่มผู้ใช้ใหม่
        </button>
      </header>

      {/* User Table */}
      <section className="rounded-[2.5rem] bg-white p-8 shadow-sm border border-slate-50">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center justify-between">
           <div className="relative flex-1 max-w-md">
              <input 
                type="text" 
                placeholder="ค้นหาชื่อ อีเมล หรือ ID..." 
                className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-2 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-teal-50"
              />
           </div>
           <div className="flex gap-2">
              {['ทั้งหมด', 'ลูกค้า', 'ร้านค้า', 'แอดมิน'].map((filter, i) => (
                <button key={filter} className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${i === 0 ? 'bg-[#4FD1C5] text-white shadow-md shadow-teal-100' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
                   {filter}
                </button>
              ))}
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <th className="pb-4 pl-4">ผู้ใช้งาน</th>
                <th className="pb-4">บทบาท</th>
                <th className="pb-4">วันที่เข้าร่วม</th>
                <th className="pb-4">สถานะ</th>
                <th className="pb-4 pr-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {users.map((user) => (
                <tr key={user.id} className="group transition-colors hover:bg-slate-50/50">
                  <td className="py-5 pl-4">
                     <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[#4FD1C5]">
                           {user.name.charAt(0)}
                        </div>
                        <div>
                           <p className="font-bold text-[#2D3748]">{user.name}</p>
                           <p className="text-xs text-slate-400 font-medium">{user.email}</p>
                        </div>
                     </div>
                  </td>
                  <td className="py-5">
                    <span className={`rounded-lg px-2 py-1 text-[10px] font-black uppercase ${
                      user.role === 'ADMIN' ? 'bg-purple-50 text-purple-600' : 
                      user.role === 'MERCHANT' ? 'bg-blue-50 text-blue-600' : 
                      'bg-slate-50 text-slate-500'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-5 font-medium text-slate-500">{user.joined}</td>
                  <td className="py-5">
                    <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${
                      user.status === 'ACTIVE' ? 'bg-teal-50 text-[#319795]' : 'bg-red-50 text-red-500'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-5 pr-4 text-right">
                    <button className="rounded-xl bg-slate-50 p-2 text-slate-400 hover:bg-[#4FD1C5] hover:text-white transition-all">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
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
