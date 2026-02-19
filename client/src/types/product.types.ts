export type ProductCategory = 'cameras' | 'nvr-kits' | 'storage' | 'services' | 'accessories';
export type Locale = 'ka' | 'ru' | 'en';
export type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'name-asc';

export interface LocalizedString {
  ka: string;
  ru: string;
  en: string;
}

export interface ProductSpec {
  key: LocalizedString;
  value: string;
}

export interface Product {
  id: string;
  slug: string;
  category: ProductCategory;
  price: number;
  currency: string;
  isActive: boolean;
  isFeatured: boolean;
  images: string[];
  name: LocalizedString;
  description: LocalizedString;
  specs: ProductSpec[];
  createdAt: string;
  content?: string; // MDX body (rich description)
}
