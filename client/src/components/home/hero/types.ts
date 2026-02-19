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
