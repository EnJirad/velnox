import Link from 'next/link';

export default function VelRepeatPage() {
  return (
    <div className="flex flex-col gap-20">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto pt-12">
        <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-6 py-2 text-sm font-black text-[#319795] mb-8">
           <span className="flex h-2 w-2 rounded-full bg-[#4FD1C5] animate-ping"></span>
           VelRepeat Subscription
        </div>
        <h1 className="text-5xl lg:text-7xl font-black text-[#2D3748] leading-tight mb-8">
          ไม่ต้องกังวลเรื่อง <br />
          <span className="text-[#4FD1C5]">ของใช้หมดบ้าน</span> อีกต่อไป
        </h1>
        <p className="text-xl text-slate-500 font-medium leading-relaxed mb-12">
          ระบบสมาชิกอัจฉริยะที่ช่วยจัดการสั่งซื้อสินค้าที่คุณใช้เป็นประจำโดยอัตโนมัติ 
          ประหยัดทั้งเวลาและค่าใช้จ่าย พร้อมรับสิทธิประโยชน์พิเศษมากมาย
        </p>
        <div className="flex justify-center gap-6">
           <Link href="/products" className="rounded-full bg-[#4FD1C5] px-10 py-5 text-lg font-black text-white shadow-2xl shadow-teal-200 transition-all hover:bg-[#319795] active:scale-95">
              เลือกสินค้าสำหรับ VelRepeat
           </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
         {[
           { step: '01', title: 'เลือกสินค้าที่ต้องการ', desc: 'เลือกสินค้าที่คุณต้องใช้เป็นประจำ เช่น ข้าวสาร น้ำดื่ม หรือของใช้ส่วนตัว' },
           { step: '02', title: 'กำหนดรอบการส่ง', desc: 'เลือกความถี่ที่คุณต้องการรับสินค้า ไม่ว่าจะเป็นรายสัปดาห์ หรือรายเดือน' },
           { step: '03', title: 'รับของที่บ้านอัตโนมัติ', desc: 'ระบบจะสร้างคำสั่งซื้อและจัดส่งให้คุณตามรอบ โดยที่คุณไม่ต้องกดสั่งใหม่' },
         ].map((item) => (
           <div key={item.step} className="group relative rounded-[3rem] bg-white p-10 shadow-sm border border-slate-50 transition-all hover:shadow-xl hover:-translate-y-2">
              <span className="text-6xl font-black text-slate-50 absolute -top-4 -left-4 z-0 group-hover:text-teal-50 transition-colors">{item.step}</span>
              <div className="relative z-10">
                 <h3 className="text-xl font-black text-[#2D3748] mb-4">{item.title}</h3>
                 <p className="text-slate-500 font-medium leading-relaxed">{item.desc}</p>
              </div>
           </div>
         ))}
      </section>

      {/* Benefits Section */}
      <section className="rounded-[4rem] bg-[#2D3748] p-12 lg:p-24 text-white relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 w-1/2 h-full bg-[#4FD1C5] opacity-5 blur-[100px]"></div>
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
            <div>
               <h2 className="text-4xl font-black mb-8 leading-tight">ทำไมต้องเลือก <br /><span className="text-[#4FD1C5]">VelRepeat?</span></h2>
               <div className="space-y-8">
                  {[
                    { title: 'ประหยัดสูงสุด 15%', desc: 'รับส่วนลดพิเศษทันทีสำหรับทุกรายการสั่งซื้อผ่านระบบ VelRepeat' },
                    { title: 'ยืดหยุ่นได้เสมอ', desc: 'สามารถข้ามรอบการส่ง หรือยกเลิกสมาชิกได้ตลอดเวลาโดยไม่มีข้อผูกมัด' },
                    { title: 'แจ้งเตือนล่วงหน้า', desc: 'ระบบจะแจ้งเตือนคุณผ่านอีเมลและแอปก่อนการสร้างคำสั่งซื้อทุกครั้ง' },
                  ].map((benefit) => (
                    <div key={benefit.title} className="flex gap-6">
                       <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#4FD1C5] text-white shadow-lg shadow-teal-500/20">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                       </div>
                       <div>
                          <h4 className="text-lg font-black mb-1">{benefit.title}</h4>
                          <p className="text-slate-400 font-medium">{benefit.desc}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-[3rem] p-8 border border-white/10 shadow-inner">
               <div className="aspect-video rounded-[2rem] bg-gradient-to-br from-[#4FD1C5] to-[#319795] flex items-center justify-center text-4xl shadow-2xl">
                  🎬
               </div>
               <p className="mt-6 text-center text-sm font-bold text-teal-200 uppercase tracking-widest">วิดีโอแนะนำการใช้งาน</p>
            </div>
         </div>
      </section>

      {/* FAQ Preview */}
      <section className="max-w-3xl mx-auto w-full text-center">
         <h2 className="text-3xl font-black text-[#2D3748] mb-12">คำถามที่พบบ่อย</h2>
         <div className="space-y-4 text-left">
            {[
              'ฉันสามารถเปลี่ยนวันส่งสินค้าได้ไหม?',
              'ถ้าสินค้าในสต็อกหมดจะทำอย่างไร?',
              'สามารถรวมหลายสินค้าในรอบส่งเดียวได้ไหม?',
            ].map((q) => (
              <div key={q} className="flex items-center justify-between rounded-2xl bg-white p-6 shadow-sm border border-slate-50 cursor-pointer hover:border-[#4FD1C5] transition-all">
                 <span className="font-bold text-[#2D3748]">{q}</span>
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                 </svg>
              </div>
            ))}
         </div>
         <button className="mt-12 font-black text-[#4FD1C5] hover:underline">ดูคำถามทั้งหมด</button>
      </section>
    </div>
  );
}
