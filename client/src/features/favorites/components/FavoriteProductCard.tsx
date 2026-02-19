'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Heart, SecurityCamera } from '@phosphor-icons/react';
import { useFavoritesStore } from '../store/favoritesStore';
import type { Product, Locale } from '@/types/product.types';

interface FavoriteProductCardProps {
  product: Product;
  locale: Locale;
}

export function FavoriteProductCard({ product, locale }: FavoriteProductCardProps): React.ReactElement {
  const t = useTranslations();
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const toggleCompare = useFavoritesStore((s) => s.toggleCompare);
  const isComparing = useFavoritesStore((s) => s.isComparing(product.id));
  const compareIds = useFavoritesStore((s) => s.compareIds);

  const name = product.name[locale];
  const hasImage = product.images.length > 0;
  const imgSrc = hasImage
    ? (product.images[0].startsWith('http') ? product.images[0] : `/images/products/${product.images[0]}`)
    : '';

  return (
    <article className="group relative flex flex-col rounded-xl border border-border/50 bg-card overflow-hidden transition-all duration-300 hover:border-border/80 hover:shadow-lg hover:-translate-y-0.5">
      {/* Image */}
      <Link
        href={`/${locale}/catalog/${product.id}`}
        className="block relative aspect-4/3 overflow-hidden bg-muted"
      >
        {hasImage ? (
          <Image
            src={imgSrc}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <SecurityCamera size={36} weight="duotone" className="text-border/60" />
          </div>
        )}
      </Link>

      {/* Favorite remove button */}
      <button
        type="button"
        onClick={() => toggleFavorite(product.id)}
        className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-background/90 backdrop-blur-sm border border-border/60 transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95"
        aria-label="Remove from favorites"
      >
        <Heart size={18} weight="fill" className="text-red-500" />
      </button>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        <Link href={`/${locale}/catalog/${product.id}`}>
          <h3 className="font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-200">
            {name}
          </h3>
        </Link>

        <div className="flex items-center justify-between mt-auto">
          {product.category === 'services' ? (
            <span className="text-sm text-muted-foreground italic">
              {t('catalog.price_on_request')}
            </span>
          ) : (
            <span className="font-bold text-xl text-foreground tabular-nums">
              {product.price}<span className="text-primary ml-1 text-base">₾</span>
            </span>
          )}

          {/* Compare toggle */}
          <button
            type="button"
            onClick={() => toggleCompare(product.id)}
            disabled={!isComparing && compareIds.length >= 3}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              isComparing
                ? 'bg-primary/10 border-primary/30 text-primary font-medium'
                : 'border-border text-muted-foreground hover:text-foreground hover:border-border/80'
            }`}
          >
            {t('favorites.compare_select')}
          </button>
        </div>
      </div>
    </article>
  );
}
