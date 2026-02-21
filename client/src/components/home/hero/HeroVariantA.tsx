'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Phone, SecurityCamera } from '@phosphor-icons/react';
import { formatPhone } from '@/lib/utils/format';
import { ProductSpecTags } from './ProductSpecTags';
import type { HeroVariantProps } from './types';

export function HeroVariantA({ products, locale, phone, labels, currentIndex, dir, onNavigate }: HeroVariantProps) {
  const product = products[currentIndex];
  const name = product.name[locale] ?? product.name['en'] ?? '';
  const imageSrc = product.images.length > 0
    ? product.images[0].startsWith('http') ? product.images[0] : `/images/products/${product.images[0]}`
    : null;

  const prev = () => onNavigate((currentIndex - 1 + products.length) % products.length);
  const next = () => onNavigate((currentIndex + 1) % products.length);

  return (
    <div className="relative min-h-[520px] lg:min-h-[600px] overflow-hidden rounded-2xl">
      {/* Full-bleed image */}
      <AnimatePresence mode="wait">
        <motion.div
          key={product.id}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={name}
              fill
              className="object-cover object-center"
              sizes="100vw"
              priority={currentIndex === 0}
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <SecurityCamera size={80} weight="duotone" className="text-border/30" />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Left gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/75 to-transparent" />
      {/* Bottom gradient for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

      {/* Content overlay */}
      <div className="relative h-full flex flex-col justify-end p-8 lg:p-12 min-h-[520px] lg:min-h-[600px]">
        {/* Left content */}
        <div className="max-w-lg space-y-4">
          <AnimatePresence mode="wait">
            <motion.h1
              key={product.id + '-name'}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="text-4xl sm:text-5xl xl:text-6xl font-black leading-tight text-white"
            >
              {name}
            </motion.h1>
          </AnimatePresence>

          <motion.div className="flex flex-wrap gap-2" layout>
            <ProductSpecTags product={product} locale={locale} dark />
          </motion.div>

          <div className="flex gap-3 pt-2">
            <Link
              href={`/${locale}/catalog`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm transition-all duration-200 hover:scale-[1.02] focus-visible:outline-none"
            >
              {labels.heroCta}
              <ArrowRight size={16} weight="bold" />
            </Link>
            <a
              href={`https://wa.me/995${phone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/30 bg-white/10 backdrop-blur-sm text-white font-bold text-sm transition-all duration-200 hover:bg-white/20"
            >
              <Phone size={16} weight="fill" />
              {formatPhone(phone)}
            </a>
          </div>
        </div>

        {/* Progress bar nav */}
        {products.length > 1 && (
          <div className="absolute bottom-6 right-8 flex items-center gap-3">
            <span className="text-white/60 text-sm tabular-nums font-mono">
              {String(currentIndex + 1).padStart(2, '0')} / {String(products.length).padStart(2, '0')}
            </span>
            <button onClick={prev} aria-label="Previous" className="w-8 h-8 rounded-full border border-white/30 bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-all duration-200 cursor-pointer">
              ←
            </button>
            <button onClick={next} aria-label="Next" className="w-8 h-8 rounded-full border border-white/30 bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-all duration-200 cursor-pointer">
              →
            </button>
          </div>
        )}

        {/* Progress bar */}
        {products.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${((currentIndex + 1) / products.length) * 100}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
