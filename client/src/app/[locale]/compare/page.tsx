import { getTranslations } from 'next-intl/server';
import { getProductById } from '@/lib/content';
import { CompareContent } from '@/features/favorites/components/CompareContent';
import type { Product } from '@/types/product.types';

interface ComparePageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ ids?: string }>;
}

export async function generateMetadata({ params }: ComparePageProps): Promise<{ title: string }> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'compare' });
  return { title: `TechBrain — ${t('title')}` };
}

export default async function ComparePage({ params, searchParams }: ComparePageProps): Promise<React.ReactElement> {
  const { locale } = await params;
  const sp = await searchParams;
  const t = await getTranslations({ locale });

  const ids = sp.ids ? sp.ids.split(',').filter(Boolean) : [];
  const products: Product[] = ids
    .map((id) => getProductById(id))
    .filter((p): p is Product => p !== null);

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl py-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-8">{t('compare.title')}</h1>
        <CompareContent products={products} locale={locale} />
      </div>
    </div>
  );
}
