# Hero Slider Variants Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build 4 visual-promo hero slider variants (A/B/C/D) with a dev-mode dropdown switcher that persists to localStorage, allowing the client to pick a layout.

**Architecture:** Split current `HeroSection.tsx` into a shell component that renders one of 4 variant sub-components. Each variant owns its own image transition and layout logic but shares `HeroVariantProps`. The dev switcher is a floating pill visible only in dev mode or via `?heroVariant=` query param.

**Tech Stack:** Next.js App Router, React, Framer Motion, Tailwind CSS, `@phosphor-icons/react`, `next/image`

---

## Task 1: Shared types + ProductSpecTags

**Files:**
- Create: `client/src/components/home/hero/types.ts`
- Create: `client/src/components/home/hero/ProductSpecTags.tsx`

**Step 1: Create the hero/ directory and types.ts**

```ts
// client/src/components/home/hero/types.ts
import type { Product, Locale } from '@/types/product.types';

export interface HeroVariantProps {
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
  currentIndex: number;
  dir: number;
  onNavigate: (i: number) => void;
}
```

**Step 2: Create ProductSpecTags.tsx (extracted from current HeroSection)**

```tsx
// client/src/components/home/hero/ProductSpecTags.tsx
'use client';
import { motion, AnimatePresence } from 'framer-motion';
import type { Product, Locale } from '@/types/product.types';

export function ProductSpecTags({
  product,
  locale,
  dark = false,
}: {
  product: Product;
  locale: Locale;
  dark?: boolean;
}) {
  return (
    <AnimatePresence mode="popLayout">
      {product.specs.map((spec, i) => (
        <motion.span
          key={`${product.id}-${i}`}
          initial={{ opacity: 0, scale: 0.85, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: -8 }}
          transition={{ duration: 0.18, delay: i * 0.03, ease: 'easeOut' }}
          className={
            dark
              ? 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/10 backdrop-blur-sm border border-white/20 text-white'
              : 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border bg-background/50 backdrop-blur-sm border-border/50'
          }
        >
          <span className={dark ? 'text-white/50 text-[10px]' : 'text-muted-foreground/60 text-[10px]'}>
            {spec.key[locale] ?? spec.key['en'] ?? spec.key['ka']}:
          </span>
          <span className="font-semibold">{spec.value}</span>
        </motion.span>
      ))}
    </AnimatePresence>
  );
}
```

**Step 3: Commit**

```bash
git add client/src/components/home/hero/
git commit -m "feat: add hero shared types + ProductSpecTags component"
```

---

## Task 2: Variant A — "Dark Fullbleed"

**Files:**
- Create: `client/src/components/home/hero/HeroVariantA.tsx`

**Design:**
- Layout: `grid lg:grid-cols-[1fr_1fr]`, image panel has NO rounded corners, bleeds to edge
- Image: `fill`, `object-cover`, cross-fade transition (opacity only, no x-slide)
- Left-side gradient bleeds over image: `absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent`
- Product name: `text-5xl xl:text-6xl font-black` white, positioned bottom-left of image via absolute
- Specs: horizontal pills bottom-left above name
- Nav: thin progress bar + `01 / 91` counter below image section

**Step 1: Create HeroVariantA.tsx**

```tsx
// client/src/components/home/hero/HeroVariantA.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Phone, SecurityCamera } from '@phosphor-icons/react';
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
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-lg transition-all duration-200 hover:scale-[1.02] focus-visible:outline-none"
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
              {phone}
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
```

**Step 2: Commit**

```bash
git add client/src/components/home/hero/HeroVariantA.tsx
git commit -m "feat: hero variant A — dark fullbleed with overlay text"
```

---

## Task 3: Variant B — "Hero Card Glow"

**Files:**
- Create: `client/src/components/home/hero/HeroVariantB.tsx`

**Design:**
- Layout: `grid lg:grid-cols-2 gap-12 items-center`
- Left: giant decorative number `01` (text-[8rem] lg:text-[12rem] opacity-5 absolute) behind title
- Right: card `rounded-2xl overflow-hidden border border-primary/40 shadow-[0_0_60px_hsl(var(--primary)/0.15)]`
- Transition: x-axis slide (dir-based)
- Nav: ← → buttons flanking card (absolute -left-5, -right-5)

**Step 1: Create HeroVariantB.tsx**

```tsx
// client/src/components/home/hero/HeroVariantB.tsx
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
```

**Step 2: Commit**

```bash
git add client/src/components/home/hero/HeroVariantB.tsx
git commit -m "feat: hero variant B — card glow with decorative slide number"
```

---

## Task 4: Variant C — "Split Screen Cinematic"

**Files:**
- Create: `client/src/components/home/hero/HeroVariantC.tsx`

**Design:**
- Full width, `min-h-[580px]`, `overflow-hidden`
- Left half: dark `bg-[hsl(var(--foreground)/0.96)] text-background` with content, `clip-path: polygon(0 0, 95% 0, 85% 100%, 0 100%)`
- Right half: image, no frame, fills remaining space
- Nav: two floating circles bottom-center of full component
- Transition: image slides from bottom, text crossfades

**Step 1: Create HeroVariantC.tsx**

```tsx
// client/src/components/home/hero/HeroVariantC.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Phone, CaretLeft, CaretRight, SecurityCamera } from '@phosphor-icons/react';
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
                <Phone size={16} weight="fill" /> {phone}
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
```

**Step 2: Commit**

```bash
git add client/src/components/home/hero/HeroVariantC.tsx
git commit -m "feat: hero variant C — split screen cinematic with diagonal divider"
```

---

## Task 5: Variant D — "Stacked Immersive"

**Files:**
- Create: `client/src/components/home/hero/HeroVariantD.tsx`

**Design:**
- Full-width image covers entire section, `min-h-[600px]`
- Heavy dark gradient bottom 60%: `from-black/90 via-black/50 to-transparent`
- Content bottom-left: category label + product name + specs
- Top-right badge: category pill + price
- Nav: vertical dots on far right edge (center-right)
- Transition: Ken Burns (scale 1.05→1.0 on enter, with `transition-transform duration-[6000ms]`)

**Step 1: Create HeroVariantD.tsx**

```tsx
// client/src/components/home/hero/HeroVariantD.tsx
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
```

**Step 2: Commit**

```bash
git add client/src/components/home/hero/HeroVariantD.tsx
git commit -m "feat: hero variant D — stacked immersive fullscreen with Ken Burns"
```

---

## Task 6: Rewrite HeroSection.tsx — orchestrator + dev switcher

**Files:**
- Modify: `client/src/components/home/HeroSection.tsx`

**Design:**
- `HeroSection` owns: `currentIndex`, `dir`, `heroVariant` ('A'|'B'|'C'|'D')
- On mount: read `localStorage.getItem('heroVariant')` and `?heroVariant=` from URL
- Renders selected variant component
- Dev switcher: floating pill `position: fixed bottom-4 right-4 z-50`, only shown in dev OR if query param present
- Switcher updates state + localStorage on change

**Step 1: Rewrite HeroSection.tsx**

```tsx
// client/src/components/home/HeroSection.tsx
'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Product, Locale } from '@/types/product.types';
import { HeroVariantA } from './hero/HeroVariantA';
import { HeroVariantB } from './hero/HeroVariantB';
import { HeroVariantC } from './hero/HeroVariantC';
import { HeroVariantD } from './hero/HeroVariantD';

// ── Types ──────────────────────────────────────────────────────────────────────

type HeroVariant = 'A' | 'B' | 'C' | 'D';

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

const VARIANT_LABELS: Record<HeroVariant, string> = {
  A: 'A — Dark Fullbleed',
  B: 'B — Card Glow',
  C: 'C — Split Cinematic',
  D: 'D — Stacked Immersive',
};

// ── Main HeroSection ───────────────────────────────────────────────────────────

export function HeroSection({ products, locale, phone, labels }: HeroSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [heroVariant, setHeroVariant] = useState<HeroVariant>('A');
  const [showSwitcher, setShowSwitcher] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const qp = searchParams.get('heroVariant') as HeroVariant | null;
    const stored = typeof window !== 'undefined' ? localStorage.getItem('heroVariant') as HeroVariant | null : null;
    const isDev = process.env.NODE_ENV === 'development';

    if (qp && ['A', 'B', 'C', 'D'].includes(qp)) {
      setHeroVariant(qp);
      setShowSwitcher(true);
    } else if (stored && ['A', 'B', 'C', 'D'].includes(stored)) {
      setHeroVariant(stored);
      if (isDev) setShowSwitcher(true);
    } else if (isDev) {
      setShowSwitcher(true);
    }
  }, [searchParams]);

  const handleNavigate = useCallback((i: number) => {
    setDir(i > currentIndex ? 1 : -1);
    setCurrentIndex(i);
  }, [currentIndex]);

  const handleVariantChange = (v: HeroVariant) => {
    setHeroVariant(v);
    if (typeof window !== 'undefined') localStorage.setItem('heroVariant', v);
  };

  if (products.length === 0) return null;

  const variantProps = { products, locale, phone, labels, currentIndex, dir, onNavigate: handleNavigate };

  return (
    <div className="relative">
      {heroVariant === 'A' && <HeroVariantA {...variantProps} />}
      {heroVariant === 'B' && <HeroVariantB {...variantProps} />}
      {heroVariant === 'C' && <HeroVariantC {...variantProps} />}
      {heroVariant === 'D' && <HeroVariantD {...variantProps} />}

      {/* Dev switcher */}
      {showSwitcher && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-xl bg-background/90 backdrop-blur-sm border border-border shadow-xl text-xs">
          <span className="text-muted-foreground font-medium select-none">Hero:</span>
          {(['A', 'B', 'C', 'D'] as HeroVariant[]).map((v) => (
            <button
              key={v}
              onClick={() => handleVariantChange(v)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all duration-150 cursor-pointer ${
                heroVariant === v
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add client/src/components/home/HeroSection.tsx
git commit -m "feat: hero orchestrator with A/B/C/D switcher + localStorage persistence"
```

---

## Task 7: Push and verify

**Step 1: Push**

```bash
git push
```

**Step 2: Verify in browser**

- Open `http://localhost:3000/ka`
- Dev switcher should appear bottom-right
- Click A/B/C/D — layout should switch live
- Reload — should persist chosen variant
- Navigate carousel — text + image should animate together

**Step 3: Test query param**

- Open `http://localhost:3000/ka?heroVariant=C` — should show variant C even in prod build
