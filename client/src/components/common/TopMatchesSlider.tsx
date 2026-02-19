'use client';

import { useState, useCallback, useEffect } from 'react';
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
        'group relative rounded-xl border flex flex-col overflow-hidden min-w-0',
        'transition-all duration-300 ease-out cursor-pointer',
        'border-border bg-card',
        'hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/8',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
      )}
      aria-label={name}
    >

      {/* ── Image ── */}
      <div className="relative aspect-16/10 bg-muted overflow-hidden shrink-0">
        {imageSrc ? (
          <>
            <Image
              src={imageSrc}
              alt={name}
              fill
              className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-105"
              sizes="(max-width: 639px) 33vw, 20vw"
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

// Cards per page by breakpoint
const COLS_MOBILE = 2;
const COLS_SM = 3;
const COLS_MD = 4;
const COLS_LG = 5;

function getColCount(): number {
  if (typeof window === 'undefined') return COLS_LG;
  const w = window.innerWidth;
  if (w < 640) return COLS_MOBILE;
  if (w < 768) return COLS_SM;
  if (w < 1024) return COLS_MD;
  return COLS_LG;
}

export function TopProductsSlider({ products, locale, labels }: TopProductsSliderProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [cols, setCols] = useState(COLS_LG);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    const update = (): void => { setCols(getColCount()); };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const filtered = activeCategory === 'all'
    ? products
    : products.filter((p) => p.category === activeCategory);

  const maxPage = Math.max(0, Math.ceil(filtered.length / cols) - 1);
  const safePage = Math.min(page, maxPage);
  const visible = filtered.slice(safePage * cols, safePage * cols + cols);

  const handleCategoryChange = useCallback((cat: string) => {
    setActiveCategory(cat);
    setPage(0);
    setAnimKey((k) => k + 1);
  }, []);

  const visibleTabs = CATEGORY_ORDER
    .filter((id) => id === 'all' || products.some((p) => p.category === id))
    .map((id) => ({
      id,
      label: labels.categoryLabels[id] ?? id,
      icon: CATEGORY_ICONS[id] ?? <Package size={13} weight="duotone" aria-hidden="true" />,
    }));

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-3 pt-3 pb-0 gap-2 md:px-4 md:pt-4 md:gap-3">
        <h2 className="text-[13px] font-bold text-foreground tracking-tight shrink-0">
          {labels.title}
        </h2>

        <div className="flex items-center gap-1.5">
          <Link
            href={labels.viewAllHref}
            className="hidden sm:inline text-[11px] text-primary hover:text-primary/80 font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded px-1"
          >
            {labels.viewAll}
          </Link>

          <div className="hidden sm:block h-3 w-px bg-border" aria-hidden="true" />

          <button
            onClick={() => { setPage((p) => Math.max(0, p - 1)); setAnimKey((k) => k + 1); }}
            disabled={safePage === 0}
            aria-label="Previous"
            className="w-7 h-7 md:w-9 md:h-9 rounded-lg flex items-center justify-center bg-secondary border border-border text-muted-foreground hover:bg-accent hover:text-foreground hover:border-border/80 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 active:scale-[0.92] disabled:opacity-40 disabled:pointer-events-none"
          >
            <CaretLeft size={12} weight="bold" className="md:hidden" />
            <CaretLeft size={14} weight="bold" className="hidden md:block" />
          </button>
          <button
            onClick={() => { setPage((p) => Math.min(maxPage, p + 1)); setAnimKey((k) => k + 1); }}
            disabled={safePage >= maxPage}
            aria-label="Next"
            className="w-7 h-7 md:w-9 md:h-9 rounded-lg flex items-center justify-center bg-secondary border border-border text-muted-foreground hover:bg-accent hover:text-foreground hover:border-border/80 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 active:scale-[0.92] disabled:opacity-40 disabled:pointer-events-none"
          >
            <CaretRight size={12} weight="bold" className="md:hidden" />
            <CaretRight size={14} weight="bold" className="hidden md:block" />
          </button>
        </div>
      </div>

      {/* ── Category tabs ───────────────────────────────────────────────── */}
      <div className="px-3 pt-2 pb-2 md:px-4 md:pt-3 md:pb-3">
        <div className="flex items-center justify-center gap-1 flex-wrap">
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
      </div>

      {/* ── Cards grid — equal columns, 100% width ─────────────────── */}
      <div className="px-3 pb-4 pt-1 md:px-4 md:pb-5">
        {visible.length > 0 ? (
          <div
            key={animKey}
            className="grid gap-2.5 motion-safe:animate-[slide-cards-in_0.25s_ease-out]"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
            role="list"
            aria-label="Product cards"
          >
            {visible.map((product) => (
              <div key={product.id} role="listitem" className="min-w-0">
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
          <div className="flex items-center justify-center h-28">
            <p className="text-[11px] text-muted-foreground">{labels.noProducts}</p>
          </div>
        )}
      </div>

    </div>
  );
}
