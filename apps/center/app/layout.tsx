import type { Metadata } from 'next';
import '../styles/globals.css';
import { fontDisplay, fontBody, fontMono } from './fonts';
import { AuthProvider } from '@/components/providers/auth-provider';

export const metadata: Metadata = {
  title: 'VelCenter — ศูนย์ควบคุม Velnox',
  description: 'ศูนย์บริหารจัดการแพลตฟอร์ม ผู้ใช้ ร้านค้า และคำสั่งซื้อของ Velnox',
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
