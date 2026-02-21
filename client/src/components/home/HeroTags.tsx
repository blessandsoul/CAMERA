'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  SecurityCamera,
  HardDrive,
  Wrench,
  Package,
  Cpu,
  Star,
} from '@phosphor-icons/react';
import type { Locale, Product } from '@/types/product.types';

type Category = 'all' | 'cameras' | 'nvr-kits' | 'storage' | 'accessories' | 'services';

interface HeroTagsProps {
  locale: Locale;
  labels: Record<string, string>;
  productsByCategory: Partial<Record<Category, Product[]>>;
}

const CATEGORY_ICONS: Record<Category, React.ElementType> = {
  all: Star,
  cameras: SecurityCamera,
  'nvr-kits': Cpu,
  storage: HardDrive,
  accessories: Package,
  services: Wrench,
};

// Extract unique spec values from products for a given spec key
function extractSpecTags(
  products: Product[],
  locale: Locale
): { label: string; href: string; isNew: boolean }[] {
  const seen = new Set<string>();
  const tags: { label: string; href: string; isNew: boolean }[] = [];

  for (const product of products) {
    for (const spec of product.specs) {
      const val = spec.value.trim();
      if (!val || seen.has(val)) continue;
      seen.add(val);
      tags.push({
        label: val,
        href: `/[locale]/catalog?q=${encodeURIComponent(val)}`,
        isNew: false,
      });
      if (tags.length >= 10) return tags;
    }
  }
  return tags;
}

// Also collect product names as tags (brand/model)
function extractNameTags(
  products: Product[],
  locale: Locale
): { label: string; href: string; isNew: boolean }[] {
  const seen = new Set<string>();
  const tags: { label: string; href: string; isNew: boolean }[] = [];

  for (const product of products) {
    // Extract first word (brand) from product name
    const name = product.name[locale] ?? product.name['en'] ?? '';
    const brand = name.split(/\s+/)[0];
    if (!brand || seen.has(brand) || brand.length < 2) continue;
    seen.add(brand);
    tags.push({
      label: brand,
      href: `/[locale]/catalog?q=${encodeURIComponent(brand)}`,
      isNew: false,
    });
    if (tags.length >= 8) return tags;
  }
  return tags;
}

// Build tags for a category: brands first, then key specs
function buildTagsForCategory(
  products: Product[],
  locale: Locale
): { label: string; href: string; isNew: boolean }[] {
  if (!products || products.length === 0) return [];

  const brandTags = extractNameTags(products, locale);
  const specTags = extractSpecTags(products, locale);

  // Merge, deduplicate by label
  const seen = new Set(brandTags.map(t => t.label));
  const merged = [...brandTags];
  for (const tag of specTags) {
    if (!seen.has(tag.label)) {
      seen.add(tag.label);
      merged.push(tag);
    }
    if (merged.length >= 12) break;
  }
  return merged;
}

export function HeroTags({ locale, labels, productsByCategory }: HeroTagsProps) {
  const [active, setActive] = useState<Category>('cameras');

  const cats: { id: Category; label: string }[] = [
    { id: 'all', label: labels.all ?? 'ყველა' },
    { id: 'cameras', label: labels.cameras ?? 'კამერები' },
    { id: 'nvr-kits', label: labels['nvr-kits'] ?? 'NVR' },
    { id: 'storage', label: labels.storage ?? 'შენახვა' },
    { id: 'accessories', label: labels.accessories ?? 'აქსესუარი' },
    { id: 'services', label: labels.services ?? 'სერვისი' },
  ];

  const activeCats = active === 'all'
    ? Object.values(productsByCategory).flat() as Product[]
    : (productsByCategory[active] ?? []);

  const tags = buildTagsForCategory(activeCats, locale);

  return (
    <div className="w-full space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
      {/* Category tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-secondary/30 backdrop-blur-sm rounded-xl border border-primary/10 w-fit">
        {cats.map((cat) => {
          const Icon = CATEGORY_ICONS[cat.id];
          return cat.id === 'all' ? (
            <button
              key={cat.id}
              onClick={() => setActive('all')}
              className={cn(
                'relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200 cursor-pointer',
                active === 'all' ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {active === 'all' && (
                <motion.div
                  layoutId="heroTabActive"
                  className="absolute inset-0 bg-primary rounded-lg"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <Icon size={14} weight="duotone" />
                {cat.label}
              </span>
            </button>
          ) : (
            <button
              key={cat.id}
              onClick={() => setActive(cat.id)}
              className={cn(
                'relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200 cursor-pointer',
                active === cat.id ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {active === cat.id && (
                <motion.div
                  layoutId="heroTabActive"
                  className="absolute inset-0 bg-primary rounded-lg"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <Icon size={14} weight="duotone" />
                {cat.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Real spec/brand tags from products */}
      <motion.div className="flex flex-wrap items-center gap-2 min-h-14 content-start" layout>
        <AnimatePresence mode="popLayout">
          {tags.length > 0 ? tags.map((tag, i) => (
            <motion.div
              key={`${active}-${tag.label}`}
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -10 }}
              transition={{ duration: 0.18, delay: i * 0.025, ease: 'easeOut' }}
            >
              <Link
                href={tag.href.replace('[locale]', locale)}
                className={cn(
                  'inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200',
                  'bg-background/50 backdrop-blur-sm border-border/50',
                  'hover:border-primary/40 hover:scale-105 hover:-translate-y-0.5',
                )}
              >
                <span className="text-muted-foreground/60">#</span>
                {tag.label}
              </Link>
            </motion.div>
          )) : (
            <motion.p
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-muted-foreground"
            >
              {labels.noProducts ?? ''}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
