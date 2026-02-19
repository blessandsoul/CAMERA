'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SecurityCamera,
  HardDrive,
  Wrench,
  Package,
  Toolbox,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { ProductMiniCard } from './ProductMiniCard';
import type { Product, Locale, ProductCategory } from '@/types/product.types';

interface CategoryMeta {
  value: ProductCategory;
  labels: Record<string, string>;
  icon: React.ReactNode;
}

const CATEGORIES: CategoryMeta[] = [
  { value: 'cameras',     labels: { ka: 'კამერები',      ru: 'Камеры',       en: 'Cameras'     }, icon: <SecurityCamera size={16} weight="duotone" aria-hidden="true" /> },
  { value: 'nvr-kits',    labels: { ka: 'NVR კომპლექტი', ru: 'NVR Комплект', en: 'NVR Kits'    }, icon: <Package        size={16} weight="duotone" aria-hidden="true" /> },
  { value: 'storage',     labels: { ka: 'მეხსიერება',    ru: 'Хранилище',    en: 'Storage'     }, icon: <HardDrive      size={16} weight="duotone" aria-hidden="true" /> },
  { value: 'accessories', labels: { ka: 'აქსესუარები',   ru: 'Аксессуары',   en: 'Accessories' }, icon: <Toolbox        size={16} weight="duotone" aria-hidden="true" /> },
  { value: 'services',    labels: { ka: 'სერვისი',       ru: 'Сервис',       en: 'Services'    }, icon: <Wrench         size={16} weight="duotone" aria-hidden="true" /> },
];

interface CategoryProductsBlockProps {
  products: Product[];
  locale: Locale;
  inStockLabel: string;
  priceOnRequestLabel: string;
  categoryLabels: Record<string, string>;
  viewAllLabel: string;
}

export function CategoryProductsBlock({
  products,
  locale,
  inStockLabel,
  priceOnRequestLabel,
  categoryLabels,
  viewAllLabel,
}: CategoryProductsBlockProps) {
  const [active, setActive] = useState<ProductCategory>('cameras');

  const activeProducts = products.filter((p) => p.category === active).slice(0, 5);
  const totalCount = products.filter((p) => p.category === active).length;

  return (
    <div className="rounded-2xl border border-border/50 bg-card shadow-sm overflow-hidden">

      {/* Category tabs row */}
      <div className="flex items-center gap-0 border-b border-border/50 overflow-x-auto scrollbar-none">
        {CATEGORIES.map((cat) => {
          const label = cat.labels[locale] ?? cat.labels['en'];
          const count = products.filter((p) => p.category === cat.value).length;
          const isActive = active === cat.value;

          return (
            <button
              key={cat.value}
              onClick={() => setActive(cat.value)}
              className={cn(
                'relative flex items-center gap-2 px-4 py-3.5 text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 shrink-0',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <span className={cn('transition-colors duration-200', isActive ? 'text-primary' : 'text-muted-foreground/70')}>
                {cat.icon}
              </span>
              {label}
              {count > 0 && (
                <span className={cn(
                  'text-[10px] font-bold tabular-nums px-1.5 py-px rounded-full leading-none border transition-colors duration-200',
                  isActive
                    ? 'bg-primary/10 text-primary border-primary/20'
                    : 'bg-muted text-muted-foreground border-border/50'
                )}>
                  {count}
                </span>
              )}
              {/* Active underline */}
              {isActive && (
                <motion.span
                  layoutId="cat-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Products grid */}
      <div className="p-4 md:p-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {activeProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {activeProducts.map((product) => (
                  <ProductMiniCard
                    key={product.id}
                    product={product}
                    locale={locale}
                    inStockLabel={inStockLabel}
                    priceOnRequestLabel={priceOnRequestLabel}
                    categoryLabels={categoryLabels}
                  />
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
                {locale === 'ru' ? 'Нет продуктов' : locale === 'en' ? 'No products' : 'პროდუქტი არ არის'}
              </div>
            )}

            {totalCount > 5 && (
              <div className="mt-4 flex justify-end">
                <Link
                  href={`/${locale}/catalog?category=${active}`}
                  className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors duration-150 focus-visible:outline-none"
                >
                  {viewAllLabel} ({totalCount})
                </Link>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
}
