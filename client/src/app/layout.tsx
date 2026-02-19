import type { Metadata } from 'next';
import { Noto_Sans_Georgian } from 'next/font/google';
import './globals.css';

const notoSansGeorgian = Noto_Sans_Georgian({
  subsets: ['georgian', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-noto',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TechBrain — კამერები და უსაფრთხოების სისტემები',
  description: 'კამერები და უსაფრთხოების სისტემები | Камеры и системы безопасности | Security cameras',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ka" className={notoSansGeorgian.variable} suppressHydrationWarning>
      <body className="font-noto antialiased">{children}</body>
    </html>
  );
}
