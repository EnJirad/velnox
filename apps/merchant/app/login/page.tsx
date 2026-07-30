export default function MerchantLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-700 text-white font-bold text-xl">V</div>
          <h1 className="text-2xl font-bold text-slate-900">VelMerchant Portal</h1>
          <p className="mt-2 text-slate-500">จัดการร้านค้าและยอดขายของคุณ</p>
        </div>
        <form className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">อีเมลธุรกิจ</label>
            <input
              type="email"
              placeholder="merchant@velnox.dev"
              className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">รหัสผ่าน</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
            />
          </div>
          <button className="mt-2 w-full rounded-lg bg-teal-700 py-2.5 font-bold text-white transition-colors hover:bg-teal-800">
            เข้าสู่ระบบร้านค้า
          </button>
        </form>
        <div className="mt-6 border-t border-slate-100 pt-6 text-center text-sm text-slate-600">
          ต้องการเปิดร้านค้าใหม่? <a href="#" className="font-bold text-teal-700 hover:underline">สมัครเป็นพาร์ทเนอร์</a>
        </div>
      </div>
    </div>
  );
}
