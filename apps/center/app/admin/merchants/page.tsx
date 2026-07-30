export default function AdminMerchantsPage() {
  const merchants = [
    { id: 'M-101', name: 'Fresh Organic Farm', owner: 'สมเกียรติ มั่นคง', status: 'PENDING', date: '2026-07-31', rating: '-' },
    { id: 'M-102', name: 'Gadget World', owner: 'วิชัย เทค', status: 'APPROVED', date: '2026-07-28', rating: '4.8' },
    { id: 'M-103', name: 'Home Decor Studio', owner: 'อริสา แต่งบ้าน', status: 'APPROVED', date: '2026-07-25', rating: '4.5' },
    { id: 'M-104', name: 'Pet Paradise', owner: 'นพดล รักสัตว์', status: 'SUSPENDED', date: '2026-07-20', rating: '3.2' },
  ];

  return (
    <div className="flex flex-col gap-8 p-6 lg:p-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-[#2D3748]">จัดการร้านค้า</h1>
          <p className="text-slate-500 font-medium">ตรวจสอบ อนุมัติ และติดตามประสิทธิภาพของร้านค้าพาร์ทเนอร์</p>
        </div>
        <div className="flex gap-3">
          <button className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-[#2D3748] shadow-sm hover:bg-slate-50">
            รายงานร้านค้า
          </button>
        </div>
      </header>

      {/* Stats for Merchants */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
         {[
           { label: 'ร้านค้าทั้งหมด', value: '1,240', color: 'bg-blue-50 text-blue-600' },
           { label: 'รอการอนุมัติ', value: '12', color: 'bg-orange-50 text-orange-600' },
           { label: 'ร้านค้าที่ถูกระงับ', value: '5', color: 'bg-red-50 text-red-500' },
         ].map((stat) => (
           <div key={stat.label} className="rounded-[2rem] bg-white p-6 shadow-sm border border-slate-50">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <h3 className={`mt-2 text-2xl font-black ${stat.color.split(' ')[1]}`}>{stat.value}</h3>
           </div>
         ))}
      </div>

      {/* Merchant Table */}
      <section className="rounded-[2.5rem] bg-white p-8 shadow-sm border border-slate-50">
        <div className="mb-8 flex items-center justify-between">
           <div className="relative flex-1 max-w-md">
              <input 
                type="text" 
                placeholder="ค้นหาร้านค้า หรือชื่อเจ้าของ..." 
                className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-2 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-teal-50"
              />
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <th className="pb-4 pl-4">ร้านค้า / เจ้าของ</th>
                <th className="pb-4">วันที่ลงทะเบียน</th>
                <th className="pb-4">คะแนน</th>
                <th className="pb-4">สถานะ</th>
                <th className="pb-4 pr-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {merchants.map((merchant) => (
                <tr key={merchant.id} className="group transition-colors hover:bg-slate-50/50">
                  <td className="py-5 pl-4">
                     <div>
                        <p className="font-bold text-[#2D3748]">{merchant.name}</p>
                        <p className="text-xs text-slate-400 font-medium">{merchant.owner}</p>
                     </div>
                  </td>
                  <td className="py-5 font-medium text-slate-500">{merchant.date}</td>
                  <td className="py-5 font-black text-[#2D3748]">{merchant.rating}</td>
                  <td className="py-5">
                    <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${
                      merchant.status === 'APPROVED' ? 'bg-teal-50 text-[#319795]' : 
                      merchant.status === 'PENDING' ? 'bg-orange-50 text-orange-600' : 
                      'bg-red-50 text-red-500'
                    }`}>
                      {merchant.status}
                    </span>
                  </td>
                  <td className="py-5 pr-4 text-right">
                    <div className="flex justify-end gap-2">
                       {merchant.status === 'PENDING' ? (
                         <>
                           <button className="rounded-xl bg-[#4FD1C5] px-3 py-1.5 text-xs font-black text-white hover:bg-[#319795]">อนุมัติ</button>
                           <button className="rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-red-50 hover:text-red-500">ปฏิเสธ</button>
                         </>
                       ) : (
                         <button className="rounded-xl bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100">ดูรายละเอียด</button>
                       )}
                    </div>
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
