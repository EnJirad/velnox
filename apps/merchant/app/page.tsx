import Link from 'next/link';

const FEATURES = [
  { icon: '🏪', title: 'เปิดร้านง่ายใน 5 นาที', desc: 'สมัครและเริ่มขายสินค้าได้ทันทีหลังผ่านการอนุมัติ' },
  { icon: '📦', title: 'จัดการสต็อกแบบเรียลไทม์', desc: 'ติดตามสินค้าคงเหลือและรับแจ้งเตือนอัตโนมัติ' },
  { icon: '📈', title: 'วิเคราะห์ยอดขายเชิงลึก', desc: 'ดูแนวโน้มยอดขายและสินค้าขายดีได้ในที่เดียว' },
  { icon: '💳', title: 'รับเงินไว วางใจได้', desc: 'โอนเงินเข้าบัญชีร้านค้าทุกสัปดาห์' },
];

export default function MerchantLandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="border-b border-slate-100 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2 text-lg font-bold text-teal-700">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-700 text-white">V</span>
            VelMerchant
          </div>
          <div className="flex gap-3 text-sm font-medium">
            <Link href="/login" className="rounded-md px-4 py-2 text-slate-700 hover:bg-slate-50">เข้าสู่ระบบ</Link>
            <Link href="/dashboard" className="rounded-md bg-teal-700 px-4 py-2 text-white hover:bg-teal-800">
              เข้าสู่แดชบอร์ด
            </Link>
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-br from-teal-700 to-teal-900 px-6 py-20 text-center text-white">
        <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium">พอร์ทัลสำหรับร้านค้า</span>
        <h1 className="mx-auto mt-4 max-w-2xl text-3xl font-bold sm:text-4xl">
          ขยายธุรกิจของคุณไปกับ Velnox
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-teal-50">
          เข้าถึงลูกค้ากว่าหลายล้านคนบน VelShop พร้อมเครื่องมือจัดการร้านค้าที่ครบครัน
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/dashboard" className="rounded-md bg-orange-500 px-6 py-3 text-sm font-semibold hover:bg-orange-600">
            เริ่มเปิดร้านค้า
          </Link>
          <Link href="/login" className="rounded-md border border-white/40 px-6 py-3 text-sm font-semibold hover:bg-white/10">
            เข้าสู่ระบบ
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-16 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => (
          <div key={f.title} className="rounded-xl border border-slate-200 p-5 text-center">
            <span className="text-3xl">{f.icon}</span>
            <h3 className="mt-3 text-sm font-semibold text-slate-900">{f.title}</h3>
            <p className="mt-1 text-xs text-slate-500">{f.desc}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto grid max-w-4xl gap-6 px-6 pb-20 text-center sm:grid-cols-3">
        {[
          { value: '120K+', label: 'ร้านค้าที่ไว้วางใจ' },
          { value: '5M+', label: 'ลูกค้าบน VelShop' },
          { value: '0%', label: 'ค่าธรรมเนียมเปิดร้าน' },
        ].map((s) => (
          <div key={s.label}>
            <p className="text-3xl font-bold text-teal-700">{s.value}</p>
            <p className="text-sm text-slate-500">{s.label}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
