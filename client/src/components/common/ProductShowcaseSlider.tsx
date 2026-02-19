'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={product.id}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          <Link
            href={`/${locale}/catalog/${product.id}`}
            className="group block rounded-2xl overflow-hidden border border-border/50 bg-card hover:border-primary/30 hover:shadow-lg transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            {/* Two-column layout: text left, image right */}
            <div className="flex flex-col md:flex-row">

              {/* ── LEFT: Text ── */}
              <div className="md:w-[42%] p-5 md:p-6 flex flex-col justify-between gap-4 order-2 md:order-1">

                <div className="flex flex-col gap-3">
                  {/* Category badge */}
                  <span className="inline-flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold uppercase tracking-widest text-primary">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    {product.category}
                  </span>

                  {/* Product name */}
                  <h3 className="text-base font-bold leading-snug line-clamp-3 group-hover:text-primary transition-colors duration-200">
                    {name}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {description}
                  </p>

                  {/* Specs */}
                  {topSpecs.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {topSpecs.map((spec, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted border border-border text-[10px] font-mono font-semibold text-muted-foreground"
                        >
                          <span className="text-muted-foreground/50">{spec.key[locale] ?? spec.key['en'] ?? spec.key['ka']}:</span>
                          {spec.value}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bottom: price + read more */}
                <div className="flex items-center justify-between gap-3 pt-2 border-t border-border/30">
                  {isService ? (
                    <span className="text-xs text-muted-foreground italic">{priceOnRequest}</span>
                  ) : (
                    <span className="text-2xl font-black text-foreground tabular-nums leading-none">
                      {product.price}
                      <span className="text-primary ml-1 text-base font-bold">₾</span>
                    </span>
                  )}

                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary group-hover:gap-2 transition-all duration-200">
                    {locale === 'ka' ? 'ნახვა' : locale === 'ru' ? 'Подробнее' : 'View'}
                    <ArrowRight size={12} weight="bold" />
                  </span>
                </div>
              </div>

              {/* ── RIGHT: Image ── */}
              <div className="md:w-[58%] relative aspect-video md:aspect-auto overflow-hidden bg-muted order-1 md:order-2">
                {imageSrc ? (
                  <>
                    <Image
                      src={imageSrc}
                      alt={name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 58vw"
                      priority={currentIndex === 0}
                    />
                    {/* gradient */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent md:bg-linear-to-l md:from-transparent md:via-transparent md:to-card/20 pointer-events-none" />
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <SecurityCamera size={48} weight="duotone" className="text-border/40" aria-hidden="true" />
                    <span className="text-[9px] font-mono text-muted-foreground/40 tracking-[0.25em] uppercase">No Signal</span>
                  </div>
                )}

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
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110 cursor-pointer focus-visible:outline-none shadow-lg"
                      aria-label="Previous"
                    >
                      <CaretLeft size={18} weight="bold" />
                    </button>
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); goToNext(); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110 cursor-pointer focus-visible:outline-none shadow-lg"
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
              <div className="flex items-center justify-center gap-1.5 py-3 border-t border-border/20">
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
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </Link>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
