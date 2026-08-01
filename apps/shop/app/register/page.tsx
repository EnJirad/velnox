import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-700 text-xl font-bold text-white">V</div>
        <h1 className="text-xl font-semibold text-slate-900">สมัครสมาชิก VelShop</h1>
        <p className="text-sm text-slate-500">สร้างบัญชีเพื่อเริ่มช้อปปิ้งกับเรา</p>
      </div>
      <form className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">ชื่อ-นามสกุล</label>
          <input placeholder="สมชาย ใจดี" className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">อีเมล</label>
          <input type="email" placeholder="you@example.com" className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">รหัสผ่าน</label>
          <input type="password" placeholder="อย่างน้อย 8 ตัวอักษร" className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600" />
        </div>
        <label className="flex items-start gap-2 text-xs text-slate-600">
          <input type="checkbox" className="mt-0.5" />
          ฉันยอมรับ <Link href="#" className="text-teal-700 hover:underline">ข้อกำหนดการใช้งาน</Link> และ{' '}
          <Link href="#" className="text-teal-700 hover:underline">นโยบายความเป็นส่วนตัว</Link>
        </label>
        <button type="submit" className="rounded-md bg-teal-700 py-2.5 text-sm font-semibold text-white hover:bg-teal-800">
          สมัครสมาชิก
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-500">
        มีบัญชีอยู่แล้ว?{' '}
        <Link href="/login" className="font-medium text-teal-700 hover:underline">
          เข้าสู่ระบบ
        </Link>
      </p>
    </div>
  );
}
