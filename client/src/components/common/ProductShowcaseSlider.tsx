'use client';

import { useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CaretLeft, CaretRight, SecurityCamera } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import type { Product, Locale } from '@/types/product.types';

interface ProductShowcaseSliderProps {
  products: Product[];
  locale: Locale;
  priceOnRequest: string;
}

type Direction = 'left' | 'right';

// ── Single slide: entire thing is a <Link> ───────────────────────────────────

interface ShowcaseSlidePanelProps {
  product: Product;
  locale: Locale;
  priceOnRequest: string;
  current: number;
  total: number;
}

function ShowcaseSlidePanel({ product, locale, priceOnRequest, current, total }: ShowcaseSlidePanelProps) {
  const name = product.name[locale];
  const description = product.description[locale];
  const hasImage = product.images.length > 0;
  const isService = product.category === 'services';
  const imageSrc = hasImage
    ? product.images[0].startsWith('http')
      ? product.images[0]
      : `/images/products/${product.images[0]}`
    : null;

  return (
    <div className="w-full shrink-0">
      <Link
        href={`/${locale}/catalog/${product.id}`}
        className="group block rounded-2xl overflow-hidden border border-border/40 bg-card shadow-sm transition-all duration-300 hover:shadow-lg hover:border-border/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      >
        {/* Mobile: vertical layout. Desktop: horizontal 45/55 split */}
        <div className="flex flex-col md:flex-row md:min-h-[340px] lg:min-h-[400px]">

          {/* ── Left: Text content ── */}
          <div className="order-2 md:order-1 md:w-[45%] p-6 md:p-8 lg:p-10 flex flex-col justify-between gap-4">

            <div className="flex flex-col gap-3">
              {/* Category badge + counter */}
              <div className="flex items-center justify-between">
                <span className="inline-block text-[9px] font-bold uppercase tracking-[0.15em] px-2.5 py-1 border-l-2 border-primary/70 bg-primary/5 text-muted-foreground">
                  {product.category}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground/60 tabular-nums">
                  {current + 1} / {total}
                </span>
              </div>

              {/* Product name */}
              <h3 className="text-xl md:text-2xl lg:text-[1.7rem] font-bold text-foreground leading-snug text-wrap-balance group-hover:text-primary transition-colors duration-200">
                {name}
              </h3>

              {/* Description */}
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed line-clamp-3">
                {description}
              </p>
            </div>

            {/* Price */}
            <div className="pt-2 border-t border-border/30">
              {isService ? (
                <span className="text-sm text-muted-foreground italic">{priceOnRequest}</span>
              ) : (
                <span className="text-2xl md:text-3xl font-bold text-foreground tabular-nums">
                  {product.price}
                  <span className="text-primary ml-1.5 text-lg font-semibold">₾</span>
                </span>
              )}
            </div>
          </div>

          {/* ── Right: Large product image ── */}
          <div className="order-1 md:order-2 md:w-[55%] relative aspect-[4/3] md:aspect-auto overflow-hidden bg-muted">
            {imageSrc ? (
              <>
                <Image
                  src={imageSrc}
                  alt={name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width: 768px) 100vw, 55vw"
                  priority={current === 0}
                />
                {/* Subtle gradient overlay on mobile */}
                <div
                  className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent md:bg-linear-to-l md:from-transparent md:via-transparent md:to-card/10 pointer-events-none"
                  aria-hidden="true"
                />
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <SecurityCamera size={56} weight="duotone" className="text-border/40" aria-hidden="true" />
                <span className="text-[9px] font-mono text-muted-foreground/40 tracking-[0.25em] uppercase">
                  No Signal
                </span>
              </div>
            )}
          </div>

        </div>
      </Link>
    </div>
  );
}

// ── ProductShowcaseSlider ─────────────────────────────────────────────────────

export function ProductShowcaseSlider({ products, locale, priceOnRequest }: ProductShowcaseSliderProps) {
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
    }, 360);
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

  const showNext = sliding && nextIndex !== null;
  const translateX = !showNext
    ? '0%'
    : direction === 'right'
    ? '-100%'
    : '100%';

  const displayedProducts = showNext
    ? direction === 'right'
      ? [products[current], products[nextIndex!]]
      : [products[nextIndex!], products[current]]
    : [products[current]];

  const activeIndex = showNext ? nextIndex! : current;

  return (
    <div className="relative">

      {/* Slide track */}
      <div className="relative overflow-hidden rounded-2xl">

        {/* Arrow buttons — overlaid on the slide */}
        {products.length > 1 && (
          <>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); prev(); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-xl bg-background/80 backdrop-blur-sm border border-border/40 flex items-center justify-center text-foreground hover:bg-background transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 shadow-sm hover:shadow-md"
              aria-label="Previous product"
            >
              <CaretLeft size={20} weight="bold" />
            </button>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); next(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-xl bg-background/80 backdrop-blur-sm border border-border/40 flex items-center justify-center text-foreground hover:bg-background transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 shadow-sm hover:shadow-md"
              aria-label="Next product"
            >
              <CaretRight size={20} weight="bold" />
            </button>
          </>
        )}

        {/* Sliding panels */}
        <div
          className="flex"
          style={{
            transform: `translateX(${translateX})`,
            transition: sliding ? 'transform 0.36s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
            willChange: 'transform',
          }}
        >
          {displayedProducts.map((product, i) => (
            <ShowcaseSlidePanel
              key={`${product.id}-${i}`}
              product={product}
              locale={locale}
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

      {/* Dot pagination */}
      {products.length > 1 && (
        <div
          className="flex items-center gap-2 justify-center mt-4"
          role="tablist"
          aria-label="Slide navigation"
        >
          {products.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === activeIndex}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => goTo(i)}
              className={cn(
                'transition-all duration-300 cursor-pointer rounded-full',
                i === activeIndex
                  ? 'w-7 h-1.5 bg-primary rounded-sm'
                  : 'w-1.5 h-1.5 bg-border hover:bg-muted-foreground'
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
