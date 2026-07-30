export default function ProductsPage() {
  const products = [
    { id: '1', name: 'ข้าวหอมมะลิ 5kg', price: 199, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=500', category: 'อาหาร', shop: 'Velnox Shop' },
    { id: '2', name: 'น้ำดื่มแพ็ค 12 ขวด', price: 89, image: 'https://images.unsplash.com/photo-1548919973-5cfe5d4fc494?q=80&w=500', category: 'เครื่องดื่ม', shop: 'Velnox Shop' },
    { id: '3', name: 'สบู่อาบน้ำสมุนไพร', price: 45, image: 'https://images.unsplash.com/photo-1600857062241-98e5dba7f214?q=80&w=500', category: 'สุขภาพ', shop: 'Herb Garden' },
    { id: '4', name: 'แชมพูสูตรอ่อนโยน', price: 129, image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=500', category: 'สุขภาพ', shop: 'Herb Garden' },
    { id: '5', name: 'กระดาษทิชชู่ 24 ม้วน', price: 250, image: 'https://images.unsplash.com/photo-1584622781564-1d9876a13d00?q=80&w=500', category: 'ของใช้ในบ้าน', shop: 'Home Mart' },
    { id: '6', name: 'อาหารสุนัข 10kg', price: 890, image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?q=80&w=500', category: 'สัตว์เลี้ยง', shop: 'Pet World' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">สินค้าทั้งหมด</h1>
        <div className="flex gap-2">
          <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none">
            <option>เรียงตาม: ล่าสุด</option>
            <option>ราคา: ต่ำ-สูง</option>
            <option>ราคา: สูง-ต่ำ</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
        {/* Sidebar Filters */}
        <aside className="hidden md:block">
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="mb-3 font-semibold text-slate-900">หมวดหมู่</h3>
              <div className="flex flex-col gap-2">
                {['อาหาร', 'เครื่องดื่ม', 'ของใช้ในบ้าน', 'สุขภาพและความงาม', 'สัตว์เลี้ยง'].map((cat) => (
                  <label key={cat} className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 cursor-pointer">
                    <input type="checkbox" className="rounded border-slate-300" />
                    {cat}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <h3 className="mb-3 font-semibold text-slate-900">ช่วงราคา</h3>
              <div className="flex items-center gap-2">
                <input type="number" placeholder="Min" className="w-full rounded border border-slate-200 px-2 py-1 text-sm" />
                <span className="text-slate-400">-</span>
                <input type="number" placeholder="Max" className="w-full rounded border border-slate-200 px-2 py-1 text-sm" />
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="md:col-span-3">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <div key={product.id} className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:shadow-lg">
                <div className="aspect-square w-full bg-slate-100">
                  <img src={product.image} alt={product.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <span className="text-xs font-medium text-blue-600">{product.category}</span>
                  <h3 className="mt-1 text-base font-semibold text-slate-900 line-clamp-2">{product.name}</h3>
                  <p className="mt-1 text-xs text-slate-500">โดย {product.shop}</p>
                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <span className="text-lg font-bold text-slate-900">฿{product.price}</span>
                    <button className="rounded-lg bg-blue-600 p-2 text-white hover:bg-blue-700">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
