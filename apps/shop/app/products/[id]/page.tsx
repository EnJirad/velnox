export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = {
    id: params.id,
    name: 'ข้าวหอมมะลิคัดพิเศษ 5kg',
    price: 245,
    description: 'ข้าวหอมมะลิคัดพิเศษจากแหล่งปลูกที่ดีที่สุด เมล็ดสวย หอม นุ่ม อร่อย เหมาะสำหรับทุกคนในครอบครัว ผ่านกระบวนการผลิตที่ทันสมัย สะอาด และปลอดภัย',
    images: [
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=500',
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=500',
    ],
    category: 'อาหาร',
    shop: 'Velnox Official Shop',
    stock: 120,
    rating: 4.8,
    reviews: 124
  };

  return (
    <div className="flex flex-col gap-12">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square w-full overflow-hidden rounded-[3rem] bg-white shadow-lg border border-slate-50">
            <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {product.images.map((img, i) => (
              <div key={i} className="aspect-square cursor-pointer overflow-hidden rounded-2xl border-2 border-[#4FD1C5] bg-white shadow-sm">
                <img src={img} alt={`${product.name} ${i}`} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <div className="mb-6 flex items-center gap-3">
             <span className="rounded-full bg-teal-50 px-4 py-1 text-xs font-black text-[#319795]">{product.category}</span>
             <div className="flex items-center gap-1 text-yellow-400">
                <span className="text-sm font-bold text-[#2D3748] ml-1">{product.rating}</span>
                <span className="text-xs text-slate-400 font-medium">({product.reviews} รีวิว)</span>
             </div>
          </div>
          
          <h1 className="text-4xl font-black text-[#2D3748] leading-tight mb-4">{product.name}</h1>
          <p className="text-sm font-bold text-slate-400 mb-8">จำหน่ายโดย <span className="text-[#4FD1C5] hover:underline cursor-pointer">{product.shop}</span></p>
          
          <div className="mb-8 flex items-baseline gap-4">
            <span className="text-5xl font-black text-[#2D3748]">฿{product.price}</span>
            <span className="text-lg text-slate-400 line-through">฿299</span>
          </div>

          <div className="mb-10 space-y-6 rounded-[2rem] bg-white p-8 shadow-sm border border-slate-50">
             <div>
                <h3 className="text-sm font-black text-[#2D3748] uppercase tracking-widest mb-4">จำนวน</h3>
                <div className="flex items-center gap-4">
                   <div className="flex items-center rounded-xl border border-slate-200 p-1">
                      <button className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-slate-50">-</button>
                      <span className="w-12 text-center font-bold">1</span>
                      <button className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-slate-50">+</button>
                   </div>
                   <span className="text-xs font-bold text-slate-400">สต็อกคงเหลือ: {product.stock} ชิ้น</span>
                </div>
             </div>

             <div className="flex flex-col gap-4">
                <button className="w-full rounded-2xl bg-[#4FD1C5] py-4 text-lg font-black text-white shadow-xl shadow-teal-100 transition-all hover:bg-[#319795] active:scale-95">
                   เพิ่มลงตะกร้า
                </button>
                <button className="w-full rounded-2xl bg-[#2D3748] py-4 text-lg font-black text-white shadow-xl transition-all hover:bg-slate-700 active:scale-95">
                   ซื้อเลย
                </button>
             </div>
          </div>

          {/* VelRepeat Promotion in Detail */}
          <div className="rounded-[2rem] bg-gradient-to-br from-[#E6FFFA] to-[#B2F5EA] p-8 border border-[#4FD1C5]/20">
             <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">🔄</div>
                <div>
                   <h4 className="font-black text-[#2D3748]">สมัคร VelRepeat ประหยัดกว่า!</h4>
                   <p className="mt-1 text-sm text-[#319795] font-medium">รับส่วนลดเพิ่ม 5% เมื่อเลือกสั่งซื้อแบบรายเดือน</p>
                   <button className="mt-4 text-sm font-black text-[#2D3748] underline decoration-[#4FD1C5] decoration-2 underline-offset-4">
                      ดูเงื่อนไขการสมัคร
                   </button>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Description & Reviews Tabs */}
      <section className="mt-12">
         <div className="flex gap-8 border-b border-slate-100 mb-8">
            <button className="border-b-4 border-[#4FD1C5] pb-4 text-lg font-black text-[#2D3748]">รายละเอียดสินค้า</button>
            <button className="pb-4 text-lg font-bold text-slate-400 hover:text-slate-600">รีวิวจากลูกค้า</button>
         </div>
         <div className="max-w-3xl leading-relaxed text-slate-600">
            <p>{product.description}</p>
            <ul className="mt-6 space-y-3 list-disc pl-5">
               <li>ผลิตจากข้าวหอมมะลิแท้ 100%</li>
               <li>น้ำหนักสุทธิ 5 กิโลกรัม</li>
               <li>บรรจุในถุงสูญญากาศเพื่อรักษาความสดใหม่</li>
               <li>ได้รับมาตรฐาน อย. และ GMP</li>
            </ul>
         </div>
      </section>
    </div>
  );
}
