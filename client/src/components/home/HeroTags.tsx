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
import type { Locale } from '@/types/product.types';

type Category = 'all' | 'cameras' | 'nvr-kits' | 'storage' | 'accessories' | 'services';

interface HeroTagsProps {
  locale: Locale;
  labels: Record<string, string>;
}

const CATEGORY_ICONS: Record<Category, React.ElementType> = {
  all: Star,
  cameras: SecurityCamera,
  'nvr-kits': Cpu,
  storage: HardDrive,
  accessories: Package,
  services: Wrench,
};

const BRANDS = [
  { label: 'Hikvision', href: '/[locale]/catalog?q=hikvision', isNew: false },
  { label: 'Dahua', href: '/[locale]/catalog?q=dahua', isNew: false },
  { label: 'Uniview', href: '/[locale]/catalog?q=uniview', isNew: true },
  { label: '4G კამერა', href: '/[locale]/catalog?category=cameras', isNew: true },
  { label: 'PTZ', href: '/[locale]/catalog?q=ptz', isNew: false },
  { label: '360°', href: '/[locale]/catalog?q=360', isNew: false },
  { label: 'NVR Kit', href: '/[locale]/catalog?category=nvr-kits', isNew: false },
  { label: '8MP / 4K', href: '/[locale]/catalog?q=4k', isNew: true },
  { label: 'PoE', href: '/[locale]/catalog?q=poe', isNew: false },
  { label: 'Wi-Fi', href: '/[locale]/catalog?q=wifi', isNew: false },
  { label: 'SSD / HDD', href: '/[locale]/catalog?category=storage', isNew: false },
  { label: 'მონტაჟი', href: '/[locale]/catalog?category=services', isNew: false },
];

const CATEGORY_BRANDS: Record<Category, typeof BRANDS> = {
  all: BRANDS,
  cameras: BRANDS.filter(b => ['Hikvision', 'Dahua', 'Uniview', '4G კამერა', 'PTZ', '360°', '8MP / 4K', 'PoE', 'Wi-Fi'].includes(b.label)),
  'nvr-kits': BRANDS.filter(b => ['NVR Kit', 'PoE', 'Hikvision', 'Dahua'].includes(b.label)),
  storage: BRANDS.filter(b => ['SSD / HDD', 'Hikvision', 'Dahua'].includes(b.label)),
  accessories: BRANDS.filter(b => ['PoE', 'Wi-Fi', 'PTZ'].includes(b.label)),
  services: BRANDS.filter(b => ['მონტაჟი', 'NVR Kit'].includes(b.label)),
};

export function HeroTags({ locale, labels }: HeroTagsProps) {
  const [active, setActive] = useState<Category>('cameras');

  const cats: { id: Category; label: string }[] = [
    { id: 'all', label: labels.all ?? 'ყველა' },
    { id: 'cameras', label: labels.cameras ?? 'კამერები' },
    { id: 'nvr-kits', label: labels['nvr-kits'] ?? 'NVR კომპლექტი' },
    { id: 'storage', label: labels.storage ?? 'მეხსიერება' },
    { id: 'accessories', label: labels.accessories ?? 'აქსესუარი' },
    { id: 'services', label: labels.services ?? 'სერვისი' },
  ];

  const tags = CATEGORY_BRANDS[active];

  return (
    <div className="w-full space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
      {/* Category tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-secondary/30 backdrop-blur-sm rounded-xl border border-primary/10 w-fit">
        {cats.map((cat) => {
          const Icon = CATEGORY_ICONS[cat.id];
          return cat.id === 'all' ? (
            <Link
              key={cat.id}
              href={`/${locale}/catalog`}
              className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              <Icon size={14} weight="duotone" />
              {cat.label}
            </Link>
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
                  className="absolute inset-0 bg-primary rounded-lg shadow-md"
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

      {/* Tag badges */}
      <motion.div className="flex flex-wrap items-center gap-2 min-h-[60px] content-start" layout>
        <AnimatePresence mode="popLayout">
          {tags.map((tag, i) => (
            <motion.div
              key={tag.label}
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -10 }}
              transition={{ duration: 0.2, delay: i * 0.03, ease: 'easeOut' }}
            >
              <Link
                href={tag.href.replace('[locale]', locale)}
                className={cn(
                  'inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200',
                  'bg-background/50 backdrop-blur-sm border-border/50',
                  'hover:border-primary/40 hover:scale-105 hover:shadow-md hover:-translate-y-0.5',
                  tag.isNew && 'border-primary/30 bg-primary/5'
                )}
              >
                <span className="text-muted-foreground/60">#</span>
                {tag.label}
                {tag.isNew && (
                  <span className="ml-1 inline-flex h-1.5 w-1.5 rounded-full bg-primary motion-safe:animate-pulse" />
                )}
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
