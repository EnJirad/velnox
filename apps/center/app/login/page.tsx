export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-800 p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-xl">VC</div>
          <h1 className="text-2xl font-bold text-white">VelCenter Admin</h1>
          <p className="mt-2 text-slate-400">ระบบบริหารจัดการกลาง Velnox Platform</p>
        </div>
        <form className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">รหัสพนักงาน / อีเมล</label>
            <input
              type="text"
              placeholder="admin@velnox.dev"
              className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-900"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">รหัสผ่านปลอดภัย</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-900"
            />
          </div>
          <button className="mt-2 w-full rounded-lg bg-blue-600 py-2.5 font-bold text-white transition-colors hover:bg-blue-700">
            ยืนยันตัวตนเข้าสู่ระบบ
          </button>
        </form>
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-500">
            ระบบมีการบันทึกการเข้าใช้งานทั้งหมด <br />
            การเข้าถึงโดยไม่ได้รับอนุญาตจะถูกดำเนินคดีตามกฎหมาย
          </p>
        </div>
      </div>
    </div>
  );
}
