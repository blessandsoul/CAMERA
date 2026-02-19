'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { CategoryTree } from './CategoryTree';
import { DynamicFilterSection } from './DynamicFilterSection';
import { PriceRangeFilter } from './PriceRangeFilter';
import type { FilterFieldConfig } from '@/lib/constants/filter-config';
import type { CategoryNode } from '@/lib/constants/category-tree';
import type { SpecValueOption } from '@/lib/content';

interface CatalogSidebarProps {
  categoryTree: CategoryNode[];
  categoryCounts: Record<string, number>;
  filterConfigs: FilterFieldConfig[];
  availableValues: Record<string, SpecValueOption[]>;
  priceRange: { min: number; max: number };
}

export function CatalogSidebar({
  categoryTree,
  categoryCounts,
  filterConfigs,
  availableValues,
  priceRange,
}: CatalogSidebarProps): React.ReactElement {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const hasActiveSpecFilters = filterConfigs.some((c) => searchParams.get(c.id));
  const hasPriceFilter = searchParams.get('minPrice') || searchParams.get('maxPrice');
  const hasFilters = hasActiveSpecFilters || hasPriceFilter;

  function clearAllFilters(): void {
    const params = new URLSearchParams();
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    if (category) params.set('category', category);
    if (subcategory) params.set('subcategory', subcategory);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      {/* Category tree */}
      <CategoryTree categoryTree={categoryTree} categoryCounts={categoryCounts} />

      {/* Divider */}
      {filterConfigs.length > 0 && (
        <div className="border-t border-border" />
      )}

      {/* Filters header + clear */}
      {filterConfigs.length > 0 && (
        <div className="flex items-center justify-between px-3">
          <p className="text-sm font-semibold text-foreground">{t('catalog.filters')}</p>
          {hasFilters && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-primary hover:text-primary/80 transition-colors cursor-pointer"
            >
              {t('catalog.clear_filters')}
            </button>
          )}
        </div>
      )}

      {/* Dynamic spec filters */}
      <div className="px-3">
        <DynamicFilterSection
          filterConfigs={filterConfigs}
          availableValues={availableValues}
        />
      </div>

      {/* Price range */}
      {filterConfigs.length > 0 && (
        <>
          <div className="border-t border-border" />
          <div className="px-3">
            <PriceRangeFilter min={priceRange.min} max={priceRange.max} />
          </div>
        </>
      )}
    </div>
  );
}
