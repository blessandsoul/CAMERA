'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
  const [dir, setDir] = useState(1);
  const prevRef = useRef(0);

  const navigate = useCallback((next: number) => {
    setDir(next >= prevRef.current ? 1 : -1);
    prevRef.current = next;
    setCurrentIndex(next);
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
  const imageSrc = product.images.length > 0
    ? product.images[0].startsWith('http')
      ? product.images[0]
      : `/images/products/${product.images[0]}`
    : null;
  const topSpecs = product.specs.slice(0, 3);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={product.id}
          initial={{ opacity: 0, x: dir > 0 ? 50 : -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: dir > 0 ? -50 : 50 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {/* Card — same structure as AndrewAltair HeroCarousel */}
          <div className="relative rounded-3xl overflow-hidden border border-border/50 bg-card group">

            {/* ── TOP: Image (aspect-video) ── */}
            <div className="aspect-video bg-muted relative overflow-hidden flex items-center justify-center">
              {imageSrc ? (
                <Image
                  src={imageSrc}
                  alt={name}
                  fill
                  className="object-contain motion-safe:group-hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, 600px"
                  priority={currentIndex === 0}
                />
              ) : (
                <SecurityCamera size={64} weight="duotone" className="text-border/30" aria-hidden="true" />
              )}

              {/* Dark gradient overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

              {/* Category badge — top left */}
              <div className="absolute top-4 left-4 z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/80 backdrop-blur-md text-[11px] font-bold uppercase tracking-widest text-white border border-white/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
                  {product.category}
                </span>
              </div>

              {/* Counter — top right (below arrows to match AndrewAltair) */}
              {products.length > 1 && (
                <div className="absolute top-14 right-4 z-20 bg-black/60 backdrop-blur-sm text-white text-sm font-medium px-3 py-1 rounded-full pointer-events-none tabular-nums">
                  {currentIndex + 1} / {products.length}
                </div>
              )}

              {/* Spec tags — bottom left, over gradient */}
              {topSpecs.length > 0 && (
                <div className="absolute bottom-4 left-4 right-20 z-10 flex flex-wrap gap-1.5">
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

              {/* Nav arrows — same as AndrewAltair */}
              {products.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.preventDefault(); goToPrev(); }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white motion-safe:transition-all motion-safe:hover:scale-110 cursor-pointer focus-visible:outline-none"
                    aria-label="Previous"
                  >
                    <CaretLeft size={22} weight="bold" />
                  </button>
                  <button
                    onClick={(e) => { e.preventDefault(); goToNext(); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white motion-safe:transition-all motion-safe:hover:scale-110 cursor-pointer focus-visible:outline-none"
                    aria-label="Next"
                  >
                    <CaretRight size={22} weight="bold" />
                  </button>
                </>
              )}
            </div>

            {/* ── BOTTOM: Text area ── */}
            <div className="p-5 space-y-3">
              {/* Title */}
              <h3 className="text-lg font-bold leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-200">
                {name}
              </h3>

              {/* Description */}
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {description}
              </p>

              {/* Bottom row: link + price + dots */}
              <div className="flex items-center justify-between pt-1">
                <Link
                  href={`/${locale}/catalog/${product.id}`}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary/80 focus-visible:outline-none group/link"
                >
                  {locale === 'ka' ? 'სრულად ნახვა' : locale === 'ru' ? 'Подробнее' : 'View product'}
                  <ArrowRight size={14} weight="bold" className="motion-safe:group-hover/link:translate-x-0.5 transition-transform" />
                </Link>

                <div className="flex items-center gap-3">
                  {/* Price */}
                  {!isService ? (
                    <span className="text-base font-black text-foreground tabular-nums leading-none">
                      {product.price}
                      <span className="text-primary ml-0.5 text-xs font-bold">₾</span>
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">{priceOnRequest}</span>
                  )}

                  {/* Dots — same as AndrewAltair */}
                  {products.length > 1 && (
                    <div className="flex items-center gap-1.5">
                      {products.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => navigate(i)}
                          className={cn(
                            'h-2 rounded-full motion-safe:transition-all duration-300 cursor-pointer',
                            i === currentIndex
                              ? 'w-6 bg-primary'
                              : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
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
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
