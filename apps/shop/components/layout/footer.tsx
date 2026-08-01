import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="mb-3 flex items-center gap-2 text-lg font-bold text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600">V</span>
            VelShop
          </div>
          <p className="text-sm text-slate-400">
            มาร์เก็ตเพลสที่รวมร้านค้าคุณภาพจากทั่วประเทศไว้ในที่เดียว ส่วนหนึ่งของแพลตฟอร์ม Velnox
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-white">ช่วยเหลือ</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/orders" className="hover:text-white">ติดตามคำสั่งซื้อ</Link></li>
            <li><Link href="#" className="hover:text-white">การจัดส่งและคืนสินค้า</Link></li>
            <li><Link href="#" className="hover:text-white">ศูนย์ช่วยเหลือ</Link></li>
            <li><Link href="#" className="hover:text-white">ติดต่อเรา</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-white">เกี่ยวกับ Velnox</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="#" className="hover:text-white">เกี่ยวกับเรา</Link></li>
            <li><a href="http://localhost:3001" className="hover:text-white">เปิดร้านกับ VelMerchant</a></li>
            <li><Link href="#" className="hover:text-white">ร่วมงานกับเรา</Link></li>
            <li><Link href="#" className="hover:text-white">นโยบายความเป็นส่วนตัว</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-white">ช่องทางการชำระเงิน</h4>
          <div className="flex flex-wrap gap-2 text-xs">
            {['บัตรเครดิต', 'พร้อมเพย์', 'โอนธนาคาร', 'เก็บเงินปลายทาง'].map((m) => (
              <span key={m} className="rounded border border-slate-700 px-2 py-1">{m}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        © 2026 Velnox Commerce Co., Ltd. — สงวนลิขสิทธิ์
      </div>
    </footer>
  );
}
