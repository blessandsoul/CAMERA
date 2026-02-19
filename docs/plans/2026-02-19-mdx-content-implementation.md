# MDX Content System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate products from JSON to MDX, add article/blog system with WYSIWYG admin, all file-based (no server).

**Architecture:** Content stored as MDX files with YAML frontmatter in `content/` directory. `gray-matter` parses frontmatter, `next-mdx-remote` renders body. TipTap WYSIWYG in admin with `turndown` for HTML→Markdown. Server Actions read/write MDX files via `fs`.

**Tech Stack:** Next.js 16, gray-matter, next-mdx-remote, TipTap (WYSIWYG), turndown, Zod

---

## Task 1: Install Dependencies

**Files:**
- Modify: `client/package.json`

**Step 1: Install content parsing & rendering deps**

```bash
cd client && npm install gray-matter next-mdx-remote
```

**Step 2: Install TipTap WYSIWYG deps**

```bash
cd client && npm install @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link @tiptap/extension-underline
```

**Step 3: Install HTML→Markdown converter**

```bash
cd client && npm install turndown && npm install -D @types/turndown
```

**Step 4: Verify install succeeded**

```bash
cd client && npm ls gray-matter next-mdx-remote @tiptap/react turndown
```

**Step 5: Commit**

```bash
git add client/package.json client/package-lock.json
git commit -m "chore: add MDX, TipTap, and turndown dependencies"
```

---

## Task 2: Create Golden Example MDX Files

**Files:**
- Create: `content/products/camera-001.mdx` (golden example product)
- Create: `content/articles/article-001.mdx` (golden example article)
- Create: `content/README.md` (schema documentation)

**Step 1: Create content directories**

```bash
mkdir -p content/products content/articles
mkdir -p client/public/images/articles
```

**Step 2: Create golden product MDX**

Create `content/products/camera-001.mdx`:

```mdx
---
id: "camera-001"
slug: "tiandy-5-indoor-camera-1-4"
category: "cameras"
price: 129
currency: "GEL"
isActive: true
isFeatured: true
images:
  - "1_qtkl-r3.png"
name:
  ka: "IP კამერა 5მპ Fixed IR Fisheye, Tiandy - TC-C35VN"
  ru: "Tiandy 5 მპ внутренняя камера 1.4 მმ"
  en: "Tiandy 5 მპ indoor Camera 1.4 ממ"
specs:
  - key: { ka: "ბრენდი", en: "Brand", ru: "Бренд" }
    value: "Tiandy"
  - key: { ka: "კამერის ტიპი", en: "Camera Type", ru: "Тип камеры" }
    value: "IP"
  - key: { ka: "კორპუსის ტიპი", en: "Body Type", ru: "Тип корпуса" }
    value: "შიდა გამოყენების"
  - key: { ka: "CMOS სენსორი", en: "CMOS Sensor", ru: "CMOS сенсор" }
    value: "1/2.7\" CMOS"
  - key: { ka: "ლინზა", en: "Lens", ru: "Объектив" }
    value: "1.4 მმ"
  - key: { ka: "ხედვის კუთხე", en: "View Angle", ru: "Угол обзора" }
    value: "180°"
  - key: { ka: "ღამის ხედვა", en: "Night Vision", ru: "Ночное видение" }
    value: "ჭკვიანი"
  - key: { ka: "ღამის ხედვა (მანძილი)", en: "Night Vision Range", ru: "Дальность ночного видения" }
    value: "30 მეტრი"
  - key: { ka: "რეზოლუცია", en: "Resolution", ru: "Разрешение" }
    value: "5 მპ"
  - key: { ka: "მიკროფონი", en: "Microphone", ru: "Микрофон" }
    value: "კი"
  - key: { ka: "Micro SD", en: "Micro SD", ru: "Micro SD" }
    value: "512 GB"
createdAt: "2026-02-18T20:55:02.845Z"
---

IP კამერა 5მპ Fixed IR Fisheye, Tiandy - TC-C35VN. შიდა გამოყენების გამოყენება. რეზოლუცია: 5 მპ. ლინზა: 1.4 მმ.
```

**Step 3: Create golden article MDX**

Create `content/articles/article-001.mdx`:

```mdx
---
id: "article-001"
slug: "rogor-aviron-sakhlis-kamera"
title: "როგორ ავირჩიოთ სახლისთვის სათვალთვალო კამერა 2025 წელს"
excerpt: "IP კამერა, WiFi კამერა თუ ანალოგური? განვიხილოთ მთავარი განსხვავებები და ვარიანტი თქვენი ბიუჯეტისა და მოთხოვნების მიხედვით."
category: "guides"
coverImage: ""
isPublished: true
readMin: 5
createdAt: "2026-02-19T10:00:00.000Z"
updatedAt: "2026-02-19T10:00:00.000Z"
---

# როგორ ავირჩიოთ სახლისთვის სათვალთვალო კამერა

სათვალთვალო კამერის შერჩევა ბევრ ფაქტორზეა დამოკიდებული. ამ სტატიაში განვიხილავთ მთავარ კრიტერიუმებს.

## IP კამერა vs WiFi კამერა

**IP კამერები** უკეთეს ხარისხს გვთავაზობენ და უფრო საიმედოა სტაბილური კავშირისთვის. ისინი ქსელურ კაბელს იყენებენ (PoE).

**WiFi კამერები** მარტივია დასამონტაჟებელი — არ სჭირდება კაბელი. იდეალურია ბინებისთვის და მცირე ოფისებისთვის.

## რას მივაქციოთ ყურადღება?

1. **რეზოლუცია** — მინიმუმ 2მპ (1080p), რეკომენდებულია 5მპ
2. **ღამის ხედვა** — Smart IR ტექნოლოგია უკეთესი შედეგის იძლევა
3. **Micro SD** — ლოკალური ჩაწერა ინტერნეტის გარეშე
4. **წყალგაუმტარობა** — გარე მონტაჟისთვის IP67 სტანდარტი

## რეკომენდაცია

სახლისთვის რეკომენდაციაა **Tiandy 5მპ IP კამერა** — საუკეთესო ფას-ხარისხის თანაფარდობით.
```

**Step 4: Create content README**

Create `content/README.md`:

```markdown
# Content Directory

All site content is stored here as MDX files with YAML frontmatter.

## Products — `products/*.mdx`

Frontmatter fields: id, slug, category, price, currency, isActive, isFeatured, images, name (ka/ru/en), specs, createdAt

## Articles — `articles/*.mdx`

Frontmatter fields: id, slug, title, excerpt, category, coverImage, isPublished, readMin, createdAt, updatedAt

Article categories: cameras, nvr, installation, news, guides
```

**Step 5: Commit**

```bash
git add content/
git commit -m "feat: add golden example MDX files for products and articles"
```

---

## Task 3: Content Reading Library

Replaces the existing `client/src/lib/products.ts` with an MDX-aware reader that parses frontmatter with `gray-matter`.

**Files:**
- Create: `client/src/lib/content.ts`
- Create: `client/src/types/article.types.ts`
- Modify: `client/src/types/product.types.ts` (add `content` field)

**Step 1: Create article types**

Create `client/src/types/article.types.ts`:

```typescript
export type ArticleCategory = 'cameras' | 'nvr' | 'installation' | 'news' | 'guides';

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: ArticleCategory;
  coverImage: string;
  isPublished: boolean;
  readMin: number;
  createdAt: string;
  updatedAt: string;
  content: string; // raw MDX body
}
```

**Step 2: Add `content` field to Product type**

In `client/src/types/product.types.ts`, add an optional `content` field for the MDX body:

```typescript
export interface Product {
  id: string;
  slug: string;
  category: ProductCategory;
  price: number;
  currency: string;
  isActive: boolean;
  isFeatured: boolean;
  images: string[];
  name: LocalizedString;
  description: LocalizedString; // keep for backward compat during migration
  specs: ProductSpec[];
  createdAt: string;
  content?: string; // MDX body (rich description)
}
```

**Step 3: Create content library**

Create `client/src/lib/content.ts`. This is the main content reading engine:

```typescript
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type { Product, ProductCategory, SortOption } from '@/types/product.types';
import type { Article, ArticleCategory } from '@/types/article.types';
import type { FilterFieldConfig } from '@/lib/constants/filter-config';
import type { CategoryNode } from '@/lib/constants/category-tree';

// ── Paths ──────────────────────────────────────────────
const CONTENT_DIR = path.join(process.cwd(), '..', 'content');
const PRODUCTS_DIR = path.join(CONTENT_DIR, 'products');
const ARTICLES_DIR = path.join(CONTENT_DIR, 'articles');

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
  subcategoryNode?: CategoryNode;
  specs: Record<string, string[]>;
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
  subcategoryNode?: CategoryNode,
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

  const cameras = products.filter((p) => p.category === 'cameras');
  const subCounts: Record<string, { kaKey: string; value: string }> = {
    'cameras-ip': { kaKey: 'კამერის ტიპი', value: 'IP' },
    'cameras-analog': { kaKey: 'კამერის ტიპი', value: 'ანალოგური' },
    'cameras-wifi': { kaKey: 'Wi-Fi', value: 'კი' },
    'cameras-ptz': { kaKey: 'PTZ / PT', value: 'PTZ' },
    'cameras-pt': { kaKey: 'PTZ / PT', value: 'PT' },
  };
  for (const [id, filter] of Object.entries(subCounts)) {
    counts[id] = cameras.filter((p) => getSpecValue(p, filter.kaKey) === filter.value).length;
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
```

**Step 4: Commit**

```bash
git add client/src/lib/content.ts client/src/types/article.types.ts client/src/types/product.types.ts
git commit -m "feat: add content reading library with gray-matter MDX parsing"
```

---

## Task 4: Migration Script (JSON → MDX)

**Files:**
- Create: `scripts/migrate-products-to-mdx.js`

**Step 1: Write migration script**

Create `scripts/migrate-products-to-mdx.js`:

```javascript
const fs = require('fs');
const path = require('path');

const JSON_DIR = path.join(__dirname, '..', 'client', 'public', 'data', 'products');
const MDX_DIR = path.join(__dirname, '..', 'content', 'products');

// Ensure output dir exists
if (!fs.existsSync(MDX_DIR)) {
  fs.mkdirSync(MDX_DIR, { recursive: true });
}

const files = fs.readdirSync(JSON_DIR).filter((f) => f.endsWith('.json'));
console.log(`Found ${files.length} JSON product files to migrate.`);

let migrated = 0;
let errors = 0;

for (const file of files) {
  try {
    const raw = fs.readFileSync(path.join(JSON_DIR, file), 'utf-8');
    const product = JSON.parse(raw);

    // Build frontmatter object (everything except description — that becomes body)
    const frontmatter = {
      id: product.id,
      slug: product.slug,
      category: product.category,
      price: product.price,
      currency: product.currency,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      images: product.images,
      name: product.name,
      specs: product.specs,
      createdAt: product.createdAt,
    };

    // Body = Georgian description (primary content)
    const body = product.description?.ka || '';

    // Convert frontmatter to YAML
    const yaml = toYaml(frontmatter);
    const mdxContent = `---\n${yaml}---\n\n${body}\n`;

    const outFile = file.replace('.json', '.mdx');
    fs.writeFileSync(path.join(MDX_DIR, outFile), mdxContent, 'utf-8');
    migrated++;
  } catch (err) {
    console.error(`Error migrating ${file}:`, err.message);
    errors++;
  }
}

console.log(`\nDone! Migrated: ${migrated}, Errors: ${errors}`);

// Simple YAML serializer for our known structure
function toYaml(obj, indent = 0) {
  const pad = '  '.repeat(indent);
  let result = '';

  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) continue;

    if (typeof value === 'string') {
      // Quote strings that contain special chars
      if (value.includes(':') || value.includes('#') || value.includes('"') || value.includes("'") || value.includes('\n') || value === '' || value === 'true' || value === 'false') {
        result += `${pad}${key}: ${JSON.stringify(value)}\n`;
      } else {
        result += `${pad}${key}: ${value}\n`;
      }
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      result += `${pad}${key}: ${value}\n`;
    } else if (Array.isArray(value)) {
      if (value.length === 0) {
        result += `${pad}${key}: []\n`;
      } else if (typeof value[0] === 'string') {
        // Simple string array
        result += `${pad}${key}:\n`;
        for (const item of value) {
          result += `${pad}  - ${JSON.stringify(item)}\n`;
        }
      } else if (typeof value[0] === 'object') {
        // Array of objects (specs)
        result += `${pad}${key}:\n`;
        for (const item of value) {
          // Inline spec format: - key: { ka: "...", en: "...", ru: "..." }
          if (item.key && item.value !== undefined) {
            const keyObj = `{ ka: ${JSON.stringify(item.key.ka)}, en: ${JSON.stringify(item.key.en)}, ru: ${JSON.stringify(item.key.ru)} }`;
            result += `${pad}  - key: ${keyObj}\n`;
            result += `${pad}    value: ${JSON.stringify(item.value)}\n`;
          }
        }
      }
    } else if (typeof value === 'object') {
      // Nested object (name, description)
      result += `${pad}${key}:\n`;
      result += toYaml(value, indent + 1);
    }
  }

  return result;
}
```

**Step 2: Run migration**

```bash
node scripts/migrate-products-to-mdx.js
```

Expected output: `Found 90 JSON product files to migrate. Done! Migrated: 90, Errors: 0`

**Step 3: Verify a migrated file looks correct**

Compare the golden example with a migrated file — frontmatter structure should match.

**Step 4: Commit**

```bash
git add scripts/migrate-products-to-mdx.js content/products/
git commit -m "feat: migrate 90 products from JSON to MDX format"
```

---

## Task 5: Switch Imports from products.ts to content.ts

Update all files that import from `@/lib/products` to import from `@/lib/content` instead. The API is identical — same function names and types.

**Files to modify:**
- `client/src/app/[locale]/page.tsx` — imports: `getFeaturedProducts`, `getAllProducts`
- `client/src/app/[locale]/catalog/page.tsx` — imports: `getFilteredProducts`, `getProductsByCategoryAndSub`, `getAvailableSpecValues`, `getCategoryCounts` + types `SpecValueOption`
- `client/src/app/[locale]/catalog/[id]/page.tsx` — imports: `getProductById`, `getAllProductIds`
- `client/src/app/admin/dashboard/page.tsx` — imports: `getAllProductsAdmin`
- `client/src/app/admin/products/[id]/edit/page.tsx` — imports: `getProductById`
- `client/src/features/admin/actions/product.actions.ts` — will be rewritten in Task 7

**Step 1: Update each file's import**

In every file listed above, change:
```typescript
// OLD
import { ... } from '@/lib/products';
// NEW
import { ... } from '@/lib/content';
```

Do NOT change any other code — only the import path.

**Step 2: Verify build succeeds**

```bash
cd client && npm run build
```

If it succeeds, the switch is working.

**Step 3: Commit**

```bash
git add -A
git commit -m "refactor: switch all imports from products.ts to content.ts"
```

---

## Task 6: Update Product Admin Actions for MDX

Rewrite `product.actions.ts` to use `content.ts` write functions instead of raw JSON `fs.writeFileSync`.

**Files:**
- Modify: `client/src/features/admin/actions/product.actions.ts`

**Step 1: Rewrite product actions**

Replace the entire file with:

```typescript
'use server';

import fs from 'fs';
import path from 'path';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getProductById, writeProductMdx, deleteProductMdx } from '@/lib/content';
import type { Product, ProductCategory } from '@/types/product.types';

const IMAGES_DIR = path.join(process.cwd(), 'public', 'images', 'products');

async function requireAdmin(): Promise<void> {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');
  if (session?.value !== process.env.ADMIN_SESSION_SECRET) {
    redirect('/admin');
  }
}

export async function createProduct(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = `product-${Date.now()}`;
  const frontmatter = {
    id,
    slug: (formData.get('slug') as string) || id,
    category: (formData.get('category') as ProductCategory) || 'cameras',
    price: Number(formData.get('price')) || 0,
    currency: 'GEL',
    isActive: formData.get('isActive') === 'true',
    isFeatured: formData.get('isFeatured') === 'true',
    images: JSON.parse((formData.get('images') as string) || '[]') as string[],
    name: {
      ka: (formData.get('name_ka') as string) || '',
      ru: (formData.get('name_ru') as string) || '',
      en: (formData.get('name_en') as string) || '',
    },
    specs: JSON.parse((formData.get('specs') as string) || '[]') as Product['specs'],
    createdAt: new Date().toISOString(),
  };

  const body = (formData.get('description_ka') as string) || '';
  writeProductMdx(id, frontmatter, body);

  revalidatePath('/');
  redirect('/admin/dashboard');
}

export async function updateProduct(id: string, formData: FormData): Promise<void> {
  await requireAdmin();

  const existing = getProductById(id);
  if (!existing) redirect('/admin/dashboard');

  const frontmatter = {
    id,
    slug: (formData.get('slug') as string) || existing.slug,
    category: (formData.get('category') as ProductCategory) || existing.category,
    price: Number(formData.get('price')) || existing.price,
    currency: existing.currency,
    isActive: formData.get('isActive') === 'true',
    isFeatured: formData.get('isFeatured') === 'true',
    images: JSON.parse((formData.get('images') as string) || JSON.stringify(existing.images)) as string[],
    name: {
      ka: (formData.get('name_ka') as string) || existing.name.ka,
      ru: (formData.get('name_ru') as string) || existing.name.ru,
      en: (formData.get('name_en') as string) || existing.name.en,
    },
    specs: JSON.parse((formData.get('specs') as string) || JSON.stringify(existing.specs)) as Product['specs'],
    createdAt: existing.createdAt,
  };

  const body = (formData.get('description_ka') as string) || existing.content || '';
  writeProductMdx(id, frontmatter, body);

  revalidatePath('/');
  redirect('/admin/dashboard');
}

export async function deleteProduct(id: string): Promise<void> {
  await requireAdmin();

  const product = getProductById(id);
  if (product) {
    for (const img of product.images) {
      const imgPath = path.join(IMAGES_DIR, img);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }
    deleteProductMdx(id);
  }

  revalidatePath('/');
  redirect('/admin/dashboard');
}

export async function toggleProductActive(id: string, isActive: boolean): Promise<void> {
  await requireAdmin();

  const product = getProductById(id);
  if (!product) return;

  const frontmatter = {
    id: product.id,
    slug: product.slug,
    category: product.category,
    price: product.price,
    currency: product.currency,
    isActive,
    isFeatured: product.isFeatured,
    images: product.images,
    name: product.name,
    specs: product.specs,
    createdAt: product.createdAt,
  };

  writeProductMdx(id, frontmatter, product.content || '');
  revalidatePath('/');
}
```

**Step 2: Verify admin CRUD works**

```bash
cd client && npm run build
```

**Step 3: Commit**

```bash
git add client/src/features/admin/actions/product.actions.ts
git commit -m "refactor: update product admin actions to use MDX content library"
```

---

## Task 7: TipTap WYSIWYG Editor Component

**Files:**
- Create: `client/src/features/admin/components/RichTextEditor.tsx`

**Step 1: Create TipTap wrapper**

Create `client/src/features/admin/components/RichTextEditor.tsx`:

```tsx
'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import LinkExtension from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import { useRef, useCallback } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
}

export function RichTextEditor({ content, onChange }: RichTextEditorProps): React.ReactElement {
  const fileRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      ImageExtension.configure({
        inline: false,
        allowBase64: false,
      }),
      LinkExtension.configure({
        openOnClick: false,
      }),
      Underline,
    ],
    content,
    onUpdate: ({ editor: e }) => {
      onChange(e.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-invert prose-sm max-w-none min-h-[300px] px-4 py-3 focus:outline-none',
      },
    },
  });

  const addImage = useCallback(async (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const data = (await res.json()) as { success: boolean; filename?: string };
    if (data.success && data.filename && editor) {
      editor
        .chain()
        .focus()
        .setImage({ src: `/images/products/${data.filename}` })
        .run();
    }
  }, [editor]);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) addImage(file);
    if (fileRef.current) fileRef.current.value = '';
  }, [addImage]);

  const handleLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('URL:', prev || 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  }, [editor]);

  if (!editor) return <div className="h-[300px] bg-[#002855] rounded-lg animate-pulse" />;

  const btnClass = (active: boolean): string =>
    `p-1.5 rounded text-sm transition-colors cursor-pointer ${
      active
        ? 'bg-[#0466c8] text-white'
        : 'text-[#979dac] hover:text-white hover:bg-[#33415c]'
    }`;

  return (
    <div className="rounded-xl border border-[#33415c] overflow-hidden bg-[#002855]">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 px-3 py-2 border-b border-[#33415c] bg-[#001845]">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btnClass(editor.isActive('bold'))} title="Bold">
          <strong>B</strong>
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btnClass(editor.isActive('italic'))} title="Italic">
          <em>I</em>
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={btnClass(editor.isActive('underline'))} title="Underline">
          <u>U</u>
        </button>

        <div className="w-px h-5 bg-[#33415c] mx-1" />

        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={btnClass(editor.isActive('heading', { level: 1 }))} title="H1">
          H1
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btnClass(editor.isActive('heading', { level: 2 }))} title="H2">
          H2
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btnClass(editor.isActive('heading', { level: 3 }))} title="H3">
          H3
        </button>

        <div className="w-px h-5 bg-[#33415c] mx-1" />

        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnClass(editor.isActive('bulletList'))} title="Bullet List">
          &#8226; List
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btnClass(editor.isActive('orderedList'))} title="Ordered List">
          1. List
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btnClass(editor.isActive('blockquote'))} title="Quote">
          &ldquo; Quote
        </button>

        <div className="w-px h-5 bg-[#33415c] mx-1" />

        <button type="button" onClick={handleLink} className={btnClass(editor.isActive('link'))} title="Link">
          Link
        </button>
        <button type="button" onClick={() => fileRef.current?.click()} className={btnClass(false)} title="Image">
          Img
        </button>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageUpload} />
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add client/src/features/admin/components/RichTextEditor.tsx
git commit -m "feat: add TipTap WYSIWYG editor component with dark theme"
```

---

## Task 8: Article Admin CRUD

**Files:**
- Create: `client/src/features/admin/actions/article.actions.ts`
- Create: `client/src/features/admin/components/ArticleForm.tsx`
- Create: `client/src/app/admin/articles/page.tsx`
- Create: `client/src/app/admin/articles/new/page.tsx`
- Create: `client/src/app/admin/articles/[id]/edit/page.tsx`
- Modify: `client/src/features/admin/components/AdminHeader.tsx` (add Articles tab)

**Step 1: Create article server actions**

Create `client/src/features/admin/actions/article.actions.ts`:

```typescript
'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getArticleById, writeArticleMdx, deleteArticleMdx } from '@/lib/content';
import type { ArticleCategory } from '@/types/article.types';

async function requireAdmin(): Promise<void> {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');
  if (session?.value !== process.env.ADMIN_SESSION_SECRET) {
    redirect('/admin');
  }
}

export async function createArticle(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = `article-${Date.now()}`;
  const now = new Date().toISOString();

  const frontmatter = {
    id,
    slug: (formData.get('slug') as string) || id,
    title: (formData.get('title') as string) || '',
    excerpt: (formData.get('excerpt') as string) || '',
    category: (formData.get('category') as ArticleCategory) || 'guides',
    coverImage: (formData.get('coverImage') as string) || '',
    isPublished: formData.get('isPublished') === 'true',
    readMin: Number(formData.get('readMin')) || 5,
    createdAt: now,
    updatedAt: now,
  };

  const body = (formData.get('body') as string) || '';
  writeArticleMdx(id, frontmatter, body);

  revalidatePath('/');
  redirect('/admin/articles');
}

export async function updateArticle(id: string, formData: FormData): Promise<void> {
  await requireAdmin();

  const existing = getArticleById(id);
  if (!existing) redirect('/admin/articles');

  const frontmatter = {
    id,
    slug: (formData.get('slug') as string) || existing.slug,
    title: (formData.get('title') as string) || existing.title,
    excerpt: (formData.get('excerpt') as string) || existing.excerpt,
    category: (formData.get('category') as ArticleCategory) || existing.category,
    coverImage: (formData.get('coverImage') as string) || existing.coverImage,
    isPublished: formData.get('isPublished') === 'true',
    readMin: Number(formData.get('readMin')) || existing.readMin,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  };

  const body = (formData.get('body') as string) || existing.content;
  writeArticleMdx(id, frontmatter, body);

  revalidatePath('/');
  redirect('/admin/articles');
}

export async function deleteArticle(id: string): Promise<void> {
  await requireAdmin();
  deleteArticleMdx(id);
  revalidatePath('/');
  redirect('/admin/articles');
}

export async function toggleArticlePublished(id: string, isPublished: boolean): Promise<void> {
  await requireAdmin();

  const article = getArticleById(id);
  if (!article) return;

  const frontmatter = {
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    category: article.category,
    coverImage: article.coverImage,
    isPublished,
    readMin: article.readMin,
    createdAt: article.createdAt,
    updatedAt: new Date().toISOString(),
  };

  writeArticleMdx(id, frontmatter, article.content);
  revalidatePath('/');
}
```

**Step 2: Create article form with WYSIWYG**

Create `client/src/features/admin/components/ArticleForm.tsx`:

```tsx
'use client';

import { useState, useRef } from 'react';
import TurndownService from 'turndown';
import { RichTextEditor } from './RichTextEditor';
import type { Article } from '@/types/article.types';

interface ArticleFormProps {
  article?: Article;
  action: (formData: FormData) => Promise<void>;
}

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
});

export function ArticleForm({ article, action }: ArticleFormProps): React.ReactElement {
  const [isPublished, setIsPublished] = useState(article?.isPublished ?? false);
  const [coverImage, setCoverImage] = useState(article?.coverImage ?? '');
  const [uploading, setUploading] = useState(false);
  const [bodyHtml, setBodyHtml] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Convert existing markdown content to simple HTML for the editor
  // For new articles, start empty
  const initialContent = article?.content
    ? markdownToSimpleHtml(article.content)
    : '';

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const data = (await res.json()) as { success: boolean; filename?: string };
    if (data.success && data.filename) {
      setCoverImage(`/images/products/${data.filename}`);
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  }

  function handleSubmit(formData: FormData): void {
    // Convert TipTap HTML to Markdown for MDX storage
    const markdown = turndown.turndown(bodyHtml || initialContent);
    formData.set('body', markdown);
    formData.set('coverImage', coverImage);
    formData.set('isPublished', isPublished ? 'true' : 'false');
    action(formData);
  }

  const fieldClass =
    'w-full px-3 py-2 rounded-lg bg-[#002855] border border-[#33415c] text-white placeholder-[#7d8597] focus:outline-none focus:border-[#0466c8] transition-colors text-sm';
  const labelClass = 'block text-xs text-[#979dac] mb-1';

  return (
    <form ref={formRef} action={handleSubmit} className="flex flex-col gap-6 max-w-3xl">

      {/* Cover Image */}
      <section className="p-4 rounded-xl bg-[#001845] border border-[#33415c]">
        <h3 className="text-sm font-semibold text-white mb-3">Cover Image</h3>
        {coverImage && (
          <div className="relative w-full h-48 rounded-lg overflow-hidden bg-[#002855] mb-3">
            <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => setCoverImage('')}
              className="absolute top-2 right-2 w-6 h-6 bg-black/70 rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-black/90"
            >
              ✕
            </button>
          </div>
        )}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2 rounded-lg border border-dashed border-[#33415c] hover:border-[#0466c8] text-[#979dac] hover:text-[#0466c8] text-sm transition-colors disabled:opacity-50 cursor-pointer"
        >
          {uploading ? 'Uploading...' : 'Upload Cover'}
        </button>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleCoverUpload} />
      </section>

      {/* Meta */}
      <section className="p-4 rounded-xl bg-[#001845] border border-[#33415c] grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className={labelClass}>Title</label>
          <input name="title" defaultValue={article?.title ?? ''} placeholder="სტატიის სათაური" className={fieldClass} required />
        </div>
        <div className="col-span-2">
          <label className={labelClass}>Slug (URL)</label>
          <input name="slug" defaultValue={article?.slug ?? ''} placeholder="rogor-aviron-kamera" className={fieldClass} />
        </div>
        <div className="col-span-2">
          <label className={labelClass}>Excerpt (short description)</label>
          <textarea name="excerpt" defaultValue={article?.excerpt ?? ''} rows={2} className={`${fieldClass} resize-y`} placeholder="მოკლე აღწერა..." />
        </div>
        <div>
          <label className={labelClass}>Category</label>
          <select name="category" defaultValue={article?.category ?? 'guides'} className={fieldClass}>
            <option value="cameras">კამერები</option>
            <option value="nvr">NVR / DVR</option>
            <option value="installation">მონტაჟი</option>
            <option value="news">სიახლეები</option>
            <option value="guides">გაიდები</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Read time (min)</label>
          <input name="readMin" type="number" min="1" max="60" defaultValue={article?.readMin ?? 5} className={fieldClass} />
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-4 h-4 accent-[#0466c8]"
            />
            <span className="text-sm text-[#979dac]">Published</span>
          </label>
        </div>
      </section>

      {/* WYSIWYG Editor */}
      <section className="p-4 rounded-xl bg-[#001845] border border-[#33415c]">
        <h3 className="text-sm font-semibold text-white mb-3">Content</h3>
        <RichTextEditor content={initialContent} onChange={setBodyHtml} />
      </section>

      {/* Submit */}
      <button
        type="submit"
        className="self-start px-6 py-3 bg-[#0466c8] hover:bg-[#0353a4] active:scale-[0.98] text-white font-semibold rounded-xl transition-all duration-200 cursor-pointer"
      >
        Save Article
      </button>
    </form>
  );
}

// Very basic markdown → HTML for initializing the editor with existing content
function markdownToSimpleHtml(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^\- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hupbolia])/gm, '<p>')
    .replace(/<p><\/p>/g, '');
}
```

**Step 3: Create articles list page**

Create `client/src/app/admin/articles/page.tsx`:

```tsx
import Link from 'next/link';
import { getAllArticlesAdmin } from '@/lib/content';
import { AdminHeader } from '@/features/admin/components/AdminHeader';
import { toggleArticlePublished } from '@/features/admin/actions/article.actions';
import { DeleteArticleButton } from '@/features/admin/components/DeleteArticleButton';

export default async function AdminArticlesPage(): Promise<React.ReactElement> {
  const articles = getAllArticlesAdmin();

  return (
    <>
      <AdminHeader />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Articles ({articles.length})</h1>
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-16 text-[#979dac]">
            No articles yet.{' '}
            <Link href="/admin/articles/new" className="text-[#0466c8] hover:underline">
              Write your first article.
            </Link>
          </div>
        ) : (
          <div className="rounded-xl border border-[#33415c] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#33415c] bg-[#001845]">
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#979dac]">Title</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#979dac]">Category</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#979dac]">Read</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#979dac]">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#979dac]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article, i) => (
                  <tr
                    key={article.id}
                    className={`border-b border-[#33415c] last:border-0 ${i % 2 === 0 ? 'bg-[#001233]' : 'bg-[#001845]'}`}
                  >
                    <td className="px-4 py-3">
                      <span className="text-sm text-white font-medium">{article.title}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-1 rounded-full bg-[#0466c8]/10 text-[#0466c8] border border-[#0466c8]/20">
                        {article.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-[#979dac] tabular-nums">{article.readMin} min</span>
                    </td>
                    <td className="px-4 py-3">
                      <form action={toggleArticlePublished.bind(null, article.id, !article.isPublished)}>
                        <button
                          type="submit"
                          className={`text-xs px-2 py-1 rounded-full border transition-colors cursor-pointer ${
                            article.isPublished
                              ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20'
                              : 'bg-[#33415c]/10 text-[#7d8597] border-[#33415c]/20 hover:bg-[#33415c]/20'
                          }`}
                        >
                          {article.isPublished ? 'Published' : 'Draft'}
                        </button>
                      </form>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/articles/${article.id}/edit`}
                          className="p-1.5 rounded-lg text-[#979dac] hover:text-white hover:bg-[#33415c] transition-colors"
                          aria-label="Edit article"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </Link>
                        <DeleteArticleButton articleId={article.id} articleTitle={article.title} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
```

**Step 4: Create DeleteArticleButton component**

Create `client/src/features/admin/components/DeleteArticleButton.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { deleteArticle } from '@/features/admin/actions/article.actions';

interface DeleteArticleButtonProps {
  articleId: string;
  articleTitle: string;
}

export function DeleteArticleButton({ articleId, articleTitle }: DeleteArticleButtonProps): React.ReactElement {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-xs text-red-400">Delete?</span>
        <form action={deleteArticle.bind(null, articleId)}>
          <button type="submit" className="text-xs px-2 py-1 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20 transition-colors cursor-pointer">
            Yes
          </button>
        </form>
        <button onClick={() => setConfirming(false)} className="text-xs px-2 py-1 text-[#979dac] hover:text-white transition-colors cursor-pointer">
          No
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="p-1.5 rounded-lg text-[#979dac] hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
      aria-label={`Delete ${articleTitle}`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
      </svg>
    </button>
  );
}
```

**Step 5: Create new article page**

Create `client/src/app/admin/articles/new/page.tsx`:

```tsx
import { AdminHeader } from '@/features/admin/components/AdminHeader';
import { ArticleForm } from '@/features/admin/components/ArticleForm';
import { createArticle } from '@/features/admin/actions/article.actions';

export default function NewArticlePage(): React.ReactElement {
  return (
    <>
      <AdminHeader />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-white mb-8">New Article</h1>
        <ArticleForm action={createArticle} />
      </div>
    </>
  );
}
```

**Step 6: Create edit article page**

Create `client/src/app/admin/articles/[id]/edit/page.tsx`:

```tsx
import { notFound } from 'next/navigation';
import { AdminHeader } from '@/features/admin/components/AdminHeader';
import { ArticleForm } from '@/features/admin/components/ArticleForm';
import { getArticleById } from '@/lib/content';
import { updateArticle } from '@/features/admin/actions/article.actions';

interface EditArticlePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditArticlePage({ params }: EditArticlePageProps): Promise<React.ReactElement> {
  const { id } = await params;
  const article = getArticleById(id);

  if (!article) notFound();

  const updateArticleWithId = updateArticle.bind(null, id);

  return (
    <>
      <AdminHeader />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-white mb-8">Edit: {article.title}</h1>
        <ArticleForm article={article} action={updateArticleWithId} />
      </div>
    </>
  );
}
```

**Step 7: Update AdminHeader with Articles tab**

Modify `client/src/features/admin/components/AdminHeader.tsx`:

Add an "Articles" nav link next to "Products", and an "Add Article" button. The component currently uses `useRouter` and has hardcoded nav.

Updated AdminHeader should have:
- Products link → `/admin/dashboard`
- Articles link → `/admin/articles`
- "Add Product" button
- "Add Article" button
- Active state based on current pathname (use `usePathname()`)

Replace the nav/buttons section to include both tabs and detect current section to show appropriate add button.

**Step 8: Commit**

```bash
git add client/src/features/admin/ client/src/app/admin/articles/
git commit -m "feat: add article admin CRUD with WYSIWYG editor"
```

---

## Task 9: Public Blog Pages

**Files:**
- Create: `client/src/app/[locale]/blog/page.tsx`
- Create: `client/src/app/[locale]/blog/[slug]/page.tsx`
- Modify: `client/src/components/common/BlogSection.tsx` (read from MDX instead of hardcoded)

**Step 1: Create blog listing page**

Create `client/src/app/[locale]/blog/page.tsx`:

```tsx
import Link from 'next/link';
import Image from 'next/image';
import { Clock, ArrowLeft } from '@phosphor-icons/react/dist/ssr';
import { getAllArticles } from '@/lib/content';

interface BlogPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata() {
  return { title: 'TechBrain — სტატიები და რჩევები' };
}

export default async function BlogPage({ params }: BlogPageProps): Promise<React.ReactElement> {
  const { locale } = await params;
  const articles = getAllArticles();

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12">
      <Link
        href={`/${locale}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft size={16} weight="bold" />
        მთავარი
      </Link>

      <h1 className="text-3xl font-bold text-foreground mb-8">სტატიები და რჩევები</h1>

      {articles.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          ჯერ სტატიები არ არის.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article, i) => (
            <Link key={article.id} href={`/${locale}/blog/${article.slug}`} className="group">
              <article className="flex flex-col rounded-xl overflow-hidden border border-border/50 bg-card shadow-sm transition-all duration-300 hover:shadow-lg motion-safe:hover:-translate-y-0.5 hover:border-primary/20">
                {article.coverImage && (
                  <div className="relative h-48 overflow-hidden bg-muted shrink-0">
                    <Image
                      src={article.coverImage}
                      alt={article.title}
                      fill
                      priority={i === 0}
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                )}
                <div className="flex flex-col flex-1 p-5 gap-3">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      {article.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <Clock size={13} weight="regular" />
                      <span className="text-xs">{article.readMin} წთ</span>
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1">
                    {article.excerpt}
                  </p>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Step 2: Create blog post page with MDX rendering**

Create `client/src/app/[locale]/blog/[slug]/page.tsx`:

```tsx
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Clock, CalendarBlank } from '@phosphor-icons/react/dist/ssr';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getArticleBySlug, getAllArticles } from '@/lib/content';

interface BlogPostPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  const articles = getAllArticles();
  const locales = ['ka', 'ru', 'en'];
  return locales.flatMap((locale) =>
    articles.map((a) => ({ locale, slug: a.slug }))
  );
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: 'Not found' };
  return {
    title: `TechBrain — ${article.title}`,
    description: article.excerpt,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps): Promise<React.ReactElement> {
  const { locale, slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-24 text-center text-muted-foreground">
        სტატია ვერ მოიძებნა.
      </div>
    );
  }

  const dateFormatted = new Intl.DateTimeFormat('ka-GE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(article.createdAt));

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12">
      <Link
        href={`/${locale}/blog`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft size={16} weight="bold" />
        სტატიები
      </Link>

      <article className="max-w-3xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 mb-4 inline-block">
            {article.category}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight mb-4 text-balance">
            {article.title}
          </h1>
          <div className="flex items-center gap-4 text-muted-foreground text-sm">
            <div className="flex items-center gap-1.5">
              <CalendarBlank size={15} weight="regular" />
              <span>{dateFormatted}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={15} weight="regular" />
              <span>{article.readMin} წთ</span>
            </div>
          </div>
        </header>

        {/* Cover */}
        {article.coverImage && (
          <div className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden mb-10 bg-muted">
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              priority
              className="object-cover"
            />
          </div>
        )}

        {/* MDX Content */}
        <div className="prose prose-invert prose-lg max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-strong:text-foreground prose-li:text-muted-foreground">
          <MDXRemote source={article.content} />
        </div>
      </article>
    </div>
  );
}
```

**Step 3: Update BlogSection to read from MDX**

Modify `client/src/components/common/BlogSection.tsx`:

Replace the hardcoded `POSTS` array with actual data from `getAllArticles()`. The component should:
- Import `getAllArticles` from `@/lib/content`
- Call `getAllArticles().slice(0, 3)` to get latest 3 articles
- Map article fields to the existing card template
- Keep the existing card design unchanged
- Link cards to `/${locale}/blog/${article.slug}`

**Step 4: Verify build**

```bash
cd client && npm run build
```

**Step 5: Commit**

```bash
git add client/src/app/\[locale\]/blog/ client/src/components/common/BlogSection.tsx
git commit -m "feat: add public blog pages with MDX rendering"
```

---

## Task 10: Clean Up & Final Verification

**Step 1: Remove old products.ts (after confirming content.ts works)**

Delete `client/src/lib/products.ts` — all imports should now point to `@/lib/content`.

**Step 2: Verify no remaining imports of old file**

Search for any remaining `from '@/lib/products'` imports. Fix any found.

**Step 3: Full build check**

```bash
cd client && npm run build
```

**Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove old products.ts, complete MDX migration"
```

---

## Execution Order Summary

| # | Task | Dependencies |
|---|------|-------------|
| 1 | Install dependencies | — |
| 2 | Create golden examples | — |
| 3 | Content reading library | Task 1 |
| 4 | Migration script | Task 2, 3 |
| 5 | Switch imports | Task 3, 4 |
| 6 | Update product admin actions | Task 3, 5 |
| 7 | TipTap WYSIWYG editor | Task 1 |
| 8 | Article admin CRUD | Task 3, 6, 7 |
| 9 | Public blog pages | Task 3, 8 |
| 10 | Clean up | All above |

Tasks 1, 2 can run in parallel. Tasks 3, 7 can run in parallel after Task 1.
