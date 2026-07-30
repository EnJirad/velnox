import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="mx-auto mt-12 max-w-lg">
      <div className="overflow-hidden rounded-[3rem] bg-white shadow-2xl border border-slate-50">
        <div className="bg-[#2D3748] p-12 text-center text-white relative">
           <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#4FD1C5] opacity-20 blur-2xl"></div>
           <div className="relative z-10">
              <h1 className="text-3xl font-black mb-2">ยินดีต้อนรับกลับมา</h1>
              <p className="text-slate-400 font-medium">เข้าสู่ระบบเพื่อจัดการการช้อปปิ้งและ VelRepeat ของคุณ</p>
           </div>
        </div>
        
        <div className="p-12">
          <form className="flex flex-col gap-6">
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">อีเมล</label>
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-6 py-4 text-sm font-bold text-[#2D3748] outline-none focus:border-[#4FD1C5] focus:bg-white focus:ring-4 focus:ring-teal-50 transition-all"
              />
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">รหัสผ่าน</label>
                <a href="#" className="text-xs font-bold text-[#4FD1C5] hover:underline">ลืมรหัสผ่าน?</a>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-6 py-4 text-sm font-bold text-[#2D3748] outline-none focus:border-[#4FD1C5] focus:bg-white focus:ring-4 focus:ring-teal-50 transition-all"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <input type="checkbox" className="h-5 w-5 rounded-lg border-slate-200 text-[#4FD1C5] focus:ring-[#4FD1C5]" />
              <span className="text-sm font-bold text-slate-600">จดจำการเข้าสู่ระบบ</span>
            </div>

            <button className="mt-4 w-full rounded-2xl bg-[#4FD1C5] py-4 text-lg font-black text-white shadow-xl shadow-teal-100 transition-all hover:bg-[#319795] active:scale-95">
              เข้าสู่ระบบ
            </button>
          </form>

          <div className="mt-10 flex items-center gap-4 text-slate-200">
             <div className="h-px flex-1 bg-slate-100"></div>
             <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">หรือเข้าสู่ระบบด้วย</span>
             <div className="h-px flex-1 bg-slate-100"></div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4">
             <button className="flex items-center justify-center gap-3 rounded-2xl border border-slate-100 bg-white py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
                <span>Google</span>
             </button>
             <button className="flex items-center justify-center gap-3 rounded-2xl border border-slate-100 bg-white py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
                <span>Facebook</span>
             </button>
          </div>

          <p className="mt-10 text-center text-sm font-bold text-slate-500">
            ยังไม่มีบัญชี? <Link href="/register" className="text-[#4FD1C5] hover:underline">สมัครสมาชิกใหม่ที่นี่</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
