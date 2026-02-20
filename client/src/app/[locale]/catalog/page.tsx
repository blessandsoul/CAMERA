import { getTranslations } from 'next-intl/server';
import { ProductCard } from '@/components/common/ProductCard';
import { Pagination } from '@/components/common/Pagination';
import { CatalogSidebar } from '@/features/catalog/components/CatalogSidebar';
import { CatalogToolbar } from '@/features/catalog/components/CatalogToolbar';
import { MobileFilterDrawer } from '@/features/catalog/components/MobileFilterDrawer';
import { getFilteredProducts, getProductsByCategoryAndSub, getAvailableSpecValues, getCategoryCounts } from '@/lib/content';
import { getFilterConfigForCategory } from '@/lib/constants/filter-config';
import { findCategoryNode, getCategoryTree } from '@/lib/constants/category-tree';
import { parseCatalogSearchParams } from '@/lib/utils/catalog-params';
import type { ProductCategory } from '@/types/product.types';
import type { SpecValueOption } from '@/lib/content';

interface CatalogPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: CatalogPageProps): Promise<{ title: string }> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'catalog' });
  return { title: `TechBrain — ${t('title')}` };
}

export default async function CatalogPage({ params, searchParams }: CatalogPageProps): Promise<React.ReactElement> {
  const { locale } = await params;
  const sp = await searchParams;
  const t = await getTranslations({ locale });

  // 1. Determine filter config for current category
  const rawCategory = typeof sp.category === 'string' ? sp.category : undefined;
  const validCategories: ProductCategory[] = ['cameras', 'nvr-kits', 'storage', 'services', 'accessories'];
  const activeCategory = rawCategory && validCategories.includes(rawCategory as ProductCategory)
    ? (rawCategory as ProductCategory)
    : undefined;

  const filterConfigs = getFilterConfigForCategory(activeCategory);

  // 2. Parse all search params
  const parsed = parseCatalogSearchParams(sp as Record<string, string | undefined>, filterConfigs);

  // 3. Resolve subcategory node
  const subcategoryNode = parsed.subcategory ? findCategoryNode(parsed.subcategory) : undefined;

  // 4. Get category counts for the tree
  const categoryCounts = getCategoryCounts();
  const categoryTree = getCategoryTree();

  // 5. Get products filtered by category/subcategory only (for available filter values)
  const categoryProducts = getProductsByCategoryAndSub(activeCategory, subcategoryNode);

  // 6. Compute available values for each filter config
  const availableValues: Record<string, SpecValueOption[]> = {};
  for (const config of filterConfigs) {
    availableValues[config.id] = getAvailableSpecValues(categoryProducts, config.specKaKey);
  }

  // 7. Get price range from category-filtered products
  const priceRange = categoryProducts.length > 0
    ? {
        min: Math.min(...categoryProducts.map((p) => p.price)),
        max: Math.max(...categoryProducts.map((p) => p.price)),
      }
    : { min: 0, max: 0 };

  // 8. Run full filter + sort + paginate
  const result = getFilteredProducts(
    {
      category: activeCategory,
      subcategoryNode,
      specs: parsed.specs,
      search: parsed.search,
      minPrice: parsed.minPrice,
      maxPrice: parsed.maxPrice,
      sort: parsed.sort,
      page: parsed.page,
      limit: parsed.limit,
    },
    filterConfigs,
    locale,
  );

  const sidebarContent = (
    <CatalogSidebar
      categoryTree={categoryTree}
      categoryCounts={categoryCounts}
      filterConfigs={filterConfigs}
      availableValues={availableValues}
      priceRange={priceRange}
    />
  );

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl py-12">
      <h1 className="text-3xl font-bold text-foreground mb-8">{t('catalog.title')}</h1>

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-72 shrink-0">
          <div className="sticky top-20 max-h-[calc(100dvh-6rem)] overflow-y-auto space-y-6 pb-8">
            {sidebarContent}
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Mobile filter button + toolbar */}
          <div className="flex items-start gap-3 mb-6">
            <MobileFilterDrawer filterConfigs={filterConfigs}>
              {sidebarContent}
            </MobileFilterDrawer>
            <div className="flex-1">
              <CatalogToolbar
                totalProducts={result.totalItems}
                filterConfigs={filterConfigs}
              />
            </div>
          </div>

          {/* Product grid */}
          {result.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-8 h-8 text-muted-foreground"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20.25 7.5l-.625 3.6m0 0L17.5 20.25H6.5L4.375 11.1m15.5 0H4.375M4.375 11.1L3.75 7.5h16.5"
                  />
                </svg>
              </div>
              <p className="text-muted-foreground">{t('catalog.no_products')}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {result.items.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {result.totalPages > 1 && (
                <div className="mt-8">
                  <Pagination page={result.page} totalPages={result.totalPages} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
