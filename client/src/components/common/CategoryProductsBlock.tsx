import Link from 'next/link';
import {
  SecurityCamera,
  HardDrive,
  Wrench,
  Package,
  Toolbox,
} from '@phosphor-icons/react/dist/ssr';
import { getTranslations } from 'next-intl/server';
import { ProductMiniCard } from './ProductMiniCard';
import type { Product, Locale, ProductCategory } from '@/types/product.types';

interface CategoryMeta {
  value: ProductCategory;
  labelKa: string;
  labelRu: string;
  labelEn: string;
  icon: React.ReactNode;
}

const CATEGORIES: CategoryMeta[] = [
  { value: 'cameras',     labelKa: 'კამერები',       labelRu: 'Камеры',       labelEn: 'Cameras',     icon: <SecurityCamera size={18} weight="duotone" aria-hidden="true" /> },
  { value: 'nvr-kits',    labelKa: 'NVR კომპლექტი',  labelRu: 'NVR Комплект', labelEn: 'NVR Kits',    icon: <Package        size={18} weight="duotone" aria-hidden="true" /> },
  { value: 'storage',     labelKa: 'მეხსიერება',     labelRu: 'Хранилище',    labelEn: 'Storage',     icon: <HardDrive      size={18} weight="duotone" aria-hidden="true" /> },
  { value: 'accessories', labelKa: 'აქსესუარები',    labelRu: 'Аксессуары',   labelEn: 'Accessories', icon: <Toolbox        size={18} weight="duotone" aria-hidden="true" /> },
  { value: 'services',    labelKa: 'სერვისი',        labelRu: 'Сервис',       labelEn: 'Services',    icon: <Wrench         size={18} weight="duotone" aria-hidden="true" /> },
];

interface CategoryProductsBlockProps {
  products: Product[];
  locale: Locale;
}

export async function CategoryProductsBlock({ products, locale }: CategoryProductsBlockProps) {
  const t = await getTranslations();

  const inStockLabel =
    locale === 'ru' ? 'В наличии' : locale === 'en' ? 'In Stock' : 'მარაგშია';

  const priceOnRequest = t('catalog.price_on_request');

  const categoryLabels: Record<string, string> = {
    cameras:     t('catalog.cameras'),
    'nvr-kits':  t('catalog.nvr_kits'),
    storage:     t('catalog.storage'),
    accessories: t('catalog.accessories'),
    services:    t('catalog.services'),
  };

  return (
    <div className="rounded-2xl border border-border/50 bg-card shadow-sm p-4 md:p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {CATEGORIES.map((cat) => {
          const label =
            locale === 'ru' ? cat.labelRu :
            locale === 'en' ? cat.labelEn :
            cat.labelKa;

          const catProducts = products
            .filter((p) => p.category === cat.value)
            .slice(0, 5);

          const count = products.filter((p) => p.category === cat.value).length;

          return (
            <div key={cat.value} className="flex flex-col gap-3">
              {/* Category header */}
              <Link
                href={`/${locale}/catalog?category=${cat.value}`}
                className="group flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-lg"
              >
                <span className="text-primary/70 group-hover:text-primary transition-colors duration-200 shrink-0">
                  {cat.icon}
                </span>
                <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors duration-200 truncate">
                  {label}
                </span>
                {count > 0 && (
                  <span className="ml-auto text-[10px] font-bold tabular-nums text-muted-foreground bg-muted border border-border/50 px-1.5 py-px rounded-full leading-none shrink-0">
                    {count}
                  </span>
                )}
              </Link>

              {/* Product cards */}
              <div className="flex flex-col gap-2">
                {catProducts.map((product) => (
                  <ProductMiniCard
                    key={product.id}
                    product={product}
                    locale={locale}
                    inStockLabel={inStockLabel}
                    priceOnRequestLabel={priceOnRequest}
                    categoryLabels={categoryLabels}
                  />
                ))}
              </div>

              {count > 5 && (
                <Link
                  href={`/${locale}/catalog?category=${cat.value}`}
                  className="text-xs font-semibold text-primary/70 hover:text-primary transition-colors duration-150 focus-visible:outline-none"
                >
                  + {count - 5} {locale === 'ru' ? 'ещё' : locale === 'en' ? 'more' : 'მეტი'}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
