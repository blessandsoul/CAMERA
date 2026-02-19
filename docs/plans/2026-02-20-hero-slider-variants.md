# Hero Slider Variants Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the current HeroSection with 3 new promo slider variants (A, B, C) plus preserve the original as variant D, with a floating dev switcher to toggle between all 4.

**Architecture:** Each variant is a standalone `'use client'` component receiving the same props as the current HeroSection. A `HeroVariantSwitcher` dev-only floating button cycles A→B→C→D, storing the choice in `localStorage`. The page.tsx wraps all 4 and renders only the active one.

**Tech Stack:** Next.js App Router, TypeScript, Framer Motion, Tailwind CSS, Phosphor Icons, shadcn/ui conventions.

---

### Variant Descriptions

| Variant | Name | Core mechanic | "Click trigger" |
|---------|------|--------------|-----------------|
| **A** | Offer Card | Fullscreen product card: big image, crossed-out old price, badge "В наличии", giant CTA | Price shock + badge |
| **B** | Cinematic Hero | 100dvh full-bleed image, dark gradient overlay, text bottom-left, progress bar | Premium feel |
| **C** | Deal of the Day | Single focused product + live countdown timer to midnight, pulsing CTA | FOMO / urgency |
| **D** | Original | Current left-text + right-carousel (AndrewAltair) | Preserve as-is |

---

### Task 1: Backup current HeroSection as variant D

**Files:**
- Copy: `src/components/home/HeroSection.tsx` → `src/components/home/HeroSectionD.tsx`
- Modify: `src/components/home/HeroSectionD.tsx` — rename export only

**Step 1: Copy file**

```bash
cp client/src/components/home/HeroSection.tsx client/src/components/home/HeroSectionD.tsx
```

**Step 2: Rename export in HeroSectionD.tsx**

In `HeroSectionD.tsx`, rename:
- `export function HeroSection(` → `export function HeroSectionD(`
- Internal `Carousel` function → `CarouselD`
- Internal `ProductSpecTags` function → `ProductSpecTagsD`
(to avoid naming conflicts when all 4 are imported)

**Step 3: Commit**

```bash
git add client/src/components/home/HeroSectionD.tsx
git commit -m "feat: copy current hero as variant D (original)"
```

---

### Task 2: Create Variant A — "Offer Card" Slider

**Files:**
- Create: `client/src/components/home/HeroSectionA.tsx`

**Design spec:**
- Full-width card, `min-h-[520px]` on desktop
- Left half: product image (fill, object-cover) with dark gradient right-to-left
- Right half (or overlay on mobile): white/card background
  - Category badge (e.g. "📷 Камеры") top-left of text area
  - Product name: `text-3xl font-bold`
  - Old price (crossed out, `text-muted-foreground line-through`) + new price (`text-4xl font-black text-primary`)
  - "В наличии" badge: green dot + "В наличии" text
  - Spec tags: 3 key specs as pills
  - CTA: `bg-primary` button "Купить сейчас →" full-width on mobile
  - Secondary: "Смотреть все →" text link
- Bottom: dot indicators + prev/next arrows
- Autoplay: 4s, pause on hover
- Transition: slide left/right with Framer Motion

**Props interface** (same shape as current HeroSectionProps):
```typescript
interface HeroSectionAProps {
  products: Product[];
  locale: Locale;
  phone: string;
  labels: { heroTitle: string; heroSubtitle: string; heroCta: string; priceOnRequest: string; viewProduct: string; };
}
```

**Key implementation notes:**
- Show `product.price` as current price (in GEL)
- Fake old price = `Math.round(product.price * 1.25)` (25% markup shown as "was")
- Show first 3 specs from `product.specs`
- Use `useEffect` + `setInterval` for autoplay, clear on unmount
- Pause autoplay on `onMouseEnter`, resume on `onMouseLeave`

**Step 1: Create the file with full implementation**

```bash
# create client/src/components/home/HeroSectionA.tsx
```

```tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, SecurityCamera, CircleFill, CaretLeft, CaretRight, Tag } from '@phosphor-icons/react';
import type { Product, Locale } from '@/types/product.types';

interface HeroSectionAProps {
  products: Product[];
  locale: Locale;
  phone: string;
  labels: {
    heroTitle: string;
    heroSubtitle: string;
    heroCta: string;
    priceOnRequest: string;
    viewProduct: string;
  };
}

const AUTOPLAY_DELAY = 4000;

const CATEGORY_LABELS: Record<string, Record<string, string>> = {
  cameras:     { ka: 'კამერები',   ru: 'Камеры',    en: 'Cameras' },
  'nvr-kits':  { ka: 'NVR კომპლ.', ru: 'NVR Кит',   en: 'NVR Kit' },
  storage:     { ka: 'შენახვა',    ru: 'Накопители', en: 'Storage' },
  accessories: { ka: 'აქსეს.',     ru: 'Аксессуары', en: 'Accessories' },
  services:    { ka: 'სერვისი',    ru: 'Сервис',     en: 'Services' },
};

export function HeroSectionA({ products, locale, labels }: HeroSectionAProps) {
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = useCallback((next: number, direction: number) => {
    setDir(direction);
    setIdx(next);
  }, []);

  const prev = () => go((idx - 1 + products.length) % products.length, -1);
  const next = useCallback(() => go((idx + 1) % products.length, 1), [idx, products.length, go]);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(next, AUTOPLAY_DELAY);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [paused, next]);

  if (products.length === 0) return null;

  const p = products[idx];
  const name = p.name[locale] ?? p.name['en'] ?? '';
  const imgSrc = p.images[0] ? (p.images[0].startsWith('http') ? p.images[0] : `/images/products/${p.images[0]}`) : null;
  const fakeOldPrice = Math.round(p.price * 1.25);
  const catLabel = CATEGORY_LABELS[p.category]?.[locale] ?? p.category;
  const topSpecs = p.specs.slice(0, 3);

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <div
      className="relative w-full rounded-3xl overflow-hidden border border-border/50 shadow-xl bg-card"
      style={{ minHeight: '480px' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence mode="wait" custom={dir}>
        <motion.div
          key={p.id}
          custom={dir}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="absolute inset-0 grid grid-cols-1 lg:grid-cols-2"
        >
          {/* Left: image */}
          <div className="relative overflow-hidden bg-muted min-h-[220px] lg:min-h-0">
            {imgSrc ? (
              <Image src={imgSrc} alt={name} fill className="object-cover object-center" sizes="(max-width: 1024px) 100vw, 50vw" priority={idx === 0} />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <SecurityCamera size={80} weight="duotone" className="text-border/30" />
              </div>
            )}
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-transparent to-card/80 hidden lg:block" />
            <div className="absolute inset-0 bg-linear-to-t from-card/70 to-transparent lg:hidden" />

            {/* Category badge */}
            <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-md">
              <Tag size={12} weight="bold" />
              {catLabel}
            </span>
          </div>

          {/* Right: offer details */}
          <div className="flex flex-col justify-center gap-5 p-6 lg:p-10 z-10">
            {/* In stock */}
            <div className="inline-flex items-center gap-2 self-start">
              <CircleFill size={8} className="text-green-500 animate-pulse" weight="fill" />
              <span className="text-xs font-semibold text-green-600 uppercase tracking-wide">
                {locale === 'ru' ? 'В наличии' : locale === 'en' ? 'In Stock' : 'მარაგშია'}
              </span>
            </div>

            {/* Product name */}
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground leading-tight text-wrap-balance">
              {name}
            </h2>

            {/* Price */}
            {p.price > 0 ? (
              <div className="flex items-baseline gap-3">
                <span className="text-4xl lg:text-5xl font-black text-primary tabular-nums">
                  {p.price} {p.currency}
                </span>
                <span className="text-lg text-muted-foreground line-through tabular-nums">
                  {fakeOldPrice} {p.currency}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-destructive/10 text-destructive text-xs font-bold">
                  -20%
                </span>
              </div>
            ) : (
              <p className="text-xl font-semibold text-muted-foreground">{labels.priceOnRequest}</p>
            )}

            {/* Spec pills */}
            {topSpecs.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {topSpecs.map((spec, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border border-border/60 bg-muted/50">
                    <span className="text-muted-foreground/70">{spec.key[locale] ?? spec.key['en']}:</span>
                    <span className="font-semibold">{spec.value}</span>
                  </span>
                ))}
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <Link
                href={`/${locale}/catalog/${p.slug}`}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base shadow-lg transition-all duration-200 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 active:scale-[0.98]"
              >
                {locale === 'ru' ? 'Купить сейчас' : locale === 'en' ? 'Buy Now' : 'შეძენა'}
                <ArrowRight size={18} weight="bold" />
              </Link>
              <Link
                href={`/${locale}/catalog`}
                className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl border border-border hover:border-primary/40 font-medium text-sm transition-colors duration-200 hover:bg-primary/5"
              >
                {labels.heroCta}
              </Link>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      {products.length > 1 && (
        <>
          {/* Arrows */}
          <button onClick={(e) => { e.preventDefault(); prev(); }} className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm border border-border/60 flex items-center justify-center hover:bg-card shadow-md transition-all hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50" aria-label="Previous"><CaretLeft size={16} weight="bold" /></button>
          <button onClick={(e) => { e.preventDefault(); next(); }} className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm border border-border/60 flex items-center justify-center hover:bg-card shadow-md transition-all hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50" aria-label="Next"><CaretRight size={16} weight="bold" /></button>

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-border/30 z-20">
            <motion.div
              key={`${idx}-${paused}`}
              className="h-full bg-primary"
              initial={{ width: '0%' }}
              animate={{ width: paused ? undefined : '100%' }}
              transition={{ duration: AUTOPLAY_DELAY / 1000, ease: 'linear' }}
            />
          </div>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
            {products.map((_, i) => (
              <button key={i} onClick={() => go(i, i > idx ? 1 : -1)} className={`rounded-full transition-all duration-300 ${i === idx ? 'w-6 h-2 bg-primary' : 'w-2 h-2 bg-border hover:bg-primary/50'}`} aria-label={`Slide ${i + 1}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add client/src/components/home/HeroSectionA.tsx
git commit -m "feat: add hero variant A — offer card slider"
```

---

### Task 3: Create Variant B — "Cinematic Hero"

**Files:**
- Create: `client/src/components/home/HeroSectionB.tsx`

**Design spec:**
- 100dvh (or `min-h-[600px]` for safety) full-bleed
- Background: product image fills entire section
- Dark overlay: `bg-linear-to-t from-black/80 via-black/40 to-black/10`
- Text anchored bottom-left (absolute positioned):
  - Small category badge
  - Product name: `text-4xl lg:text-6xl font-black text-white`
  - Price large white
  - Spec pills: dark glass style `bg-white/10 backdrop-blur border-white/20 text-white`
  - CTA: white button with dark text (inverted) — stands out on dark background
- Right side: slide counter `01 / 05` in monospace white
- Bottom: thin white progress bar spanning full width
- Transition: crossfade (opacity only) — cinematic feel
- Autoplay: 5s

**Step 1: Create the file**

```tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, SecurityCamera } from '@phosphor-icons/react';
import type { Product, Locale } from '@/types/product.types';

interface HeroSectionBProps {
  products: Product[];
  locale: Locale;
  phone: string;
  labels: {
    heroTitle: string;
    heroSubtitle: string;
    heroCta: string;
    priceOnRequest: string;
    viewProduct: string;
  };
}

const AUTOPLAY_DELAY = 5000;

export function HeroSectionB({ products, locale, labels }: HeroSectionBProps) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const nextFn = useCallback(() => setIdx(i => (i + 1) % products.length), [products.length]);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(nextFn, AUTOPLAY_DELAY);
    return () => clearInterval(t);
  }, [paused, nextFn]);

  if (products.length === 0) return null;

  const p = products[idx];
  const name = p.name[locale] ?? p.name['en'] ?? '';
  const imgSrc = p.images[0] ? (p.images[0].startsWith('http') ? p.images[0] : `/images/products/${p.images[0]}`) : null;
  const topSpecs = p.specs.slice(0, 4);

  return (
    <div
      className="relative w-full overflow-hidden rounded-3xl"
      style={{ minHeight: 'clamp(480px, 70dvh, 720px)' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background image */}
      <AnimatePresence mode="wait">
        <motion.div
          key={p.id + '-bg'}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute inset-0"
        >
          {imgSrc ? (
            <Image src={imgSrc} alt={name} fill className="object-cover object-center" sizes="100vw" priority={idx === 0} />
          ) : (
            <div className="absolute inset-0 bg-muted flex items-center justify-center">
              <SecurityCamera size={120} weight="duotone" className="text-border/20" />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/40 to-black/10 z-10" />
      <div className="absolute inset-0 bg-linear-to-r from-black/50 to-transparent z-10" />

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={p.id + '-content'}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="absolute bottom-0 left-0 right-0 z-20 p-8 lg:p-12"
        >
          <div className="max-w-2xl space-y-4">
            {/* Slide counter */}
            <div className="absolute top-8 right-8 text-white/50 font-mono text-sm tabular-nums">
              {String(idx + 1).padStart(2, '0')} / {String(products.length).padStart(2, '0')}
            </div>

            {/* Spec pills */}
            {topSpecs.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {topSpecs.map((spec, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white/10 backdrop-blur-sm border border-white/20 text-white/90">
                    <span className="text-white/50">{spec.key[locale] ?? spec.key['en']}:</span>
                    <span className="font-semibold">{spec.value}</span>
                  </span>
                ))}
              </div>
            )}

            {/* Name */}
            <h2 className="text-4xl lg:text-6xl font-black text-white leading-tight tracking-tight text-wrap-balance">
              {name}
            </h2>

            {/* Price + CTA row */}
            <div className="flex items-center gap-6 pt-2">
              {p.price > 0 && (
                <span className="text-3xl font-black text-white tabular-nums">
                  {p.price} <span className="text-white/60 text-xl font-bold">{p.currency}</span>
                </span>
              )}
              <Link
                href={`/${locale}/catalog/${p.slug}`}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white hover:bg-white/95 text-black font-bold text-base shadow-2xl transition-all duration-200 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40 active:scale-[0.98]"
              >
                {locale === 'ru' ? 'Подробнее' : locale === 'en' ? 'View Product' : 'დეტალები'}
                <ArrowRight size={18} weight="bold" />
              </Link>
              <Link
                href={`/${locale}/catalog`}
                className="text-white/70 hover:text-white text-sm font-medium transition-colors underline-offset-4 hover:underline"
              >
                {labels.heroCta}
              </Link>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Dot nav */}
      {products.length > 1 && (
        <div className="absolute bottom-8 right-8 z-30 flex flex-col gap-1.5">
          {products.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)} className={`rounded-full transition-all duration-300 ${i === idx ? 'h-6 w-1.5 bg-white' : 'h-1.5 w-1.5 bg-white/40 hover:bg-white/70'}`} aria-label={`Slide ${i + 1}`} />
          ))}
        </div>
      )}

      {/* Progress bar bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10 z-30">
        <motion.div
          key={`${idx}-${paused}`}
          className="h-full bg-white/60"
          initial={{ width: '0%' }}
          animate={{ width: paused ? undefined : '100%' }}
          transition={{ duration: AUTOPLAY_DELAY / 1000, ease: 'linear' }}
        />
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add client/src/components/home/HeroSectionB.tsx
git commit -m "feat: add hero variant B — cinematic fullbleed hero"
```

---

### Task 4: Create Variant C — "Deal of the Day" with Countdown

**Files:**
- Create: `client/src/components/home/HeroSectionC.tsx`

**Design spec:**
- Single featured product (first `isFeatured=true`, or first in list)
- Two-column: left = big product image with "DEAL OF THE DAY" overlay badge; right = offer details
- Countdown timer: live, counts down to midnight (00:00:00 local time)
  - 3 blocks: HH | MM | SS, each in a pill/card with dark bg
  - Label above: "Осталось" / "Remaining" / "დარჩა"
- Price: very large, primary color
- "Срочно заказать" button with red pulsing ring animation (`animate-ping` on ring)
- Urgency text below CTA: "Только сегодня по этой цене"
- WhatsApp CTA below that

**Countdown implementation:**
```typescript
function useCountdown() {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 });
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const midnight = new Date(now); midnight.setHours(24, 0, 0, 0);
      const diff = Math.floor((midnight.getTime() - now.getTime()) / 1000);
      setTime({ h: Math.floor(diff / 3600), m: Math.floor((diff % 3600) / 60), s: diff % 60 });
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);
  return time;
}
```

**Step 1: Create the file**

```tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Phone, Fire, SecurityCamera, Clock } from '@phosphor-icons/react';
import type { Product, Locale } from '@/types/product.types';

interface HeroSectionCProps {
  products: Product[];
  locale: Locale;
  phone: string;
  labels: {
    heroTitle: string;
    heroSubtitle: string;
    heroCta: string;
    priceOnRequest: string;
    viewProduct: string;
  };
}

function useCountdown() {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 });
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const midnight = new Date(now); midnight.setHours(24, 0, 0, 0);
      const diff = Math.floor((midnight.getTime() - now.getTime()) / 1000);
      setTime({ h: Math.floor(diff / 3600), m: Math.floor((diff % 3600) / 60), s: diff % 60 });
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);
  return time;
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="w-16 h-16 rounded-xl bg-foreground text-background flex items-center justify-center font-black text-2xl tabular-nums shadow-lg">
        {String(value).padStart(2, '0')}
      </div>
      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</span>
    </div>
  );
}

export function HeroSectionC({ products, locale, phone, labels }: HeroSectionCProps) {
  const time = useCountdown();

  const deal = products.find(p => p.isFeatured) ?? products[0];
  if (!deal) return null;

  const name = deal.name[locale] ?? deal.name['en'] ?? '';
  const imgSrc = deal.images[0] ? (deal.images[0].startsWith('http') ? deal.images[0] : `/images/products/${deal.images[0]}`) : null;
  const fakeOldPrice = Math.round(deal.price * 1.3);
  const topSpecs = deal.specs.slice(0, 4);

  const urgencyText = { ka: 'მხოლოდ დღეს ამ ფასად', ru: 'Только сегодня по этой цене', en: 'Today only at this price' }[locale];
  const countdownLabel = { ka: 'სთავაზობა მთავრდება', ru: 'Предложение заканчивается', en: 'Offer ends in' }[locale];
  const hoursLabel = { ka: 'სთ', ru: 'Ч', en: 'H' }[locale];
  const minLabel = { ka: 'წთ', ru: 'МИН', en: 'MIN' }[locale];
  const secLabel = { ka: 'წმ', ru: 'СЕК', en: 'SEC' }[locale];

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-border/50 shadow-xl bg-card">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[520px]">

        {/* Left: Image */}
        <div className="relative overflow-hidden bg-muted min-h-[280px] lg:min-h-0">
          {imgSrc ? (
            <Image src={imgSrc} alt={name} fill className="object-cover object-center" sizes="(max-width: 1024px) 100vw, 50vw" priority />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <SecurityCamera size={100} weight="duotone" className="text-border/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent lg:hidden" />

          {/* "DEAL" badge */}
          <div className="absolute top-4 left-4 z-10">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-destructive text-destructive-foreground font-black text-sm shadow-lg shadow-destructive/30"
            >
              <Fire size={16} weight="fill" />
              {locale === 'ru' ? 'ГОРЯЧЕЕ ПРЕДЛОЖЕНИЕ' : locale === 'en' ? 'HOT DEAL' : 'ცხელი შეთავაზება'}
            </motion.div>
          </div>
        </div>

        {/* Right: Deal details */}
        <div className="flex flex-col justify-center gap-5 p-6 lg:p-10">

          {/* Countdown */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              <Clock size={12} />
              {countdownLabel}
            </div>
            <div className="flex items-center gap-3">
              <TimeBlock value={time.h} label={hoursLabel} />
              <span className="text-2xl font-black text-foreground mb-4">:</span>
              <TimeBlock value={time.m} label={minLabel} />
              <span className="text-2xl font-black text-foreground mb-4">:</span>
              <TimeBlock value={time.s} label={secLabel} />
            </div>
          </div>

          {/* Product name */}
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground leading-tight text-wrap-balance">
            {name}
          </h2>

          {/* Price */}
          {deal.price > 0 ? (
            <div className="flex items-baseline gap-3">
              <span className="text-4xl lg:text-5xl font-black text-primary tabular-nums">
                {deal.price} {deal.currency}
              </span>
              <span className="text-xl text-muted-foreground line-through tabular-nums">
                {fakeOldPrice} {deal.currency}
              </span>
            </div>
          ) : (
            <p className="text-xl font-semibold text-muted-foreground">{labels.priceOnRequest}</p>
          )}

          {/* Specs */}
          {topSpecs.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {topSpecs.map((spec, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border border-border/60 bg-muted/50">
                  <span className="text-muted-foreground/70">{spec.key[locale] ?? spec.key['en']}:</span>
                  <span className="font-semibold">{spec.value}</span>
                </span>
              ))}
            </div>
          )}

          {/* CTA — pulsing ring */}
          <div className="flex flex-col gap-3 pt-1">
            <div className="relative self-start w-full sm:w-auto">
              <span className="absolute -inset-1 rounded-xl bg-destructive/30 motion-safe:animate-ping" aria-hidden="true" />
              <Link
                href={`/${locale}/catalog/${deal.slug}`}
                className="relative inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground font-black text-base shadow-lg shadow-destructive/20 transition-all duration-200 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/50 active:scale-[0.98]"
              >
                {locale === 'ru' ? 'Срочно заказать' : locale === 'en' ? 'Order Now' : 'შეკვეთა'}
                <ArrowRight size={18} weight="bold" />
              </Link>
            </div>
            <p className="text-xs text-destructive font-semibold">{urgencyText}</p>
            <a
              href={`https://wa.me/995${phone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Phone size={14} weight="fill" />
              {phone}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add client/src/components/home/HeroSectionC.tsx
git commit -m "feat: add hero variant C — deal of the day with countdown"
```

---

### Task 5: Create HeroVariantSwitcher (dev floating button)

**Files:**
- Create: `client/src/components/home/HeroVariantSwitcher.tsx`

**Design spec:**
- Fixed position: `fixed bottom-6 right-6 z-50`
- Only visible in dev: `process.env.NODE_ENV !== 'production'` check
- Pill-shaped button group or dropdown showing A / B / C / D
- Active variant highlighted in primary
- Stores selection in `localStorage` key `hero_variant`
- On mount: reads from localStorage (default = 'A')

```tsx
'use client';

import { useState, useEffect } from 'react';

type Variant = 'A' | 'B' | 'C' | 'D';
const STORAGE_KEY = 'hero_variant';
const VARIANTS: Variant[] = ['A', 'B', 'C', 'D'];

interface HeroVariantSwitcherProps {
  value: Variant;
  onChange: (v: Variant) => void;
}

export function HeroVariantSwitcher({ value, onChange }: HeroVariantSwitcherProps) {
  if (process.env.NODE_ENV === 'production') return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-1 p-1 rounded-xl bg-background/90 backdrop-blur-md border border-border shadow-xl" role="group" aria-label="Hero variant switcher">
      <span className="text-xs font-bold text-muted-foreground px-2">Hero:</span>
      {VARIANTS.map(v => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={`w-9 h-9 rounded-lg text-sm font-black transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${value === v ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
          aria-pressed={value === v}
          aria-label={`Variant ${v}`}
        >
          {v}
        </button>
      ))}
    </div>
  );
}

// Hook for using in page
export function useHeroVariant() {
  const [variant, setVariant] = useState<Variant>('A');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Variant | null;
    if (stored && VARIANTS.includes(stored)) setVariant(stored);
  }, []);

  const handleChange = (v: Variant) => {
    setVariant(v);
    localStorage.setItem(STORAGE_KEY, v);
  };

  return { variant, handleChange };
}
```

**Step 2: Commit**

```bash
git add client/src/components/home/HeroVariantSwitcher.tsx
git commit -m "feat: add HeroVariantSwitcher dev floating UI"
```

---

### Task 6: Create HeroRouter — renders active variant

**Files:**
- Create: `client/src/components/home/HeroRouter.tsx`

**Purpose:** Client component that reads variant from localStorage and renders A/B/C/D accordingly. Keeps page.tsx as a Server Component.

```tsx
'use client';

import { HeroSectionA } from './HeroSectionA';
import { HeroSectionB } from './HeroSectionB';
import { HeroSectionC } from './HeroSectionC';
import { HeroSectionD } from './HeroSectionD';
import { HeroVariantSwitcher, useHeroVariant } from './HeroVariantSwitcher';
import type { Product, Locale } from '@/types/product.types';

interface HeroRouterProps {
  products: Product[];
  locale: Locale;
  phone: string;
  labels: {
    heroTitle: string; heroSubtitle: string; heroCta: string;
    all: string; cameras: string; nvrKits: string; storage: string;
    accessories: string; services: string; priceOnRequest: string; viewProduct: string;
  };
}

export function HeroRouter({ products, locale, phone, labels }: HeroRouterProps) {
  const { variant, handleChange } = useHeroVariant();

  const sharedProps = { products, locale, phone, labels };

  return (
    <>
      {variant === 'A' && <HeroSectionA {...sharedProps} />}
      {variant === 'B' && <HeroSectionB {...sharedProps} />}
      {variant === 'C' && <HeroSectionC {...sharedProps} />}
      {variant === 'D' && <HeroSectionD {...sharedProps} />}
      <HeroVariantSwitcher value={variant} onChange={handleChange} />
    </>
  );
}
```

**Step 2: Commit**

```bash
git add client/src/components/home/HeroRouter.tsx
git commit -m "feat: add HeroRouter — renders active variant + dev switcher"
```

---

### Task 7: Wire HeroRouter into page.tsx

**Files:**
- Modify: `client/src/app/[locale]/page.tsx`

**Change:** Replace the `<HeroSection ...>` import and usage with `<HeroRouter ...>`.

**Step 1: Update import**

Replace:
```tsx
import { HeroSection } from '@/components/home/HeroSection';
```
With:
```tsx
import { HeroRouter } from '@/components/home/HeroRouter';
```

**Step 2: Replace component usage**

Replace:
```tsx
<HeroSection
  products={allProducts}
  locale={locale as Locale}
  phone={phone}
  labels={{...}}
/>
```
With:
```tsx
<HeroRouter
  products={allProducts}
  locale={locale as Locale}
  phone={phone}
  labels={{...}}
/>
```

**Step 3: Verify dev server starts, switcher appears bottom-right**

```bash
cd client && npm run dev
```

Open http://localhost:3000/ru — look for A/B/C/D switcher in bottom-right corner.

**Step 4: Commit**

```bash
git add client/src/app/[locale]/page.tsx
git commit -m "feat: wire HeroRouter into homepage — 4 hero variants selectable"
git push
```

---

### Task 8: QA checklist

- [ ] Variant A: autoplay starts, progress bar animates, dots navigate, image fills left, price visible
- [ ] Variant B: fullbleed image, text bottom-left, cinematic crossfade, slide counter top-right
- [ ] Variant C: countdown ticks every second, pulsing CTA ring, single featured product shown
- [ ] Variant D: original layout preserved exactly
- [ ] Switcher: persists after page refresh (localStorage)
- [ ] Switcher: hidden in production build (`npm run build && npm start`)
- [ ] Mobile: all 4 variants stack properly
- [ ] No TypeScript errors: `npm run type-check` or `tsc --noEmit`
- [ ] No `any` types used

---

### Summary

| Task | Deliverable |
|------|-------------|
| 1 | `HeroSectionD.tsx` — original preserved |
| 2 | `HeroSectionA.tsx` — offer card slider |
| 3 | `HeroSectionB.tsx` — cinematic hero |
| 4 | `HeroSectionC.tsx` — deal + countdown |
| 5 | `HeroVariantSwitcher.tsx` + `useHeroVariant` hook |
| 6 | `HeroRouter.tsx` — variant dispatcher |
| 7 | `page.tsx` — wired to HeroRouter |
| 8 | QA pass |
