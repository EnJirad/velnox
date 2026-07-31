'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ProductsPage() {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const products = [
    { id: '1', name: 'ข้าวหอมมะลิคัดพิเศษ 5kg', price: 245, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=500', category: 'อาหาร', shop: 'Velnox Shop' },
    { id: '2', name: 'น้ำแร่ธรรมชาติแพ็ค 12', price: 120, image: 'https://images.unsplash.com/photo-1548919973-5cfe5d4fc494?q=80&w=500', category: 'เครื่องดื่ม', shop: 'Velnox Shop' },
    { id: '3', name: 'เซ็ตสบู่สมุนไพรออร์แกนิค', price: 189, image: 'https://images.unsplash.com/photo-1600857062241-98e5dba7f214?q=80&w=500', category: 'สุขภาพ', shop: 'Herb Garden' },
    { id: '4', name: 'กาแฟอาราบิก้า 100%', price: 350, image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=500', category: 'เครื่องดื่ม', shop: 'Velnox Shop' },
    { id: '5', name: 'แชมพูสูตรอ่อนโยน', price: 129, image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=500', category: 'สุขภาพ', shop: 'Herb Garden' },
    { id: '6', name: 'กระดาษทิชชู่ 24 ม้วน', price: 250, image: 'https://images.unsplash.com/photo-1584622781564-1d9876a13d00?q=80&w=500', category: 'ของใช้ในบ้าน', shop: 'Home Mart' },
  ];

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      {/* Header */}
      <header className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#2D3748]">สินค้าทั้งหมด</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">พบกับสินค้าคุณภาพที่คัดสรรมาเพื่อคุณ</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="md:hidden flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-slate-100 text-slate-600 font-bold text-xs sm:text-sm hover:bg-slate-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            ตัวกรอง
          </button>
          <select className="hidden sm:block rounded-lg sm:rounded-2xl border border-slate-200 bg-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-[#2D3748] outline-none focus:border-[#4FD1C5] focus:ring-4 focus:ring-teal-50 transition-all">
            <option>ล่าสุด</option>
            <option>ราคา: ต่ำ-สูง</option>
            <option>ราคา: สูง-ต่ำ</option>
            <option>ยอดนิยม</option>
          </select>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-4">
        {/* Sidebar Filters - Desktop */}
        <aside className="hidden lg:flex flex-col gap-6">
          {/* Categories */}
          <div className="rounded-lg sm:rounded-2xl md:rounded-[2rem] bg-white p-4 sm:p-6 md:p-8 shadow-sm border border-slate-50">
            <h3 className="mb-4 sm:mb-6 text-sm sm:text-lg font-black text-[#2D3748]">หมวดหมู่</h3>
            <div className="flex flex-col gap-2 sm:gap-4">
              {['อาหาร', 'เครื่องดื่ม', 'ของใช้ในบ้าน', 'สุขภาพและความงาม', 'สัตว์เลี้ยง'].map((cat) => (
                <label key={cat} className="group flex items-center gap-2 sm:gap-3 cursor-pointer">
                  <div className="flex h-4 sm:h-5 w-4 sm:w-5 items-center justify-center rounded-md border-2 border-slate-200 transition-all group-hover:border-[#4FD1C5]">
                     <input type="checkbox" className="hidden" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-600 transition-colors group-hover:text-[#4FD1C5]">{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="rounded-lg sm:rounded-2xl md:rounded-[2rem] bg-white p-4 sm:p-6 md:p-8 shadow-sm border border-slate-50">
            <h3 className="mb-4 sm:mb-6 text-sm sm:text-lg font-black text-[#2D3748]">ช่วงราคา</h3>
            <div className="space-y-3 sm:space-y-4">
               <div className="flex items-center gap-2 sm:gap-3">
                  <input type="number" placeholder="ต่ำสุด" className="w-full rounded-lg sm:rounded-xl border border-slate-100 bg-slate-50 px-2 sm:px-4 py-2 text-xs sm:text-sm outline-none focus:bg-white focus:ring-2 focus:ring-teal-50" />
                  <span className="text-slate-300">-</span>
                  <input type="number" placeholder="สูงสุด" className="w-full rounded-lg sm:rounded-xl border border-slate-100 bg-slate-50 px-2 sm:px-4 py-2 text-xs sm:text-sm outline-none focus:bg-white focus:ring-2 focus:ring-teal-50" />
               </div>
               <button className="w-full rounded-lg sm:rounded-xl bg-[#4FD1C5] py-2 text-xs font-black text-white transition-all hover:bg-[#319795]">นำไปใช้</button>
            </div>
          </div>
          
          {/* VelRepeat */}
          <div className="rounded-lg sm:rounded-2xl md:rounded-[2rem] bg-[#2D3748] p-4 sm:p-6 md:p-8 shadow-xl text-white">
             <h3 className="mb-2 sm:mb-4 text-sm sm:text-lg font-black text-[#4FD1C5]">VelRepeat Only</h3>
             <p className="text-[10px] sm:text-xs text-slate-400 leading-relaxed mb-4 sm:mb-6">แสดงเฉพาะสินค้าที่รองรับระบบสมัครสมาชิกอัตโนมัติ</p>
             <button className="flex items-center gap-2 sm:gap-3 w-full rounded-lg sm:rounded-2xl bg-white/10 p-3 sm:p-4 border border-white/10 hover:bg-white/20 transition-all">
                <div className="h-4 sm:h-5 w-4 sm:w-5 rounded-full bg-[#4FD1C5] shadow-lg shadow-teal-500/50"></div>
                <span className="text-xs sm:text-sm font-bold">เปิดใช้งาน</span>
             </button>
          </div>
        </aside>

        {/* Mobile Filters */}
        {mobileFiltersOpen && (
          <div className="md:hidden col-span-1 bg-white rounded-lg border border-slate-200 p-4 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2">หมวดหมู่</label>
              <select className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs sm:text-sm">
                <option>ทั้งหมด</option>
                <option>อาหาร</option>
                <option>เครื่องดื่ม</option>
                <option>สุขภาพ</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2">ราคา</label>
              <select className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs sm:text-sm">
                <option>ทั้งหมด</option>
                <option>0-100 บาท</option>
                <option>100-300 บาท</option>
                <option>300+ บาท</option>
              </select>
            </div>
          </div>
        )}

        {/* Product Grid */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Link href={`/products/${product.id}`} key={product.id} className="group relative flex flex-col overflow-hidden rounded-lg sm:rounded-2xl md:rounded-[2.5rem] bg-white shadow-sm border border-slate-50 transition-all hover:shadow-lg md:hover:shadow-2xl hover:-translate-y-1 active:scale-95">
                <div className="aspect-[4/5] w-full overflow-hidden bg-slate-50 relative">
                  <img src={product.image} alt={product.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute left-2 sm:left-4 top-2 sm:top-4">
                     <span className="rounded-full bg-white/90 backdrop-blur-sm px-2 sm:px-3 py-0.5 sm:py-1 text-[8px] sm:text-[10px] font-black text-[#319795] shadow-sm">
                        {product.category}
                     </span>
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-3 sm:p-4 md:p-6">
                  <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">{product.shop}</p>
                  <h3 className="mt-1 sm:mt-2 text-xs sm:text-base md:text-lg font-bold text-[#2D3748] line-clamp-2 transition-colors group-hover:text-[#4FD1C5]">{product.name}</h3>
                  <div className="mt-auto pt-3 sm:pt-6 flex items-center justify-between gap-2">
                    <div>
                       <p className="text-[8px] sm:text-[10px] font-bold text-slate-400">ราคา</p>
                       <span className="text-base sm:text-2xl font-black text-[#2D3748]">฿{product.price}</span>
                    </div>
                    <button className="flex h-8 sm:h-10 md:h-12 w-8 sm:w-10 md:w-12 items-center justify-center rounded-lg sm:rounded-2xl bg-slate-100 text-[#2D3748] transition-all hover:bg-[#4FD1C5] hover:text-white hover:shadow-lg hover:shadow-teal-100 active:scale-90 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 sm:h-5 md:h-6 w-4 sm:w-5 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          {/* Pagination */}
          <div className="mt-8 sm:mt-12 md:mt-16 flex justify-center gap-1 sm:gap-2">
             <button className="h-9 sm:h-10 md:h-12 w-9 sm:w-10 md:w-12 rounded-lg sm:rounded-2xl border border-slate-200 bg-white font-bold text-xs sm:text-sm text-slate-400 hover:border-[#4FD1C5] hover:text-[#4FD1C5]">1</button>
             <button className="h-9 sm:h-10 md:h-12 w-9 sm:w-10 md:w-12 rounded-lg sm:rounded-2xl bg-[#4FD1C5] font-bold text-xs sm:text-sm text-white shadow-lg shadow-teal-100">2</button>
             <button className="h-9 sm:h-10 md:h-12 w-9 sm:w-10 md:w-12 rounded-lg sm:rounded-2xl border border-slate-200 bg-white font-bold text-xs sm:text-sm text-slate-400 hover:border-[#4FD1C5] hover:text-[#4FD1C5]">3</button>
             <button className="flex h-9 sm:h-10 md:h-12 items-center gap-1 sm:gap-2 rounded-lg sm:rounded-2xl border border-slate-200 bg-white px-3 sm:px-6 font-bold text-xs sm:text-sm text-slate-400 hover:border-[#4FD1C5] hover:text-[#4FD1C5]">
                ถัดไป
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 sm:h-4 w-3 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
