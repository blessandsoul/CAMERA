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
    category: p.category as ProductCategory,
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

  const relatedCats = RELATED_CATEGORIES[product.category];
  if (relatedCats.length === 0) return [];

  const rows = await prisma.product.findMany({
    where: {
      isActive: true,
      category: { in: relatedCats },
      id: { not: product.id },
    },
    include: { specs: true },
    orderBy: [{ isFeatured: 'desc' }, { price: 'asc' }],
    take: 3,
  });
  return rows.map(dbProductToProduct);
}

export async function getProductsByCategory(category: ProductCategory): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: { isActive: true, category },
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
  const rows = await prisma.product.findMany({
    where: {
      isActive: true,
      originalPrice: { not: null },
    },
    include: { specs: true },
    orderBy: { createdAt: 'desc' },
  });
  return rows
    .map(dbProductToProduct)
    .filter((p) => p.originalPrice !== undefined && p.originalPrice > p.price)
    .slice(0, 6);
}

export async function getAllProductIds(): Promise<string[]> {
  const rows = await prisma.product.findMany({ select: { id: true } });
  return rows.map((r) => r.id);
}

// ── Product spec helpers ──────────────────────────────
export function getSpecValue(product: Product, kaKey: string): string {
  const spec = product.specs.find((s) => s.key.ka === kaKey);
  return spec?.value ?? '';
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
      category: frontmatter.category,
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
      category: frontmatter.category,
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

function sortProducts(products: Product[], sort: SortOption, locale: string): Product[] {
  const sorted = [...products];
  switch (sort) {
    case 'price-asc':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return sorted.sort((a, b) => b.price - a.price);
    case 'name-asc':
      return sorted.sort((a, b) => {
        const nameA = a.name[locale as keyof typeof a.name] ?? a.name.ka;
        const nameB = b.name[locale as keyof typeof b.name] ?? b.name.ka;
        return nameA.localeCompare(nameB);
      });
    case 'newest':
    default:
      return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

export async function getFilteredProducts(
  filters: CatalogFilters,
  filterConfigs: FilterFieldConfig[],
  locale: string = 'ka',
): Promise<FilteredResult> {
  let products = await getAllProducts();

  if (filters.category) {
    products = products.filter((p) => p.category === filters.category);
  }

  if (filters.subcategoryNode?.specFilter) {
    const { kaKey, value } = filters.subcategoryNode.specFilter;
    products = products.filter((p) => getSpecValue(p, kaKey) === value);
  }

  if (filters.search) {
    const term = filters.search.toLowerCase().trim();
    products = products.filter((p) =>
      p.name.ka.toLowerCase().includes(term) ||
      p.name.ru.toLowerCase().includes(term) ||
      p.name.en.toLowerCase().includes(term) ||
      p.slug.toLowerCase().includes(term)
    );
  }

  for (const config of filterConfigs) {
    const selectedValues = filters.specs[config.id];
    if (selectedValues && selectedValues.length > 0) {
      products = products.filter((p) => {
        const specVal = getSpecValue(p, config.specKaKey);
        return selectedValues.includes(specVal);
      });
    }
  }

  const priceRange = computePriceRange(products);

  if (filters.minPrice !== undefined) {
    products = products.filter((p) => p.price >= filters.minPrice!);
  }
  if (filters.maxPrice !== undefined) {
    products = products.filter((p) => p.price <= filters.maxPrice!);
  }

  products = sortProducts(products, filters.sort, locale);

  const totalItems = products.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / filters.limit));
  const page = Math.min(filters.page, totalPages);
  const offset = (page - 1) * filters.limit;
  const items = products.slice(offset, offset + filters.limit);

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

export async function getProductsByCategoryAndSub(
  category?: ProductCategory,
  subcategoryNode?: { specFilter?: { kaKey: string; value: string } },
): Promise<Product[]> {
  let products = await getAllProducts();
  if (category) products = products.filter((p) => p.category === category);
  if (subcategoryNode?.specFilter) {
    const { kaKey, value } = subcategoryNode.specFilter;
    products = products.filter((p) => getSpecValue(p, kaKey) === value);
  }
  return products;
}

function computePriceRange(products: Product[]): { min: number; max: number } {
  if (products.length === 0) return { min: 0, max: 0 };
  let min = Infinity;
  let max = -Infinity;
  for (const p of products) {
    if (p.price < min) min = p.price;
    if (p.price > max) max = p.price;
  }
  return { min, max };
}

export async function getCategoryCounts(): Promise<Record<string, number>> {
  const products = await getAllProducts();
  const counts: Record<string, number> = { all: products.length };

  for (const p of products) {
    counts[p.category] = (counts[p.category] ?? 0) + 1;
  }

  const config = await getCatalogConfig();
  for (const cat of config.categories) {
    if (cat.children) {
      const categoryProducts = products.filter((p) => p.category === cat.parentCategory);
      for (const child of cat.children) {
        if (child.specFilter) {
          counts[child.id] = categoryProducts.filter(
            (p) => getSpecValue(p, child.specFilter!.kaKey) === child.specFilter!.value
          ).length;
        }
      }
    }
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
  const all = await getAllProducts();
  return all.filter((p) => {
    if (filters.category && p.category !== filters.category) return false;
    if (filters.brand && getSpecValue(p, 'ბრენდი') !== filters.brand) return false;
    if (filters.resolution && getSpecValue(p, 'რეზოლუცია') !== filters.resolution) return false;
    if (filters.bodyType && getSpecValue(p, 'კორპუსის ტიპი') !== filters.bodyType) return false;
    if (filters.nightVision && getSpecValue(p, 'ღამის ხედვა') !== filters.nightVision) return false;
    if (filters.wifi && getSpecValue(p, 'Wi-Fi') !== filters.wifi) return false;
    if (filters.minPrice !== undefined && p.price < filters.minPrice) return false;
    if (filters.maxPrice !== undefined && p.price > filters.maxPrice) return false;
    return true;
  });
}

export async function getUniqueSpecValues(kaKey: string): Promise<string[]> {
  const all = await getAllProducts();
  const values = new Set<string>();
  all.forEach((p) => {
    const v = getSpecValue(p, kaKey);
    if (v) values.add(v);
  });
  return Array.from(values).sort();
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
