import Link from 'next/link';

export default function CenterLoginPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center bg-slate-900 px-4 py-12 text-white">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-600 text-xl font-bold">V</div>
        <h1 className="text-xl font-semibold">เข้าสู่ระบบผู้ดูแล</h1>
        <p className="text-sm text-slate-400">สำหรับทีมงาน Velnox ที่ได้รับอนุญาตเท่านั้น</p>
      </div>
      <form className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-800/50 p-6">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-300">อีเมลผู้ดูแลระบบ</label>
          <input type="email" placeholder="admin@velnox.com" className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-teal-500" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-300">รหัสผ่าน</label>
          <input type="password" placeholder="••••••••" className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-teal-500" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-300">รหัส 2FA</label>
          <input placeholder="000000" className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-teal-500" />
        </div>
        <Link href="/admin" className="rounded-md bg-teal-600 py-2.5 text-center text-sm font-semibold hover:bg-teal-500">
          เข้าสู่ระบบ
        </Link>
      </form>
    </div>
  );
}
