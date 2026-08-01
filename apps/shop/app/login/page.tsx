import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-700 text-xl font-bold text-white">V</div>
        <h1 className="text-xl font-semibold text-slate-900">เข้าสู่ระบบ VelShop</h1>
        <p className="text-sm text-slate-500">ยินดีต้อนรับกลับ กรอกข้อมูลเพื่อเข้าสู่ระบบ</p>
      </div>
      <form className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">อีเมล</label>
          <input type="email" placeholder="you@example.com" className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">รหัสผ่าน</label>
          <input type="password" placeholder="••••••••" className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600" />
        </div>
        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 text-slate-600">
            <input type="checkbox" /> จดจำฉันไว้
          </label>
          <Link href="#" className="text-teal-700 hover:underline">ลืมรหัสผ่าน?</Link>
        </div>
        <button type="submit" className="rounded-md bg-teal-700 py-2.5 text-sm font-semibold text-white hover:bg-teal-800">
          เข้าสู่ระบบ
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-500">
        ยังไม่มีบัญชี?{' '}
        <Link href="/register" className="font-medium text-teal-700 hover:underline">
          สมัครสมาชิก
        </Link>
      </p>
    </div>
  );
}
