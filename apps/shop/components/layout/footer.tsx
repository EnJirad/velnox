import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-line bg-white/60">
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-ink/60">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <div className="font-display text-lg font-bold text-teal">
              Vel<span className="text-marigold">Shop</span>
            </div>
            <p className="mt-2 max-w-xs">
              ตลาดออนไลน์ที่รวมร้านค้าอิสระจากทั่วประเทศไว้ในที่เดียว ส่วนหนึ่งของแพลตฟอร์ม Velnox
            </p>
          </div>
          <div>
            <div className="mb-2 font-semibold text-ink">ลูกค้า</div>
            <ul className="flex flex-col gap-1.5">
              <li><Link href="/products" className="hover:text-teal">สินค้าทั้งหมด</Link></li>
              <li><Link href="/orders" className="hover:text-teal">ติดตามคำสั่งซื้อ</Link></li>
              <li><Link href="/profile" className="hover:text-teal">บัญชีของฉัน</Link></li>
            </ul>
          </div>
          <div>
            <div className="mb-2 font-semibold text-ink">ขายของกับ Velnox</div>
            <ul className="flex flex-col gap-1.5">
              <li>
                <a href="http://localhost:3001" className="hover:text-teal">
                  เปิดร้านค้าบน VelMerchant →
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="receipt-divider my-6" />
        <p>© {new Date().getFullYear()} Velnox. สร้างด้วยความตั้งใจสำหรับร้านค้าอิสระ</p>
      </div>
    </footer>
  );
}
