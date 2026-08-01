import Link from 'next/link';

export default function CenterLandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 px-4 text-center text-white">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-600 text-2xl font-bold">V</div>
      <h1 className="text-2xl font-semibold">VelCenter</h1>
      <p className="mt-2 max-w-sm text-sm text-slate-400">
        ศูนย์ควบคุมและบริหารจัดการแพลตฟอร์ม Velnox สำหรับทีมงานที่ได้รับอนุญาตเท่านั้น
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/admin" className="rounded-md bg-teal-600 px-6 py-3 text-sm font-semibold hover:bg-teal-500">
          เข้าสู่ระบบแอดมิน
        </Link>
        <Link href="/login" className="rounded-md border border-slate-700 px-6 py-3 text-sm font-semibold hover:bg-slate-800">
          เข้าสู่ระบบ
        </Link>
      </div>
      <p className="mt-8 text-xs text-slate-600">© 2026 Velnox Commerce Co., Ltd. — Internal use only</p>
    </div>
  );
}
