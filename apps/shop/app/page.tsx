import Link from 'next/link';

export default function HomePage() {
  const featuredProducts = [
    { id: '1', name: 'ข้าวหอมมะลิคัดพิเศษ 5kg', price: 245, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=500', category: 'อาหาร' },
    { id: '2', name: 'น้ำแร่ธรรมชาติแพ็ค 12', price: 120, image: 'https://images.unsplash.com/photo-1548919973-5cfe5d4fc494?q=80&w=500', category: 'เครื่องดื่ม' },
    { id: '3', name: 'เซ็ตสบู่สมุนไพรออร์แกนิค', price: 189, image: 'https://images.unsplash.com/photo-1600857062241-98e5dba7f214?q=80&w=500', category: 'สุขภาพ' },
    { id: '4', name: 'กาแฟอาราบิก้า 100%', price: 350, image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=500', category: 'เครื่องดื่ม' },
  ];

  return (
    <div className="flex flex-col gap-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[2rem] bg-[#2D3748] shadow-2xl">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#4FD1C5] opacity-20 blur-3xl"></div>
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-[#319795] opacity-20 blur-3xl"></div>
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2">
          <div className="flex flex-col justify-center p-12 lg:p-20">
            <span className="mb-4 inline-block w-fit rounded-full bg-[#4FD1C5]/20 px-4 py-1 text-sm font-bold text-[#4FD1C5]">
              New Commerce Experience
            </span>
            <h1 className="mb-6 text-5xl font-black leading-tight text-white lg:text-6xl">
              ช้อปง่าย สั่งซ้ำ <br />
              <span className="text-[#4FD1C5]">อัตโนมัติ</span>
            </h1>
            <p className="mb-8 text-lg text-slate-300">
              พบกับ Marketplace รูปแบบใหม่ที่ช่วยให้ชีวิตคุณง่ายขึ้น ด้วยระบบ VelRepeat ที่ช่วยสั่งสินค้าอุปโภคบริโภคให้คุณโดยอัตโนมัติ
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/products" className="rounded-full bg-[#4FD1C5] px-8 py-4 text-lg font-bold text-white shadow-lg shadow-teal-900/20 transition-all hover:bg-[#319795] hover:shadow-teal-900/40 active:scale-95">
                เริ่มช้อปเลย
              </Link>
              <Link href="/velrepeat" className="rounded-full border-2 border-slate-600 bg-transparent px-8 py-4 text-lg font-bold text-white transition-all hover:bg-slate-700">
                รู้จัก VelRepeat
              </Link>
            </div>
          </div>
          <div className="hidden lg:block relative h-full min-h-[500px]">
             <div className="absolute inset-0 bg-gradient-to-l from-[#2D3748] to-transparent z-10"></div>
             <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=1000" className="h-full w-full object-cover opacity-60" alt="Marketplace" />
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { icon: '🚚', title: 'ส่งเร็วทั่วไทย', desc: 'ได้รับสินค้าภายใน 1-3 วัน' },
          { icon: '🛡️', title: 'มั่นใจ 100%', desc: 'รับประกันสินค้าของแท้' },
          { icon: '🔄', title: 'VelRepeat', desc: 'สั่งซื้อซ้ำอัตโนมัติ' },
          { icon: '💳', title: 'จ่ายสะดวก', desc: 'รองรับทุกช่องทาง' },
        ].map((item) => (
          <div key={item.title} className="flex flex-col items-center rounded-2xl bg-white p-6 text-center shadow-sm border border-slate-50 transition-transform hover:-translate-y-1">
            <span className="mb-3 text-3xl">{item.icon}</span>
            <h3 className="font-bold text-[#2D3748]">{item.title}</h3>
            <p className="text-xs text-slate-500">{item.desc}</p>
          </div>
        ))}
      </section>

      {/* Categories */}
      <section>
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-black text-[#2D3748]">หมวดหมู่สินค้า</h2>
            <p className="text-slate-500">เลือกช้อปตามหมวดหมู่ที่คุณต้องการ</p>
          </div>
          <Link href="/categories" className="text-sm font-bold text-[#4FD1C5] hover:underline">ดูทั้งหมด</Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {[
            { name: 'อาหาร', icon: '🍲', color: 'bg-orange-50' },
            { name: 'เครื่องดื่ม', icon: '🥤', color: 'bg-blue-50' },
            { name: 'ของใช้ในบ้าน', icon: '🏠', color: 'bg-purple-50' },
            { name: 'ความงาม', icon: '💄', color: 'bg-pink-50' },
            { name: 'สุขภาพ', icon: '💊', color: 'bg-green-50' },
            { name: 'สัตว์เลี้ยง', icon: '🐾', color: 'bg-yellow-50' },
          ].map((cat) => (
            <div key={cat.name} className="group cursor-pointer flex flex-col items-center gap-3 rounded-3xl bg-white p-6 shadow-sm border border-slate-50 transition-all hover:border-[#4FD1C5] hover:shadow-md">
              <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${cat.color} text-3xl transition-transform group-hover:scale-110`}>
                {cat.icon}
              </div>
              <span className="text-sm font-bold text-slate-700">{cat.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section>
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-black text-[#2D3748]">สินค้าแนะนำ</h2>
            <p className="text-slate-500">คัดสรรสินค้าคุณภาพเพื่อคุณโดยเฉพาะ</p>
          </div>
          <Link href="/products" className="text-sm font-bold text-[#4FD1C5] hover:underline">ดูทั้งหมด</Link>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <div key={product.id} className="group relative flex flex-col overflow-hidden rounded-[2rem] bg-white shadow-sm border border-slate-100 transition-all hover:shadow-xl hover:-translate-y-1">
              <div className="aspect-[4/5] w-full overflow-hidden bg-slate-100">
                <img src={product.image} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <button className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-[#2D3748] backdrop-blur-md transition-colors hover:bg-[#4FD1C5] hover:text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <span className="text-xs font-bold uppercase tracking-wider text-[#4FD1C5]">{product.category}</span>
                <h3 className="mt-2 text-lg font-bold text-[#2D3748] line-clamp-2">{product.name}</h3>
                <div className="mt-auto pt-6 flex items-center justify-between">
                  <span className="text-2xl font-black text-[#2D3748]">฿{product.price}</span>
                  <button className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#4FD1C5] text-white shadow-lg shadow-teal-100 transition-all hover:bg-[#319795] active:scale-90">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* VelRepeat Feature Section */}
      <section className="rounded-[3rem] bg-gradient-to-br from-[#4FD1C5] to-[#319795] p-12 lg:p-20 shadow-2xl shadow-teal-200">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-white">
            <h2 className="mb-6 text-4xl font-black lg:text-5xl leading-tight">
              VelRepeat <br />
              <span className="text-teal-900/30 underline decoration-white/30">ผู้ช่วยส่วนตัว</span> เรื่องของใช้
            </h2>
            <p className="mb-8 text-lg text-teal-50">
              ไม่ต้องคอยเช็คสต็อกของในบ้าน ไม่ต้องกังวลว่าของจะหมดเมื่อไหร่ ให้ VelRepeat ดูแลคุณด้วยระบบสมัครรับสินค้าอัตโนมัติตามรอบที่คุณต้องการ
            </p>
            <div className="space-y-4">
              {[
                'เลือกความถี่ได้ตามใจ (รายสัปดาห์, รายเดือน)',
                'ยกเลิกหรือพักการสั่งซื้อได้ตลอดเวลา',
                'รับส่วนลดพิเศษสำหรับการสั่งซื้อต่อเนื่อง',
                'ระบบแจ้งเตือนก่อนส่งสินค้าทุกครั้ง'
              ].map((text) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#319795]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="font-bold">{text}</span>
                </div>
              ))}
            </div>
            <button className="mt-10 rounded-full bg-white px-10 py-4 font-black text-[#319795] shadow-xl transition-all hover:bg-teal-50 hover:shadow-2xl active:scale-95">
              สมัคร VelRepeat ตอนนี้
            </button>
          </div>
          <div className="relative">
             <div className="aspect-square rounded-[2.5rem] bg-white/20 backdrop-blur-sm border border-white/30 p-8 shadow-inner">
                <div className="h-full w-full rounded-[2rem] bg-white p-6 shadow-2xl">
                   <div className="flex items-center justify-between mb-8">
                      <h4 className="font-black text-[#2D3748]">ตารางการส่งสินค้า</h4>
                      <span className="text-xs font-bold text-[#4FD1C5]">ACTIVE</span>
                   </div>
                   <div className="space-y-6">
                      {[
                        { name: 'ข้าวหอมมะลิ', date: '15 ส.ค.', status: 'กำลังเตรียม' },
                        { name: 'น้ำดื่มคริสตัล', date: '22 ส.ค.', status: 'รอรอบส่ง' },
                        { name: 'ทิชชู่ Scott', date: '1 ก.ย.', status: 'รอรอบส่ง' },
                      ].map((item) => (
                        <div key={item.name} className="flex items-center justify-between border-b border-slate-50 pb-4">
                           <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-xl bg-slate-50"></div>
                              <div>
                                 <p className="font-bold text-sm text-[#2D3748]">{item.name}</p>
                                 <p className="text-xs text-slate-400">รอบส่ง: {item.date}</p>
                              </div>
                           </div>
                           <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-full">{item.status}</span>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}
