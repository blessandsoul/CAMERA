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
