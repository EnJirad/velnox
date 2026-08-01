import Link from 'next/link';

export default function CenterLandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-ink px-4 text-center text-white">
      <span className="font-mono text-xs uppercase tracking-widest text-marigold">Internal Tool</span>
      <h1 className="max-w-md font-display text-3xl font-bold sm:text-4xl">VelCenter</h1>
      <p className="max-w-sm text-white/60">
        ศูนย์ควบคุมสำหรับทีมงาน Velnox — จัดการผู้ใช้ ผู้ขาย ร้านค้า และคำสั่งซื้อทั้งแพลตฟอร์ม
      </p>
      <Link href="/login" className="rounded-md bg-teal px-5 py-2.5 font-semibold hover:bg-tealDeep">
        เข้าสู่ระบบผู้ดูแล
      </Link>
    </div>
  );
}
