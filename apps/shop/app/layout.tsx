import type { Metadata } from 'next';
import '../styles/globals.css';
import { AuthProvider } from '@/components/providers/auth-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { LanguageProvider } from '@/components/providers/language-provider';
import { Navigation } from '@/components/layout/navigation';
import { Footer } from '@/components/layout/footer';

export const metadata: Metadata = {
  title: 'VelShop | ช้อปครบ จบในที่เดียว',
  description: 'มาร์เก็ตเพลสรวมร้านค้าคุณภาพ ส่วนหนึ่งของแพลตฟอร์ม Velnox',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>
        <LanguageProvider>
          <ThemeProvider>
            <AuthProvider>
              <div className="flex min-h-screen flex-col">
                <Navigation />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
            </AuthProvider>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
