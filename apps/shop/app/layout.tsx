import type { Metadata } from 'next';
import '../styles/globals.css';
import { fontDisplay, fontBody, fontMono } from './fonts';
import { AuthProvider } from '@/components/providers/auth-provider';
import { Navigation } from '@/components/layout/navigation';
import { Footer } from '@/components/layout/footer';

export const metadata: Metadata = {
  title: 'VelShop — ตลาดออนไลน์จาก Velnox',
  description: 'ซื้อสินค้าจากร้านค้าอิสระทั่วประเทศ ส่งตรงถึงหน้าบ้านคุณ',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${fontDisplay.variable} ${fontBody.variable} ${fontMono.variable}`}>
      <body className="flex min-h-screen flex-col font-sans">
        <AuthProvider>
          <Navigation />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
