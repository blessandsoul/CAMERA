'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { CaretLeft, CaretRight, SecurityCamera, ArrowRight } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import type { Product, Locale } from '@/types/product.types';

interface ProductShowcaseSliderProps {
  products: Product[];
  locale: Locale;
  priceOnRequest: string;
  autoPlayInterval?: number;
}

const SLIDE_VARIANTS: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 60 : -60 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -60 : 60, transition: { duration: 0.3, ease: [0.55, 0, 1, 0.45] } }),
};

const TEXT_VARIANTS: Variants = {
  enter: { opacity: 0, y: 12 },
  center: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.1 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

export function ProductShowcaseSlider({
  products,
  locale,
  priceOnRequest,
  autoPlayInterval = 5000,
}: ProductShowcaseSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [dir, setDir] = useState(1);
  const [animKey, setAnimKey] = useState(0);
  const prevIndexRef = useRef(0);

  const navigate = useCallback((nextIndex: number) => {
    setDir(nextIndex >= prevIndexRef.current ? 1 : -1);
    setAnimKey((k) => k + 1);
    prevIndexRef.current = nextIndex;
    setCurrentIndex(nextIndex);
  }, []);

  const goToNext = useCallback(() => {
    navigate((currentIndex + 1) % products.length);
  }, [currentIndex, navigate, products.length]);

  const goToPrev = useCallback(() => {
    navigate((currentIndex - 1 + products.length) % products.length);
  }, [currentIndex, navigate, products.length]);

  useEffect(() => {
    if (isHovered || products.length <= 1) return;
    const interval = setInterval(goToNext, autoPlayInterval);
    return () => clearInterval(interval);
  }, [isHovered, goToNext, autoPlayInterval, products.length]);

  if (products.length === 0) return null;

  const product = products[currentIndex];
  const name = product.name[locale];
  const description = product.description[locale];
  const isService = product.category === 'services';
  const hasImage = product.images.length > 0;
  const imageSrc = hasImage
    ? product.images[0].startsWith('http')
      ? product.images[0]
      : `/images/products/${product.images[0]}`
    : null;
  const topSpecs = product.specs.slice(0, 3);

  return (
    <div
      className="rounded-2xl overflow-hidden border border-border/50 bg-card shadow-sm"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >

      {/* ── TOP: Image area ─────────────────────────────────────────────── */}
      <div className="relative aspect-video bg-muted overflow-hidden">

        {/* Sliding image */}
        <AnimatePresence mode="popLayout" custom={dir}>
          <motion.div
            key={`img-${animKey}`}
            custom={dir}
            variants={SLIDE_VARIANTS}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0"
          >
            {imageSrc ? (
              <Image
                src={imageSrc}
                alt={name}
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 600px"
                priority={currentIndex === 0}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-muted">
                <SecurityCamera size={48} weight="duotone" className="text-border/40" aria-hidden="true" />
                <span className="text-[9px] font-mono text-muted-foreground/40 tracking-[0.25em] uppercase">No Signal</span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Dark gradient at bottom — like AndrewAltair */}
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

        {/* Category badge — top left */}
        <div className="absolute top-3 left-3 z-10">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/80 backdrop-blur-sm text-[10px] font-bold uppercase tracking-widest text-white border border-white/20">
            <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
            {product.category}
          </span>
        </div>

        {/* Counter — top right */}
        {products.length > 1 && (
          <div className="absolute top-3 right-3 z-10 bg-black/60 backdrop-blur-sm text-white text-xs font-mono px-2.5 py-1 rounded-full pointer-events-none tabular-nums">
            {currentIndex + 1} / {products.length}
          </div>
        )}

        {/* Specs row — bottom left, over gradient */}
        {topSpecs.length > 0 && (
          <div className="absolute bottom-3 left-3 right-14 z-10 flex flex-wrap gap-1.5">
            {topSpecs.map((spec, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-sm border border-white/10 text-[10px] font-mono font-semibold text-white/90"
              >
                <span className="text-white/50">{spec.key[locale] ?? spec.key['en'] ?? spec.key['ka']}:</span>
                {spec.value}
              </span>
            ))}
          </div>
        )}

        {/* Nav arrows */}
        {products.length > 1 && (
          <>
            <button
              onClick={goToPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-black/50 hover:bg-black/75 backdrop-blur-sm rounded-full flex items-center justify-center text-white motion-safe:transition-all duration-200 motion-safe:hover:scale-110 cursor-pointer focus-visible:outline-none shadow-lg"
              aria-label="Previous"
            >
              <CaretLeft size={18} weight="bold" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-black/50 hover:bg-black/75 backdrop-blur-sm rounded-full flex items-center justify-center text-white motion-safe:transition-all duration-200 motion-safe:hover:scale-110 cursor-pointer focus-visible:outline-none shadow-lg"
              aria-label="Next"
            >
              <CaretRight size={18} weight="bold" />
            </button>
          </>
        )}
      </div>

      {/* ── BOTTOM: Text area ───────────────────────────────────────────── */}
      <div className="p-4 space-y-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={`text-${animKey}`}
            variants={TEXT_VARIANTS}
            initial="enter"
            animate="center"
            exit="exit"
            className="space-y-1.5"
          >
            <h3 className="text-sm font-bold leading-snug line-clamp-2 text-foreground">
              {name}
            </h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
              {description}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Price + link + dots */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <Link
            href={`/${locale}/catalog/${product.id}`}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:gap-2 transition-all duration-200 focus-visible:outline-none shrink-0"
          >
            {locale === 'ka' ? 'სრულად ნახვა' : locale === 'ru' ? 'Подробнее' : 'View product'}
            <ArrowRight size={12} weight="bold" />
          </Link>

          <div className="flex items-center gap-2">
            {!isService && (
              <span className="text-sm font-black text-foreground tabular-nums leading-none">
                {product.price}
                <span className="text-primary ml-0.5 text-xs font-bold">₾</span>
              </span>
            )}

            {/* Dots */}
            {products.length > 1 && (
              <div className="flex items-center gap-1.5">
                {products.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => navigate(i)}
                    className={cn(
                      'h-1.5 rounded-full motion-safe:transition-all duration-300 cursor-pointer',
                      i === currentIndex
                        ? 'w-5 bg-primary'
                        : 'w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                    )}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
