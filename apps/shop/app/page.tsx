import Link from 'next/link';

export default function HomePage() {
  // Mock data for display since we can't fetch from live API easily in this step
  const featuredProducts = [
    { id: '1', name: 'ข้าวหอมมะลิ 5kg', price: 199, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=500', category: 'อาหาร' },
    { id: '2', name: 'น้ำดื่มแพ็ค 12 ขวด', price: 89, image: 'https://images.unsplash.com/photo-1548919973-5cfe5d4fc494?q=80&w=500', category: 'เครื่องดื่ม' },
    { id: '3', name: 'สบู่อาบน้ำสมุนไพร', price: 45, image: 'https://images.unsplash.com/photo-1600857062241-98e5dba7f214?q=80&w=500', category: 'สุขภาพ' },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Hero Section */}
      <section className="relative h-64 w-full overflow-hidden rounded-2xl bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-900 opacity-90"></div>
        <div className="relative z-10 flex h-full flex-col justify-center px-8 text-white">
          <h1 className="mb-2 text-4xl font-bold">Velnox Marketplace</h1>
          <p className="mb-6 text-lg text-blue-100">แหล่งรวมสินค้าอุปโภคบริโภค พร้อมระบบสมัครรับสินค้าอัตโนมัติ VelRepeat</p>
          <button className="w-fit rounded-lg bg-white px-6 py-2 font-semibold text-blue-600 transition-colors hover:bg-blue-50">
            ช้อปเลย
          </button>
        </div>
      </section>

      {/* Categories */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-slate-900">หมวดหมู่ยอดนิยม</h2>
        <div className="grid grid-cols-3 gap-4 md:grid-cols-6">
          {['อาหาร', 'เครื่องดื่ม', 'ของใช้ในบ้าน', 'ความงาม', 'สุขภาพ', 'สัตว์เลี้ยง'].map((cat) => (
            <div key={cat} className="flex flex-col items-center gap-2 rounded-xl border border-slate-100 p-4 transition-shadow hover:shadow-md">
              <div className="h-12 w-12 rounded-full bg-blue-50"></div>
              <span className="text-sm font-medium text-slate-700">{cat}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">สินค้าแนะนำ</h2>
          <Link href="/products" className="text-sm font-medium text-blue-600 hover:underline">ดูทั้งหมด</Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredProducts.map((product) => (
            <div key={product.id} className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:border-blue-300 hover:shadow-lg">
              <div className="aspect-square w-full bg-slate-100">
                <img src={product.image} alt={product.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
              </div>
              <div className="p-4">
                <span className="text-xs font-medium text-blue-600">{product.category}</span>
                <h3 className="mt-1 text-lg font-semibold text-slate-900">{product.name}</h3>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xl font-bold text-slate-900">฿{product.price}</span>
                  <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                    เพิ่มลงตะกร้า
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* VelRepeat Promo */}
      <section className="rounded-2xl bg-indigo-50 p-8 text-center">
        <h2 className="text-2xl font-bold text-indigo-900">ไม่ต้องกลัวของหมดบ้าน!</h2>
        <p className="mt-2 text-indigo-700">ด้วยระบบ VelRepeat คุณสามารถตั้งเวลาสั่งซื้อสินค้าที่ใช้เป็นประจำได้อัตโนมัติ</p>
        <div className="mt-6 flex justify-center gap-4">
          <div className="flex flex-col items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white font-bold">1</div>
            <span className="mt-2 text-sm font-medium">เลือกสินค้า</span>
          </div>
          <div className="mt-5 h-px w-12 bg-indigo-200"></div>
          <div className="flex flex-col items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white font-bold">2</div>
            <span className="mt-2 text-sm font-medium">เลือกความถี่</span>
          </div>
          <div className="mt-5 h-px w-12 bg-indigo-200"></div>
          <div className="flex flex-col items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white font-bold">3</div>
            <span className="mt-2 text-sm font-medium">รับของที่บ้าน</span>
          </div>
        </div>
      </section>
    </div>
  );
}
