'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Phone, CaretLeft, CaretRight, SecurityCamera } from '@phosphor-icons/react';
import { formatPhone } from '@/lib/utils/format';
import { ProductSpecTags } from './ProductSpecTags';
import type { HeroVariantProps } from './types';

export function HeroVariantC({ products, locale, phone, labels, currentIndex, dir, onNavigate }: HeroVariantProps) {
  const product = products[currentIndex];
  const name = product.name[locale] ?? product.name['en'] ?? '';
  const imageSrc = product.images.length > 0
    ? product.images[0].startsWith('http') ? product.images[0] : `/images/products/${product.images[0]}`
    : null;

  const prev = () => onNavigate((currentIndex - 1 + products.length) % products.length);
  const next = () => onNavigate((currentIndex + 1) % products.length);

  return (
    <div className="relative min-h-[560px] lg:min-h-[620px] overflow-hidden rounded-2xl flex">
      {/* Left dark panel */}
      <div
        className="relative z-10 flex flex-col justify-center px-10 lg:px-14 py-12 min-w-[50%] bg-foreground"
        style={{ clipPath: 'polygon(0 0, 100% 0, 88% 100%, 0 100%)' }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={product.id + '-text'}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="space-y-4 pr-16"
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              {product.category.replace('-', ' ')}
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight text-background">
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
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/20 bg-white/5 text-background font-bold text-sm transition-all duration-200 hover:bg-white/10"
              >
                <Phone size={16} weight="fill" /> {formatPhone(phone)}
              </a>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Right image panel */}
      <div className="absolute inset-0 left-[44%]">
        <AnimatePresence mode="wait">
          <motion.div
            key={product.id}
            className="absolute inset-0"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            {imageSrc ? (
              <Image src={imageSrc} alt={name} fill className="object-cover object-center" sizes="60vw" priority={currentIndex === 0} />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <SecurityCamera size={80} weight="duotone" className="text-border/30" />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom center nav */}
      {products.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
          <button onClick={prev} aria-label="Previous" className="w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border hover:bg-background shadow-lg flex items-center justify-center transition-all duration-200 cursor-pointer">
            <CaretLeft size={18} weight="bold" />
          </button>
          <span className="text-sm font-mono tabular-nums text-background/70 bg-background/20 backdrop-blur-sm px-3 py-1 rounded-full">
            {String(currentIndex + 1).padStart(2, '0')} / {String(products.length).padStart(2, '0')}
          </span>
          <button onClick={next} aria-label="Next" className="w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border hover:bg-background shadow-lg flex items-center justify-center transition-all duration-200 cursor-pointer">
            <CaretRight size={18} weight="bold" />
          </button>
        </div>
      )}
    </div>
  );
}
