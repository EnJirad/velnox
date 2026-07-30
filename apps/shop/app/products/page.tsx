import Link from 'next/link';

export default function ProductsPage() {
  const products = [
    { id: '1', name: 'ข้าวหอมมะลิคัดพิเศษ 5kg', price: 245, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=500', category: 'อาหาร', shop: 'Velnox Shop' },
    { id: '2', name: 'น้ำแร่ธรรมชาติแพ็ค 12', price: 120, image: 'https://images.unsplash.com/photo-1548919973-5cfe5d4fc494?q=80&w=500', category: 'เครื่องดื่ม', shop: 'Velnox Shop' },
    { id: '3', name: 'เซ็ตสบู่สมุนไพรออร์แกนิค', price: 189, image: 'https://images.unsplash.com/photo-1600857062241-98e5dba7f214?q=80&w=500', category: 'สุขภาพ', shop: 'Herb Garden' },
    { id: '4', name: 'กาแฟอาราบิก้า 100%', price: 350, image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=500', category: 'เครื่องดื่ม', shop: 'Velnox Shop' },
    { id: '5', name: 'แชมพูสูตรอ่อนโยน', price: 129, image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=500', category: 'สุขภาพ', shop: 'Herb Garden' },
    { id: '6', name: 'กระดาษทิชชู่ 24 ม้วน', price: 250, image: 'https://images.unsplash.com/photo-1584622781564-1d9876a13d00?q=80&w=500', category: 'ของใช้ในบ้าน', shop: 'Home Mart' },
  ];

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black text-[#2D3748]">สินค้าทั้งหมด</h1>
          <p className="text-slate-500 font-medium">พบกับสินค้าคุณภาพที่คัดสรรมาเพื่อคุณ</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-slate-400">เรียงตาม</span>
          <select className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-[#2D3748] outline-none focus:border-[#4FD1C5] focus:ring-4 focus:ring-teal-50 transition-all">
            <option>ล่าสุด</option>
            <option>ราคา: ต่ำ-สูง</option>
            <option>ราคา: สูง-ต่ำ</option>
            <option>ยอดนิยม</option>
          </select>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-4">
        {/* Sidebar Filters */}
        <aside className="hidden lg:block space-y-8">
          <div className="rounded-[2rem] bg-white p-8 shadow-sm border border-slate-50">
            <h3 className="mb-6 text-lg font-black text-[#2D3748]">หมวดหมู่</h3>
            <div className="flex flex-col gap-4">
              {['อาหาร', 'เครื่องดื่ม', 'ของใช้ในบ้าน', 'สุขภาพและความงาม', 'สัตว์เลี้ยง'].map((cat) => (
                <label key={cat} className="group flex items-center gap-3 cursor-pointer">
                  <div className="flex h-5 w-5 items-center justify-center rounded-md border-2 border-slate-200 transition-all group-hover:border-[#4FD1C5]">
                     <input type="checkbox" className="hidden" />
                  </div>
                  <span className="text-sm font-bold text-slate-600 transition-colors group-hover:text-[#4FD1C5]">{cat}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-8 shadow-sm border border-slate-50">
            <h3 className="mb-6 text-lg font-black text-[#2D3748]">ช่วงราคา</h3>
            <div className="space-y-4">
               <div className="flex items-center gap-3">
                  <input type="number" placeholder="ต่ำสุด" className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-2 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-teal-50" />
                  <span className="text-slate-300">-</span>
                  <input type="number" placeholder="สูงสุด" className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-2 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-teal-50" />
               </div>
               <button className="w-full rounded-xl bg-[#4FD1C5] py-2 text-xs font-black text-white transition-all hover:bg-[#319795]">นำไปใช้</button>
            </div>
          </div>
          
          <div className="rounded-[2rem] bg-[#2D3748] p-8 shadow-xl text-white">
             <h3 className="mb-4 text-lg font-black text-[#4FD1C5]">VelRepeat Only</h3>
             <p className="text-xs text-slate-400 leading-relaxed mb-6">แสดงเฉพาะสินค้าที่รองรับระบบสมัครสมาชิกอัตโนมัติ</p>
             <button className="flex items-center gap-3 w-full rounded-2xl bg-white/10 p-4 border border-white/10 hover:bg-white/20 transition-all">
                <div className="h-5 w-5 rounded-full bg-[#4FD1C5] shadow-lg shadow-teal-500/50"></div>
                <span className="text-sm font-bold">เปิดใช้งาน</span>
             </button>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <Link href={`/products/${product.id}`} key={product.id} className="group relative flex flex-col overflow-hidden rounded-[2.5rem] bg-white shadow-sm border border-slate-50 transition-all hover:shadow-2xl hover:-translate-y-2">
                <div className="aspect-[4/5] w-full overflow-hidden bg-slate-50">
                  <img src={product.image} alt={product.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute left-4 top-4">
                     <span className="rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-[10px] font-black text-[#319795] shadow-sm">
                        {product.category}
                     </span>
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{product.shop}</p>
                  <h3 className="mt-2 text-lg font-bold text-[#2D3748] line-clamp-2 transition-colors group-hover:text-[#4FD1C5]">{product.name}</h3>
                  <div className="mt-auto pt-6 flex items-center justify-between">
                    <div>
                       <p className="text-[10px] font-bold text-slate-400">ราคาเริ่มต้น</p>
                       <span className="text-2xl font-black text-[#2D3748]">฿{product.price}</span>
                    </div>
                    <button className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F7FAFC] text-[#2D3748] transition-all hover:bg-[#4FD1C5] hover:text-white hover:shadow-lg hover:shadow-teal-100 active:scale-90">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          {/* Pagination */}
          <div className="mt-16 flex justify-center gap-2">
             <button className="h-12 w-12 rounded-2xl border border-slate-200 bg-white font-bold text-slate-400 hover:border-[#4FD1C5] hover:text-[#4FD1C5]">1</button>
             <button className="h-12 w-12 rounded-2xl bg-[#4FD1C5] font-bold text-white shadow-lg shadow-teal-100">2</button>
             <button className="h-12 w-12 rounded-2xl border border-slate-200 bg-white font-bold text-slate-400 hover:border-[#4FD1C5] hover:text-[#4FD1C5]">3</button>
             <button className="flex h-12 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 font-bold text-slate-400 hover:border-[#4FD1C5] hover:text-[#4FD1C5]">
                ถัดไป
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
