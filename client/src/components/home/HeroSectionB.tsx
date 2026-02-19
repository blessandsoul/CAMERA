'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, SecurityCamera, CaretLeft, CaretRight } from '@phosphor-icons/react';
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

const AUTOPLAY_DELAY = 5000;

const CATEGORY_LABELS: Record<string, Record<string, string>> = {
  cameras:     { ka: 'კამერები',    ru: 'Камеры',     en: 'Cameras' },
  'nvr-kits':  { ka: 'NVR კომპლ.', ru: 'NVR Комплект', en: 'NVR Kit' },
  storage:     { ka: 'შენახვა',     ru: 'Накопители',  en: 'Storage' },
  accessories: { ka: 'აქსეს.',      ru: 'Аксессуары',  en: 'Accessories' },
  services:    { ka: 'სერვისი',     ru: 'Сервис',      en: 'Services' },
};

export function HeroSectionB({ products, locale, labels }: HeroSectionBProps) {
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);

  const go = useCallback((next: number, d: number) => { setDir(d); setIdx(next); }, []);
  const prev = useCallback(() => go((idx - 1 + products.length) % products.length, -1), [idx, products.length, go]);
  const nextFn = useCallback(() => go((idx + 1) % products.length, 1), [idx, products.length, go]);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(nextFn, AUTOPLAY_DELAY);
    return () => clearInterval(t);
  }, [paused, nextFn]);

  if (products.length === 0) return null;

  const p = products[idx];
  const name = p.name[locale] ?? p.name['en'] ?? '';
  const imgSrc = p.images[0]
    ? (p.images[0].startsWith('http') ? p.images[0] : `/images/products/${p.images[0]}`)
    : null;
  const topSpecs = p.specs.slice(0, 3);
  const catLabel = CATEGORY_LABELS[p.category]?.[locale] ?? p.category;

  return (
    <div
      className="relative w-full overflow-hidden rounded-3xl border border-border/30"
      style={{ minHeight: 'clamp(480px, 68dvh, 700px)' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── Background image with Ken Burns effect ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={p.id + '-bg'}
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="absolute inset-0"
        >
          {imgSrc ? (
            <Image
              src={imgSrc}
              alt={name}
              fill
              className="object-cover object-center"
              sizes="100vw"
              priority={idx === 0}
            />
          ) : (
            <div className="absolute inset-0 bg-muted flex items-center justify-center">
              <SecurityCamera size={120} weight="duotone" className="text-border/20" />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── Light gradient — only bottom-left, preserves photo ── */}
      <div className="absolute inset-0 bg-linear-to-t from-black/55 via-black/15 to-transparent z-10" />
      <div className="absolute inset-0 bg-linear-to-r from-black/35 via-transparent to-transparent z-10" />

      {/* ── Slide counter top-right ── */}
      {products.length > 1 && (
        <div className="absolute top-6 right-6 z-30 flex items-center gap-2">
          <span className="font-mono text-xs text-white/70 tabular-nums tracking-widest">
            {String(idx + 1).padStart(2, '0')}
            <span className="text-white/30 mx-1.5">—</span>
            {String(products.length).padStart(2, '0')}
          </span>
        </div>
      )}

      {/* ── Category badge top-left ── */}
      <div className="absolute top-6 left-6 z-30">
        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-primary/80 backdrop-blur-sm text-white border border-white/10 shadow-md">
          {catLabel}
        </span>
      </div>

      {/* ── Main content card — glassmorphism ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={p.id + '-content'}
          initial={{ opacity: 0, y: dir > 0 ? 20 : -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: dir > 0 ? -20 : 20 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="absolute bottom-0 left-0 right-0 z-20 p-6 lg:p-10"
        >
          {/* Glass card */}
          <div className="inline-block max-w-xl w-full">
            <div className="rounded-2xl bg-background/70 backdrop-blur-xl border border-white/20 shadow-2xl p-6 lg:p-8 space-y-4">

              {/* Specs row */}
              {topSpecs.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {topSpecs.map((spec, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/10 border border-primary/20 text-foreground"
                    >
                      <span className="text-muted-foreground">{spec.key[locale] ?? spec.key['en']}:</span>
                      <span className="font-bold">{spec.value}</span>
                    </span>
                  ))}
                </div>
              )}

              {/* Product name */}
              <h2 className="text-2xl lg:text-4xl font-black text-foreground leading-tight tracking-tight text-wrap-balance">
                {name}
              </h2>

              {/* Price + CTA */}
              <div className="flex items-center flex-wrap gap-3 pt-1">
                {p.price > 0 && (
                  <span className="text-2xl lg:text-3xl font-black text-primary tabular-nums">
                    {p.price}
                    <span className="text-muted-foreground text-lg font-semibold ml-1">{p.currency}</span>
                  </span>
                )}
                <Link
                  href={`/${locale}/catalog/${p.slug}`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-lg transition-all duration-200 motion-safe:hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 active:scale-[0.98] cursor-pointer"
                >
                  {locale === 'ru' ? 'Подробнее' : locale === 'en' ? 'View Product' : 'დეტალები'}
                  <ArrowRight size={16} weight="bold" />
                </Link>
                <Link
                  href={`/${locale}/catalog`}
                  className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors underline-offset-4 hover:underline"
                >
                  {labels.heroCta}
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ── Prev / Next arrows ── */}
      {products.length > 1 && (
        <>
          <button
            onClick={(e) => { e.preventDefault(); prev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-background/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-foreground shadow-lg transition-all duration-200 motion-safe:hover:scale-110 hover:bg-background/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 cursor-pointer"
            aria-label="Previous"
          >
            <CaretLeft size={18} weight="bold" />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); nextFn(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-background/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-foreground shadow-lg transition-all duration-200 motion-safe:hover:scale-110 hover:bg-background/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 cursor-pointer"
            aria-label="Next"
          >
            <CaretRight size={18} weight="bold" />
          </button>
        </>
      )}

      {/* ── Dot nav bottom-right ── */}
      {products.length > 1 && (
        <div className="absolute bottom-6 right-6 z-30 flex flex-col gap-1.5">
          {products.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i, i > idx ? 1 : -1)}
              className={`rounded-full transition-all duration-300 cursor-pointer ${i === idx ? 'h-6 w-1.5 bg-primary' : 'h-1.5 w-1.5 bg-white/40 hover:bg-white/70'}`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* ── Progress bar ── */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10 z-30">
        <motion.div
          key={`${idx}-${paused}`}
          className="h-full bg-primary/70"
          initial={{ width: '0%' }}
          animate={{ width: paused ? undefined : '100%' }}
          transition={{ duration: AUTOPLAY_DELAY / 1000, ease: 'linear' }}
        />
      </div>
    </div>
  );
}
