import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type { Product, ProductCategory, SortOption } from '@/types/product.types';
import type { Article, ArticleCategory } from '@/types/article.types';
import type { FilterFieldConfig } from '@/lib/constants/filter-config';

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

// ── Paths ──────────────────────────────────────────────
const CONTENT_DIR = path.join(process.cwd(), 'content');
const PRODUCTS_DIR = path.join(CONTENT_DIR, 'products');
const ARTICLES_DIR = path.join(CONTENT_DIR, 'articles');
const CATALOG_CONFIG_PATH = path.join(CONTENT_DIR, 'catalog-config.json');
const SITE_SETTINGS_PATH = path.join(CONTENT_DIR, 'site-settings.json');
const ORDERS_PATH = path.join(CONTENT_DIR, 'orders.json');
const INQUIRIES_PATH = path.join(CONTENT_DIR, 'inquiries.json');
const PROJECTS_PATH = path.join(CONTENT_DIR, 'projects.json');

// ── Generic MDX reader ─────────────────────────────────
function readMdxFile<T>(filePath: string): { data: T; content: string } | null {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(raw);
    return { data: data as T, content: content.trim() };
  } catch {
    return null;
  }
}

function readAllMdxFiles<T>(dir: string): Array<{ data: T; content: string }> {
  try {
    if (!fs.existsSync(dir)) return [];
    return fs
      .readdirSync(dir)
      .filter((f) => f.endsWith('.mdx'))
      .map((f) => readMdxFile<T>(path.join(dir, f)))
      .filter((r): r is { data: T; content: string } => r !== null);
  } catch {
    return [];
  }
}

// ── Products ───────────────────────────────────────────
// Omit 'content' and 'description' from frontmatter — they come from MDX body
type ProductFrontmatter = Omit<Product, 'content' | 'description'>;

function parseProduct(entry: { data: ProductFrontmatter; content: string }): Product {
  const fm = entry.data;
  return {
    ...fm,
    content: entry.content,
    // Build description from content for backward compat
    description: fm.name, // fallback — pages that need description should use content
  };
}

export function getAllProducts(): Product[] {
  return readAllMdxFiles<ProductFrontmatter>(PRODUCTS_DIR)
    .map(parseProduct)
    .filter((p) => p.isActive)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getAllProductsAdmin(): Product[] {
  return readAllMdxFiles<ProductFrontmatter>(PRODUCTS_DIR)
    .map(parseProduct)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getProductById(id: string): Product | null {
  const entry = readMdxFile<ProductFrontmatter>(path.join(PRODUCTS_DIR, `${id}.mdx`));
  if (!entry) return null;
  return parseProduct(entry);
}

export function getProductsByCategory(category: ProductCategory): Product[] {
  return getAllProducts().filter((p) => p.category === category);
}

export function getFeaturedProducts(): Product[] {
  return getAllProducts().filter((p) => p.isFeatured).slice(0, 6);
}

export function getDiscountedProducts(): Product[] {
  return getAllProducts()
    .filter((p) => p.originalPrice !== undefined && p.originalPrice > p.price)
    .slice(0, 6);
}

export function getAllProductIds(): string[] {
  try {
    if (!fs.existsSync(PRODUCTS_DIR)) return [];
    return fs
      .readdirSync(PRODUCTS_DIR)
      .filter((f) => f.endsWith('.mdx'))
      .map((f) => f.replace('.mdx', ''));
  } catch {
    return [];
  }
}

// ── Product spec helpers (same logic as old products.ts) ──
export function getSpecValue(product: Product, kaKey: string): string {
  const spec = product.specs.find((s) => s.key.ka === kaKey);
  return spec?.value ?? '';
}

// ── Articles ───────────────────────────────────────────
type ArticleFrontmatter = Omit<Article, 'content'>;

function parseArticle(entry: { data: ArticleFrontmatter; content: string }): Article {
  return { ...entry.data, content: entry.content };
}

export function getAllArticles(): Article[] {
  return readAllMdxFiles<ArticleFrontmatter>(ARTICLES_DIR)
    .map(parseArticle)
    .filter((a) => a.isPublished)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getAllArticlesAdmin(): Article[] {
  return readAllMdxFiles<ArticleFrontmatter>(ARTICLES_DIR)
    .map(parseArticle)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getArticleById(id: string): Article | null {
  const entry = readMdxFile<ArticleFrontmatter>(path.join(ARTICLES_DIR, `${id}.mdx`));
  if (!entry) return null;
  return parseArticle(entry);
}

export function getArticleBySlug(slug: string): Article | null {
  const all = getAllArticlesAdmin();
  return all.find((a) => a.slug === slug) ?? null;
}

export function getArticlesByCategory(category: ArticleCategory): Article[] {
  return getAllArticles().filter((a) => a.category === category);
}

// ── Catalog Config ──────────────────────────────────────
export function getCatalogConfig(): CatalogConfig {
  try {
    const raw = fs.readFileSync(CATALOG_CONFIG_PATH, 'utf-8');
    return JSON.parse(raw) as CatalogConfig;
  } catch {
    return { categories: [], filters: {} };
  }
}

export function writeCatalogConfig(config: CatalogConfig): void {
  if (!fs.existsSync(CONTENT_DIR)) fs.mkdirSync(CONTENT_DIR, { recursive: true });
  fs.writeFileSync(CATALOG_CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
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
  social: { facebook: '', instagram: '', tiktok: '' },
  announcement: { enabled: false, text_ka: '', text_ru: '', text_en: '' },
};

export function getSiteSettings(): SiteSettings {
  try {
    const raw = fs.readFileSync(SITE_SETTINGS_PATH, 'utf-8');
    return JSON.parse(raw) as SiteSettings;
  } catch {
    return DEFAULT_SITE_SETTINGS;
  }
}

export function writeSiteSettings(settings: SiteSettings): void {
  if (!fs.existsSync(CONTENT_DIR)) fs.mkdirSync(CONTENT_DIR, { recursive: true });
  fs.writeFileSync(SITE_SETTINGS_PATH, JSON.stringify(settings, null, 2), 'utf-8');
}

// ── Orders ──────────────────────────────────────────────
export function getAllOrders(): Order[] {
  try {
    const raw = fs.readFileSync(ORDERS_PATH, 'utf-8');
    return (JSON.parse(raw) as Order[]).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch {
    return [];
  }
}

export function saveOrder(order: Order): void {
  const orders = getAllOrders();
  orders.unshift(order);
  if (!fs.existsSync(CONTENT_DIR)) fs.mkdirSync(CONTENT_DIR, { recursive: true });
  fs.writeFileSync(ORDERS_PATH, JSON.stringify(orders, null, 2), 'utf-8');
}

export function updateOrderStatus(orderId: string, status: Order['status']): void {
  const orders = getAllOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx === -1) return;
  orders[idx].status = status;
  fs.writeFileSync(ORDERS_PATH, JSON.stringify(orders, null, 2), 'utf-8');
}

// ── MDX file writing ───────────────────────────────────
export function writeProductMdx(id: string, frontmatter: Omit<Product, 'content' | 'description'>, body: string): void {
  const content = buildMdxString(frontmatter, body);
  if (!fs.existsSync(PRODUCTS_DIR)) fs.mkdirSync(PRODUCTS_DIR, { recursive: true });
  fs.writeFileSync(path.join(PRODUCTS_DIR, `${id}.mdx`), content, 'utf-8');
}

export function writeArticleMdx(id: string, frontmatter: Omit<Article, 'content'>, body: string): void {
  const content = buildMdxString(frontmatter, body);
  if (!fs.existsSync(ARTICLES_DIR)) fs.mkdirSync(ARTICLES_DIR, { recursive: true });
  fs.writeFileSync(path.join(ARTICLES_DIR, `${id}.mdx`), content, 'utf-8');
}

export function deleteProductMdx(id: string): boolean {
  const filePath = path.join(PRODUCTS_DIR, `${id}.mdx`);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
}

export function deleteArticleMdx(id: string): boolean {
  const filePath = path.join(ARTICLES_DIR, `${id}.mdx`);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
}

function buildMdxString(frontmatter: Record<string, unknown>, body: string): string {
  // Use gray-matter to stringify
  return matter.stringify(body, frontmatter);
}

// ── Re-export filter functions (same logic, using new source) ──
// These are kept identical to the old products.ts filter engine
// so the catalog page doesn't need any logic changes.

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

export function getFilteredProducts(
  filters: CatalogFilters,
  filterConfigs: FilterFieldConfig[],
  locale: string = 'ka',
): FilteredResult {
  let products = getAllProducts();

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

export function getProductsByCategoryAndSub(
  category?: ProductCategory,
  subcategoryNode?: { specFilter?: { kaKey: string; value: string } },
): Product[] {
  let products = getAllProducts();
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

export function getCategoryCounts(): Record<string, number> {
  const products = getAllProducts();
  const counts: Record<string, number> = { all: products.length };

  for (const p of products) {
    counts[p.category] = (counts[p.category] ?? 0) + 1;
  }

  // Dynamic subcategory counts from catalog config
  const config = getCatalogConfig();
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

export function getProductsFiltered(filters: ProductFilters): Product[] {
  return getAllProducts().filter((p) => {
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

export function getUniqueSpecValues(kaKey: string): string[] {
  const all = getAllProducts();
  const values = new Set<string>();
  all.forEach((p) => {
    const v = getSpecValue(p, kaKey);
    if (v) values.add(v);
  });
  return Array.from(values).sort();
}

// ── Inquiries ─────────────────────────────────────────
export function getAllInquiries(): Inquiry[] {
  try {
    const raw = fs.readFileSync(INQUIRIES_PATH, 'utf-8');
    return (JSON.parse(raw) as Inquiry[]).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch {
    return [];
  }
}

export function saveInquiry(inquiry: Inquiry): void {
  const inquiries = getAllInquiries();
  inquiries.unshift(inquiry);
  if (!fs.existsSync(CONTENT_DIR)) fs.mkdirSync(CONTENT_DIR, { recursive: true });
  fs.writeFileSync(INQUIRIES_PATH, JSON.stringify(inquiries, null, 2), 'utf-8');
}

export function deleteInquiry(id: string): void {
  const inquiries = getAllInquiries().filter((i) => i.id !== id);
  fs.writeFileSync(INQUIRIES_PATH, JSON.stringify(inquiries, null, 2), 'utf-8');
}

// ── Projects ─────────────────────────────────────────

export function getAllProjects(): Project[] {
  try {
    const raw = fs.readFileSync(PROJECTS_PATH, 'utf-8');
    const projects: Project[] = JSON.parse(raw);
    return projects
      .filter((p) => p.isActive)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    return [];
  }
}

export function getAllProjectsAdmin(): Project[] {
  try {
    const raw = fs.readFileSync(PROJECTS_PATH, 'utf-8');
    const projects: Project[] = JSON.parse(raw);
    return projects.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    return [];
  }
}

export function getProjectById(id: string): Project | null {
  const projects = getAllProjectsAdmin();
  return projects.find((p) => p.id === id) ?? null;
}

export function saveProject(project: Project): void {
  const projects = getAllProjectsAdmin();
  const idx = projects.findIndex((p) => p.id === project.id);
  if (idx >= 0) {
    projects[idx] = project;
  } else {
    projects.push(project);
  }
  fs.writeFileSync(PROJECTS_PATH, JSON.stringify(projects, null, 2), 'utf-8');
}

export function deleteProject(id: string): void {
  const projects = getAllProjectsAdmin().filter((p) => p.id !== id);
  fs.writeFileSync(PROJECTS_PATH, JSON.stringify(projects, null, 2), 'utf-8');
}
