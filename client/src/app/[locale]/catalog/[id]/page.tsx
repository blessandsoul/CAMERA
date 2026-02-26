import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { getProductById, getRelatedProducts, getFeaturedProducts } from '@/lib/content';
import { ProductCTA } from '@/features/catalog/components/ProductCTA';
import { ProductGallery } from '@/features/catalog/components/ProductGallery';
import { BoughtTogether } from '@/features/catalog/components/BoughtTogether';
import { PopularProductsSlider } from '@/features/catalog/components/PopularProductsSlider';
import type { Locale } from '@/types/product.types';

export const dynamic = 'force-dynamic';

interface ProductPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { locale, id } = await params;
  const product = await getProductById(id);
  if (!product) return { title: 'Not found' };
  return { title: `TechBrain — ${product.name[locale as Locale]}` };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { locale, id } = await params;
  const t = await getTranslations({ locale });
  const product = await getProductById(id);

  if (!product) notFound();

  const l = locale as Locale;
  const isService = product.category === 'services';
  const relatedProducts = await getRelatedProducts(product);
  const popularProducts = (await getFeaturedProducts()).filter((p) => p.id !== product.id);

  // Map category key to translation key
  const categoryKeyMap: Record<string, string> = {
    'cameras': 'catalog.cameras',
    'nvr-kits': 'catalog.nvr_kits',
    'storage': 'catalog.storage',
    'services': 'catalog.services',
  };

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl py-12">
      {/* Back link */}
      <Link
        href={`/${locale}/catalog`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        {t('catalog.title')}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left column: gallery + bought together */}
        <div className="flex flex-col gap-6">
          <ProductGallery images={product.images} productName={product.name[l]} />

          {/* Bought together block */}
          {relatedProducts.length > 0 && (
            <BoughtTogether
              mainProduct={product}
              relatedProducts={relatedProducts}
              locale={l}
            />
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-6">
          <div>
            <span className="text-xs font-medium text-primary uppercase tracking-wide">
              {t(categoryKeyMap[product.category] as Parameters<typeof t>[0])}
            </span>
            <h1 className="text-3xl font-bold text-foreground mt-2 text-balance">
              {product.name[l]}
            </h1>
          </div>

          <p className="text-muted-foreground leading-relaxed">{product.description[l]}</p>

          {/* Price + CTA */}
          <div className="flex items-center gap-4 p-6 rounded-xl bg-muted border border-border">
            {isService ? (
              <span className="text-muted-foreground">{t('catalog.price_on_request')}</span>
            ) : (
              <>
                <span className="text-3xl font-bold text-foreground tabular-nums shrink-0">{product.price} ₾</span>
                <ProductCTA product={product} />
              </>
            )}
          </div>

          {/* Specs table */}
          {product.specs.length > 0 && (
            <div>
              <h2 className="font-semibold text-foreground mb-4">{t('catalog.specs')}</h2>
              <div className="rounded-xl border border-border overflow-hidden">
                {product.specs.map((spec, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between px-4 py-3 ${
                      i % 2 === 0 ? 'bg-muted' : 'bg-muted/50'
                    }`}
                  >
                    <span className="text-sm text-muted-foreground">{spec.key[l]}</span>
                    <span className="text-sm font-medium text-foreground tabular-nums">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Popular products slider */}
      {popularProducts.length > 0 && (
        <PopularProductsSlider
          products={popularProducts}
          locale={l}
          title={t('home.popular_products')}
          subtitle={t('home.popular_products_subtitle')}
        />
      )}
    </div>
  );
}
