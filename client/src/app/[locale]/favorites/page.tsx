import { getTranslations } from 'next-intl/server';
import { getAllProducts } from '@/lib/content';
import { FavoritesContent } from '@/features/favorites/components/FavoritesContent';

interface FavoritesPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: FavoritesPageProps): Promise<{ title: string }> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'favorites' });
  return { title: `TechBrain — ${t('title')}` };
}

export default async function FavoritesPage({ params }: FavoritesPageProps): Promise<React.ReactElement> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const products = getAllProducts();

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-8">{t('favorites.title')}</h1>
        <FavoritesContent products={products} locale={locale} />
      </div>
    </div>
  );
}
