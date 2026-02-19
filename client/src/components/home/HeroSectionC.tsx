'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Phone, Fire, SecurityCamera } from '@phosphor-icons/react';
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

function useCountdown(): { h: number; m: number; s: number } {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 });
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
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
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-foreground text-background flex items-center justify-center font-black text-xl sm:text-2xl tabular-nums shadow-lg">
        {String(value).padStart(2, '0')}
      </div>
      <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{label}</span>
    </div>
  );
}

export function HeroSectionC({ products, locale, phone, labels }: HeroSectionCProps) {
  const time = useCountdown();

  const deal = products.find(p => p.isFeatured) ?? products[0];
  if (!deal) return null;

  const name = deal.name[locale] ?? deal.name['en'] ?? '';
  const imgSrc = deal.images[0]
    ? deal.images[0].startsWith('http') ? deal.images[0] : `/images/products/${deal.images[0]}`
    : null;
  const fakeOldPrice = Math.round(deal.price * 1.3);
  const topSpecs = deal.specs.slice(0, 4);

  const urgencyText = { ka: 'მხოლოდ დღეს ამ ფასად', ru: 'Только сегодня по этой цене', en: 'Today only at this price' }[locale];
  const offerLabel = { ka: 'შეთავაზება მთავრდება', ru: 'Предложение заканчивается', en: 'Offer ends in' }[locale];
  const hoursLabel = { ka: 'სთ', ru: 'Ч', en: 'H' }[locale];
  const minLabel   = { ka: 'წთ', ru: 'МИН', en: 'MIN' }[locale];
  const secLabel   = { ka: 'წმ', ru: 'СЕК', en: 'SEC' }[locale];

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-border/50 shadow-xl bg-card">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-125 lg:min-h-120">

        {/* ── LEFT: Image — top on mobile ── */}
        <div className="relative overflow-hidden bg-muted min-h-56 lg:min-h-0 order-1">
          {imgSrc ? (
            <Image
              src={imgSrc}
              alt={name}
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <SecurityCamera size={100} weight="duotone" className="text-border/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent lg:hidden" />

          {/* HOT DEAL badge */}
          <div className="absolute top-4 left-4 z-10">
            <motion.div
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-destructive text-destructive-foreground font-black text-xs shadow-lg shadow-destructive/30"
            >
              <Fire size={14} weight="fill" />
              {locale === 'ru' ? 'ГОРЯЧЕЕ ПРЕДЛОЖЕНИЕ' : locale === 'en' ? 'HOT DEAL' : 'ცხელი შეთავაზება'}
            </motion.div>
          </div>

          {/* Countdown — top right of image */}
          <div className="absolute top-4 right-4 z-10">
            <div className="flex flex-col items-end gap-1.5 bg-background/85 backdrop-blur-md rounded-2xl px-3 py-2.5 border border-border/50 shadow-lg">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                {offerLabel}
              </span>
              <div className="flex items-center gap-1.5">
                <TimeBlock value={time.h} label={hoursLabel} />
                <span className="text-lg font-black text-foreground leading-none mb-3">:</span>
                <TimeBlock value={time.m} label={minLabel} />
                <span className="text-lg font-black text-foreground leading-none mb-3">:</span>
                <TimeBlock value={time.s} label={secLabel} />
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Deal details — bottom on mobile ── */}
        <div className="flex flex-col justify-center gap-4 p-6 lg:p-10 order-2 lg:border-l border-t lg:border-t-0 border-border/30">

          {/* Product name */}
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground leading-tight text-wrap-balance">
            {name}
          </h2>

          {/* Price */}
          {deal.price > 0 ? (
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl lg:text-4xl font-black text-primary tabular-nums">
                {deal.price}
                <span className="text-base font-bold ml-1 text-primary/70">{deal.currency}</span>
              </span>
              <span className="text-base text-muted-foreground line-through tabular-nums">
                {fakeOldPrice} {deal.currency}
              </span>
              <span className="text-xs font-black text-destructive bg-destructive/8 border border-destructive/15 px-2 py-0.5 rounded-md">
                −23%
              </span>
            </div>
          ) : (
            <p className="text-lg font-semibold text-muted-foreground">{labels.priceOnRequest}</p>
          )}

          {/* Specs */}
          {topSpecs.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {topSpecs.map((spec, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium border border-border/60 bg-muted/50">
                  <span className="text-muted-foreground/70">{spec.key[locale] ?? spec.key['en']}:</span>
                  <span className="font-semibold">{spec.value}</span>
                </span>
              ))}
            </div>
          )}

          {/* CTA — pulsing ring */}
          <div className="flex flex-col gap-3 pt-1">
            <div className="relative self-stretch sm:self-start">
              <span className="absolute -inset-1 rounded-xl bg-destructive/25 motion-safe:animate-ping" aria-hidden="true" />
              <Link
                href={`/${locale}/catalog/${deal.slug}`}
                className="relative inline-flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground font-black text-sm shadow-lg shadow-destructive/20 transition-all duration-200 motion-safe:hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/50 active:scale-[0.98] cursor-pointer"
              >
                {locale === 'ru' ? 'Срочно заказать' : locale === 'en' ? 'Order Now' : 'შეკვეთა'}
                <ArrowRight size={16} weight="bold" />
              </Link>
            </div>
            <p className="text-xs text-destructive font-semibold">{urgencyText}</p>
            <a
              href={`https://wa.me/995${phone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
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
