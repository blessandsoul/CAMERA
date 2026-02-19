import type { ProductCategory } from '@/types/product.types';

export const CATEGORIES: { value: ProductCategory | 'all'; labelKey: string }[] = [
  { value: 'all', labelKey: 'catalog.all' },
  { value: 'cameras', labelKey: 'catalog.cameras' },
  { value: 'nvr-kits', labelKey: 'catalog.nvr_kits' },
  { value: 'accessories', labelKey: 'catalog.accessories' },
  { value: 'storage', labelKey: 'catalog.storage' },
  { value: 'services', labelKey: 'catalog.services' },
];

export const PHONE = process.env.NEXT_PUBLIC_PHONE ?? '597470518';
