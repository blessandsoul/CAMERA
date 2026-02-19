'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Phone, CaretLeft, CaretRight, SecurityCamera } from '@phosphor-icons/react';
import { ProductSpecTags } from './ProductSpecTags';
import type { HeroVariantProps } from './types';

export function HeroVariantB({ products, locale, phone, labels, currentIndex, dir, onNavigate }: HeroVariantProps) {
  const product = products[currentIndex];
  const name = product.name[locale] ?? product.name['en'] ?? '';
  const imageSrc = product.images.length > 0
    ? product.images[0].startsWith('http') ? product.images[0] : `/images/products/${product.images[0]}`
    : null;

  const prev = () => onNavigate((currentIndex - 1 + products.length) % products.length);
  const next = () => onNavigate((currentIndex + 1) % products.length);

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
      {/* Left */}
      <div className="relative space-y-5">
        {/* Decorative number */}
        <AnimatePresence mode="wait">
          <motion.div
            key={product.id + '-num'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute -top-8 -left-4 text-[7rem] lg:text-[10rem] font-black text-foreground/5 leading-none select-none pointer-events-none tabular-nums"
          >
            {String(currentIndex + 1).padStart(2, '0')}
          </motion.div>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.h1
            key={product.id + '-name'}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="relative text-3xl sm:text-4xl lg:text-5xl font-black leading-tight text-wrap-balance"
          >
            {name}
          </motion.h1>
        </AnimatePresence>

        <motion.div className="flex flex-wrap gap-2" layout>
          <ProductSpecTags product={product} locale={locale} />
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href={`/${locale}/catalog`}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base shadow-lg transition-all duration-200 hover:scale-[1.02] focus-visible:outline-none"
          >
            {labels.heroCta} <ArrowRight size={18} weight="bold" />
          </Link>
          <a
            href={`https://wa.me/995${phone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-border hover:border-primary/40 bg-background/50 backdrop-blur-sm font-bold text-base transition-all duration-200 hover:bg-primary/5"
          >
            <Phone size={18} weight="fill" /> {phone}
          </a>
        </div>
      </div>

      {/* Right: glowing card */}
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={product.id}
            initial={{ opacity: 0, x: dir > 0 ? 60 : -60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir > 0 ? -60 : 60 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="rounded-2xl overflow-hidden border border-primary/40 shadow-[0_0_60px_hsl(var(--primary)/0.15)]"
          >
            <div className="aspect-video bg-muted relative">
              {imageSrc ? (
                <Image src={imageSrc} alt={name} fill className="object-cover object-center" sizes="(max-width:768px) 100vw, 600px" priority={currentIndex === 0} />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <SecurityCamera size={64} weight="duotone" className="text-border/30" />
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Flanking arrows */}
        {products.length > 1 && (
          <>
            <button onClick={prev} aria-label="Previous" className="absolute -left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-background border border-border shadow-lg flex items-center justify-center hover:bg-accent hover:border-primary/40 transition-all duration-200 cursor-pointer focus-visible:outline-none">
              <CaretLeft size={18} weight="bold" />
            </button>
            <button onClick={next} aria-label="Next" className="absolute -right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-background border border-border shadow-lg flex items-center justify-center hover:bg-accent hover:border-primary/40 transition-all duration-200 cursor-pointer focus-visible:outline-none">
              <CaretRight size={18} weight="bold" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
