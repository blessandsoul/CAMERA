import Image from 'next/image';
import Link from 'next/link';
import {
  SecurityCamera,
  HardDrive,
  Wrench,
  Package,
  Toolbox,
} from '@phosphor-icons/react/dist/ssr';
import type { Product, Locale, ProductCategory } from '@/types/product.types';

interface CategoryMeta {
  value: ProductCategory;
  labelKa: string;
  labelRu: string;
  labelEn: string;
  icon: React.ReactNode;
}

const CATEGORIES: CategoryMeta[] = [
  { value: 'cameras',     labelKa: 'კამერები',       labelRu: 'Камеры',      labelEn: 'Cameras',     icon: <SecurityCamera size={20} weight="duotone" aria-hidden="true" /> },
  { value: 'nvr-kits',    labelKa: 'NVR კომპლექტი',  labelRu: 'NVR Комплект',labelEn: 'NVR Kits',    icon: <Package size={20} weight="duotone" aria-hidden="true" /> },
  { value: 'storage',     labelKa: 'მეხსიერება',     labelRu: 'Хранилище',   labelEn: 'Storage',     icon: <HardDrive size={20} weight="duotone" aria-hidden="true" /> },
  { value: 'accessories', labelKa: 'აქსესუარები',    labelRu: 'Аксессуары',  labelEn: 'Accessories', icon: <Toolbox size={20} weight="duotone" aria-hidden="true" /> },
  { value: 'services',    labelKa: 'სერვისი',        labelRu: 'Сервис',      labelEn: 'Services',    icon: <Wrench size={20} weight="duotone" aria-hidden="true" /> },
];

interface CategoryProductsBlockProps {
  products: Product[];
  locale: Locale;
}

export function CategoryProductsBlock({ products, locale }: CategoryProductsBlockProps) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card shadow-sm p-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {CATEGORIES.map((cat) => {
          const label = locale === 'ru' ? cat.labelRu : locale === 'en' ? cat.labelEn : cat.labelKa;
          const catProducts = products.filter((p) => p.category === cat.value).slice(0, 3);
          const count = products.filter((p) => p.category === cat.value).length;

          return (
            <div key={cat.value} className="flex flex-col gap-2">
              {/* Category header */}
              <Link
                href={`/${locale}/catalog?category=${cat.value}`}
                className="group flex items-center gap-2 px-3 py-2 rounded-lg border border-border/40 bg-muted/40 hover:bg-primary/5 hover:border-primary/30 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                <span className="text-primary/70 group-hover:text-primary transition-colors duration-200 shrink-0">
                  {cat.icon}
                </span>
                <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors duration-200 truncate leading-tight">
                  {label}
                </span>
                {count > 0 && (
                  <span className="ml-auto text-[10px] font-bold tabular-nums text-muted-foreground bg-muted border border-border/50 px-1.5 py-px rounded-full leading-none shrink-0">
                    {count}
                  </span>
                )}
              </Link>

              {/* Mini product cards */}
              <div className="flex flex-col gap-1.5">
                {catProducts.map((product) => {
                  const name = product.name[locale] ?? product.name['en'] ?? '';
                  const imgSrc = product.images.length > 0
                    ? (product.images[0].startsWith('http') ? product.images[0] : `/images/products/${product.images[0]}`)
                    : null;
                  const isService = product.category === 'services';

                  return (
                    <Link
                      key={product.id}
                      href={`/${locale}/catalog/${product.id}`}
                      className="group flex items-center gap-2 p-2 rounded-lg hover:bg-muted/60 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                    >
                      {/* Thumbnail */}
                      <div className="w-10 h-10 rounded-md overflow-hidden bg-muted border border-border/40 shrink-0 relative">
                        {imgSrc ? (
                          <Image
                            src={imgSrc}
                            alt={name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="40px"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <SecurityCamera size={16} weight="duotone" className="text-border/50" aria-hidden="true" />
                          </div>
                        )}
                      </div>

                      {/* Name + price */}
                      <div className="flex flex-col min-w-0">
                        <span className="text-[11px] font-medium text-foreground group-hover:text-primary transition-colors duration-150 line-clamp-2 leading-tight">
                          {name}
                        </span>
                        {!isService && product.price > 0 && (
                          <span className="text-[10px] font-bold text-primary tabular-nums mt-0.5">
                            {product.price}₾
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}

                {count > 3 && (
                  <Link
                    href={`/${locale}/catalog?category=${cat.value}`}
                    className="text-[10px] font-semibold text-primary/70 hover:text-primary transition-colors duration-150 px-2 focus-visible:outline-none"
                  >
                    + {count - 3} {locale === 'ru' ? 'ещё' : locale === 'en' ? 'more' : 'მეტი'}
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
