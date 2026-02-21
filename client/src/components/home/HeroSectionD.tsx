'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Phone, SecurityCamera, CaretLeft, CaretRight } from '@phosphor-icons/react';
import Image from 'next/image';
import { formatPhone } from '@/lib/utils/format';
import type { Product, Locale } from '@/types/product.types';

// ── Types ──────────────────────────────────────────────────────────────────────

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

// ── Carousel ───────────────────────────────────────────────────────────────────

function CarouselD({ products, locale, currentIndex, dir, onPrev, onNext }: {
  products: Product[]; locale: Locale; currentIndex: number; dir: number;
  onPrev: () => void; onNext: () => void;
}) {
  const product = products[currentIndex];
  const name = product.name[locale] ?? product.name['en'] ?? '';
  const imageSrc = product.images.length > 0 ? product.images[0].startsWith('http') ? product.images[0] : `/images/products/${product.images[0]}` : null;

  const overlayBtnClass = "absolute top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 flex items-center justify-center text-foreground active:scale-95 transition-transform lg:hidden";

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        <motion.div key={product.id} initial={{ opacity: 0, x: dir > 0 ? 50 : -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: dir > 0 ? -50 : 50 }} transition={{ duration: 0.5, ease: 'easeOut' }}>
          <div className="relative rounded-2xl lg:rounded-3xl overflow-hidden border border-border/50 bg-card group">
            <div className="aspect-[4/3] lg:aspect-square bg-muted relative overflow-hidden flex items-center justify-center">
              {imageSrc ? (
                <Image src={imageSrc} alt={name} fill className="object-contain object-center motion-safe:group-hover:scale-105 transition-transform duration-700" sizes="(max-width: 768px) 90vw, (max-width: 1024px) 50vw, 600px" priority={currentIndex === 0} />
              ) : (
                <SecurityCamera size={64} weight="duotone" className="text-border/30" />
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Mobile overlay nav arrows on the image */}
      {products.length > 1 && (
        <>
          <button onClick={(e) => { e.preventDefault(); onPrev(); }} className={`${overlayBtnClass} left-2`} aria-label="Previous">
            <CaretLeft size={16} weight="bold" />
          </button>
          <button onClick={(e) => { e.preventDefault(); onNext(); }} className={`${overlayBtnClass} right-2`} aria-label="Next">
            <CaretRight size={16} weight="bold" />
          </button>
        </>
      )}
    </div>
  );
}

// ── Spec Tags ──────────────────────────────────────────────────────────────────

function ProductSpecTagsD({ product, locale }: { product: Product; locale: Locale }) {
  return (
    <AnimatePresence mode="popLayout">
      {product.specs.slice(0, 6).map((spec, i) => (
        <motion.span key={`${product.id}-${i}`} initial={{ opacity: 0, scale: 0.85, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.85, y: -8 }} transition={{ duration: 0.18, delay: i * 0.03, ease: 'easeOut' }} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border bg-background/50 backdrop-blur-sm border-border/50">
          <span className="text-muted-foreground/60 text-[11px]">{spec.key[locale] ?? spec.key['en'] ?? spec.key['ka']}:</span>
          <span className="font-semibold">{spec.value}</span>
        </motion.span>
      ))}
    </AnimatePresence>
  );
}

// ── Dot Indicators ─────────────────────────────────────────────────────────────

function DotIndicators({ count, current, onDotClick }: { count: number; current: number; onDotClick: (i: number) => void }) {
  if (count <= 1) return null;

  // If more than 9 dots, show a condensed version
  const maxDots = 9;
  const showCondensed = count > maxDots;

  if (showCondensed) {
    return (
      <div className="flex items-center justify-center gap-1.5">
        {Array.from({ length: Math.min(count, maxDots) }).map((_, i) => {
          let actualIndex: number;
          if (current < 4) {
            actualIndex = i;
          } else if (current > count - 5) {
            actualIndex = count - maxDots + i;
          } else {
            actualIndex = current - 4 + i;
          }
          const isActive = actualIndex === current;
          const isEdge = i === 0 || i === maxDots - 1;

          return (
            <button
              key={actualIndex}
              onClick={() => onDotClick(actualIndex)}
              className={`rounded-full transition-all duration-300 cursor-pointer ${isActive ? 'bg-primary w-5 h-2' : isEdge ? 'bg-muted-foreground/20 w-1.5 h-1.5' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50 w-2 h-2'}`}
              aria-label={`Go to slide ${actualIndex + 1}`}
            />
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-1.5">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          onClick={() => onDotClick(i)}
          className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${i === current ? 'bg-primary w-5' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50 w-2'}`}
          aria-label={`Go to slide ${i + 1}`}
        />
      ))}
    </div>
  );
}

// ── Main HeroSection ───────────────────────────────────────────────────────────

export function HeroSectionD({ products, locale, phone, labels }: HeroSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const go = useCallback((next: number) => { setDir(next > currentIndex ? 1 : -1); setCurrentIndex(next); }, [currentIndex]);
  const prev = useCallback(() => go((currentIndex - 1 + products.length) % products.length), [go, currentIndex, products.length]);
  const next = useCallback(() => go((currentIndex + 1) % products.length), [go, currentIndex, products.length]);

  // Auto-play: 5s interval, pause on hover
  useEffect(() => {
    if (isHovered || products.length <= 1) return;
    const interval = setInterval(() => {
      go((currentIndex + 1) % products.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isHovered, currentIndex, go, products.length]);

  if (products.length === 0) return null;

  const currentProduct = products[currentIndex];
  const navBtnClass = "w-10 h-10 rounded-xl border border-border/60 bg-card hover:bg-accent hover:border-primary/40 flex items-center justify-center text-foreground motion-safe:transition-all duration-200 motion-safe:hover:scale-105 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50";

  return (
    <div
      className="flex items-center gap-4 lg:gap-6"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Desktop prev button */}
      {products.length > 1 && (
        <button onClick={(e) => { e.preventDefault(); prev(); }} className={`${navBtnClass} shrink-0 hidden lg:flex`} aria-label="Previous">
          <CaretLeft size={18} weight="bold" />
        </button>
      )}

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-center flex-1 min-w-0">

        {/* ── Image column — first on mobile (order-1), second on desktop (lg:order-2) ── */}
        <div className="relative order-1 lg:order-2 min-w-0 animate-in fade-in slide-in-from-right-4 duration-700 delay-300">
          <div className="absolute inset-0 bg-linear-to-r from-primary/10 to-primary/5 lg:from-primary/15 lg:to-primary/10 rounded-3xl blur-2xl" aria-hidden="true" />
          <CarouselD products={products} locale={locale} currentIndex={currentIndex} dir={dir} onPrev={prev} onNext={next} />
          {/* Mobile dots under image */}
          {products.length > 1 && (
            <div className="flex items-center justify-center pt-3 lg:hidden">
              <DotIndicators count={products.length} current={currentIndex} onDotClick={go} />
            </div>
          )}
        </div>

        {/* ── Text column — second on mobile (order-2), first on desktop (lg:order-1) ── */}
        <div className="space-y-4 order-2 lg:order-1 min-w-0">
          {/* Product title */}
          <AnimatePresence mode="wait">
            <motion.h1
              key={currentProduct.id + '-title'}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="text-xl sm:text-2xl lg:text-[34px] xl:text-[42px] font-bold tracking-tight leading-tight text-hero-shimmer line-clamp-2"
            >
              {currentProduct.name[locale] ?? currentProduct.name['en'] ?? labels.heroTitle}
            </motion.h1>
          </AnimatePresence>

          {/* Description */}
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              <motion.p
                key={currentProduct.id + '-desc'}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed line-clamp-3"
              >
                {currentProduct.content?.trim() || labels.heroSubtitle}
              </motion.p>
            </AnimatePresence>

            {/* Spec tags */}
            <motion.div className="flex flex-wrap items-center gap-2 min-h-10 content-start" layout>
              <ProductSpecTagsD product={currentProduct} locale={locale} />
            </motion.div>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link href={`/${locale}/catalog`} className="inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:px-8 sm:py-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm sm:text-base motion-safe:transition-all duration-200 motion-safe:hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
              {labels.heroCta}<ArrowRight size={18} weight="bold" />
            </Link>
            <a href={`https://wa.me/995${phone}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:px-8 sm:py-4 rounded-xl border-2 border-border hover:border-primary/40 bg-background/50 backdrop-blur-sm font-bold text-sm sm:text-base motion-safe:transition-all duration-200 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30">
              <Phone size={18} weight="fill" />{formatPhone(phone)}
            </a>
          </div>

          {/* Desktop dots */}
          {products.length > 1 && (
            <div className="hidden lg:flex items-center gap-3 pt-1">
              <DotIndicators count={products.length} current={currentIndex} onDotClick={go} />
            </div>
          )}
        </div>
      </div>

      {/* Desktop next button */}
      {products.length > 1 && (
        <button onClick={(e) => { e.preventDefault(); next(); }} className={`${navBtnClass} shrink-0 hidden lg:flex`} aria-label="Next">
          <CaretRight size={18} weight="bold" />
        </button>
      )}
    </div>
  );
}
