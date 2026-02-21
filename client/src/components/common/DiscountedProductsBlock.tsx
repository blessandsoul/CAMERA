'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CaretLeft, CaretRight, Tag, Sparkle } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { ProductMiniCard } from './ProductMiniCard';
import type { Product, Locale } from '@/types/product.types';

interface DiscountedProductsBlockProps {
  products: Product[];
  locale: Locale;
  inStockLabel: string;
  priceOnRequestLabel: string;
  categoryLabels: Record<string, string>;
  saleLabel: string;
  viewAllLabel: string;
}

export function DiscountedProductsBlock({
  products,
  locale,
  inStockLabel,
  priceOnRequestLabel,
  categoryLabels,
  saleLabel,
  viewAllLabel,
}: DiscountedProductsBlockProps) {
  const saleProducts = products.filter(
    (p) => p.originalPrice !== undefined && p.originalPrice > p.price
  );

  const cardsRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = cardsRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = cardsRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      ro.disconnect();
    };
  }, [checkScroll]);

  const scroll = (dir: 'left' | 'right') => {
    cardsRef.current?.scrollBy({ left: dir === 'left' ? -280 : 280, behavior: 'smooth' });
  };

  if (saleProducts.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/20">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-success/10 border border-success/20 flex items-center justify-center shrink-0">
            <Tag size={14} weight="duotone" className="text-success" aria-hidden="true" />
          </div>
          <span className="text-sm font-bold text-foreground">{saleLabel}</span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted border border-border/60 text-[10px] font-bold text-muted-foreground tabular-nums">
            <Sparkle size={10} weight="fill" aria-hidden="true" />
            {saleProducts.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
            className="w-7 h-7 rounded-lg flex items-center justify-center border border-border/50 text-muted-foreground transition-all duration-150 cursor-pointer hover:text-success hover:border-success/30 hover:bg-success/5 disabled:opacity-30 disabled:cursor-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success/50"
          >
            <CaretLeft size={12} weight="bold" aria-hidden="true" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            aria-label="Scroll right"
            className="w-7 h-7 rounded-lg flex items-center justify-center border border-border/50 text-muted-foreground transition-all duration-150 cursor-pointer hover:text-success hover:border-success/30 hover:bg-success/5 disabled:opacity-30 disabled:cursor-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success/50"
          >
            <CaretRight size={12} weight="bold" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Scrollable cards */}
      <div
        ref={cardsRef}
        className="p-4 overflow-x-auto scrollbar-none"
      >
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <div className="flex gap-3">
              {saleProducts.map((product) => (
                <div key={product.id} className="w-50 sm:w-56 shrink-0">
                  <ProductMiniCard
                    product={product}
                    locale={locale}
                    inStockLabel={inStockLabel}
                    priceOnRequestLabel={priceOnRequestLabel}
                    categoryLabels={categoryLabels}
                    saleColor="success"
                  />
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
}
