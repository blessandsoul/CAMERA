'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SecurityCamera,
  HardDrive,
  Wrench,
  Package,
  Toolbox,
  CaretLeft,
  CaretRight,
  ClockCounterClockwise,
  Tag,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { ProductMiniCard } from './ProductMiniCard';
import { useRecentlyViewedStore } from '@/features/catalog/store/recentlyViewedStore';
import type { Product, Locale, ProductCategory } from '@/types/product.types';

interface CategoryMeta {
  value: ProductCategory | 'recent' | 'sale';
  labels: Record<string, string>;
  icon: React.ReactNode;
  isSale?: boolean;
}

const CATEGORIES: CategoryMeta[] = [
  { value: 'sale',        labels: { ka: 'ფასდაკლება',    ru: 'Акция',        en: 'Sale'        }, icon: <Tag            size={16} weight="duotone" aria-hidden="true" />, isSale: true },
  { value: 'cameras',     labels: { ka: 'კამერები',      ru: 'Камеры',       en: 'Cameras'     }, icon: <SecurityCamera size={16} weight="duotone" aria-hidden="true" /> },
  { value: 'nvr-kits',    labels: { ka: 'NVR კომპლექტი', ru: 'NVR Комплект', en: 'NVR Kits'    }, icon: <Package        size={16} weight="duotone" aria-hidden="true" /> },
  { value: 'storage',     labels: { ka: 'მეხსიერება',    ru: 'Хранილище',    en: 'Storage'     }, icon: <HardDrive      size={16} weight="duotone" aria-hidden="true" /> },
  { value: 'accessories', labels: { ka: 'აქსესუარები',   ru: 'Аксессуары',    en: 'Accessories' }, icon: <Toolbox        size={16} weight="duotone" aria-hidden="true" /> },
  { value: 'services',    labels: { ka: 'სერვისი',       ru: 'Сервис',       en: 'Services'    }, icon: <Wrench         size={16} weight="duotone" aria-hidden="true" /> },
];

const RECENT_LABELS: Record<string, string> = {
  ka: 'ბოლოს ნანახი',
  ru: 'Недавно просмотренные',
  en: 'Recently Viewed',
};

const RECENT_EMPTY_LABELS: Record<string, string> = {
  ka: 'ჯერ არ გინახავთ პროდუქტები',
  ru: 'Вы ещё не просматривали товары',
  en: "You haven't viewed any products yet",
};

interface CategoryProductsBlockProps {
  products: Product[];
  locale: Locale;
  inStockLabel: string;
  priceOnRequestLabel: string;
  categoryLabels: Record<string, string>;
}

export function CategoryProductsBlock({
  products,
  locale,
  inStockLabel,
  priceOnRequestLabel,
  categoryLabels,
}: CategoryProductsBlockProps) {
  const [active, setActive] = useState<ProductCategory | 'recent' | 'sale'>('cameras');
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  // Ref on the cards container — arrows scroll the product row, not the tabs
  const cardsRef = useRef<HTMLDivElement>(null);

  const recentIds = useRecentlyViewedStore((s) => s.ids);
  const recentProducts = recentIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is Product => !!p)
    .slice(0, 5);

  const saleProducts = products.filter((p) => p.originalPrice !== undefined && p.originalPrice > p.price);

  const checkScroll = useCallback(() => {
    const el = cardsRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  // Re-check when active tab changes (different card count → different scrollability)
  useEffect(() => {
    const t = setTimeout(checkScroll, 50);
    return () => clearTimeout(t);
  }, [active, checkScroll]);

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
    const el = cardsRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -280 : 280, behavior: 'smooth' });
  };

  const activeProducts =
    active === 'recent'
      ? recentProducts
      : active === 'sale'
      ? saleProducts
      : products.filter((p) => p.category === active);

  const noProductsLabel =
    locale === 'ru' ? 'Нет продуктов' : locale === 'en' ? 'No products' : 'პროდუქტი არ არის';

  return (
    <div className="rounded-2xl border border-border/50 bg-card shadow-sm overflow-hidden">

      {/* Tab bar */}
      <div className="flex items-stretch border-b border-border/50 overflow-x-auto scrollbar-none">
        {CATEGORIES.map((cat) => {
          const label = cat.labels[locale] ?? cat.labels['en'];
          const count = cat.isSale
            ? saleProducts.length
            : products.filter((p) => p.category === cat.value).length;
          const isActive = active === cat.value;
          const isSaleTab = cat.isSale;

          if (isSaleTab && count === 0) return null;

          return (
            <button
              key={cat.value}
              onClick={() => setActive(cat.value as ProductCategory | 'recent' | 'sale')}
              className={cn(
                'relative flex items-center gap-2 px-4 py-3.5 text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 shrink-0',
                isSaleTab
                  ? isActive
                    ? 'text-destructive focus-visible:ring-destructive/50'
                    : 'text-destructive/70 hover:text-destructive focus-visible:ring-destructive/50'
                  : isActive
                    ? 'text-primary focus-visible:ring-primary/50'
                    : 'text-muted-foreground hover:text-foreground focus-visible:ring-primary/50'
              )}
            >
              <span className={cn(
                'transition-colors duration-200',
                isSaleTab
                  ? isActive ? 'text-destructive' : 'text-destructive/60'
                  : isActive ? 'text-primary' : 'text-muted-foreground/70'
              )}>
                {cat.icon}
              </span>
              {label}
              {count > 0 && (
                <span className={cn(
                  'text-[10px] font-bold tabular-nums px-1.5 py-px rounded-full leading-none border transition-colors duration-200',
                  isSaleTab
                    ? isActive
                      ? 'bg-destructive/10 text-destructive border-destructive/20'
                      : 'bg-destructive/5 text-destructive/70 border-destructive/20'
                    : isActive
                      ? 'bg-primary/10 text-primary border-primary/20'
                      : 'bg-muted text-muted-foreground border-border/50'
                )}>
                  {count}
                </span>
              )}
              {isActive && (
                <motion.span
                  layoutId="cat-underline"
                  className={cn(
                    'absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full',
                    isSaleTab ? 'bg-destructive' : 'bg-primary'
                  )}
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                />
              )}
            </button>
          );
        })}

        {/* Recently viewed toggle — pinned right */}
        <button
          onClick={() => setActive(active === 'recent' ? 'cameras' : 'recent')}
          aria-label={RECENT_LABELS[locale] ?? RECENT_LABELS['en']}
          aria-pressed={active === 'recent'}
          className={cn(
            'relative ml-auto shrink-0 flex items-center gap-1.5 px-3 py-3.5 text-xs font-semibold whitespace-nowrap border-l border-border/50 transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
            active === 'recent'
              ? 'text-primary bg-primary/5'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
          )}
        >
          <ClockCounterClockwise
            size={15}
            weight={active === 'recent' ? 'fill' : 'duotone'}
            aria-hidden="true"
            className="transition-all duration-200"
          />
          <span className="hidden sm:inline">{RECENT_LABELS[locale] ?? RECENT_LABELS['en']}</span>
          {recentIds.length > 0 && (
            <span className={cn(
              'text-[10px] font-bold tabular-nums px-1.5 py-px rounded-full leading-none border transition-colors duration-200',
              active === 'recent'
                ? 'bg-primary/10 text-primary border-primary/20'
                : 'bg-muted text-muted-foreground border-border/50'
            )}>
              {recentIds.length}
            </span>
          )}
          {active === 'recent' && (
            <motion.span
              layoutId="cat-underline"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            />
          )}
        </button>

        {/* Scroll arrows — always visible in the tab bar, disabled when at edge */}
        <button
          onClick={() => scroll('left')}
          disabled={!canScrollLeft}
          aria-label="Scroll left"
          className="shrink-0 flex items-center justify-center w-8 self-stretch border-l border-border/50 text-muted-foreground transition-colors duration-150 cursor-pointer hover:text-foreground hover:bg-muted/40 disabled:opacity-30 disabled:cursor-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          <CaretLeft size={13} weight="bold" aria-hidden="true" />
        </button>
        <button
          onClick={() => scroll('right')}
          disabled={!canScrollRight}
          aria-label="Scroll right"
          className="shrink-0 flex items-center justify-center w-8 self-stretch border-l border-border/50 text-muted-foreground transition-colors duration-150 cursor-pointer hover:text-foreground hover:bg-muted/40 disabled:opacity-30 disabled:cursor-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          <CaretRight size={13} weight="bold" aria-hidden="true" />
        </button>
      </div>

      {/* Scrollable cards */}
      <div
        ref={cardsRef}
        className="p-4 md:p-5 overflow-x-auto scrollbar-none"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            {activeProducts.length > 0 ? (
              <div className="flex gap-3">
                {activeProducts.map((product) => (
                  <div key={product.id} className="w-40 sm:w-45 shrink-0">
                    <ProductMiniCard
                      product={product}
                      locale={locale}
                      inStockLabel={inStockLabel}
                      priceOnRequestLabel={priceOnRequestLabel}
                      categoryLabels={categoryLabels}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
                {active === 'recent'
                  ? (RECENT_EMPTY_LABELS[locale] ?? RECENT_EMPTY_LABELS['en'])
                  : noProductsLabel}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
}
