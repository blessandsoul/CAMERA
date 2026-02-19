'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Heart, Scales } from '@phosphor-icons/react';
import { useFavoritesStore } from '../store/favoritesStore';
import type { Product, Locale } from '@/types/product.types';
import { FavoriteProductCard } from './FavoriteProductCard';

interface FavoritesContentProps {
  products: Product[];
  locale: string;
}

export function FavoritesContent({ products, locale }: FavoritesContentProps): React.ReactElement {
  const t = useTranslations();
  const [mounted, setMounted] = useState(false);
  const ids = useFavoritesStore((s) => s.ids);
  const compareIds = useFavoritesStore((s) => s.compareIds);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        {t('common.loading')}
      </div>
    );
  }

  const favoriteProducts = products.filter((p) => ids.includes(p.id));

  if (favoriteProducts.length === 0) {
    return (
      <div className="py-20 text-center">
        <Heart size={48} weight="duotone" className="mx-auto text-border mb-4" />
        <h2 className="text-lg font-semibold text-foreground mb-2">{t('favorites.empty')}</h2>
        <Link
          href={`/${locale}/catalog`}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:brightness-110 transition-all duration-200 cursor-pointer"
        >
          {t('favorites.empty_cta')}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Compare bar */}
      {compareIds.length >= 2 && (
        <div className="flex items-center justify-between p-4 rounded-xl border border-primary/20 bg-primary/5">
          <div className="flex items-center gap-3">
            <Scales size={20} className="text-primary" />
            <span className="text-sm font-medium text-foreground">
              {t('favorites.compare')} ({compareIds.length})
            </span>
          </div>
          <Link
            href={`/${locale}/compare?ids=${compareIds.join(',')}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:brightness-110 transition-all duration-200 cursor-pointer"
          >
            {t('favorites.compare')}
          </Link>
        </div>
      )}

      {/* Product grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {favoriteProducts.map((product) => (
          <FavoriteProductCard
            key={product.id}
            product={product}
            locale={locale as Locale}
          />
        ))}
      </div>
    </div>
  );
}
