import type { Metadata } from 'next';
import Link from 'next/link';
import '../styles/globals.css';
import { AuthProvider } from '@/components/providers/auth-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { LanguageProvider } from '@/components/providers/language-provider';
import { Navigation } from '@/components/layout/navigation';

export const metadata: Metadata = {
  title: 'Velnox Marketplace | แพลตฟอร์ม Commerce Ecosystem',
  description: 'ช้อปปิ้งสินค้าคุณภาพพร้อมระบบสมัครสมาชิกอัตโนมัติ VelRepeat',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className="min-h-screen bg-[#F7FAFC] font-sans text-[#1A202C]">
        <LanguageProvider>
          <ThemeProvider>
            <AuthProvider>
              <Navigation />
              <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {children}
              </main>
              <footer className="border-t border-slate-200 bg-white py-12 mt-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-2">
                      <span className="text-2xl font-black tracking-tight text-[#2D3748]">
                        VEL<span className="text-[#4FD1C5]">NOX</span>
                      </span>
                      <p className="mt-4 text-slate-500 max-w-sm">
                        เรามุ่งมั่นสร้างระบบ Commerce Ecosystem ที่ดีที่สุดเพื่อเชื่อมต่อร้านค้าและลูกค้าเข้าด้วยกันด้วยเทคโนโลยีที่สมัยใหม่
                      </p>
                    </div>
                    <div>
                      <h4 className="font-bold text-[#2D3748] mb-4">บริการของเรา</h4>
                      <ul className="space-y-2 text-sm text-slate-600">
                        <li><Link href="/products" className="hover:text-[#4FD1C5]">สินค้าทั้งหมด</Link></li>
                        <li><Link href="/velrepeat" className="hover:text-[#4FD1C5]">VelRepeat</Link></li>
                        <li><Link href="/merchant-register" className="hover:text-[#4FD1C5]">ขายสินค้ากับเรา</Link></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-[#2D3748] mb-4">ช่วยเหลือ</h4>
                      <ul className="space-y-2 text-sm text-slate-600">
                        <li><a href="#" className="hover:text-[#4FD1C5]">คำถามที่พบบ่อย</a></li>
                        <li><a href="#" className="hover:text-[#4FD1C5]">นโยบายความเป็นส่วนตัว</a></li>
                        <li><a href="#" className="hover:text-[#4FD1C5]">ติดต่อเรา</a></li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-12 pt-8 border-t border-slate-100 text-center text-xs text-slate-400">
                    © 2026 Velnox Platform. All rights reserved.
                  </div>
                </div>
              </footer>
            </AuthProvider>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
