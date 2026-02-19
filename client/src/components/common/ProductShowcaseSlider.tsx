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

// Text slides in from the opposite side of image, with a slight delay
const TEXT_VARIANTS: Variants = {
  enter: (dir: number) => ({
    opacity: 0,
    x: dir > 0 ? -32 : 32,
    filter: 'blur(4px)',
  }),
  center: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.42, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.06 },
  },
  exit: (dir: number) => ({
    opacity: 0,
    x: dir > 0 ? 32 : -32,
    filter: 'blur(4px)',
    transition: { duration: 0.28, ease: [0.55, 0, 1, 0.45] },
  }),
};

// Image slides in from the same side as navigation direction
const IMAGE_VARIANTS: Variants = {
  enter: (dir: number) => ({
    opacity: 0,
    x: dir > 0 ? 60 : -60,
    scale: 1.04,
  }),
  center: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.52, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: (dir: number) => ({
    opacity: 0,
    x: dir > 0 ? -60 : 60,
    scale: 0.97,
    transition: { duration: 0.3, ease: [0.55, 0, 1, 0.45] },
  }),
};

export function ProductShowcaseSlider({
  products,
  locale,
  priceOnRequest,
  autoPlayInterval = 5000,
}: ProductShowcaseSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  // +1 = forward, -1 = backward
  const [dir, setDir] = useState(1);
  // key changes on every navigation to trigger AnimatePresence re-mount
  const [animKey, setAnimKey] = useState(0);
  const prevIndexRef = useRef(0);

  const navigate = useCallback((nextIndex: number) => {
    const d = nextIndex > prevIndexRef.current ? 1 : -1;
    setDir(d);
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
  const topSpecs = product.specs.slice(0, 4);

  return (
    <div
      className="relative rounded-2xl overflow-hidden border border-border/50 bg-card hover:border-primary/30 hover:shadow-lg transition-colors duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Two-column layout — fixed height on desktop */}
      <div className="flex flex-col md:flex-row md:h-64">

        {/* ── LEFT: Text ── */}
        <div className="md:w-[44%] relative overflow-hidden order-2 md:order-1 shrink-0">
          <AnimatePresence mode="popLayout" custom={dir}>
            <motion.div
              key={`text-${animKey}`}
              custom={dir}
              variants={TEXT_VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0 flex flex-col justify-between p-5 md:p-6"
            >
              <div className="flex flex-col gap-2.5">
                {/* Category badge */}
                <span className="inline-flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold uppercase tracking-widest text-primary">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  {product.category}
                </span>

                {/* Product name */}
                <h3 className="text-sm md:text-base font-bold leading-snug line-clamp-2">
                  {name}
                </h3>

                {/* Description */}
                <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                  {description}
                </p>

                {/* Specs */}
                {topSpecs.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {topSpecs.map((spec, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted border border-border text-[10px] font-mono font-semibold text-muted-foreground"
                      >
                        <span className="text-muted-foreground/50">
                          {spec.key[locale] ?? spec.key['en'] ?? spec.key['ka']}:
                        </span>
                        {spec.value}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom: price + link */}
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-border/30">
                {isService ? (
                  <span className="text-xs text-muted-foreground italic">{priceOnRequest}</span>
                ) : (
                  <span className="text-2xl font-black text-foreground tabular-nums leading-none">
                    {product.price}
                    <span className="text-primary ml-1 text-base font-bold">₾</span>
                  </span>
                )}

                <Link
                  href={`/${locale}/catalog/${product.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:gap-2 transition-all duration-200 focus-visible:outline-none"
                >
                  {locale === 'ka' ? 'ნახვა' : locale === 'ru' ? 'Подробнее' : 'View'}
                  <ArrowRight size={12} weight="bold" />
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── RIGHT: Image ── */}
        <div className="md:w-[56%] relative aspect-video md:aspect-auto overflow-hidden bg-muted order-1 md:order-2">
          <AnimatePresence mode="popLayout" custom={dir}>
            <motion.div
              key={`img-${animKey}`}
              custom={dir}
              variants={IMAGE_VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0"
            >
              {imageSrc ? (
                <>
                  <Image
                    src={imageSrc}
                    alt={name}
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 768px) 100vw, 56vw"
                    priority={currentIndex === 0}
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent md:bg-linear-to-l md:from-black/30 md:via-transparent md:to-transparent pointer-events-none" />
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-muted">
                  <SecurityCamera size={48} weight="duotone" className="text-border/40" aria-hidden="true" />
                  <span className="text-[9px] font-mono text-muted-foreground/40 tracking-[0.25em] uppercase">No Signal</span>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Counter */}
          {products.length > 1 && (
            <div className="absolute top-3 right-3 z-10 bg-black/60 backdrop-blur-sm text-white text-xs font-mono px-2.5 py-1 rounded-full pointer-events-none tabular-nums">
              {currentIndex + 1} / {products.length}
            </div>
          )}

          {/* Navigation arrows */}
          {products.length > 1 && (
            <>
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); goToPrev(); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-black/50 hover:bg-black/75 backdrop-blur-sm rounded-full flex items-center justify-center text-white motion-safe:transition-all duration-200 motion-safe:hover:scale-110 cursor-pointer focus-visible:outline-none shadow-lg"
                aria-label="Previous"
              >
                <CaretLeft size={18} weight="bold" />
              </button>
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); goToNext(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-black/50 hover:bg-black/75 backdrop-blur-sm rounded-full flex items-center justify-center text-white motion-safe:transition-all duration-200 motion-safe:hover:scale-110 cursor-pointer focus-visible:outline-none shadow-lg"
                aria-label="Next"
              >
                <CaretRight size={18} weight="bold" />
              </button>
            </>
          )}
        </div>

      </div>

      {/* Dots */}
      {products.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 py-2.5 border-t border-border/20">
          {products.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(i); }}
              className={cn(
                'h-1.5 rounded-full motion-safe:transition-all duration-300 cursor-pointer',
                i === currentIndex
                  ? 'w-6 bg-primary'
                  : 'w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'
              )}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
