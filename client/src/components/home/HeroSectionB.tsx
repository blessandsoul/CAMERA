'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, SecurityCamera, ArrowUpRight, Star } from '@phosphor-icons/react';
import type { Product, Locale } from '@/types/product.types';

interface HeroSectionBProps {
  products: Product[];
  locale: Locale;
  phone: string;
  labels: {
    heroTitle: string;
    heroSubtitle: string;
    heroCta: string;
    priceOnRequest: string;
    viewProduct: string;
  };
}

const AUTOPLAY_DELAY = 5500;

const CATEGORY_LABELS: Record<string, Record<string, string>> = {
  cameras:     { ka: 'კამერები',    ru: 'Камера',       en: 'Camera' },
  'nvr-kits':  { ka: 'NVR კომპლ.', ru: 'NVR Комплект', en: 'NVR Kit' },
  storage:     { ka: 'შენახვა',     ru: 'Накопитель',   en: 'Storage' },
  accessories: { ka: 'აქსეს.',      ru: 'Аксессуар',    en: 'Accessory' },
  services:    { ka: 'სერვისი',     ru: 'Сервис',       en: 'Service' },
};

export function HeroSectionB({ products, locale, labels }: HeroSectionBProps) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  const nextFn = useCallback(() => setIdx(i => (i + 1) % products.length), [products.length]);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(nextFn, AUTOPLAY_DELAY);
    return () => clearInterval(t);
  }, [paused, nextFn]);

  if (products.length === 0) return null;

  const p = products[idx];
  const name = p.name[locale] ?? p.name['en'] ?? '';
  const imgSrc = p.images[0]
    ? p.images[0].startsWith('http') ? p.images[0] : `/images/products/${p.images[0]}`
    : null;
  const specs = p.specs.slice(0, 5);
  const catLabel = CATEGORY_LABELS[p.category]?.[locale] ?? p.category;
  const fakeOldPrice = p.price > 0 ? Math.round(p.price * 1.22) : 0;

  return (
    <div
      className="relative w-full rounded-3xl overflow-hidden border border-border/40 shadow-xl bg-card"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Flow layout — image top on mobile, side-by-side on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-[42%_58%] min-h-125 lg:min-h-120">

        {/* ── LEFT: Info panel — bottom on mobile (order-2), left on desktop (order-1) ── */}
        <div className="flex flex-col justify-between p-6 lg:p-10 bg-card lg:border-r border-t lg:border-t-0 border-border/30 order-2 lg:order-1">

          {/* Top: category + counter */}
          <div className="flex items-center justify-between mb-4">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/8 border border-primary/15 text-xs font-bold text-primary uppercase tracking-widest">
              {catLabel}
            </span>
            {products.length > 1 && (
              <span className="font-mono text-xs text-muted-foreground/60 tabular-nums">
                {String(idx + 1).padStart(2, '0')}&thinsp;/&thinsp;{String(products.length).padStart(2, '0')}
              </span>
            )}
          </div>

          {/* Middle: animated content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="flex flex-col gap-4 flex-1 justify-center py-4"
            >
              <h2 className="text-xl sm:text-2xl lg:text-[1.75rem] font-black text-foreground leading-tight tracking-tight text-wrap-balance">
                {name}
              </h2>

              {/* Specs table */}
              {specs.length > 0 && (
                <div className="space-y-1">
                  {specs.map((spec, i) => (
                    <div key={i} className="flex items-baseline justify-between gap-3 py-1.5 border-b border-border/40 last:border-0">
                      <span className="text-xs text-muted-foreground shrink-0">
                        {spec.key[locale] ?? spec.key['en']}
                      </span>
                      <span className="text-xs font-semibold text-foreground text-right">{spec.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Price */}
              {p.price > 0 ? (
                <div className="flex items-baseline gap-2.5 flex-wrap">
                  <span className="text-3xl lg:text-4xl font-black text-primary tabular-nums">
                    {p.price}
                    <span className="text-base font-bold ml-1 text-primary/70">{p.currency}</span>
                  </span>
                  <span className="text-sm text-muted-foreground line-through tabular-nums">
                    {fakeOldPrice} {p.currency}
                  </span>
                  <span className="text-xs font-black text-destructive bg-destructive/8 border border-destructive/15 px-2 py-0.5 rounded-md">
                    −18%
                  </span>
                </div>
              ) : (
                <p className="text-lg font-semibold text-muted-foreground">{labels.priceOnRequest}</p>
              )}
            </motion.div>
          </AnimatePresence>

          {/* CTAs */}
          <div className="flex flex-col gap-2.5 mt-2">
            <Link
              href={`/${locale}/catalog/${p.slug}`}
              className="inline-flex items-center justify-between gap-2 w-full px-5 py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-md transition-all duration-200 motion-safe:hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 active:scale-[0.98] cursor-pointer"
            >
              <span>{locale === 'ru' ? 'Подробнее о товаре' : locale === 'en' ? 'View product' : 'პროდუქტის ნახვა'}</span>
              <ArrowUpRight size={16} weight="bold" />
            </Link>
            <Link
              href={`/${locale}/catalog`}
              className="inline-flex items-center justify-center gap-1.5 w-full px-5 py-3 rounded-xl border border-border hover:border-primary/40 text-muted-foreground hover:text-foreground font-medium text-sm transition-all duration-200 hover:bg-primary/5 cursor-pointer"
            >
              {labels.heroCta}
              <ArrowRight size={14} weight="bold" />
            </Link>
          </div>
        </div>

        {/* ── RIGHT: Product image stage — top on mobile (order-1), right on desktop (order-2) ── */}
        <div className="relative overflow-hidden bg-linear-to-br from-secondary via-secondary/60 to-accent/40 order-1 lg:order-2 min-h-56 lg:min-h-0">

          {/* Subtle dot grid texture */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'radial-gradient(hsl(var(--border)) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
            aria-hidden="true"
          />

          {/* Product image — animated */}
          <AnimatePresence mode="wait">
            <motion.div
              key={p.id + '-img'}
              initial={{ opacity: 0, scale: 0.93, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.04, y: -8 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 flex items-center justify-center p-6 lg:p-10"
            >
              {imgSrc ? (
                <div className="relative w-full h-full">
                  <Image
                    src={imgSrc}
                    alt={name}
                    fill
                    className="object-contain object-center drop-shadow-2xl"
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    priority={idx === 0}
                  />
                </div>
              ) : (
                <SecurityCamera size={80} weight="duotone" className="text-border/25" />
              )}
            </motion.div>
          </AnimatePresence>

          {/* In stock badge — top right */}
          <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 motion-safe:animate-pulse" aria-hidden="true" />
            <span className="text-xs font-semibold text-foreground">
              {locale === 'ru' ? 'В наличии' : locale === 'en' ? 'In stock' : 'მარაგშია'}
            </span>
          </div>

          {/* TechBrain badge — bottom left */}
          <div className="absolute bottom-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
            <Star size={11} weight="fill" className="text-primary" />
            <span className="text-xs font-bold text-primary">TechBrain</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-border/30 z-20">
        <motion.div
          key={`${idx}-${paused}`}
          className="h-full bg-primary"
          initial={{ width: '0%' }}
          animate={{ width: paused ? undefined : '100%' }}
          transition={{ duration: AUTOPLAY_DELAY / 1000, ease: 'linear' }}
        />
      </div>
    </div>
  );
}
