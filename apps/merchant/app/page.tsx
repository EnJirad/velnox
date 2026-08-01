import Link from 'next/link';

export default function MerchantLandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-canvas px-4 text-center">
      <span className="font-mono text-xs uppercase tracking-widest text-marigold">Velnox for Business</span>
      <h1 className="max-w-lg font-display text-3xl font-bold text-ink sm:text-4xl">
        เปิดร้านค้าออนไลน์ของคุณ<br />กับ VelMerchant
      </h1>
      <p className="max-w-md text-ink/60">
        จัดการสินค้า สต็อก และคำสั่งซื้อได้ในที่เดียว เข้าถึงลูกค้าบน VelShop ทันทีที่ร้านได้รับการอนุมัติ
      </p>
      <div className="flex gap-3">
        <Link href="/register" className="rounded-md bg-teal px-5 py-2.5 font-semibold text-white hover:bg-tealDeep">
          สมัครเป็นผู้ขาย
        </Link>
        <Link href="/login" className="rounded-md border border-line px-5 py-2.5 font-semibold text-ink hover:border-teal">
          เข้าสู่ระบบ
        </Link>
      </div>
    </div>
  );
}
