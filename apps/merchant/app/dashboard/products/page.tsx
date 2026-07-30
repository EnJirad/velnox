export default function MerchantProductsPage() {
  const products = [
    { id: '1', name: 'ข้าวหอมมะลิคัดพิเศษ 5kg', price: 245, stock: 120, status: 'ACTIVE', category: 'อาหาร' },
    { id: '2', name: 'น้ำแร่ธรรมชาติแพ็ค 12', price: 120, stock: 45, status: 'ACTIVE', category: 'เครื่องดื่ม' },
    { id: '3', name: 'เซ็ตสบู่สมุนไพรออร์แกนิค', price: 189, stock: 8, status: 'LOW_STOCK', category: 'สุขภาพ' },
    { id: '4', name: 'กาแฟอาราบิก้า 100%', price: 350, stock: 0, status: 'OUT_OF_STOCK', category: 'เครื่องดื่ม' },
  ];

  return (
    <div className="flex flex-col gap-8 p-6 lg:p-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-[#2D3748]">จัดการสินค้า</h1>
          <p className="text-slate-500 font-medium">จัดการรายการสินค้า สต็อก และการตั้งค่าการขาย</p>
        </div>
        <button className="rounded-2xl bg-[#4FD1C5] px-6 py-3 text-sm font-black text-white shadow-lg shadow-teal-100 transition-all hover:bg-[#319795] active:scale-95">
          + เพิ่มสินค้าใหม่
        </button>
      </header>

      {/* Filter & Search */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between rounded-[2rem] bg-white p-6 shadow-sm border border-slate-50">
         <div className="relative flex-1 max-w-md">
            <input 
              type="text" 
              placeholder="ค้นหาด้วยชื่อสินค้า หรือ SKU..." 
              className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-2 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-teal-50"
            />
         </div>
         <div className="flex gap-3">
            <select className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-500 outline-none">
               <option>ทุกหมวดหมู่</option>
               <option>อาหาร</option>
               <option>เครื่องดื่ม</option>
            </select>
            <select className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-500 outline-none">
               <option>สถานะทั้งหมด</option>
               <option>Active</option>
               <option>Out of Stock</option>
            </select>
         </div>
      </div>

      {/* Product Table */}
      <section className="rounded-[2.5rem] bg-white p-8 shadow-sm border border-slate-50">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <th className="pb-4 pl-4">ข้อมูลสินค้า</th>
                <th className="pb-4">หมวดหมู่</th>
                <th className="pb-4">ราคา</th>
                <th className="pb-4">สต็อก</th>
                <th className="pb-4">สถานะ</th>
                <th className="pb-4 pr-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {products.map((product) => (
                <tr key={product.id} className="group transition-colors hover:bg-slate-50/50">
                  <td className="py-5 pl-4">
                     <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-slate-50 overflow-hidden">
                           <div className="h-full w-full bg-slate-200"></div>
                        </div>
                        <span className="font-bold text-[#2D3748]">{product.name}</span>
                     </div>
                  </td>
                  <td className="py-5 font-medium text-slate-500">{product.category}</td>
                  <td className="py-5 font-black text-[#2D3748]">฿{product.price}</td>
                  <td className="py-5">
                     <span className={`font-bold ${product.stock < 10 ? 'text-red-500' : 'text-[#2D3748]'}`}>
                        {product.stock}
                     </span>
                  </td>
                  <td className="py-5">
                    <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${
                      product.status === 'ACTIVE' ? 'bg-teal-50 text-[#319795]' : 
                      product.status === 'LOW_STOCK' ? 'bg-orange-50 text-orange-600' : 
                      'bg-red-50 text-red-500'
                    }`}>
                      {product.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-5 pr-4 text-right">
                    <div className="flex justify-end gap-2">
                       <button className="rounded-xl bg-slate-50 p-2 text-slate-400 hover:bg-[#4FD1C5] hover:text-white transition-all">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                       </button>
                       <button className="rounded-xl bg-slate-50 p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                       </button>
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
