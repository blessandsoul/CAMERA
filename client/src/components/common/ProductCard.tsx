import Image from 'next/image';
import Link from 'next/link';
import { SecurityCamera } from '@phosphor-icons/react/dist/ssr';
import { getLocale, getTranslations } from 'next-intl/server';
import { cn } from '@/lib/utils';
import type { Product, Locale } from '@/types/product.types';

interface ProductCardProps {
  product: Product;
}

const CATEGORY_KEYS: Record<string, string> = {
  cameras: 'catalog.cameras',
  'nvr-kits': 'catalog.nvr_kits',
  storage: 'catalog.storage',
  services: 'catalog.services',
  accessories: 'catalog.accessories',
};

export async function ProductCard({ product }: ProductCardProps) {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations();
  const name = product.name[locale];
  const hasImage = product.images.length > 0;
  const isService = product.category === 'services';
  const categoryLabel = t(CATEGORY_KEYS[product.category] ?? product.category);
  const imgSrc = hasImage
    ? (product.images[0].startsWith('http') ? product.images[0] : `/images/products/${product.images[0]}`)
    : '';

  return (
    <article className="group relative flex flex-col rounded-xl border border-border/50 bg-card overflow-hidden transition-all duration-300 hover:border-border/80 hover:-translate-y-0.5">

      {/* Image */}
      <Link
        href={`/${locale}/catalog/${product.id}`}
        className="block relative aspect-4/3 overflow-hidden bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        aria-label={name}
      >
        {hasImage ? (
          <>
            <Image
              src={imgSrc}
              alt={name}
              fill
              className="object-contain transition-transform duration-500 group-hover:scale-[1.03]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            <div className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-card/80 to-transparent pointer-events-none" aria-hidden="true" />
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <SecurityCamera size={36} weight="duotone" className="text-border/60" aria-hidden="true" />
            <span className="text-[9px] font-mono text-muted-foreground/40 tracking-[0.25em] uppercase">
              {t('catalog.no_signal')}
            </span>
          </div>
        )}

        {/* Category badge */}
        <div className={cn('absolute top-3 left-3', !hasImage && 'hidden')}>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-background/90 backdrop-blur-sm border border-border/60 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            <span className="w-1 h-1 rounded-full bg-primary" aria-hidden="true" />
            {categoryLabel}
          </span>
        </div>

        {/* Discount badge */}
        {product.originalPrice && product.originalPrice > product.price && (
          <div className="absolute bottom-3 left-3">
            <span className="inline-flex items-center px-3 py-1 rounded-lg bg-success text-white text-sm font-bold tabular-nums">
              -{Math.round((1 - product.price / product.originalPrice) * 100)}%
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5 gap-4">

        <Link href={`/${locale}/catalog/${product.id}`} className="focus-visible:outline-none">
          <h3 className="font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-200 text-base">
            {name}
          </h3>
        </Link>

        {/* Price + CTA */}
        <div className="mt-auto flex items-center justify-between gap-3">
          {isService ? (
            <span className="text-base text-muted-foreground italic">
              {t('catalog.price_on_request')}
            </span>
          ) : (
            <div className="flex flex-col leading-none">
              {product.originalPrice ? (
                <>
                  <span className="text-sm text-destructive/60 line-through tabular-nums mb-0.5">
                    {product.originalPrice}₾
                  </span>
                  <span className="font-bold text-2xl text-success tabular-nums">
                    {product.price}<span className="ml-1 text-lg">₾</span>
                  </span>
                </>
              ) : (
                <span className="font-bold text-2xl text-foreground tabular-nums">
                  {product.price}<span className="text-primary ml-1 text-lg">₾</span>
                </span>
              )}
            </div>
          )}

          <Link
            href={`/${locale}/catalog/${product.id}`}
            className="flex items-center justify-center gap-2 h-11 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm whitespace-nowrap transition-all duration-200 hover:brightness-110 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            {t('catalog.view_details')}
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
            </svg>
          </Link>
        </div>

      </div>
    </article>
  );
}
