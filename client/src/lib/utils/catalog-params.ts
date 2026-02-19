import type { ProductCategory } from '@/types/product.types';
import type { SortOption } from '@/types/product.types';
import type { FilterFieldConfig } from '@/lib/constants/filter-config';

export interface CatalogSearchParams {
  category?: ProductCategory;
  subcategory?: string;
  specs: Record<string, string[]>;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort: SortOption;
  page: number;
  limit: number;
}

export function parseMultiValue(param: string | undefined): string[] {
  if (!param) return [];
  return param.split(',').map((v) => v.trim()).filter(Boolean);
}

export function serializeMultiValue(values: string[]): string {
  return values.join(',');
}

const VALID_CATEGORIES: ProductCategory[] = ['cameras', 'nvr-kits', 'storage', 'services', 'accessories'];
const VALID_SORTS: SortOption[] = ['newest', 'price-asc', 'price-desc', 'name-asc'];
const VALID_LIMITS = [16, 32, 64];

export function parseCatalogSearchParams(
  sp: Record<string, string | string[] | undefined>,
  filterConfigs: FilterFieldConfig[],
): CatalogSearchParams {
  const rawCategory = typeof sp.category === 'string' ? sp.category : undefined;
  const category = rawCategory && VALID_CATEGORIES.includes(rawCategory as ProductCategory)
    ? (rawCategory as ProductCategory)
    : undefined;

  const subcategory = typeof sp.subcategory === 'string' ? sp.subcategory : undefined;

  const specs: Record<string, string[]> = {};
  for (const config of filterConfigs) {
    const raw = typeof sp[config.id] === 'string' ? (sp[config.id] as string) : undefined;
    const values = parseMultiValue(raw);
    if (values.length > 0) {
      specs[config.id] = values;
    }
  }

  const rawSort = typeof sp.sort === 'string' ? sp.sort : undefined;
  const sort: SortOption = rawSort && VALID_SORTS.includes(rawSort as SortOption)
    ? (rawSort as SortOption)
    : 'newest';

  const rawPage = typeof sp.page === 'string' ? parseInt(sp.page, 10) : 1;
  const page = Number.isFinite(rawPage) && rawPage >= 1 ? rawPage : 1;

  const rawLimit = typeof sp.limit === 'string' ? parseInt(sp.limit, 10) : 16;
  const limit = VALID_LIMITS.includes(rawLimit) ? rawLimit : 16;

  const rawMinPrice = typeof sp.minPrice === 'string' ? parseFloat(sp.minPrice) : undefined;
  const minPrice = rawMinPrice !== undefined && Number.isFinite(rawMinPrice) ? rawMinPrice : undefined;

  const rawMaxPrice = typeof sp.maxPrice === 'string' ? parseFloat(sp.maxPrice) : undefined;
  const maxPrice = rawMaxPrice !== undefined && Number.isFinite(rawMaxPrice) ? rawMaxPrice : undefined;

  const search = typeof sp.search === 'string' && sp.search.trim().length > 0
    ? sp.search.trim()
    : undefined;

  return { category, subcategory, specs, search, minPrice, maxPrice, sort, page, limit };
}
