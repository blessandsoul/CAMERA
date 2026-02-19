'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  CaretLeft,
  CaretRight,
  SecurityCamera,
  HardDrive,
  Wrench,
  Package,
  ArrowRight,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import type { Product, Locale } from '@/types/product.types';

// ── Types ─────────────────────────────────────────────────────────────────────

interface TopProductsSliderProps {
  products: Product[];
  locale: Locale;
  labels: {
    title: string;
    inStock: string;
    priceOnRequest: string;
    viewAll: string;
    viewAllHref: string;
    noProducts: string;
    categoryLabels: Record<string, string>;
  };
}

// ── Category tabs config ───────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  all: <Package size={13} weight="duotone" aria-hidden="true" />,
  cameras: <SecurityCamera size={13} weight="duotone" aria-hidden="true" />,
  'nvr-kits': <Package size={13} weight="duotone" aria-hidden="true" />,
  storage: <HardDrive size={13} weight="duotone" aria-hidden="true" />,
  services: <Wrench size={13} weight="duotone" aria-hidden="true" />,
  accessories: <Package size={13} weight="duotone" aria-hidden="true" />,
};

const CATEGORY_ORDER = ['all', 'cameras', 'nvr-kits', 'storage', 'services', 'accessories'];

// ── Spec badge ─────────────────────────────────────────────────────────────────

function SpecBadge({ value }: { value: string }) {
  return (
    <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-muted text-muted-foreground border border-border leading-none">
      {value}
    </span>
  );
}

// ── ProductCard ────────────────────────────────────────────────────────────────

interface ProductCardProps {
  product: Product;
  locale: Locale;
  inStockLabel: string;
  priceOnRequestLabel: string;
  categoryLabels: Record<string, string>;
}

function ProductCard({ product, locale, inStockLabel, priceOnRequestLabel, categoryLabels }: ProductCardProps) {
  const name = product.name[locale];
  const hasImage = product.images.length > 0;
  const isService = product.category === 'services';
  const topSpecs = product.specs.slice(0, 2);
  const imageSrc = hasImage
    ? product.images[0].startsWith('http')
      ? product.images[0]
      : `/images/products/${product.images[0]}`
    : null;

  return (
    <Link
      href={`/${locale}/catalog/${product.id}`}
      className={cn(
        'group relative flex-none w-37.5 sm:w-50 rounded-xl border flex flex-col overflow-hidden',
        'transition-all duration-300 ease-out cursor-pointer',
        'border-border bg-card',
        'hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/8',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
      )}
      aria-label={name}
    >

      {/* ── Image ── */}
      <div className="relative h-20 sm:h-27 bg-muted overflow-hidden shrink-0">
        {imageSrc ? (
          <>
            <Image
              src={imageSrc}
              alt={name}
              fill
              className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-105"
              sizes="(max-width: 639px) 150px, 200px"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none"
              aria-hidden="true"
            />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <SecurityCamera size={32} weight="duotone" className="text-border" aria-hidden="true" />
          </div>
        )}

        {/* Badges row — in-stock + category on the same line */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1">
          <div className="flex items-center gap-1.5 bg-background/90 backdrop-blur-sm rounded-md px-2 py-1 border border-border/60 shrink-0">
            <span className="relative flex h-1.5 w-1.5 shrink-0" aria-hidden="true">
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-online" />
            </span>
            <span className="text-[10px] font-bold text-online leading-none">{inStockLabel}</span>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md bg-background/90 backdrop-blur-sm text-muted-foreground border border-border/60 shrink-0 max-w-22.5 truncate">
            <span className="w-1 h-1 rounded-full bg-primary shrink-0" aria-hidden="true" />
            {categoryLabels[product.category] ?? product.category}
          </span>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-col gap-2.5 p-3 flex-1">

        {/* Name */}
        <p className="text-[12px] font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-150">
          {name}
        </p>

        {/* Top specs */}
        {topSpecs.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {topSpecs.map((spec, i) => (
              <SpecBadge key={i} value={spec.value} />
            ))}
          </div>
        )}

        {/* Price row */}
        <div className="mt-auto pt-1 flex items-end justify-between gap-2">
          {isService ? (
            <span className="text-[11px] text-muted-foreground italic">{priceOnRequestLabel}</span>
          ) : (
            <div className="flex items-baseline gap-0.5">
              <span className="text-[18px] font-black text-foreground tabular-nums leading-none">
                {product.price.toLocaleString()}
              </span>
              <span className="text-[12px] font-bold text-primary leading-none mb-px">₾</span>
            </div>
          )}

          <div
            className={cn(
              'w-6 h-6 rounded-lg flex items-center justify-center shrink-0',
              'bg-primary/10 border border-primary/20',
              'group-hover:bg-primary group-hover:border-primary',
              'transition-all duration-200'
            )}
            aria-hidden="true"
          >
            <ArrowRight
              size={11}
              weight="bold"
              className="text-primary group-hover:text-primary-foreground transition-colors duration-200"
            />
          </div>
        </div>

      </div>
    </Link>
  );
}

// ── TopProductsSlider ─────────────────────────────────────────────────────────

// Card width + gap constants (must match Tailwind classes)
const CARD_W_MOBILE = 150; // w-37.5
const CARD_W_DESKTOP = 200; // sm:w-50
const GAP = 10; // gap-2.5
const PAD = 16; // px-4

export function TopProductsSlider({ products, locale, labels }: TopProductsSliderProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [idx, setIdx] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const getCardWidth = useCallback((): number => {
    return typeof window !== 'undefined' && window.innerWidth < 640
      ? CARD_W_MOBILE
      : CARD_W_DESKTOP;
  }, []);

  const scroll = useCallback((dir: 'left' | 'right') => {
    if (!trackRef.current) return;
    const cardW = getCardWidth();
    const visibleArea = trackRef.current.clientWidth - PAD * 2;
    const visibleCards = Math.floor((visibleArea + GAP) / (cardW + GAP));
    const totalCards = trackRef.current.querySelectorAll('[role="listitem"]').length;
    const maxIdx = Math.max(0, totalCards - visibleCards);

    setIdx((prev) => {
      const next = dir === 'right'
        ? Math.min(prev + 1, maxIdx)
        : Math.max(prev - 1, 0);
      const scrollPos = next * (cardW + GAP);
      trackRef.current?.scrollTo({ left: scrollPos, behavior: 'smooth' });
      return next;
    });
  }, [getCardWidth]);

  // Reset scroll position when category changes
  const handleCategoryChange = useCallback((cat: string) => {
    setActiveCategory(cat);
    setIdx(0);
    trackRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
  }, []);

  const filtered = activeCategory === 'all'
    ? products
    : products.filter((p) => p.category === activeCategory);

  const visibleTabs = CATEGORY_ORDER
    .filter((id) => id === 'all' || products.some((p) => p.category === id))
    .map((id) => ({
      id,
      label: labels.categoryLabels[id] ?? id,
      icon: CATEGORY_ICONS[id] ?? <Package size={13} weight="duotone" aria-hidden="true" />,
    }));

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 pt-4 pb-0 gap-3">
        <h2 className="text-[13px] font-bold text-foreground tracking-tight shrink-0">
          {labels.title}
        </h2>

        <div className="flex items-center gap-1.5">
          <Link
            href={labels.viewAllHref}
            className="text-[11px] text-primary hover:text-primary/80 font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded px-1"
          >
            {labels.viewAll}
          </Link>

          <div className="h-3 w-px bg-border" aria-hidden="true" />

          <button
            onClick={() => scroll('left')}
            aria-label="Scroll left"
            className="w-9 h-9 rounded-lg flex items-center justify-center bg-secondary border border-border text-muted-foreground hover:bg-accent hover:text-foreground hover:border-border/80 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 active:scale-[0.92]"
          >
            <CaretLeft size={14} weight="bold" />
          </button>
          <button
            onClick={() => scroll('right')}
            aria-label="Scroll right"
            className="w-9 h-9 rounded-lg flex items-center justify-center bg-secondary border border-border text-muted-foreground hover:bg-accent hover:text-foreground hover:border-border/80 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 active:scale-[0.92]"
          >
            <CaretRight size={14} weight="bold" />
          </button>
        </div>
      </div>

      {/* ── Category tabs ───────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-1 px-4 pt-3 pb-3 overflow-x-auto"
        style={{ scrollbarWidth: 'none' }}
      >
        {visibleTabs.map((tab) => {
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleCategoryChange(tab.id)}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap',
                'transition-all duration-150 cursor-pointer shrink-0',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                'active:scale-[0.95]',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-secondary text-muted-foreground border border-border hover:bg-accent hover:text-foreground'
              )}
              aria-pressed={isActive}
            >
              <span className="shrink-0">{tab.icon}</span>
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Cards track ─────────────────────────────────────────────────── */}
      {filtered.length > 0 ? (
        <div
          ref={trackRef}
          className="flex gap-2.5 px-4 pb-5 pt-1 overflow-hidden"
          aria-label="Product cards"
          role="list"
        >
          {filtered.map((product) => (
            <div key={product.id} role="listitem" className="flex-none">
              <ProductCard
                product={product}
                locale={locale}
                inStockLabel={labels.inStock}
                priceOnRequestLabel={labels.priceOnRequest}
                categoryLabels={labels.categoryLabels}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-28 px-4 pb-4">
          <p className="text-[11px] text-muted-foreground">{labels.noProducts}</p>
        </div>
      )}

    </div>
  );
}
