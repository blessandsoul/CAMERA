import { getTranslations } from 'next-intl/server';
import { CartPage } from '@/features/cart/components/CartPage';
import { getSiteSettings } from '@/lib/content';

interface CartRouteProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: CartRouteProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'cart' });
  return { title: `TechBrain — ${t('title')}` };
}

export default async function CartRoute({ params }: CartRouteProps) {
  const { locale } = await params;
  const phone = getSiteSettings().contact.phone || '597470518';
  return <CartPage locale={locale} phone={phone} />;
}
