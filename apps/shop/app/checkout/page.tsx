export default function CheckoutPage() {
  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-black text-[#2D3748]">ชำระเงิน</h1>
        <p className="text-slate-500 font-medium">กรุณาตรวจสอบข้อมูลการจัดส่งและการชำระเงิน</p>
      </header>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          {/* Shipping Address */}
          <section className="rounded-[2.5rem] bg-white p-8 shadow-sm border border-slate-50">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-black text-[#2D3748]">ที่อยู่จัดส่ง</h2>
              <button className="text-sm font-bold text-[#4FD1C5] hover:underline">+ เพิ่มที่อยู่ใหม่</button>
            </div>
            <div className="rounded-3xl border-2 border-[#4FD1C5] bg-teal-50/30 p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="font-black text-[#2D3748]">สมชาย ใจดี (บ้าน)</p>
                  <p className="text-sm text-slate-600">123/45 หมู่บ้านสุขใจ ถ.สุขุมวิท แขวงคลองเตย</p>
                  <p className="text-sm text-slate-600">เขตคลองเตย กรุงเทพฯ 10110</p>
                  <p className="text-sm text-slate-600">โทร: 081-234-5678</p>
                </div>
                <span className="rounded-full bg-[#4FD1C5] px-3 py-1 text-[10px] font-black text-white">ค่าเริ่มต้น</span>
              </div>
            </div>
          </section>

          {/* Payment Method */}
          <section className="rounded-[2.5rem] bg-white p-8 shadow-sm border border-slate-50">
            <h2 className="mb-6 text-xl font-black text-[#2D3748]">ช่องทางการชำระเงิน</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { name: 'บัตรเครดิต', icon: '💳' },
                { name: 'QR PromptPay', icon: '📱' },
                { name: 'โอนเงินธนาคาร', icon: '🏦' },
              ].map((method, i) => (
                <div key={method.name} className={`cursor-pointer rounded-2xl border-2 p-4 text-center transition-all ${i === 1 ? 'border-[#4FD1C5] bg-teal-50/30' : 'border-slate-100 hover:border-slate-200'}`}>
                  <span className="text-2xl mb-2 block">{method.icon}</span>
                  <span className="text-sm font-bold text-[#2D3748]">{method.name}</span>
                </div>
              ))}
            </div>
          </section>

          {/* VelRepeat Option */}
          <section className="rounded-[2.5rem] bg-[#2D3748] p-8 shadow-xl text-white">
            <div className="flex items-center gap-4 mb-6">
               <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#4FD1C5] text-2xl shadow-lg shadow-teal-500/20">🔄</div>
               <div>
                  <h2 className="text-xl font-black">เปิดใช้งาน VelRepeat</h2>
                  <p className="text-sm text-slate-400">สั่งซื้อรายการนี้ซ้ำโดยอัตโนมัติ</p>
               </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
               {['ทุกสัปดาห์', 'ทุก 2 สัปดาห์', 'ทุกเดือน'].map((freq) => (
                 <button key={freq} className="rounded-2xl border border-white/10 bg-white/5 py-3 text-sm font-bold hover:bg-white/10 transition-all">
                    {freq}
                 </button>
               ))}
            </div>
          </section>
        </div>

        {/* Order Review */}
        <aside>
          <div className="rounded-[2.5rem] bg-white p-8 shadow-xl border border-slate-50 sticky top-28">
            <h2 className="mb-6 text-xl font-black text-[#2D3748]">ตรวจสอบรายการ</h2>
            <div className="mb-6 space-y-4">
               <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">ข้าวหอมมะลิ x2</span>
                  <span className="font-bold text-[#2D3748]">฿490</span>
               </div>
               <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">น้ำแร่ธรรมชาติ x1</span>
                  <span className="font-bold text-[#2D3748]">฿120</span>
               </div>
            </div>
            <div className="space-y-3 border-t border-slate-100 pt-6 text-sm">
              <div className="flex justify-between text-slate-500 font-medium">
                <span>ยอดรวม</span>
                <span>฿610</span>
              </div>
              <div className="flex justify-between text-slate-500 font-medium">
                <span>ค่าจัดส่ง</span>
                <span>฿50</span>
              </div>
              <div className="flex justify-between pt-4">
                <span className="text-lg font-black text-[#2D3748]">ยอดสุทธิ</span>
                <span className="text-2xl font-black text-[#4FD1C5]">฿660</span>
              </div>
            </div>
            <button className="mt-8 w-full rounded-2xl bg-[#4FD1C5] py-4 text-lg font-black text-white shadow-xl shadow-teal-100 transition-all hover:bg-[#319795] active:scale-95">
              ยืนยันคำสั่งซื้อ
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
