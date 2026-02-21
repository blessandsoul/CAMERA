import Link from 'next/link';
import {
  SecurityCamera,
  HardDrive,
  Wrench,
  Package,
  Toolbox,
} from '@phosphor-icons/react/dist/ssr';
import type { ProductCategory, Locale } from '@/types/product.types';

interface CategoryItem {
  value: ProductCategory;
  labels: Record<Locale, string>;
  icon: React.ReactNode;
}

const CATEGORIES: CategoryItem[] = [
  {
    value: 'cameras',
    labels: { ka: 'კამერები', ru: 'Камеры', en: 'Cameras' },
    icon: <SecurityCamera size={26} weight="duotone" aria-hidden="true" />,
  },
  {
    value: 'nvr-kits',
    labels: { ka: 'NVR კომპლექტი', ru: 'NVR Комплект', en: 'NVR Kits' },
    icon: <Package size={26} weight="duotone" aria-hidden="true" />,
  },
  {
    value: 'storage',
    labels: { ka: 'მეხსიერება', ru: 'Хранилище', en: 'Storage' },
    icon: <HardDrive size={26} weight="duotone" aria-hidden="true" />,
  },
  {
    value: 'accessories',
    labels: { ka: 'აქსესუარები', ru: 'Аксессуары', en: 'Accessories' },
    icon: <Toolbox size={26} weight="duotone" aria-hidden="true" />,
  },
  {
    value: 'services',
    labels: { ka: 'სერვისი', ru: 'Сервис', en: 'Services' },
    icon: <Wrench size={26} weight="duotone" aria-hidden="true" />,
  },
];

interface CategoryNavBarProps {
  locale: Locale;
  counts?: Record<string, number>;
  badge?: string;
  title?: string;
  subtitle?: string;
}

export function CategoryNavBar({ locale, counts, badge, title, subtitle }: CategoryNavBarProps): React.ReactElement {
  return (
    <div className="flex flex-col items-center gap-5">
      {/* Badge + Title + subtitle above icons */}
      {(badge || title || subtitle) && (
        <div className="flex flex-col items-center gap-5">
          {badge && (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-muted/60 border border-border/50">
              <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full rounded-full bg-online opacity-50 motion-safe:animate-ping" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-online" />
              </span>
              <span className="text-base font-medium text-muted-foreground">{badge}</span>
            </div>
          )}
          <div className="text-center max-w-2xl">
            {title && (
              <h2 className="text-[30px] font-bold text-foreground leading-tight whitespace-nowrap">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-2 text-sm sm:text-base text-muted-foreground leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Category icons */}
      <nav
        aria-label="Product categories"
        className="flex items-stretch justify-center gap-1.5 sm:gap-2 rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-2 sm:p-2.5 w-full"
      >
        {CATEGORIES.map((cat) => {
          const label = cat.labels[locale] ?? cat.labels.en;
          const count = counts?.[cat.value];

          return (
            <Link
              key={cat.value}
              href={`/${locale}/catalog?category=${cat.value}`}
              className="group relative flex flex-1 flex-col items-center gap-1 sm:gap-1.5 py-2.5 sm:py-3 px-1 sm:px-3 rounded-xl transition-all duration-200 ease-out hover:bg-primary/5 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 cursor-pointer"
            >
              <div className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-primary/8 border border-primary/10 text-primary/70 group-hover:bg-primary/12 group-hover:text-primary group-hover:border-primary/20 transition-all duration-200">
                {cat.icon}
                {count !== undefined && count > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 text-[9px] font-bold tabular-nums text-primary bg-primary/10 border border-primary/15 px-1.5 py-px rounded-full leading-none">
                    {count}
                  </span>
                )}
              </div>
              <span className="text-[10px] sm:text-xs font-semibold text-foreground/80 text-center leading-tight group-hover:text-primary transition-colors duration-200 w-full truncate">
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
