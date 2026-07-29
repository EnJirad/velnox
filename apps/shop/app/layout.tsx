import type { Metadata } from 'next';
import '../styles/globals.css';
import { AuthProvider } from '@/components/providers/auth-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { LanguageProvider } from '@/components/providers/language-provider';
import { Navigation } from '@/components/layout/navigation';

export const metadata: Metadata = {
  title: 'VelShop | Velnox',
  description: 'Customer marketplace for the Velnox commerce platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>
        <LanguageProvider>
          <ThemeProvider>
            <AuthProvider>
              <Navigation />
              <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
            </AuthProvider>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
