'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { CaretLeft, CaretRight, SecurityCamera } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import type { Product, Locale } from '@/types/product.types';

interface ProductShowcaseSliderProps {
  products: Product[];
  locale: Locale;
  priceOnRequest: string;
  autoPlayInterval?: number;
}

export function ProductShowcaseSlider({
  products,
  locale,
  priceOnRequest,
  autoPlayInterval = 5000,
}: ProductShowcaseSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % products.length);
  }, [products.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
  }, [products.length]);

  // Auto-play
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

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={product.id}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <Link
            href={`/${locale}/catalog/${product.id}`}
            className="group block rounded-2xl overflow-hidden border border-border/50 bg-card hover:border-border/80 hover:shadow-lg transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            {/* ── Image ── */}
            <div className="relative aspect-video overflow-hidden bg-muted">
              {imageSrc ? (
                <Image
                  src={imageSrc}
                  alt={name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority={currentIndex === 0}
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <SecurityCamera size={48} weight="duotone" className="text-border/40" aria-hidden="true" />
                  <span className="text-[9px] font-mono text-muted-foreground/40 tracking-[0.25em] uppercase">No Signal</span>
                </div>
              )}

              {/* Dark gradient overlay */}
              {imageSrc && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
              )}

              {/* Category badge — top left */}
              <div className="absolute top-4 left-4 z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/90">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" aria-hidden="true" />
                  {product.category}
                </span>
              </div>

              {/* Counter — top right */}
              {products.length > 1 && (
                <div className="absolute top-4 right-4 z-10 bg-black/60 backdrop-blur-sm text-white text-xs font-mono px-3 py-1.5 rounded-full pointer-events-none tabular-nums">
                  {currentIndex + 1} / {products.length}
                </div>
              )}

              {/* Navigation arrows */}
              {products.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); goToPrev(); }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110 shadow-lg cursor-pointer focus-visible:outline-none"
                    aria-label="Previous product"
                  >
                    <CaretLeft size={20} weight="bold" />
                  </button>
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); goToNext(); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110 shadow-lg cursor-pointer focus-visible:outline-none"
                    aria-label="Next product"
                  >
                    <CaretRight size={20} weight="bold" />
                  </button>
                </>
              )}
            </div>

            {/* ── Text content ── */}
            <div className="p-5 space-y-3">
              <h3 className="text-base font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-200">
                {name}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {description}
              </p>

              <div className="flex items-center justify-between pt-1">
                {/* Price */}
                {isService ? (
                  <span className="text-sm text-muted-foreground italic">{priceOnRequest}</span>
                ) : (
                  <span className="text-2xl font-black text-foreground tabular-nums leading-none">
                    {product.price}
                    <span className="text-primary ml-1 text-base font-bold">₾</span>
                  </span>
                )}

                {/* Dots */}
                {products.length > 1 && (
                  <div className="flex items-center gap-1.5">
                    {products.map((_, i) => (
                      <button
                        key={i}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentIndex(i); }}
                        className={cn(
                          'h-1.5 rounded-full transition-all duration-300 cursor-pointer',
                          i === currentIndex
                            ? 'w-6 bg-primary'
                            : 'w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                        )}
                        aria-label={`Go to slide ${i + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Link>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
