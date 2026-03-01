import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';
import type { Product, ProductCategory, SortOption } from '@/types/product.types';
import type { Article, ArticleCategory } from '@/types/article.types';
import type { FilterFieldConfig } from '@/lib/constants/filter-config';
import type {
  Product as PrismaProduct,
  ProductSpec as PrismaProductSpec,
  Article as PrismaArticle,
  Project as PrismaProject,
} from '@prisma/client';

// ── Catalog Config types ────────────────────────────────
export interface CatalogLabel {
  ka: string;
  ru: string;
  en: string;
}

export interface CatalogCategoryConfig {
  id: string;
  parentCategory: string | null;
  label: CatalogLabel;
  specFilter?: { kaKey: string; value: string };
  children?: CatalogCategoryConfig[];
}

export interface CatalogFilterConfig {
  id: string;
  specKaKey: string;
  label: CatalogLabel;
  priority: number;
  defaultExpanded?: boolean;
}

export interface CatalogConfig {
  categories: CatalogCategoryConfig[];
  filters: Record<string, CatalogFilterConfig[]>;
}

// ── Site Settings types ─────────────────────────────────
export interface SiteSettings {
  contact: {
    phone: string;
    whatsapp: string;
    email: string;
  };
  business: {
    companyName: string;
    address: { city: string; region: string; country: string };
    geo: { latitude: number; longitude: number };
  };
  hours: {
    weekdays: { open: string; close: string };
    sunday: { open: string; close: string };
  };
  stats: {
    camerasInstalled: string;
    projectsCompleted: string;
    yearsExperience: string;
    warrantyYears: string;
  };
  social: {
    facebook: string;
    instagram: string;
    tiktok: string;
  };
  announcement: {
    enabled: boolean;
    text_ka: string;
    text_ru: string;
    text_en: string;
  };
}

// ── Order types ─────────────────────────────────────────
export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  name: string;
  phone: string;
  locale: string;
  items: OrderItem[];
  total: number;
  status: 'new' | 'contacted' | 'completed';
  createdAt: string;
}

// ── Inquiry types ─────────────────────────────────────
export interface Inquiry {
  id: string;
  name: string;
  phone: string;
  message: string;
  locale: string;
  createdAt: string;
}

// ── Project types ─────────────────────────────────────
export interface Project {
  id: string;
  title: { ka: string; ru: string; en: string };
  location: { ka: string; ru: string; en: string };
  type: 'commercial' | 'residential' | 'retail' | 'office';
  cameras: number;
  image: string;
  year: string;
  isActive: boolean;
  createdAt: string;
}

// ── DB → Domain mappers ──────────────────────────────
function dbProductToProduct(
  p: PrismaProduct & { specs: PrismaProductSpec[] },
): Product {
  return {
    id: p.id,
    slug: p.slug,
    categories: (p.categories as string[]).map((c) => c as ProductCategory),
    price: p.price,
    originalPrice: p.originalPrice ?? undefined,
    currency: p.currency,
    isActive: p.isActive,
    isFeatured: p.isFeatured,
    images: p.images as string[],
    name: { ka: p.nameKa, ru: p.nameRu, en: p.nameEn },
    description: {
      ka: p.descriptionKa ?? p.nameKa,
      ru: p.descriptionRu ?? p.nameRu,
      en: p.descriptionEn ?? p.nameEn,
    },
    specs: p.specs.map((s) => ({
      key: { ka: s.keyKa, ru: s.keyRu, en: s.keyEn },
      value: s.value,
    })),
    relatedProducts: (p.relatedProducts as string[] | null) ?? undefined,
    createdAt: p.createdAt.toISOString(),
    content: p.content ?? undefined,
  };
}

function dbArticleToArticle(a: PrismaArticle): Article {
  return {
    id: a.id,
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    category: a.category as ArticleCategory,
    coverImage: a.coverImage,
    isPublished: a.isPublished,
    readMin: a.readMin,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
    content: a.content,
  };
}

function dbProjectToProject(p: PrismaProject): Project {
  return {
    id: p.id,
    title: { ka: p.titleKa, ru: p.titleRu, en: p.titleEn },
    location: { ka: p.locationKa, ru: p.locationRu, en: p.locationEn },
    type: p.type as Project['type'],
    cameras: p.cameras,
    image: p.image,
    year: p.year,
    isActive: p.isActive,
    createdAt: p.createdAt.toISOString(),
  };
}

// ── Products ───────────────────────────────────────────

export async function getAllProducts(): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: { isActive: true },
    include: { specs: true },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(dbProductToProduct);
}

export async function getAllProductsAdmin(): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    include: { specs: true },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(dbProductToProduct);
}

export async function getProductById(id: string): Promise<Product | null> {
  const row = await prisma.product.findUnique({
    where: { id },
    include: { specs: true },
  });
  if (!row) return null;
  return dbProductToProduct(row);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const row = await prisma.product.findUnique({
    where: { slug },
    include: { specs: true },
  });
  if (!row) return null;
  return dbProductToProduct(row);
}

export async function getProductBySlugOrId(slugOrId: string): Promise<Product | null> {
  const bySlug = await getProductBySlug(slugOrId);
  if (bySlug) return bySlug;
  return getProductById(slugOrId);
}

const RELATED_CATEGORIES: Record<ProductCategory, ProductCategory[]> = {
  cameras: ['accessories', 'storage'],
  'nvr-kits': ['accessories', 'storage'],
  storage: ['accessories', 'cameras'],
  accessories: ['cameras', 'storage'],
  services: [],
};

export async function getRelatedProducts(product: Product): Promise<Product[]> {
  if (product.relatedProducts && product.relatedProducts.length > 0) {
    const rows = await prisma.product.findMany({
      where: { id: { in: product.relatedProducts }, isActive: true },
      include: { specs: true },
    });
    return rows.map(dbProductToProduct);
  }

  const primaryCategory = product.categories[0];
  if (!primaryCategory) return [];
  const relatedCats = RELATED_CATEGORIES[primaryCategory];
  if (relatedCats.length === 0) return [];

  const allProducts = await prisma.product.findMany({
    where: {
      isActive: true,
      id: { not: product.id },
    },
    include: { specs: true },
    orderBy: [{ isFeatured: 'desc' }, { price: 'asc' }],
  });
  return allProducts
    .map(dbProductToProduct)
    .filter((p) => p.categories.some((c) => relatedCats.includes(c)))
    .slice(0, 3);
}

export async function getProductsByCategory(category: ProductCategory): Promise<Product[]> {
  const ids = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT id FROM products
    WHERE isActive = true AND JSON_CONTAINS(categories, ${JSON.stringify(category)})
    ORDER BY createdAt DESC
  `;
  if (ids.length === 0) return [];
  const rows = await prisma.product.findMany({
    where: { id: { in: ids.map((r) => r.id) } },
    include: { specs: true },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(dbProductToProduct);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    include: { specs: true },
    orderBy: { createdAt: 'desc' },
    take: 6,
  });
  return rows.map(dbProductToProduct);
}

export async function getDiscountedProducts(): Promise<Product[]> {
  const discountedIds = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT id FROM products
    WHERE isActive = true
      AND originalPrice IS NOT NULL
      AND originalPrice > price
    ORDER BY createdAt DESC
    LIMIT 6
  `;
  if (discountedIds.length === 0) return [];
  const rows = await prisma.product.findMany({
    where: { id: { in: discountedIds.map((r) => r.id) } },
    include: { specs: true },
  });
  return rows.map(dbProductToProduct);
}

export async function getAllProductIds(): Promise<string[]> {
  const rows = await prisma.product.findMany({ select: { id: true } });
  return rows.map((r) => r.id);
}

// ── Product spec helpers ──────────────────────────────
export function getSpecValue(product: Product, kaKey: string): string {
  const values = product.specs.filter((s) => s.key.ka === kaKey).map((s) => s.value);
  return values.join(', ');
}

// ── Articles ───────────────────────────────────────────

export async function getAllArticles(): Promise<Article[]> {
  const rows = await prisma.article.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(dbArticleToArticle);
}

export async function getAllArticlesAdmin(): Promise<Article[]> {
  const rows = await prisma.article.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(dbArticleToArticle);
}

export async function getArticleById(id: string): Promise<Article | null> {
  const row = await prisma.article.findUnique({ where: { id } });
  if (!row) return null;
  return dbArticleToArticle(row);
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const row = await prisma.article.findUnique({ where: { slug } });
  if (!row) return null;
  return dbArticleToArticle(row);
}

export async function getArticlesByCategory(category: ArticleCategory): Promise<Article[]> {
  const rows = await prisma.article.findMany({
    where: { isPublished: true, category },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(dbArticleToArticle);
}

// ── Catalog Config ──────────────────────────────────────

export async function getCatalogConfig(): Promise<CatalogConfig> {
  const row = await prisma.catalogConfig.findUnique({ where: { id: 'singleton' } });
  if (!row) return { categories: [], filters: {} };
  return {
    categories: row.categories as unknown as CatalogCategoryConfig[],
    filters: row.filters as unknown as Record<string, CatalogFilterConfig[]>,
  };
}

export async function writeCatalogConfig(config: CatalogConfig): Promise<void> {
  await prisma.catalogConfig.upsert({
    where: { id: 'singleton' },
    create: { categories: JSON.parse(JSON.stringify(config.categories)), filters: JSON.parse(JSON.stringify(config.filters)) },
    update: { categories: JSON.parse(JSON.stringify(config.categories)), filters: JSON.parse(JSON.stringify(config.filters)) },
  });
}

// ── Site Settings ───────────────────────────────────────

const DEFAULT_SITE_SETTINGS: SiteSettings = {
  contact: { phone: '597470518', whatsapp: '', email: '' },
  business: {
    companyName: 'TechBrain',
    address: { city: 'Tbilisi', region: 'Tbilisi', country: 'GE' },
    geo: { latitude: 41.6938, longitude: 44.8015 },
  },
  hours: {
    weekdays: { open: '10:00', close: '19:00' },
    sunday: { open: '11:00', close: '17:00' },
  },
  stats: {
    camerasInstalled: '500+',
    projectsCompleted: '120+',
    yearsExperience: '5+',
    warrantyYears: '2',
  },
  social: { facebook: 'https://www.facebook.com/TechbrainGE', instagram: 'https://www.instagram.com/techbrainge/', tiktok: '' },
  announcement: { enabled: false, text_ka: '', text_ru: '', text_en: '' },
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const row = await prisma.siteSettings.findUnique({ where: { id: 'singleton' } });
  if (!row) return DEFAULT_SITE_SETTINGS;
  return {
    contact: row.contact as unknown as SiteSettings['contact'],
    business: row.business as unknown as SiteSettings['business'],
    hours: row.hours as unknown as SiteSettings['hours'],
    stats: row.stats as unknown as SiteSettings['stats'],
    social: row.social as unknown as SiteSettings['social'],
    announcement: row.announcement as unknown as SiteSettings['announcement'],
  };
}

export async function writeSiteSettings(settings: SiteSettings): Promise<void> {
  await prisma.siteSettings.upsert({
    where: { id: 'singleton' },
    create: {
      contact: JSON.parse(JSON.stringify(settings.contact)),
      business: JSON.parse(JSON.stringify(settings.business)),
      hours: JSON.parse(JSON.stringify(settings.hours)),
      stats: JSON.parse(JSON.stringify(settings.stats)),
      social: JSON.parse(JSON.stringify(settings.social)),
      announcement: JSON.parse(JSON.stringify(settings.announcement)),
    },
    update: {
      contact: JSON.parse(JSON.stringify(settings.contact)),
      business: JSON.parse(JSON.stringify(settings.business)),
      hours: JSON.parse(JSON.stringify(settings.hours)),
      stats: JSON.parse(JSON.stringify(settings.stats)),
      social: JSON.parse(JSON.stringify(settings.social)),
      announcement: JSON.parse(JSON.stringify(settings.announcement)),
    },
  });
}

// ── Orders ──────────────────────────────────────────────

export async function getAllOrders(): Promise<Order[]> {
  const rows = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map((o) => ({
    id: o.id,
    name: o.name,
    phone: o.phone,
    locale: o.locale,
    total: o.total,
    status: o.status as Order['status'],
    createdAt: o.createdAt.toISOString(),
    items: o.items.map((i) => ({
      name: i.name,
      quantity: i.quantity,
      price: i.price,
    })),
  }));
}

export async function getOrderById(id: string): Promise<Order | null> {
  const o = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!o) return null;
  return {
    id: o.id,
    name: o.name,
    phone: o.phone,
    locale: o.locale,
    total: o.total,
    status: o.status as Order['status'],
    createdAt: o.createdAt.toISOString(),
    items: o.items.map((i) => ({
      name: i.name,
      quantity: i.quantity,
      price: i.price,
    })),
  };
}

export async function saveOrder(order: Order): Promise<void> {
  await prisma.order.create({
    data: {
      id: order.id,
      name: order.name,
      phone: order.phone,
      locale: order.locale,
      total: order.total,
      status: order.status,
      createdAt: new Date(order.createdAt),
      items: {
        create: order.items.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          price: i.price,
        })),
      },
    },
  });
}

export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
  await prisma.order.update({
    where: { id: orderId },
    data: { status },
  });
}

// ── Product write operations ──────────────────────────

export async function writeProductMdx(
  id: string,
  frontmatter: Omit<Product, 'content' | 'description'>,
  body: string,
): Promise<void> {
  await prisma.product.upsert({
    where: { id },
    create: {
      id,
      slug: frontmatter.slug,
      categories: frontmatter.categories as unknown as string[],
      price: frontmatter.price,
      originalPrice: frontmatter.originalPrice ?? null,
      currency: frontmatter.currency || 'GEL',
      isActive: frontmatter.isActive,
      isFeatured: frontmatter.isFeatured,
      images: frontmatter.images as unknown as string[],
      nameKa: frontmatter.name.ka,
      nameRu: frontmatter.name.ru || '',
      nameEn: frontmatter.name.en || '',
      content: body || null,
      relatedProducts: frontmatter.relatedProducts ?? Prisma.JsonNull,
      createdAt: new Date(frontmatter.createdAt),
      specs: {
        create: (frontmatter.specs || []).map((s) => ({
          keyKa: s.key.ka,
          keyRu: s.key.ru || '',
          keyEn: s.key.en || '',
          value: s.value,
        })),
      },
    },
    update: {
      slug: frontmatter.slug,
      categories: frontmatter.categories as unknown as string[],
      price: frontmatter.price,
      originalPrice: frontmatter.originalPrice ?? null,
      currency: frontmatter.currency || 'GEL',
      isActive: frontmatter.isActive,
      isFeatured: frontmatter.isFeatured,
      images: frontmatter.images as unknown as string[],
      nameKa: frontmatter.name.ka,
      nameRu: frontmatter.name.ru || '',
      nameEn: frontmatter.name.en || '',
      content: body || null,
      relatedProducts: frontmatter.relatedProducts ?? Prisma.JsonNull,
      specs: {
        deleteMany: {},
        create: (frontmatter.specs || []).map((s) => ({
          keyKa: s.key.ka,
          keyRu: s.key.ru || '',
          keyEn: s.key.en || '',
          value: s.value,
        })),
      },
    },
  });
}

export async function deleteProductMdx(id: string): Promise<boolean> {
  try {
    await prisma.product.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

// ── Article write operations ──────────────────────────

export async function writeArticleMdx(
  id: string,
  frontmatter: Omit<Article, 'content'>,
  body: string,
): Promise<void> {
  await prisma.article.upsert({
    where: { id },
    create: {
      id,
      slug: frontmatter.slug,
      title: frontmatter.title,
      excerpt: frontmatter.excerpt || '',
      category: frontmatter.category,
      coverImage: frontmatter.coverImage || '',
      isPublished: frontmatter.isPublished,
      readMin: frontmatter.readMin || 5,
      content: body,
      createdAt: new Date(frontmatter.createdAt),
      updatedAt: new Date(frontmatter.updatedAt || frontmatter.createdAt),
    },
    update: {
      slug: frontmatter.slug,
      title: frontmatter.title,
      excerpt: frontmatter.excerpt || '',
      category: frontmatter.category,
      coverImage: frontmatter.coverImage || '',
      isPublished: frontmatter.isPublished,
      readMin: frontmatter.readMin || 5,
      content: body,
      updatedAt: new Date(frontmatter.updatedAt || new Date().toISOString()),
    },
  });
}

export async function deleteArticleMdx(id: string): Promise<boolean> {
  try {
    await prisma.article.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

// ── Filter engine ──────────────────────────────────────

export interface CatalogFilters {
  category?: ProductCategory;
  subcategoryNode?: { specFilter?: { kaKey: string; value: string } };
  specs: Record<string, string[]>;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort: SortOption;
  page: number;
  limit: number;
}

export interface FilteredResult {
  items: Product[];
  totalItems: number;
  totalPages: number;
  page: number;
  limit: number;
  priceRange: { min: number; max: number };
}

export interface SpecValueOption {
  value: string;
  count: number;
}

async function getProductIdsByCategory(category: ProductCategory): Promise<string[]> {
  const ids = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT id FROM products
    WHERE isActive = true AND JSON_CONTAINS(categories, ${JSON.stringify(category)})
  `;
  return ids.map((r) => r.id);
}

function buildCategoryWhere(
  category?: ProductCategory,
  subcategoryNode?: { specFilter?: { kaKey: string; value: string } },
  categoryProductIds?: string[],
): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = { isActive: true };
  if (category && categoryProductIds) {
    where.id = { in: categoryProductIds };
  }
  if (subcategoryNode?.specFilter) {
    const { kaKey, value } = subcategoryNode.specFilter;
    where.AND = [{ specs: { some: { keyKa: kaKey, value } } }];
  }
  return where;
}

function buildOrderBy(sort: SortOption, locale: string): Prisma.ProductOrderByWithRelationInput {
  switch (sort) {
    case 'price-asc':
      return { price: 'asc' };
    case 'price-desc':
      return { price: 'desc' };
    case 'name-asc': {
      const field = locale === 'ru' ? 'nameRu' : locale === 'en' ? 'nameEn' : 'nameKa';
      return { [field]: 'asc' };
    }
    case 'newest':
    default:
      return { createdAt: 'desc' };
  }
}

export async function getFilteredProducts(
  filters: CatalogFilters,
  filterConfigs: FilterFieldConfig[],
  locale: string = 'ka',
): Promise<FilteredResult> {
  const andConditions: Prisma.ProductWhereInput[] = [];

  if (filters.subcategoryNode?.specFilter) {
    const { kaKey, value } = filters.subcategoryNode.specFilter;
    andConditions.push({ specs: { some: { keyKa: kaKey, value } } });
  }

  for (const config of filterConfigs) {
    const selectedValues = filters.specs[config.id];
    if (selectedValues && selectedValues.length > 0) {
      andConditions.push({
        specs: { some: { keyKa: config.specKaKey, value: { in: selectedValues } } },
      });
    }
  }

  let categoryProductIds: string[] | undefined;
  if (filters.category) {
    categoryProductIds = await getProductIdsByCategory(filters.category);
  }

  const baseWhere: Prisma.ProductWhereInput = {
    isActive: true,
    ...(categoryProductIds && { id: { in: categoryProductIds } }),
    ...(filters.search && {
      OR: [
        { nameKa: { contains: filters.search.trim() } },
        { nameRu: { contains: filters.search.trim() } },
        { nameEn: { contains: filters.search.trim() } },
        { slug: { contains: filters.search.trim() } },
      ],
    }),
    ...(andConditions.length > 0 && { AND: andConditions }),
  };

  const priceAgg = await prisma.product.aggregate({
    where: baseWhere,
    _min: { price: true },
    _max: { price: true },
  });
  const priceRange = {
    min: priceAgg._min.price ?? 0,
    max: priceAgg._max.price ?? 0,
  };

  const where: Prisma.ProductWhereInput = {
    ...baseWhere,
    ...(filters.minPrice !== undefined || filters.maxPrice !== undefined
      ? {
          price: {
            ...(filters.minPrice !== undefined && { gte: filters.minPrice }),
            ...(filters.maxPrice !== undefined && { lte: filters.maxPrice }),
          },
        }
      : {}),
  };

  const totalItems = await prisma.product.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalItems / filters.limit));
  const page = Math.min(filters.page, totalPages);
  const offset = (page - 1) * filters.limit;

  const rows = await prisma.product.findMany({
    where,
    include: { specs: true },
    orderBy: buildOrderBy(filters.sort, locale),
    skip: offset,
    take: filters.limit,
  });

  const items = rows.map(dbProductToProduct);

  return { items, totalItems, totalPages, page, limit: filters.limit, priceRange };
}

export function getAvailableSpecValues(
  products: Product[],
  specKaKey: string,
): SpecValueOption[] {
  const counts = new Map<string, number>();
  for (const p of products) {
    const v = getSpecValue(p, specKaKey);
    if (v) counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => a.value.localeCompare(b.value));
}

export async function getAvailableSpecValuesFromDB(
  category?: ProductCategory,
  subcategoryNode?: { specFilter?: { kaKey: string; value: string } },
  filterConfigs: FilterFieldConfig[] = [],
): Promise<Record<string, SpecValueOption[]>> {
  if (filterConfigs.length === 0) return {};

  let categoryProductIds: string[] | undefined;
  if (category) {
    categoryProductIds = await getProductIdsByCategory(category);
  }
  const baseWhere = buildCategoryWhere(category, subcategoryNode, categoryProductIds);
  const matchingProducts = await prisma.product.findMany({
    where: baseWhere,
    select: { id: true },
  });
  const productIds = matchingProducts.map((p) => p.id);

  if (productIds.length === 0) {
    return Object.fromEntries(filterConfigs.map((c) => [c.id, []]));
  }

  const entries = await Promise.all(
    filterConfigs.map(async (config): Promise<[string, SpecValueOption[]]> => {
      const groups = await prisma.productSpec.groupBy({
        by: ['value'],
        where: {
          keyKa: config.specKaKey,
          value: { not: '' },
          productId: { in: productIds },
        },
        _count: { _all: true },
        orderBy: { value: 'asc' },
      });
      return [config.id, groups.map((g) => ({ value: g.value, count: g._count._all }))];
    }),
  );

  return Object.fromEntries(entries);
}

export async function getPriceRangeFromDB(
  category?: ProductCategory,
  subcategoryNode?: { specFilter?: { kaKey: string; value: string } },
): Promise<{ min: number; max: number }> {
  let categoryProductIds: string[] | undefined;
  if (category) {
    categoryProductIds = await getProductIdsByCategory(category);
  }
  const where = buildCategoryWhere(category, subcategoryNode, categoryProductIds);
  const agg = await prisma.product.aggregate({
    where,
    _min: { price: true },
    _max: { price: true },
  });
  return { min: agg._min.price ?? 0, max: agg._max.price ?? 0 };
}

export async function getProductsByCategoryAndSub(
  category?: ProductCategory,
  subcategoryNode?: { specFilter?: { kaKey: string; value: string } },
): Promise<Product[]> {
  let categoryProductIds: string[] | undefined;
  if (category) {
    categoryProductIds = await getProductIdsByCategory(category);
  }
  const where = buildCategoryWhere(category, subcategoryNode, categoryProductIds);
  const rows = await prisma.product.findMany({
    where,
    include: { specs: true },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(dbProductToProduct);
}

export async function getCategoryCounts(): Promise<Record<string, number>> {
  const allCategories: ProductCategory[] = ['cameras', 'nvr-kits', 'accessories', 'storage', 'services'];

  const [totalCount, config, ...categoryCounts] = await Promise.all([
    prisma.product.count({ where: { isActive: true } }),
    getCatalogConfig(),
    ...allCategories.map((cat) =>
      prisma.$queryRaw<Array<{ cnt: bigint }>>`
        SELECT COUNT(*) as cnt FROM products
        WHERE isActive = true AND JSON_CONTAINS(categories, ${JSON.stringify(cat)})
      `.then((r) => ({ category: cat, count: Number(r[0]?.cnt ?? 0) })),
    ),
  ]);

  const counts: Record<string, number> = { all: totalCount };
  for (const g of categoryCounts) {
    counts[g.category] = g.count;
  }

  const subcategoryQueries: Array<{ id: string; promise: Promise<number> }> = [];
  for (const cat of config.categories) {
    if (cat.children) {
      for (const child of cat.children) {
        if (child.specFilter) {
          if (cat.parentCategory) {
            subcategoryQueries.push({
              id: child.id,
              promise: getProductIdsByCategory(cat.parentCategory as ProductCategory).then(
                (ids) =>
                  ids.length === 0
                    ? 0
                    : prisma.product.count({
                        where: {
                          isActive: true,
                          id: { in: ids },
                          specs: { some: { keyKa: child.specFilter!.kaKey, value: child.specFilter!.value } },
                        },
                      }),
              ),
            });
          } else {
            subcategoryQueries.push({
              id: child.id,
              promise: prisma.product.count({
                where: {
                  isActive: true,
                  specs: { some: { keyKa: child.specFilter.kaKey, value: child.specFilter.value } },
                },
              }),
            });
          }
        }
      }
    }
  }

  if (subcategoryQueries.length > 0) {
    const results = await Promise.all(subcategoryQueries.map((q) => q.promise));
    subcategoryQueries.forEach((q, i) => { counts[q.id] = results[i]; });
  }

  return counts;
}

// Legacy compat
export interface ProductFilters {
  category?: ProductCategory;
  brand?: string;
  resolution?: string;
  bodyType?: string;
  nightVision?: string;
  wifi?: string;
  minPrice?: number;
  maxPrice?: number;
}

export async function getProductsFiltered(filters: ProductFilters): Promise<Product[]> {
  const andConditions: Prisma.ProductWhereInput[] = [];

  const specFilters: Array<{ kaKey: string; value: string | undefined }> = [
    { kaKey: 'ბრენდი', value: filters.brand },
    { kaKey: 'რეზოლუცია', value: filters.resolution },
    { kaKey: 'კორპუსის ტიპი', value: filters.bodyType },
    { kaKey: 'ღამის ხედვა', value: filters.nightVision },
    { kaKey: 'Wi-Fi', value: filters.wifi },
  ];

  for (const { kaKey, value } of specFilters) {
    if (value) {
      andConditions.push({ specs: { some: { keyKa: kaKey, value } } });
    }
  }

  let categoryProductIds: string[] | undefined;
  if (filters.category) {
    categoryProductIds = await getProductIdsByCategory(filters.category);
  }

  const where: Prisma.ProductWhereInput = {
    isActive: true,
    ...(categoryProductIds && { id: { in: categoryProductIds } }),
    ...(filters.minPrice !== undefined || filters.maxPrice !== undefined
      ? {
          price: {
            ...(filters.minPrice !== undefined && { gte: filters.minPrice }),
            ...(filters.maxPrice !== undefined && { lte: filters.maxPrice }),
          },
        }
      : {}),
    ...(andConditions.length > 0 && { AND: andConditions }),
  };

  const rows = await prisma.product.findMany({
    where,
    include: { specs: true },
    orderBy: { createdAt: 'desc' },
  });

  return rows.map(dbProductToProduct);
}

export async function getUniqueSpecValues(kaKey: string): Promise<string[]> {
  const rows = await prisma.productSpec.findMany({
    where: {
      keyKa: kaKey,
      value: { not: '' },
      product: { is: { isActive: true } },
    },
    select: { value: true },
    distinct: ['value'],
    orderBy: { value: 'asc' },
  });
  return rows.map((r) => r.value);
}

// ── Inquiries ─────────────────────────────────────────

export async function getAllInquiries(): Promise<Inquiry[]> {
  const rows = await prisma.inquiry.findMany({ orderBy: { createdAt: 'desc' } });
  return rows.map((i) => ({
    id: i.id,
    name: i.name,
    phone: i.phone,
    message: i.message,
    locale: i.locale,
    createdAt: i.createdAt.toISOString(),
  }));
}

export async function saveInquiry(inquiry: Inquiry): Promise<void> {
  await prisma.inquiry.create({
    data: {
      id: inquiry.id,
      name: inquiry.name,
      phone: inquiry.phone,
      message: inquiry.message,
      locale: inquiry.locale,
      createdAt: new Date(inquiry.createdAt),
    },
  });
}

export async function deleteInquiry(id: string): Promise<void> {
  await prisma.inquiry.delete({ where: { id } });
}

// ── Projects ─────────────────────────────────────────

export async function getAllProjects(): Promise<Project[]> {
  const rows = await prisma.project.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(dbProjectToProject);
}

export async function getAllProjectsAdmin(): Promise<Project[]> {
  const rows = await prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(dbProjectToProject);
}

export async function getProjectById(id: string): Promise<Project | null> {
  const row = await prisma.project.findUnique({ where: { id } });
  if (!row) return null;
  return dbProjectToProject(row);
}

export async function saveProject(project: Project): Promise<void> {
  await prisma.project.upsert({
    where: { id: project.id },
    create: {
      id: project.id,
      titleKa: project.title.ka,
      titleRu: project.title.ru || '',
      titleEn: project.title.en || '',
      locationKa: project.location.ka,
      locationRu: project.location.ru || '',
      locationEn: project.location.en || '',
      type: project.type,
      cameras: project.cameras,
      image: project.image || '',
      year: project.year,
      isActive: project.isActive,
      createdAt: new Date(project.createdAt),
    },
    update: {
      titleKa: project.title.ka,
      titleRu: project.title.ru || '',
      titleEn: project.title.en || '',
      locationKa: project.location.ka,
      locationRu: project.location.ru || '',
      locationEn: project.location.en || '',
      type: project.type,
      cameras: project.cameras,
      image: project.image || '',
      year: project.year,
      isActive: project.isActive,
    },
  });
}

export async function deleteProject(id: string): Promise<void> {
  await prisma.project.delete({ where: { id } });
}
