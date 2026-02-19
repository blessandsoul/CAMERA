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
            <div className="flex items-baseline gap-3 flex-wrap">
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
