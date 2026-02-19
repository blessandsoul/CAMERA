'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Phone, SecurityCamera, CaretLeft, CaretRight } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import type { Product, Locale } from '@/types/product.types';
import { HeroVariantA } from './hero/HeroVariantA';
import { HeroVariantB } from './hero/HeroVariantB';
import { HeroVariantC } from './hero/HeroVariantC';
import { HeroVariantD } from './hero/HeroVariantD';

// ── Types ──────────────────────────────────────────────────────────────────────

type HeroVariant = 'A' | 'B' | 'C' | 'D' | 'E';

interface HeroSectionProps {
  products: Product[];
  locale: Locale;
  phone: string;
  labels: {
    heroTitle: string;
    heroSubtitle: string;
    heroCta: string;
    all: string;
    cameras: string;
    nvrKits: string;
    storage: string;
    accessories: string;
    services: string;
    priceOnRequest: string;
    viewProduct: string;
  };
}

// ── Variant E internals (original layout — preserved) ─────────────────────────

function CarouselE({ products, locale, currentIndex, onNavigate }: {
  products: Product[]; locale: Locale; currentIndex: number; onNavigate: (i: number) => void;
}) {
  const [dir, setDir] = useState(1);
  const go = useCallback((next: number) => { setDir(next > currentIndex ? 1 : -1); onNavigate(next); }, [currentIndex, onNavigate]);
  const prev = () => go((currentIndex - 1 + products.length) % products.length);
  const next = () => go((currentIndex + 1) % products.length);
  const product = products[currentIndex];
  const name = product.name[locale] ?? product.name['en'] ?? '';
  const imageSrc = product.images.length > 0 ? product.images[0].startsWith('http') ? product.images[0] : `/images/products/${product.images[0]}` : null;

  return (
    <div className="flex flex-col gap-3">
      <AnimatePresence mode="wait">
        <motion.div key={product.id} initial={{ opacity: 0, x: dir > 0 ? 50 : -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: dir > 0 ? -50 : 50 }} transition={{ duration: 0.45, ease: 'easeOut' }}>
          <div className="relative rounded-3xl overflow-hidden border border-border/50 bg-card shadow-sm group">
            <div className="aspect-video lg:aspect-16/8 bg-muted relative overflow-hidden flex items-center justify-center">
              {imageSrc ? (
                <Image src={imageSrc} alt={name} fill className="object-cover object-center motion-safe:group-hover:scale-105 transition-transform duration-700" sizes="(max-width: 768px) 100vw, 600px" priority={currentIndex === 0} />
              ) : (
                <SecurityCamera size={64} weight="duotone" className="text-border/30" />
              )}
              <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent" />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
      {products.length > 1 && (
        <div className="flex items-center justify-end gap-2">
          <span className="text-sm text-muted-foreground tabular-nums mr-auto">{currentIndex + 1} / {products.length}</span>
          <button onClick={(e) => { e.preventDefault(); prev(); }} className="w-10 h-10 rounded-xl border border-border/60 bg-card hover:bg-accent hover:border-primary/40 flex items-center justify-center text-foreground motion-safe:transition-all duration-200 motion-safe:hover:scale-105 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 shadow-sm" aria-label="Previous"><CaretLeft size={18} weight="bold" /></button>
          <button onClick={(e) => { e.preventDefault(); next(); }} className="w-10 h-10 rounded-xl border border-border/60 bg-card hover:bg-accent hover:border-primary/40 flex items-center justify-center text-foreground motion-safe:transition-all duration-200 motion-safe:hover:scale-105 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 shadow-sm" aria-label="Next"><CaretRight size={18} weight="bold" /></button>
        </div>
      )}
    </div>
  );
}

function SpecTagsE({ product, locale }: { product: Product; locale: Locale }) {
  return (
    <AnimatePresence mode="popLayout">
      {product.specs.map((spec, i) => (
        <motion.span key={`${product.id}-${i}`} initial={{ opacity: 0, scale: 0.85, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.85, y: -8 }} transition={{ duration: 0.18, delay: i * 0.03, ease: 'easeOut' }} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border bg-background/50 backdrop-blur-sm border-border/50">
          <span className="text-muted-foreground/60 text-[10px]">{spec.key[locale] ?? spec.key['en'] ?? spec.key['ka']}:</span>
          <span className="font-semibold">{spec.value}</span>
        </motion.span>
      ))}
    </AnimatePresence>
  );
}

function HeroVariantE({ products, locale, phone, labels, currentIndex, onNavigate }: {
  products: Product[]; locale: Locale; phone: string; labels: HeroSectionProps['labels']; currentIndex: number; onNavigate: (i: number) => void;
}) {
  const currentProduct = products[currentIndex];
  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
      <div className="space-y-5 max-w-2xl">
        <AnimatePresence mode="wait">
          <motion.h1 key={currentProduct.id + '-title'} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35, ease: 'easeOut' }} className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight leading-tight text-wrap-balance text-hero-shimmer">
            {(currentProduct.name[locale] ?? currentProduct.name['en'] ?? labels.heroTitle).slice(0, 15)}
          </motion.h1>
        </AnimatePresence>
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          <AnimatePresence mode="wait">
            <motion.p key={currentProduct.id + '-desc'} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: 'easeOut' }} className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
              {(() => {
                const fullName = currentProduct.name[locale] ?? currentProduct.name['en'] ?? '';
                const tail = fullName.length > 15 ? fullName.slice(15).trimStart() : '';
                const body = currentProduct.content?.trim() ?? '';
                return tail && body ? `${tail} — ${body}` : tail || body || labels.heroSubtitle;
              })()}
            </motion.p>
          </AnimatePresence>
          <motion.div className="flex flex-wrap items-center gap-2 min-h-14 content-start" layout>
            <SpecTagsE product={currentProduct} locale={locale} />
          </motion.div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 pt-1">
          <Link href={`/${locale}/catalog`} className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base shadow-lg glow-sm motion-safe:transition-all duration-200 motion-safe:hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
            {labels.heroCta}<ArrowRight size={18} weight="bold" />
          </Link>
          <a href={`https://wa.me/995${phone}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-border hover:border-primary/40 bg-background/50 backdrop-blur-sm font-bold text-base motion-safe:transition-all duration-200 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30">
            <Phone size={18} weight="fill" />{phone}
          </a>
        </div>
      </div>
      <div className="relative animate-in fade-in slide-in-from-right-4 duration-700 delay-300">
        <div className="absolute inset-0 bg-linear-to-r from-primary/15 to-primary/10 rounded-3xl blur-2xl" aria-hidden="true" />
        <CarouselE products={products} locale={locale} currentIndex={currentIndex} onNavigate={onNavigate} />
      </div>
    </div>
  );
}

// ── Main HeroSection orchestrator ──────────────────────────────────────────────

export function HeroSection({ products, locale, phone, labels }: HeroSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [heroVariant, setHeroVariant] = useState<HeroVariant>('E');
  const [showSwitcher, setShowSwitcher] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const VALID: HeroVariant[] = ['A', 'B', 'C', 'D', 'E'];
    const qp = searchParams.get('heroVariant') as HeroVariant | null;
    const stored = typeof window !== 'undefined' ? localStorage.getItem('heroVariant') as HeroVariant | null : null;
    const isDev = process.env.NODE_ENV === 'development';
    if (qp && VALID.includes(qp)) { setHeroVariant(qp); setShowSwitcher(true); }
    else if (stored && VALID.includes(stored)) { setHeroVariant(stored); if (isDev) setShowSwitcher(true); }
    else if (isDev) setShowSwitcher(true);
  }, [searchParams]);

  const handleNavigate = useCallback((i: number) => { setDir(i > currentIndex ? 1 : -1); setCurrentIndex(i); }, [currentIndex]);
  const handleVariantChange = (v: HeroVariant) => { setHeroVariant(v); if (typeof window !== 'undefined') localStorage.setItem('heroVariant', v); };

  if (products.length === 0) return null;

  const vp = { products, locale, phone, labels, currentIndex, dir, onNavigate: handleNavigate };

  return (
    <div className="relative">
      {heroVariant === 'A' && <HeroVariantA {...vp} />}
      {heroVariant === 'B' && <HeroVariantB {...vp} />}
      {heroVariant === 'C' && <HeroVariantC {...vp} />}
      {heroVariant === 'D' && <HeroVariantD {...vp} />}
      {heroVariant === 'E' && <HeroVariantE products={products} locale={locale} phone={phone} labels={labels} currentIndex={currentIndex} onNavigate={handleNavigate} />}

      {showSwitcher && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-background/95 backdrop-blur-sm border border-border shadow-xl text-xs font-mono">
          <span className="text-muted-foreground mr-1 select-none">Hero:</span>
          {(['A', 'B', 'C', 'D', 'E'] as HeroVariant[]).map((v) => (
            <button key={v} onClick={() => handleVariantChange(v)} className={cn('px-2.5 py-1 rounded-lg font-bold transition-all duration-150 cursor-pointer', heroVariant === v ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent')}>
              {v}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
