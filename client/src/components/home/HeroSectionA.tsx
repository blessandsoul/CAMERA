'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, SecurityCamera, CircleFill, CaretLeft, CaretRight, Tag } from '@phosphor-icons/react';
import type { Product, Locale } from '@/types/product.types';

interface HeroSectionAProps {
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

const AUTOPLAY_DELAY = 4000;

const CATEGORY_LABELS: Record<string, Record<string, string>> = {
  cameras:     { ka: 'კამერები',   ru: 'Камеры',    en: 'Cameras' },
  'nvr-kits':  { ka: 'NVR კომპლ.', ru: 'NVR Кит',   en: 'NVR Kit' },
  storage:     { ka: 'შენახვა',    ru: 'Накопители', en: 'Storage' },
  accessories: { ka: 'აქსეს.',     ru: 'Аксессуары', en: 'Accessories' },
  services:    { ka: 'სერვისი',    ru: 'Сервис',     en: 'Services' },
};

export function HeroSectionA({ products, locale, labels }: HeroSectionAProps) {
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = useCallback((next: number, direction: number) => {
    setDir(direction);
    setIdx(next);
  }, []);

  const prev = useCallback(() => go((idx - 1 + products.length) % products.length, -1), [idx, products.length, go]);
  const next = useCallback(() => go((idx + 1) % products.length, 1), [idx, products.length, go]);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(next, AUTOPLAY_DELAY);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [paused, next]);

  if (products.length === 0) return null;

  const p = products[idx];
  const name = p.name[locale] ?? p.name['en'] ?? '';
  const imgSrc = p.images[0] ? (p.images[0].startsWith('http') ? p.images[0] : `/images/products/${p.images[0]}`) : null;
  const fakeOldPrice = Math.round(p.price * 1.25);
  const catLabel = CATEGORY_LABELS[p.category]?.[locale] ?? p.category;
  const topSpecs = p.specs.slice(0, 3);

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <div
      className="relative w-full rounded-3xl overflow-hidden border border-border/50 shadow-xl bg-card"
      style={{ minHeight: '480px' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence mode="wait" custom={dir}>
        <motion.div
          key={p.id}
          custom={dir}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="absolute inset-0 grid grid-cols-1 lg:grid-cols-2"
        >
          {/* Left: image */}
          <div className="relative overflow-hidden bg-muted min-h-[220px] lg:min-h-0">
            {imgSrc ? (
              <Image src={imgSrc} alt={name} fill className="object-cover object-center" sizes="(max-width: 1024px) 100vw, 50vw" priority={idx === 0} />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <SecurityCamera size={80} weight="duotone" className="text-border/30" />
              </div>
            )}
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-transparent to-card/80 hidden lg:block" />
            <div className="absolute inset-0 bg-linear-to-t from-card/70 to-transparent lg:hidden" />

            {/* Category badge */}
            <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-md">
              <Tag size={12} weight="bold" />
              {catLabel}
            </span>
          </div>

          {/* Right: offer details */}
          <div className="flex flex-col justify-center gap-5 p-6 lg:p-10 z-10">
            {/* In stock */}
            <div className="inline-flex items-center gap-2 self-start">
              <CircleFill size={8} className="text-green-500 animate-pulse" weight="fill" />
              <span className="text-xs font-semibold text-green-600 uppercase tracking-wide">
                {locale === 'ru' ? 'В наличии' : locale === 'en' ? 'In Stock' : 'მარაგშია'}
              </span>
            </div>

            {/* Product name */}
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground leading-tight text-wrap-balance">
              {name}
            </h2>

            {/* Price */}
            {p.price > 0 ? (
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-4xl lg:text-5xl font-black text-primary tabular-nums">
                  {p.price} {p.currency}
                </span>
                <span className="text-lg text-muted-foreground line-through tabular-nums">
                  {fakeOldPrice} {p.currency}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-destructive/10 text-destructive text-xs font-bold">
                  -20%
                </span>
              </div>
            ) : (
              <p className="text-xl font-semibold text-muted-foreground">{labels.priceOnRequest}</p>
            )}

            {/* Spec pills */}
            {topSpecs.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {topSpecs.map((spec, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border border-border/60 bg-muted/50">
                    <span className="text-muted-foreground/70">{spec.key[locale] ?? spec.key['en']}:</span>
                    <span className="font-semibold">{spec.value}</span>
                  </span>
                ))}
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <Link
                href={`/${locale}/catalog/${p.slug}`}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base shadow-lg transition-all duration-200 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 active:scale-[0.98]"
              >
                {locale === 'ru' ? 'Купить сейчас' : locale === 'en' ? 'Buy Now' : 'შეძენა'}
                <ArrowRight size={18} weight="bold" />
              </Link>
              <Link
                href={`/${locale}/catalog`}
                className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl border border-border hover:border-primary/40 font-medium text-sm transition-colors duration-200 hover:bg-primary/5"
              >
                {labels.heroCta}
              </Link>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      {products.length > 1 && (
        <>
          {/* Arrows */}
          <button onClick={(e) => { e.preventDefault(); prev(); }} className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm border border-border/60 flex items-center justify-center hover:bg-card shadow-md transition-all hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50" aria-label="Previous"><CaretLeft size={16} weight="bold" /></button>
          <button onClick={(e) => { e.preventDefault(); next(); }} className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm border border-border/60 flex items-center justify-center hover:bg-card shadow-md transition-all hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50" aria-label="Next"><CaretRight size={16} weight="bold" /></button>

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-border/30 z-20">
            <motion.div
              key={`${idx}-${paused}`}
              className="h-full bg-primary"
              initial={{ width: '0%' }}
              animate={{ width: paused ? undefined : '100%' }}
              transition={{ duration: AUTOPLAY_DELAY / 1000, ease: 'linear' }}
            />
          </div>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
            {products.map((_, i) => (
              <button key={i} onClick={() => go(i, i > idx ? 1 : -1)} className={`rounded-full transition-all duration-300 ${i === idx ? 'w-6 h-2 bg-primary' : 'w-2 h-2 bg-border hover:bg-primary/50'}`} aria-label={`Slide ${i + 1}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
