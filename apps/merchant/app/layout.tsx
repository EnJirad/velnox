import type { Metadata } from 'next';
import '../styles/globals.css';
import { AuthProvider } from '@/components/providers/auth-provider';
import { LanguageProvider } from '@/components/providers/language-provider';

export const metadata: Metadata = {
  title: 'VelMerchant | Velnox',
  description: 'Merchant management portal for the Velnox commerce platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>
        <LanguageProvider>
          <AuthProvider>{children}</AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
