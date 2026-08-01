import type { Metadata } from 'next';
import '../styles/globals.css';
import { fontDisplay, fontBody, fontMono } from './fonts';
import { AuthProvider } from '@/components/providers/auth-provider';

export const metadata: Metadata = {
  title: 'VelMerchant — จัดการร้านค้าของคุณ',
  description: 'พอร์ทัลจัดการร้านค้า สินค้า และคำสั่งซื้อสำหรับผู้ขายบน Velnox',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${fontDisplay.variable} ${fontBody.variable} ${fontMono.variable}`}>
      <body className="font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
