export default function OrdersPage() {
  const orders = [
    { id: '#VEX-9921', date: '31 ก.ค. 2026', total: '฿490', status: 'SHIPPED', items: 2 },
    { id: '#VEX-8812', date: '15 ก.ค. 2026', total: '฿1,250', status: 'DELIVERED', items: 5 },
    { id: '#VEX-7756', date: '01 ก.ค. 2026', total: '฿89', status: 'CANCELLED', items: 1 },
  ];

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-black text-[#2D3748]">คำสั่งซื้อของฉัน</h1>
        <p className="text-slate-500 font-medium">ติดตามสถานะและประวัติการสั่งซื้อทั้งหมดของคุณ</p>
      </header>

      <div className="flex flex-col gap-6">
        {orders.map((order) => (
          <div key={order.id} className="group overflow-hidden rounded-[2.5rem] bg-white shadow-sm border border-slate-50 transition-all hover:shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between p-8">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order ID</span>
                <h3 className="text-xl font-black text-[#2D3748]">{order.id}</h3>
                <p className="text-sm font-bold text-slate-400">{order.date}</p>
              </div>
              
              <div className="mt-4 md:mt-0 flex flex-wrap gap-8 items-center">
                 <div className="text-center md:text-left">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">รายการ</p>
                    <p className="font-bold text-[#2D3748]">{order.items} ชิ้น</p>
                 </div>
                 <div className="text-center md:text-left">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ยอดรวมสุทธิ</p>
                    <p className="font-black text-[#4FD1C5] text-xl">{order.total}</p>
                 </div>
                 <div className="text-center md:text-left">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">สถานะ</p>
                    <span className={`rounded-full px-4 py-1 text-[10px] font-black uppercase ${
                      order.status === 'DELIVERED' ? 'bg-teal-50 text-[#319795]' : 
                      order.status === 'SHIPPED' ? 'bg-blue-50 text-blue-600' : 
                      'bg-red-50 text-red-500'
                    }`}>
                      {order.status}
                    </span>
                 </div>
                 <button className="rounded-2xl bg-slate-50 px-6 py-3 text-sm font-bold text-slate-600 hover:bg-[#4FD1C5] hover:text-white transition-all">
                    ดูรายละเอียด
                 </button>
              </div>
            </div>
            
            {/* Order Progress Bar for Shipped items */}
            {order.status === 'SHIPPED' && (
              <div className="bg-slate-50/50 p-8 border-t border-slate-50">
                 <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-[#319795]">พัสดุกำลังเดินทาง</span>
                    <span className="text-xs font-medium text-slate-400">คาดว่าจะถึงใน 2 วัน</span>
                 </div>
                 <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full w-[65%] rounded-full bg-[#4FD1C5] shadow-lg shadow-teal-100"></div>
                 </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
