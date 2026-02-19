import { notFound } from 'next/navigation';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileCallBar } from '@/components/layout/MobileCallBar';
import { getSiteSettings } from '@/lib/content';
import { Toaster } from 'sonner';
import { Agentation } from 'agentation';

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();

  const phone = getSiteSettings().contact.phone || '597470518';

  return (
    <NextIntlClientProvider messages={messages}>
      <div className="min-h-[100dvh] flex flex-col bg-background pb-16 md:pb-0">
        <Header locale={locale} />
        <main className="flex-1 pt-17">{children}</main>
        <Footer locale={locale} />
        <MobileCallBar phone={phone} label="დარეკე:" />
      </div>
      <Toaster
        position="top-right"
        theme="dark"
        toastOptions={{
          style: {
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            color: '#0f172a',
          },
        }}
      />
      {process.env.NODE_ENV === 'development' && <Agentation />}
    </NextIntlClientProvider>
  );
}
