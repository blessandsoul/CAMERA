'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Phone, SecurityCamera } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { ProductSpecTags } from './ProductSpecTags';
import type { HeroVariantProps } from './types';

export function HeroVariantD({ products, locale, phone, labels, currentIndex, dir, onNavigate }: HeroVariantProps) {
  const product = products[currentIndex];
  const name = product.name[locale] ?? product.name['en'] ?? '';
  const isService = product.category === 'services';
  const imageSrc = product.images.length > 0
    ? product.images[0].startsWith('http') ? product.images[0] : `/images/products/${product.images[0]}`
    : null;

  return (
    <div className="relative min-h-[600px] lg:min-h-[680px] overflow-hidden rounded-2xl">
      {/* Background image with Ken Burns */}
      <AnimatePresence mode="wait">
        <motion.div
          key={product.id}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {imageSrc ? (
            <Image src={imageSrc} alt={name} fill className="object-cover object-center" sizes="100vw" priority={currentIndex === 0} />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <SecurityCamera size={80} weight="duotone" className="text-border/30" />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />

      {/* Top-right badge */}
      <AnimatePresence mode="wait">
        <motion.div
          key={product.id + '-badge'}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute top-6 right-6 z-10 flex flex-col items-end gap-2"
        >
          <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider">
            {product.category.replace('-', ' ')}
          </span>
          {!isService && (
            <span className="text-2xl font-black text-white tabular-nums">
              {product.price}<span className="text-primary text-sm ml-0.5">₾</span>
            </span>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Bottom-left content */}
      <div className="absolute inset-0 flex flex-col justify-end p-8 lg:p-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={product.id + '-content'}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="space-y-3 max-w-xl"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight text-white">
              {name}
            </h1>
            <div className="flex flex-wrap gap-2">
              <ProductSpecTags product={product} locale={locale} dark />
            </div>
            <div className="flex gap-3 pt-2">
              <Link
                href={`/${locale}/catalog`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-lg transition-all duration-200 hover:scale-[1.02]"
              >
                {labels.heroCta} <ArrowRight size={16} weight="bold" />
              </Link>
              <a
                href={`https://wa.me/995${phone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/30 bg-white/10 backdrop-blur-sm text-white font-bold text-sm transition-all duration-200 hover:bg-white/20"
              >
                <Phone size={16} weight="fill" /> {phone}
              </a>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Vertical dots — right edge */}
      {products.length > 1 && (
        <div className="absolute right-5 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-2">
          {products.map((_, i) => (
            <button
              key={i}
              onClick={() => onNavigate(i)}
              aria-label={`Slide ${i + 1}`}
              className={cn(
                'rounded-full transition-all duration-300 cursor-pointer',
                i === currentIndex ? 'w-2 h-6 bg-primary' : 'w-2 h-2 bg-white/40 hover:bg-white/70'
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
