import Link from 'next/link';

export function Navigation() {
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4FD1C5] text-white shadow-lg shadow-teal-100">
              <span className="text-xl font-bold italic">V</span>
            </div>
            <span className="text-2xl font-black tracking-tight text-[#2D3748]">
              VEL<span className="text-[#4FD1C5]">NOX</span>
            </span>
          </Link>
          
          <div className="hidden items-center gap-6 md:flex">
            <Link href="/products" className="text-sm font-semibold text-slate-600 transition-colors hover:text-[#4FD1C5]">สินค้า</Link>
            <Link href="/categories" className="text-sm font-semibold text-slate-600 transition-colors hover:text-[#4FD1C5]">หมวดหมู่</Link>
            <Link href="/velrepeat" className="flex items-center gap-1.5 text-sm font-semibold text-[#319795] transition-colors hover:text-[#285E61]">
              <span className="flex h-2 w-2 rounded-full bg-[#4FD1C5] animate-pulse"></span>
              VelRepeat
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden lg:block">
            <input 
              type="text" 
              placeholder="ค้นหาสินค้า..." 
              className="w-64 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-[#4FD1C5] focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-50 transition-all"
            />
          </div>
          
          <Link href="/cart" className="relative p-2 text-slate-600 hover:text-[#4FD1C5] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-[#4FD1C5] text-[10px] font-bold text-white shadow-sm">3</span>
          </Link>
          
          <Link href="/login" className="rounded-full bg-[#4FD1C5] px-5 py-2 text-sm font-bold text-white shadow-lg shadow-teal-100 transition-all hover:bg-[#319795] hover:shadow-teal-200 active:scale-95">
            เข้าสู่ระบบ
          </Link>
        </div>
      </div>
    </nav>
  );
}
