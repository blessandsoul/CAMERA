'use client';

import { useState, useCallback, useRef } from 'react';
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

type Direction = 'left' | 'right';

// ── Slide panel ────────────────────────────────────────────────────────────────

interface SlidePanelProps {
  product: Product;
  locale: Locale;
  viewLabel: string;
  priceOnRequest: string;
  current: number;
  total: number;
}

function SlidePanel({ product, locale, viewLabel, priceOnRequest, current, total }: SlidePanelProps) {
  const name = product.name[locale];
  const description = product.description[locale];
  const hasImage = product.images.length > 0;
  const isService = product.category === 'services';

  return (
    <div className="w-full shrink-0">
      {/* Image */}
      <div className="relative aspect-video overflow-hidden bg-muted">
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

        {/* Category */}
        <div className="absolute top-3 left-0 z-10">
          <span className="inline-block text-[9px] font-bold uppercase tracking-[0.15em] pl-2.5 pr-3 py-1 border-l-2 border-primary/70 bg-background/90 backdrop-blur-sm text-muted-foreground">
            {product.category}
          </span>
        </div>

        {/* Counter */}
        <div className="absolute top-3 right-3 z-10">
          <span className="text-[10px] font-mono text-white/90 tabular-nums bg-black/30 backdrop-blur-sm px-2 py-0.5">
            {current + 1} / {total}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <h3 className="text-lg font-bold text-foreground leading-snug">{name}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{description}</p>
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
            <Link href={`/${locale}/catalog/${product.id}`}>{viewLabel}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── FeaturedSlider ─────────────────────────────────────────────────────────────

export function FeaturedSlider({ products, locale, viewLabel, priceOnRequest }: FeaturedSliderProps) {
  const [current, setCurrent] = useState(0);
  const [sliding, setSliding] = useState(false);
  const [direction, setDirection] = useState<Direction>('right');
  const [nextIndex, setNextIndex] = useState<number | null>(null);
  const lockRef = useRef(false);

  const slideTo = useCallback((targetIndex: number, dir: Direction) => {
    if (lockRef.current) return;
    lockRef.current = true;
    setDirection(dir);
    setNextIndex(targetIndex);
    setSliding(true);

    setTimeout(() => {
      setCurrent(targetIndex);
      setSliding(false);
      setNextIndex(null);
      lockRef.current = false;
    }, 320);
  }, []);

  const prev = useCallback(() => {
    const target = current === 0 ? products.length - 1 : current - 1;
    slideTo(target, 'left');
  }, [current, products.length, slideTo]);

  const next = useCallback(() => {
    const target = current === products.length - 1 ? 0 : current + 1;
    slideTo(target, 'right');
  }, [current, products.length, slideTo]);

  const goTo = useCallback((i: number) => {
    if (i === current) return;
    slideTo(i, i > current ? 'right' : 'left');
  }, [current, slideTo]);

  if (products.length === 0) return null;

  // When sliding: show current + next side by side, translateX animates
  const showNext = sliding && nextIndex !== null;
  const translateX = !showNext
    ? '0%'
    : direction === 'right'
    ? '-100%'  // current slides left, next comes from right
    : '100%';  // current slides right, next comes from left

  const displayedProducts = showNext
    ? direction === 'right'
      ? [products[current], products[nextIndex!]]
      : [products[nextIndex!], products[current]]
    : [products[current]];

  const currentDisplayIndex = showNext && direction === 'left' ? nextIndex! : current;

  return (
    <div className="rounded-2xl overflow-hidden border border-border/40 bg-card">

      {/* Slide track */}
      <div className="relative overflow-hidden">
        {/* Arrow buttons — positioned over the track */}
        <div className="absolute inset-y-0 left-3 flex items-center z-10" style={{ top: 0, bottom: '40%' }}>
          <button
            onClick={prev}
            className="w-9 h-9 rounded-lg bg-background/80 backdrop-blur-sm border border-border/40 flex items-center justify-center text-foreground hover:bg-background transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            aria-label="Previous product"
          >
            <CaretLeft size={18} weight="bold" />
          </button>
        </div>
        <div className="absolute inset-y-0 right-3 flex items-center z-10" style={{ top: 0, bottom: '40%' }}>
          <button
            onClick={next}
            className="w-9 h-9 rounded-lg bg-background/80 backdrop-blur-sm border border-border/40 flex items-center justify-center text-foreground hover:bg-background transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            aria-label="Next product"
          >
            <CaretRight size={18} weight="bold" />
          </button>
        </div>

        {/* Sliding panels */}
        <div
          className="flex"
          style={{
            transform: `translateX(${translateX})`,
            transition: sliding ? 'transform 0.32s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
            willChange: 'transform',
          }}
        >
          {displayedProducts.map((product, i) => (
            <SlidePanel
              key={`${product.id}-${i}`}
              product={product}
              locale={locale}
              viewLabel={viewLabel}
              priceOnRequest={priceOnRequest}
              current={showNext
                ? direction === 'right'
                  ? i === 0 ? current : nextIndex!
                  : i === 0 ? nextIndex! : current
                : current
              }
              total={products.length}
            />
          ))}
        </div>
      </div>

      {/* Dot pagination — outside the track, no sliding */}
      <div
        className="flex items-center gap-2 justify-center pb-4 -mt-2"
        role="tablist"
        aria-label="Slide navigation"
      >
        {products.map((_, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={i === (showNext ? nextIndex! : current)}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => goTo(i)}
            className={cn(
              'transition-all duration-300 cursor-pointer',
              i === (showNext ? nextIndex! : current)
                ? 'w-6 h-1 bg-primary'
                : 'w-1 h-1 bg-border hover:bg-muted-foreground rounded-full'
            )}
          />
        ))}
      </div>

    </div>
  );
}
