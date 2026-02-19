'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, SecurityCamera } from '@phosphor-icons/react';
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
  const imgSrc = p.images[0] ? (p.images[0].startsWith('http') ? p.images[0] : `/images/products/${p.images[0]}`) : null;
  const topSpecs = p.specs.slice(0, 4);

  return (
    <div
      className="relative w-full overflow-hidden rounded-3xl"
      style={{ minHeight: 'clamp(480px, 70dvh, 720px)' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background image */}
      <AnimatePresence mode="wait">
        <motion.div
          key={p.id + '-bg'}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute inset-0"
        >
          {imgSrc ? (
            <Image src={imgSrc} alt={name} fill className="object-cover object-center" sizes="100vw" priority={idx === 0} />
          ) : (
            <div className="absolute inset-0 bg-muted flex items-center justify-center">
              <SecurityCamera size={120} weight="duotone" className="text-border/20" />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/40 to-black/10 z-10" />
      <div className="absolute inset-0 bg-linear-to-r from-black/50 to-transparent z-10" />

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={p.id + '-content'}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="absolute bottom-0 left-0 right-0 z-20 p-8 lg:p-12"
        >
          <div className="max-w-2xl space-y-4">
            {/* Spec pills */}
            {topSpecs.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {topSpecs.map((spec, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white/10 backdrop-blur-sm border border-white/20 text-white/90">
                    <span className="text-white/50">{spec.key[locale] ?? spec.key['en']}:</span>
                    <span className="font-semibold">{spec.value}</span>
                  </span>
                ))}
              </div>
            )}

            {/* Name */}
            <h2 className="text-4xl lg:text-6xl font-black text-white leading-tight tracking-tight text-wrap-balance">
              {name}
            </h2>

            {/* Price + CTA row */}
            <div className="flex items-center flex-wrap gap-4 pt-2">
              {p.price > 0 && (
                <span className="text-3xl font-black text-white tabular-nums">
                  {p.price} <span className="text-white/60 text-xl font-bold">{p.currency}</span>
                </span>
              )}
              <Link
                href={`/${locale}/catalog/${p.slug}`}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white hover:bg-white/95 text-black font-bold text-base shadow-2xl transition-all duration-200 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40 active:scale-[0.98]"
              >
                {locale === 'ru' ? 'Подробнее' : locale === 'en' ? 'View Product' : 'დეტალები'}
                <ArrowRight size={18} weight="bold" />
              </Link>
              <Link
                href={`/${locale}/catalog`}
                className="text-white/70 hover:text-white text-sm font-medium transition-colors underline-offset-4 hover:underline"
              >
                {labels.heroCta}
              </Link>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Slide counter top-right */}
      {products.length > 1 && (
        <div className="absolute top-8 right-8 z-30 text-white/50 font-mono text-sm tabular-nums">
          {String(idx + 1).padStart(2, '0')} / {String(products.length).padStart(2, '0')}
        </div>
      )}

      {/* Vertical dot nav right */}
      {products.length > 1 && (
        <div className="absolute bottom-8 right-8 z-30 flex flex-col gap-1.5">
          {products.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)} className={`rounded-full transition-all duration-300 ${i === idx ? 'h-6 w-1.5 bg-white' : 'h-1.5 w-1.5 bg-white/40 hover:bg-white/70'}`} aria-label={`Slide ${i + 1}`} />
          ))}
        </div>
      )}

      {/* Progress bar bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10 z-30">
        <motion.div
          key={`${idx}-${paused}`}
          className="h-full bg-white/60"
          initial={{ width: '0%' }}
          animate={{ width: paused ? undefined : '100%' }}
          transition={{ duration: AUTOPLAY_DELAY / 1000, ease: 'linear' }}
        />
      </div>
    </div>
  );
}
