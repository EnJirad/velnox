import Link from 'next/link';

export default function CartPage() {
  const cartItems = [
    { id: '1', name: 'ข้าวหอมมะลิคัดพิเศษ 5kg', price: 245, quantity: 2, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=500', shop: 'Velnox Shop' },
    { id: '2', name: 'น้ำแร่ธรรมชาติแพ็ค 12', price: 120, quantity: 1, image: 'https://images.unsplash.com/photo-1548919973-5cfe5d4fc494?q=80&w=500', shop: 'Velnox Shop' },
  ];

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = 50;
  const total = subtotal + shipping;

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-black text-[#2D3748]">ตะกร้าสินค้าของคุณ</h1>
        <p className="text-slate-500 font-medium">มีสินค้าทั้งหมด {cartItems.length} รายการในตะกร้า</p>
      </header>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-6">
          {cartItems.map((item) => (
            <div key={item.id} className="flex flex-col sm:flex-row items-center gap-6 rounded-[2rem] bg-white p-6 shadow-sm border border-slate-50 transition-all hover:shadow-md">
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-slate-50">
                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.shop}</p>
                <h3 className="text-lg font-bold text-[#2D3748]">{item.name}</h3>
                <p className="text-[#4FD1C5] font-black">฿{item.price}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center rounded-xl border border-slate-200 p-1">
                  <button className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-50">-</button>
                  <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                  <button className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-50">+</button>
                </div>
                <button className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
          
          <Link href="/products" className="inline-flex items-center gap-2 text-sm font-bold text-[#4FD1C5] hover:underline mt-4">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
             </svg>
             เลือกซื้อสินค้าต่อ
          </Link>
        </div>

        {/* Order Summary */}
        <aside className="space-y-6">
          <div className="rounded-[2.5rem] bg-white p-8 shadow-xl border border-slate-50">
            <h2 className="mb-6 text-xl font-black text-[#2D3748]">สรุปคำสั่งซื้อ</h2>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between font-medium text-slate-600">
                <span>ยอดรวมสินค้า</span>
                <span>฿{subtotal}</span>
              </div>
              <div className="flex justify-between font-medium text-slate-600">
                <span>ค่าจัดส่ง</span>
                <span>฿{shipping}</span>
              </div>
              <div className="mt-6 border-t border-slate-100 pt-6 flex justify-between">
                <span className="text-lg font-black text-[#2D3748]">ยอดสุทธิ</span>
                <span className="text-2xl font-black text-[#4FD1C5]">฿{total}</span>
              </div>
            </div>
            <Link href="/checkout" className="mt-8 block w-full rounded-2xl bg-[#2D3748] py-4 text-center text-lg font-black text-white shadow-xl transition-all hover:bg-slate-700 active:scale-95">
              ดำเนินการชำระเงิน
            </Link>
          </div>

          <div className="rounded-[2rem] bg-[#E6FFFA] p-8 border border-[#4FD1C5]/20">
             <div className="flex items-center gap-3 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#4FD1C5] text-white text-xs">✓</div>
                <h4 className="font-black text-[#2D3748] text-sm">รับประกันความปลอดภัย</h4>
             </div>
             <p className="text-xs text-[#319795] font-medium leading-relaxed">
                ข้อมูลการชำระเงินของคุณถูกเข้ารหัสและปกป้องด้วยมาตรฐานความปลอดภัยระดับสูงสุด
             </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
