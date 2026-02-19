import Link from 'next/link';
import {
  SecurityCamera,
  HardDrive,
  Wrench,
  Package,
  Toolbox,
} from '@phosphor-icons/react/dist/ssr';
import type { ProductCategory } from '@/types/product.types';

interface Category {
  value: ProductCategory;
  labelKa: string;
  labelRu: string;
  labelEn: string;
  icon: React.ReactNode;
}

const CATEGORIES: Category[] = [
  {
    value: 'cameras',
    labelKa: 'კამერები',
    labelRu: 'Камеры',
    labelEn: 'Cameras',
    icon: <SecurityCamera size={48} weight="duotone" aria-hidden="true" />,
  },
  {
    value: 'nvr-kits',
    labelKa: 'NVR კომპლექტი',
    labelRu: 'NVR Комплект',
    labelEn: 'NVR Kits',
    icon: <Package size={48} weight="duotone" aria-hidden="true" />,
  },
  {
    value: 'storage',
    labelKa: 'მეხსიერება',
    labelRu: 'Хранилище',
    labelEn: 'Storage',
    icon: <HardDrive size={48} weight="duotone" aria-hidden="true" />,
  },
  {
    value: 'accessories',
    labelKa: 'აქსესუარები',
    labelRu: 'Аксессуары',
    labelEn: 'Accessories',
    icon: <Toolbox size={48} weight="duotone" aria-hidden="true" />,
  },
  {
    value: 'services',
    labelKa: 'სერვისი',
    labelRu: 'Сервис',
    labelEn: 'Services',
    icon: <Wrench size={48} weight="duotone" aria-hidden="true" />,
  },
];

interface CategoryGridProps {
  locale: string;
  counts?: Record<string, number>;
}

export function CategoryGrid({ locale, counts = {} }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
      {CATEGORIES.map((cat) => {
        const label =
          locale === 'ru' ? cat.labelRu :
          locale === 'en' ? cat.labelEn :
          cat.labelKa;

        const count = counts[cat.value];

        return (
          <Link
            key={cat.value}
            href={`/${locale}/catalog?category=${cat.value}`}
            className="group flex flex-col items-center gap-3 p-6 rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-sm hover:shadow-md motion-safe:hover:-translate-y-0.5 hover:border-primary/30 hover:bg-card transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 cursor-pointer"
          >
            <div className="text-primary/70 group-hover:text-primary transition-colors duration-200">
              {cat.icon}
            </div>
            <span className="text-base font-semibold text-foreground text-center leading-tight group-hover:text-primary transition-colors duration-200">
              {label}
            </span>
            {count !== undefined && count > 0 && (
              <span className="text-[9px] font-bold tabular-nums text-muted-foreground bg-muted/70 border border-border/50 px-1.5 py-px rounded-full leading-none">
                {count}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
