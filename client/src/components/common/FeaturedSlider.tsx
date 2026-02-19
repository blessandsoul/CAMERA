'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CaretLeft, CaretRight, SecurityCamera } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import type { Product, Locale } from '@/types/product.types';
import { Button } from '@/components/ui/button';

interface FeaturedSliderProps {
  products: Product[];
  locale: Locale;
  viewLabel: string;
  priceOnRequest: string;
}

export function FeaturedSlider({ products, locale, viewLabel, priceOnRequest }: FeaturedSliderProps) {
  const [current, setCurrent] = useState(0);

  const prev = useCallback(() => {
    setCurrent((i) => (i === 0 ? products.length - 1 : i - 1));
  }, [products.length]);

  const next = useCallback(() => {
    setCurrent((i) => (i === products.length - 1 ? 0 : i + 1));
  }, [products.length]);

  if (products.length === 0) return null;

  const product = products[current];
  const name = product.name[locale];
  const description = product.description[locale];
  const hasImage = product.images.length > 0;
  const isService = product.category === 'services';

  return (
    <div className="rounded-2xl overflow-hidden border border-border/40 bg-card shadow-2xl shadow-black/10">

      {/* ── Image (top) ── */}
      <div key={`img-${current}`} className="relative aspect-video overflow-hidden bg-muted motion-safe:animate-[slide-fade-in_0.35s_ease-out]">
        {hasImage ? (
          <>
            <Image
              src={product.images[0].startsWith('http') ? product.images[0] : `/images/products/${product.images[0]}`}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            <div
              className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent pointer-events-none"
              aria-hidden="true"
            />
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <SecurityCamera size={48} weight="duotone" className="text-border/50" aria-hidden="true" />
            <span className="text-[9px] font-mono text-muted-foreground/50 tracking-[0.25em] uppercase">No Signal</span>
          </div>
        )}

        {/* Category — ledger tab (flush left, no border-radius) */}
        <div className="absolute top-3 left-0 z-10">
          <span className="inline-block text-[9px] font-bold uppercase tracking-[0.15em] pl-2.5 pr-3 py-1 border-l-2 border-primary/70 bg-background/90 backdrop-blur-sm text-muted-foreground">
            {product.category}
          </span>
        </div>

        {/* Counter */}
        <div className="absolute top-3 right-3 z-10">
          <span className="text-[10px] font-mono text-white/90 tabular-nums bg-black/30 backdrop-blur-sm px-2 py-0.5">
            {current + 1} / {products.length}
          </span>
        </div>

        {/* Prev arrow */}
        <div className="absolute inset-y-0 left-3 flex items-center z-10">
          <button
            onClick={prev}
            className="w-9 h-9 rounded-lg bg-background/80 backdrop-blur-sm border border-border/40 flex items-center justify-center text-foreground hover:bg-background transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            aria-label="Previous product"
          >
            <CaretLeft size={18} weight="bold" />
          </button>
        </div>

        {/* Next arrow */}
        <div className="absolute inset-y-0 right-3 flex items-center z-10">
          <button
            onClick={next}
            className="w-9 h-9 rounded-lg bg-background/80 backdrop-blur-sm border border-border/40 flex items-center justify-center text-foreground hover:bg-background transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            aria-label="Next product"
          >
            <CaretRight size={18} weight="bold" />
          </button>
        </div>
      </div>

      {/* ── Info (bottom) ── */}
      <div key={`info-${current}`} className="p-6 flex flex-col gap-4 motion-safe:animate-[slide-fade-in_0.35s_ease-out]">

        <div className="flex flex-col gap-1.5">
          <h3 className="text-lg font-bold text-foreground leading-snug">
            {name}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {description}
          </p>
        </div>

        <div className="flex items-center justify-between gap-4">
          {isService ? (
            <span className="text-sm text-muted-foreground italic">{priceOnRequest}</span>
          ) : (
            <span className="text-2xl font-bold text-foreground tabular-nums">
              {product.price}
              <span className="text-primary ml-1 text-base font-semibold">₾</span>
            </span>
          )}
          <Button asChild size="sm" className="rounded-lg shrink-0">
            <Link href={`/${locale}/catalog/${product.id}`}>
              {viewLabel}
            </Link>
          </Button>
        </div>

        {/* Dot pagination */}
        <div
          className="flex items-center gap-2 justify-center"
          role="tablist"
          aria-label="Slide navigation"
        >
          {products.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === current}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setCurrent(i)}
              className={cn(
                'transition-all duration-300 cursor-pointer',
                i === current
                  ? 'w-6 h-1 bg-primary'
                  : 'w-1 h-1 bg-border hover:bg-muted-foreground rounded-full'
              )}
            />
          ))}
        </div>

      </div>
    </div>
  );
}
