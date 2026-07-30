export default function LoginPage() {
  return (
    <div className="mx-auto mt-12 max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900">เข้าสู่ระบบ Velnox</h1>
        <p className="mt-2 text-slate-500">ช้อปสินค้าที่คุณรัก พร้อมระบบ VelRepeat</p>
      </div>
      <form className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">อีเมล</label>
          <input
            type="email"
            placeholder="example@email.com"
            className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">รหัสผ่าน</label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" className="rounded border-slate-300" />
            จดจำฉัน
          </label>
          <a href="#" className="text-sm font-medium text-blue-600 hover:underline">ลืมรหัสผ่าน?</a>
        </div>
        <button className="mt-2 w-full rounded-lg bg-blue-600 py-2.5 font-bold text-white transition-colors hover:bg-blue-700">
          เข้าสู่ระบบ
        </button>
      </form>
      <div className="mt-6 text-center text-sm text-slate-600">
        ยังไม่มีบัญชี? <a href="#" className="font-bold text-blue-600 hover:underline">สมัครสมาชิกใหม่</a>
      </div>
    </div>
  );
}
