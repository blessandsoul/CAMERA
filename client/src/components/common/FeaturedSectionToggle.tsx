'use client';

import { useState } from 'react';
import { ProductCard } from './ProductCard';
import { ProductShowcaseSlider } from './ProductShowcaseSlider';
import { cn } from '@/lib/utils';
import type { Product, Locale } from '@/types/product.types';

interface FeaturedSectionToggleProps {
  products: Product[];
  locale: Locale;
  priceOnRequest: string;
  variantALabel: string;
  variantBLabel: string;
}

export function FeaturedSectionToggle({
  products,
  locale,
  priceOnRequest,
  variantALabel,
  variantBLabel,
}: FeaturedSectionToggleProps) {
  const [variant, setVariant] = useState<'A' | 'B'>('A');

  return (
    <div>
      {/* Toggle switch */}
      <div className="flex items-center justify-center gap-1 mb-6">
        <div className="inline-flex items-center rounded-lg border border-border/50 bg-muted/50 p-0.5">
          <button
            onClick={() => setVariant('A')}
            className={cn(
              'px-4 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 cursor-pointer',
              variant === 'A'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {variantALabel}
          </button>
          <button
            onClick={() => setVariant('B')}
            className={cn(
              'px-4 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 cursor-pointer',
              variant === 'B'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {variantBLabel}
          </button>
        </div>
      </div>

      {/* Variant A: Original product cards grid */}
      {variant === 'A' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <ProductShowcaseSlider
          products={products}
          locale={locale}
          priceOnRequest={priceOnRequest}
        />
      )}
    </div>
  );
}
