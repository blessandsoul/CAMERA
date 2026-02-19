# Admin Catalog Settings Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make category tree and per-category filters editable from the admin panel via a JSON config file.

**Architecture:** Replace hardcoded TypeScript constants in `category-tree.ts` and `filter-config.ts` with a single `content/catalog-config.json` file. The existing `.ts` files become thin wrappers that read from JSON. A new admin page at `/admin/catalog-settings` provides a full visual editor. Labels change from i18n `labelKey` references to direct `{ ka, ru, en }` objects.

**Tech Stack:** Next.js Server Actions, JSON file I/O (fs), React state management for editor UI

---

## Task 1: Create `catalog-config.json` with Current Data

**Files:**
- Create: `content/catalog-config.json`

**Context:** This JSON file replaces the hardcoded data in `category-tree.ts` and `filter-config.ts`. The `label` field stores direct translations (extracted from `messages/ka.json`, `ru.json`, `en.json`) instead of `labelKey` references.

**Step 1: Create the JSON file**

```json
{
  "categories": [
    {
      "id": "all",
      "parentCategory": null,
      "label": { "ka": "ყველა", "ru": "Все", "en": "All" }
    },
    {
      "id": "cameras",
      "parentCategory": "cameras",
      "label": { "ka": "კამერები", "ru": "Камеры", "en": "Cameras" },
      "children": [
        {
          "id": "cameras-ip",
          "parentCategory": "cameras",
          "label": { "ka": "IP კამერები", "ru": "IP камеры", "en": "IP Cameras" },
          "specFilter": { "kaKey": "კამერის ტიპი", "value": "IP" }
        },
        {
          "id": "cameras-analog",
          "parentCategory": "cameras",
          "label": { "ka": "ანალოგური კამერები", "ru": "Аналоговые камеры", "en": "Analog Cameras" },
          "specFilter": { "kaKey": "კამერის ტიპი", "value": "ანალოგური" }
        },
        {
          "id": "cameras-wifi",
          "parentCategory": "cameras",
          "label": { "ka": "Wi-Fi კამერები", "ru": "Wi-Fi камеры", "en": "Wi-Fi Cameras" },
          "specFilter": { "kaKey": "Wi-Fi", "value": "კი" }
        },
        {
          "id": "cameras-ptz",
          "parentCategory": "cameras",
          "label": { "ka": "PTZ კამერები", "ru": "PTZ камеры", "en": "PTZ Cameras" },
          "specFilter": { "kaKey": "PTZ / PT", "value": "PTZ" }
        },
        {
          "id": "cameras-pt",
          "parentCategory": "cameras",
          "label": { "ka": "PT კამერები", "ru": "PT камеры", "en": "PT Cameras" },
          "specFilter": { "kaKey": "PTZ / PT", "value": "PT" }
        }
      ]
    },
    {
      "id": "nvr-kits",
      "parentCategory": "nvr-kits",
      "label": { "ka": "NVR კომპლექტები", "ru": "Комплекты NVR", "en": "NVR Kits" }
    },
    {
      "id": "accessories",
      "parentCategory": "accessories",
      "label": { "ka": "აქსესუარები", "ru": "Аксессуары", "en": "Accessories" }
    },
    {
      "id": "storage",
      "parentCategory": "storage",
      "label": { "ka": "შენახვა", "ru": "Накопители", "en": "Storage" }
    },
    {
      "id": "services",
      "parentCategory": "services",
      "label": { "ka": "სერვისი", "ru": "Услуги", "en": "Services" }
    }
  ],
  "filters": {
    "cameras": [
      { "id": "brand", "specKaKey": "ბრენდი", "label": { "ka": "ბრენდი", "ru": "Бренд", "en": "Brand" }, "priority": 1, "defaultExpanded": true },
      { "id": "resolution", "specKaKey": "რეზოლუცია", "label": { "ka": "რეზოლუცია", "ru": "Разрешение", "en": "Resolution" }, "priority": 2, "defaultExpanded": true },
      { "id": "bodyType", "specKaKey": "კორპუსის ტიპი", "label": { "ka": "კორპუსის ტიპი", "ru": "Тип корпуса", "en": "Body Type" }, "priority": 3, "defaultExpanded": true },
      { "id": "nightVision", "specKaKey": "ღამის ხედვა", "label": { "ka": "ღამის ხედვა", "ru": "Ночное видение", "en": "Night Vision" }, "priority": 4, "defaultExpanded": true },
      { "id": "nightVisionRange", "specKaKey": "ღამის ხედვა (მანძილი)", "label": { "ka": "ღამის ხედვა (მანძილი)", "ru": "Дальность ночного видения", "en": "Night Vision Range" }, "priority": 5 },
      { "id": "lens", "specKaKey": "ლინზა", "label": { "ka": "ლინზა", "ru": "Объектив", "en": "Lens" }, "priority": 6 },
      { "id": "wifi", "specKaKey": "Wi-Fi", "label": { "ka": "Wi-Fi", "ru": "Wi-Fi", "en": "Wi-Fi" }, "priority": 7 },
      { "id": "ptz", "specKaKey": "PTZ / PT", "label": { "ka": "PTZ / PT", "ru": "PTZ / PT", "en": "PTZ / PT" }, "priority": 8 },
      { "id": "microphone", "specKaKey": "მიკროფონი", "label": { "ka": "მიკროფონი", "ru": "Микрофон", "en": "Microphone" }, "priority": 9 },
      { "id": "microSD", "specKaKey": "Micro SD", "label": { "ka": "Micro SD", "ru": "Micro SD", "en": "Micro SD" }, "priority": 10 },
      { "id": "protectionClass", "specKaKey": "დაცვის კლასი", "label": { "ka": "დაცვის კლასი", "ru": "Класс защиты", "en": "Protection Class" }, "priority": 11 },
      { "id": "cmosSensor", "specKaKey": "CMOS სენსორი", "label": { "ka": "CMOS სენსორი", "ru": "CMOS сенсор", "en": "CMOS Sensor" }, "priority": 12 },
      { "id": "aiDetection", "specKaKey": "ადამიანის და ავტომობილის სილუეტის ამოცნობა", "label": { "ka": "AI ამოცნობა", "ru": "AI распознавание", "en": "AI Detection" }, "priority": 13 }
    ],
    "nvr-kits": [
      { "id": "channels", "specKaKey": "არხები", "label": { "ka": "არხები", "ru": "Каналы", "en": "Channels" }, "priority": 1, "defaultExpanded": true },
      { "id": "nvrResolution", "specKaKey": "გარჩევადობა", "label": { "ka": "რეზოლუცია", "ru": "Разрешение", "en": "Resolution" }, "priority": 2, "defaultExpanded": true },
      { "id": "hdd", "specKaKey": "HDD", "label": { "ka": "HDD", "ru": "HDD", "en": "HDD" }, "priority": 3 },
      { "id": "connectivity", "specKaKey": "კავშირი", "label": { "ka": "კავშირი", "ru": "Подключение", "en": "Connectivity" }, "priority": 4 },
      { "id": "poe", "specKaKey": "PoE", "label": { "ka": "PoE", "ru": "PoE", "en": "PoE" }, "priority": 5 },
      { "id": "codec", "specKaKey": "კოდეკი", "label": { "ka": "კოდეკი", "ru": "Кодек", "en": "Codec" }, "priority": 6 }
    ],
    "accessories": [
      { "id": "accType", "specKaKey": "ტიპი", "label": { "ka": "ტიპი", "ru": "Тип", "en": "Type" }, "priority": 1, "defaultExpanded": true },
      { "id": "voltage", "specKaKey": "ძაბვა", "label": { "ka": "ძაბვა", "ru": "Напряжение", "en": "Voltage" }, "priority": 2 },
      { "id": "power", "specKaKey": "სიმძლავრე", "label": { "ka": "სიმძლავრე", "ru": "Мощность", "en": "Power" }, "priority": 3 },
      { "id": "material", "specKaKey": "მასალა", "label": { "ka": "მასალა", "ru": "Материал", "en": "Material" }, "priority": 4 }
    ],
    "storage": [
      { "id": "capacity", "specKaKey": "მოცულობა", "label": { "ka": "მოცულობა", "ru": "Ёмкость", "en": "Capacity" }, "priority": 1, "defaultExpanded": true },
      { "id": "interface", "specKaKey": "ინტერფეისი", "label": { "ka": "ინტერფეისი", "ru": "Интерфейс", "en": "Interface" }, "priority": 2 },
      { "id": "rpm", "specKaKey": "RPM", "label": { "ka": "RPM", "ru": "RPM", "en": "RPM" }, "priority": 3 }
    ],
    "services": []
  }
}
```

---

## Task 2: Add `getCatalogConfig` / `writeCatalogConfig` to `content.ts`

**Files:**
- Modify: `client/src/lib/content.ts` — add two functions and the config type

**Context:** These functions read/write `content/catalog-config.json`. They are used by both the public catalog (read) and admin settings page (write). The `CONTENT_DIR` constant already points to `path.join(process.cwd(), '..', 'content')`.

**Step 1: Add the type and read/write functions**

At the top of `content.ts` (after the existing type imports), add:

```typescript
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
```

Then add the functions (after the articles section):

```typescript
// ── Catalog Config ──────────────────────────────────────
const CATALOG_CONFIG_PATH = path.join(CONTENT_DIR, 'catalog-config.json');

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
```

---

## Task 3: Update `category-tree.ts` to Read from JSON

**Files:**
- Modify: `client/src/lib/constants/category-tree.ts`

**Context:** Currently exports hardcoded `CATEGORY_TREE` array and `CategoryNode` type. After this change, it imports data from `getCatalogConfig()` and maps it to `CategoryNode[]`. The `CategoryNode` interface gains a `label` field (replaces `labelKey`).

**Step 1: Rewrite `category-tree.ts`**

Replace entire file with:

```typescript
import type { ProductCategory } from '@/types/product.types';
import { getCatalogConfig } from '@/lib/content';
import type { CatalogCategoryConfig, CatalogLabel } from '@/lib/content';

export interface CategoryNode {
  id: string;
  parentCategory: ProductCategory | null;
  label: CatalogLabel;
  specFilter?: {
    kaKey: string;
    value: string;
  };
  children?: CategoryNode[];
}

function mapCategory(cat: CatalogCategoryConfig): CategoryNode {
  return {
    id: cat.id,
    parentCategory: cat.parentCategory as ProductCategory | null,
    label: cat.label,
    specFilter: cat.specFilter,
    children: cat.children?.map(mapCategory),
  };
}

export function getCategoryTree(): CategoryNode[] {
  const config = getCatalogConfig();
  return config.categories.map(mapCategory);
}

/** @deprecated Use getCategoryTree() — kept for backward compat during migration */
export const CATEGORY_TREE: CategoryNode[] = getCategoryTree();

export function findCategoryNode(id: string): CategoryNode | undefined {
  const tree = getCategoryTree();
  for (const node of tree) {
    if (node.id === id) return node;
    if (node.children) {
      const child = node.children.find((c) => c.id === id);
      if (child) return child;
    }
  }
  return undefined;
}

export function findParentNode(childId: string): CategoryNode | undefined {
  const tree = getCategoryTree();
  for (const node of tree) {
    if (node.children?.some((c) => c.id === childId)) return node;
  }
  return undefined;
}
```

**Important:** The `CATEGORY_TREE` const is kept as a computed value for backward compat — existing imports like `CATEGORY_TREE.some(...)` in `CategoryTree.tsx` still work.

---

## Task 4: Update `filter-config.ts` to Read from JSON

**Files:**
- Modify: `client/src/lib/constants/filter-config.ts`

**Context:** Currently exports hardcoded `CATEGORY_FILTER_CONFIG` and `FilterFieldConfig` type. After this change, it reads from JSON. The `FilterFieldConfig` interface gets `label` (replaces `labelKey`).

**Step 1: Rewrite `filter-config.ts`**

Replace entire file with:

```typescript
import { getCatalogConfig } from '@/lib/content';
import type { CatalogLabel } from '@/lib/content';

export interface FilterFieldConfig {
  id: string;
  specKaKey: string;
  label: CatalogLabel;
  priority: number;
  defaultExpanded?: boolean;
}

export function getFilterConfigs(): Record<string, FilterFieldConfig[]> {
  const config = getCatalogConfig();
  const result: Record<string, FilterFieldConfig[]> = {};
  for (const [category, filters] of Object.entries(config.filters)) {
    result[category] = filters.map((f) => ({
      id: f.id,
      specKaKey: f.specKaKey,
      label: f.label,
      priority: f.priority,
      defaultExpanded: f.defaultExpanded,
    }));
  }
  return result;
}

/** @deprecated Use getFilterConfigs() */
export const CATEGORY_FILTER_CONFIG: Record<string, FilterFieldConfig[]> = getFilterConfigs();

export function getFilterConfigForCategory(category: string | undefined): FilterFieldConfig[] {
  if (!category) return [];
  const configs = getFilterConfigs();
  return configs[category] ?? [];
}
```

---

## Task 5: Update Catalog Components — `labelKey` → `label[locale]`

**Files:**
- Modify: `client/src/features/catalog/components/CategoryTree.tsx` (lines 110, 132)
- Modify: `client/src/features/catalog/components/DynamicFilterSection.tsx` (line 30)
- Modify: `client/src/features/catalog/components/CatalogToolbar.tsx` (line 45)
- Modify: `client/src/lib/constants/categories.ts` (optional — update or keep)
- Modify: `client/src/lib/content.ts` — update `getCategoryCounts` to use `getCategoryTree()`

**Context:** These 3 components currently render labels via `t(node.labelKey)` using next-intl. They need to switch to `node.label[locale]`. They already have `useTranslations()` — they now also need `useLocale()` from `next-intl` to get the current locale.

**Step 1: Update `CategoryTree.tsx`**

Add `useLocale` import:
```typescript
import { useTranslations, useLocale } from 'next-intl';
```

Add inside the component:
```typescript
const locale = useLocale();
```

Replace line 110:
```typescript
// OLD: <span className="flex-1 text-left">{t(node.labelKey as Parameters<typeof t>[0])}</span>
// NEW:
<span className="flex-1 text-left">{node.label[locale as keyof typeof node.label] ?? node.label.ka}</span>
```

Replace line 132 (same pattern):
```typescript
// OLD: <span className="flex-1 text-left">{t(child.labelKey as Parameters<typeof t>[0])}</span>
// NEW:
<span className="flex-1 text-left">{child.label[locale as keyof typeof child.label] ?? child.label.ka}</span>
```

Also update import to use `getCategoryTree` instead of `CATEGORY_TREE`:
```typescript
// OLD: import { CATEGORY_TREE } from '@/lib/constants/category-tree';
// NEW:
import { getCategoryTree } from '@/lib/constants/category-tree';
```

Inside the component, call it:
```typescript
const categoryTree = getCategoryTree();
```

Then replace all `CATEGORY_TREE` references in the component with `categoryTree`. Specifically:
- Line 51: `const isChild = CATEGORY_TREE.some(...)` → `const isChild = categoryTree.some(...)`
- Line 76: `{CATEGORY_TREE.map((node) => {` → `{categoryTree.map((node) => {`

**IMPORTANT:** `getCategoryTree()` reads from the filesystem, so it should NOT be called inside a client component directly. Instead, the `CategoryTree` component must receive the tree data as a prop. Modify:

```typescript
interface CategoryTreeProps {
  categoryCounts: Record<string, number>;
  categoryTree: CategoryNode[]; // NEW PROP
}
```

Then the parent (`CatalogSidebar`) passes it. And `CatalogSidebar` gets it from the server component `CatalogPage`.

The chain: `CatalogPage` (Server) calls `getCategoryTree()` → passes to `CatalogSidebar` → passes to `CategoryTree`.

Update `CatalogSidebar` props:
```typescript
interface CatalogSidebarProps {
  categoryCounts: Record<string, number>;
  filterConfigs: FilterFieldConfig[];
  availableValues: Record<string, SpecValueOption[]>;
  priceRange: { min: number; max: number };
  categoryTree: CategoryNode[]; // NEW
}
```

Update `CatalogPage` to call and pass:
```typescript
import { getCategoryTree } from '@/lib/constants/category-tree';
// ...
const categoryTree = getCategoryTree();
// ... pass to CatalogSidebar
<CatalogSidebar categoryTree={categoryTree} ... />
```

**Step 2: Update `DynamicFilterSection.tsx`**

Add `useLocale`:
```typescript
import { useLocale } from 'next-intl';
```

Remove `useTranslations` import (no longer needed here).

Inside the component:
```typescript
const locale = useLocale();
```

Replace line 30:
```typescript
// OLD: label={t(config.labelKey as Parameters<typeof t>[0])}
// NEW:
label={config.label[locale as keyof typeof config.label] ?? config.label.ka}
```

**Step 3: Update `CatalogToolbar.tsx`**

Add `useLocale`:
```typescript
import { useTranslations, useLocale } from 'next-intl';
```

Inside the component:
```typescript
const locale = useLocale();
```

Replace line 45:
```typescript
// OLD: label: `${t(config.labelKey as Parameters<typeof t>[0])}: ${v}`,
// NEW:
label: `${config.label[locale as keyof typeof config.label] ?? config.label.ka}: ${v}`,
```

**Step 4: Update `getCategoryCounts` in `content.ts`**

The function `getCategoryCounts()` in `content.ts` (line ~300) currently hardcodes subcategory spec filters. Update it to read from `getCategoryTree()` dynamically:

```typescript
export function getCategoryCounts(): Record<string, number> {
  const products = getAllProducts();
  const counts: Record<string, number> = { all: products.length };

  for (const p of products) {
    counts[p.category] = (counts[p.category] ?? 0) + 1;
  }

  // Dynamic subcategory counts from config
  const { getCategoryTree } = require('@/lib/constants/category-tree');
  const tree = getCategoryTree();
  for (const node of tree) {
    if (node.children) {
      const categoryProducts = products.filter((p) => p.category === node.parentCategory);
      for (const child of node.children) {
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
```

**NOTE:** To avoid circular dependency (content.ts → category-tree.ts → content.ts), use `getCatalogConfig()` directly instead of importing from category-tree.ts:

```typescript
export function getCategoryCounts(): Record<string, number> {
  const products = getAllProducts();
  const counts: Record<string, number> = { all: products.length };

  for (const p of products) {
    counts[p.category] = (counts[p.category] ?? 0) + 1;
  }

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
```

---

## Task 6: Create Server Action for Saving Catalog Config

**Files:**
- Create: `client/src/features/admin/actions/catalog.actions.ts`

**Context:** Single server action that receives the full config JSON and writes it. Same auth pattern as `product.actions.ts`.

**Step 1: Create the file**

```typescript
'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getCatalogConfig, writeCatalogConfig } from '@/lib/content';
import type { CatalogConfig } from '@/lib/content';

async function requireAdmin(): Promise<void> {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');
  if (session?.value !== process.env.ADMIN_SESSION_SECRET) {
    redirect('/admin');
  }
}

export async function saveCatalogConfig(configJson: string): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  try {
    const config = JSON.parse(configJson) as CatalogConfig;

    // Basic validation
    if (!Array.isArray(config.categories)) {
      return { success: false, error: 'Invalid categories array' };
    }
    if (typeof config.filters !== 'object' || config.filters === null) {
      return { success: false, error: 'Invalid filters object' };
    }

    writeCatalogConfig(config);
    revalidatePath('/');
    return { success: true };
  } catch (e) {
    return { success: false, error: 'Invalid JSON format' };
  }
}

export async function loadCatalogConfig(): Promise<CatalogConfig> {
  await requireAdmin();
  return getCatalogConfig();
}
```

---

## Task 7: Add "Settings" Tab to AdminHeader

**Files:**
- Modify: `client/src/features/admin/components/AdminHeader.tsx`

**Context:** Currently has 2 tabs: Products and Articles. Add a third: Settings (gear icon). Active when path starts with `/admin/catalog-settings`. The "Add" button in the header should hide when on Settings page.

**Step 1: Update `AdminHeader.tsx`**

Add pathname detection:
```typescript
const isSettings = pathname.startsWith('/admin/catalog-settings');
```

Add the Settings nav link after the Articles link:
```typescript
<Link
  href="/admin/catalog-settings"
  className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors ${
    isSettings
      ? 'text-white bg-[#0466c8]/10 border border-[#0466c8]/20'
      : 'text-[#979dac] hover:text-white'
  }`}
>
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
  Settings
</Link>
```

Update the "Add" button visibility — hide on settings page:
```typescript
{!isSettings && (
  <Link
    href={isArticles ? '/admin/articles/new' : '/admin/products/new'}
    ...
  >
    ...
  </Link>
)}
```

Update `isArticles` logic to also exclude settings:
```typescript
const isArticles = pathname.startsWith('/admin/articles');
const isSettings = pathname.startsWith('/admin/catalog-settings');
```

---

## Task 8: Build Admin Catalog Settings Page

**Files:**
- Create: `client/src/app/admin/catalog-settings/page.tsx` — Server Component shell
- Create: `client/src/features/admin/components/CatalogSettingsEditor.tsx` — Client Component with full editor UI

**Context:** This is the main feature. The page loads the config JSON, passes it to a client component editor. The editor has two sections: Categories (tree) and Filters (per-category tabs). A "Save All" button calls the server action.

### `page.tsx` — Server Component

```typescript
import { AdminHeader } from '@/features/admin/components/AdminHeader';
import { CatalogSettingsEditor } from '@/features/admin/components/CatalogSettingsEditor';
import { getCatalogConfig } from '@/lib/content';

export default async function CatalogSettingsPage(): Promise<React.ReactElement> {
  const config = getCatalogConfig();

  return (
    <>
      <AdminHeader />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-white mb-6">Catalog Settings</h1>
        <CatalogSettingsEditor initialConfig={config} />
      </div>
    </>
  );
}
```

### `CatalogSettingsEditor.tsx` — Client Component

This is the largest file. It manages the full config state with two sections.

**Admin dark theme tokens (from existing admin components):**
- Background: `#001233`
- Surface: `#001845`
- Border: `#33415c`
- Primary: `#0466c8`
- Muted text: `#979dac` / `#7d8597`
- Field: `bg-[#002855] border-[#33415c]`

**Component structure:**

```
CatalogSettingsEditor (manages config state)
├── Section 1: Categories
│   ├── Category row (inline edit: label ka/ru/en, parentCategory)
│   │   └── Subcategory rows (label ka/ru/en, specFilter kaKey + value)
│   ├── Add Category button
│   └── Add Subcategory button (per category with children)
├── Section 2: Filters
│   ├── Category tabs (one tab per category)
│   └── Filter rows (id, specKaKey, label ka/ru/en, priority, defaultExpanded toggle)
│       ├── Add Filter button
│       └── Delete button per filter
└── Save All button → calls saveCatalogConfig server action
```

**Key UI elements:**

1. **Category tree editor**: Each category is a collapsible row. Main fields: `id` (readonly after create), `label.ka`, `label.ru`, `label.en`. Subcategories additionally have `specFilter.kaKey` and `specFilter.value`. Up/Down arrows for reorder. Delete button (with confirm). "Add Category" at bottom. "Add Subcategory" button on parent categories.

2. **Filter editor tabs**: Tabs across top showing category names. Each tab shows a table of filters. Columns: ID, Spec Key (KA), Label KA, Label RU, Label EN, Priority (number input), Expanded (checkbox), Actions (delete). "Add Filter" button at bottom of each tab.

3. **Save button**: At bottom, calls `saveCatalogConfig(JSON.stringify(config))`. Shows success/error toast via a simple inline message (no external toast library needed in admin — use a state-based success/error message).

**Full component code:**

```typescript
'use client';

import { useState } from 'react';
import { saveCatalogConfig } from '@/features/admin/actions/catalog.actions';
import type { CatalogConfig, CatalogCategoryConfig, CatalogFilterConfig } from '@/lib/content';

interface Props {
  initialConfig: CatalogConfig;
}

export function CatalogSettingsEditor({ initialConfig }: Props): React.ReactElement {
  const [config, setConfig] = useState<CatalogConfig>(initialConfig);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeFilterTab, setActiveFilterTab] = useState<string>(
    Object.keys(initialConfig.filters)[0] ?? 'cameras'
  );

  // ── Categories ──────────────────────────────────────
  function updateCategory(index: number, updated: CatalogCategoryConfig): void {
    setConfig((prev) => ({
      ...prev,
      categories: prev.categories.map((c, i) => (i === index ? updated : c)),
    }));
  }

  function addCategory(): void {
    const id = `category-${Date.now()}`;
    setConfig((prev) => ({
      ...prev,
      categories: [
        ...prev.categories,
        { id, parentCategory: id, label: { ka: '', ru: '', en: '' } },
      ],
      filters: { ...prev.filters, [id]: [] },
    }));
  }

  function removeCategory(index: number): void {
    const cat = config.categories[index];
    if (cat.id === 'all') return; // Can't delete "all"
    setConfig((prev) => {
      const newFilters = { ...prev.filters };
      delete newFilters[cat.id];
      return {
        ...prev,
        categories: prev.categories.filter((_, i) => i !== index),
        filters: newFilters,
      };
    });
  }

  function moveCategory(index: number, direction: -1 | 1): void {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= config.categories.length) return;
    setConfig((prev) => {
      const cats = [...prev.categories];
      [cats[index], cats[newIndex]] = [cats[newIndex], cats[index]];
      return { ...prev, categories: cats };
    });
  }

  function addSubcategory(parentIndex: number): void {
    const parent = config.categories[parentIndex];
    const childId = `${parent.id}-${Date.now()}`;
    const child: CatalogCategoryConfig = {
      id: childId,
      parentCategory: parent.parentCategory,
      label: { ka: '', ru: '', en: '' },
      specFilter: { kaKey: '', value: '' },
    };
    const updated = {
      ...parent,
      children: [...(parent.children ?? []), child],
    };
    updateCategory(parentIndex, updated);
  }

  function updateSubcategory(parentIndex: number, childIndex: number, updated: CatalogCategoryConfig): void {
    const parent = config.categories[parentIndex];
    const newChildren = (parent.children ?? []).map((c, i) => (i === childIndex ? updated : c));
    updateCategory(parentIndex, { ...parent, children: newChildren });
  }

  function removeSubcategory(parentIndex: number, childIndex: number): void {
    const parent = config.categories[parentIndex];
    updateCategory(parentIndex, {
      ...parent,
      children: (parent.children ?? []).filter((_, i) => i !== childIndex),
    });
  }

  // ── Filters ─────────────────────────────────────────
  function updateFilter(category: string, filterIndex: number, updated: CatalogFilterConfig): void {
    setConfig((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        [category]: (prev.filters[category] ?? []).map((f, i) => (i === filterIndex ? updated : f)),
      },
    }));
  }

  function addFilter(category: string): void {
    const existing = config.filters[category] ?? [];
    const maxPriority = existing.reduce((max, f) => Math.max(max, f.priority), 0);
    setConfig((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        [category]: [
          ...(prev.filters[category] ?? []),
          {
            id: `filter-${Date.now()}`,
            specKaKey: '',
            label: { ka: '', ru: '', en: '' },
            priority: maxPriority + 1,
          },
        ],
      },
    }));
  }

  function removeFilter(category: string, filterIndex: number): void {
    setConfig((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        [category]: (prev.filters[category] ?? []).filter((_, i) => i !== filterIndex),
      },
    }));
  }

  // ── Save ────────────────────────────────────────────
  async function handleSave(): Promise<void> {
    setSaving(true);
    setMessage(null);
    const result = await saveCatalogConfig(JSON.stringify(config));
    if (result.success) {
      setMessage({ type: 'success', text: 'Configuration saved successfully' });
    } else {
      setMessage({ type: 'error', text: result.error ?? 'Failed to save' });
    }
    setSaving(false);
  }

  // ── Render helpers ──────────────────────────────────
  const fieldClass =
    'w-full px-2 py-1.5 rounded-lg bg-[#002855] border border-[#33415c] text-white placeholder-[#7d8597] focus:outline-none focus:border-[#0466c8] transition-colors text-sm';
  const labelClass = 'block text-[10px] text-[#7d8597] mb-0.5 uppercase tracking-wider';
  const btnClass = 'p-1.5 rounded-lg text-[#979dac] hover:text-white hover:bg-[#33415c] transition-colors cursor-pointer';

  // Get non-"all" categories for filter tabs
  const filterTabCategories = config.categories.filter((c) => c.id !== 'all' && c.parentCategory);

  return (
    <div className="flex flex-col gap-8">

      {/* ── Section 1: Categories ── */}
      <section className="p-5 rounded-xl bg-[#001845] border border-[#33415c]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white">Categories</h2>
          <button
            type="button"
            onClick={addCategory}
            className="flex items-center gap-1 text-xs text-[#0466c8] hover:text-[#0353a4] transition-colors cursor-pointer"
          >
            {/* Plus icon */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Category
          </button>
        </div>

        <div className="space-y-3">
          {config.categories.map((cat, catIdx) => (
            <div key={cat.id} className="rounded-lg border border-[#33415c] bg-[#001233] p-3">
              {/* Main category row */}
              <div className="flex items-start gap-2">
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button onClick={() => moveCategory(catIdx, -1)} className={btnClass} aria-label="Move up">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>
                  </button>
                  <button onClick={() => moveCategory(catIdx, 1)} className={btnClass} aria-label="Move down">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                  </button>
                </div>

                <div className="flex-1 grid grid-cols-4 gap-2">
                  <div>
                    <label className={labelClass}>ID</label>
                    <input value={cat.id} readOnly className={`${fieldClass} opacity-60`} />
                  </div>
                  <div>
                    <label className={labelClass}>Label KA</label>
                    <input value={cat.label.ka} onChange={(e) => updateCategory(catIdx, { ...cat, label: { ...cat.label, ka: e.target.value } })} className={fieldClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Label RU</label>
                    <input value={cat.label.ru} onChange={(e) => updateCategory(catIdx, { ...cat, label: { ...cat.label, ru: e.target.value } })} className={fieldClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Label EN</label>
                    <input value={cat.label.en} onChange={(e) => updateCategory(catIdx, { ...cat, label: { ...cat.label, en: e.target.value } })} className={fieldClass} />
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 mt-4">
                  {cat.id !== 'all' && (
                    <>
                      <button onClick={() => addSubcategory(catIdx)} className={`${btnClass} text-[#0466c8]`} aria-label="Add subcategory" title="Add subcategory">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                      </button>
                      <button onClick={() => removeCategory(catIdx)} className={`${btnClass} hover:text-red-400`} aria-label="Delete category">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Subcategories */}
              {cat.children && cat.children.length > 0 && (
                <div className="ml-8 mt-3 space-y-2">
                  {cat.children.map((child, childIdx) => (
                    <div key={child.id} className="flex items-start gap-2 p-2 rounded-lg bg-[#001845] border border-[#33415c]/50">
                      <div className="flex-1 grid grid-cols-6 gap-2">
                        <div>
                          <label className={labelClass}>Label KA</label>
                          <input value={child.label.ka} onChange={(e) => updateSubcategory(catIdx, childIdx, { ...child, label: { ...child.label, ka: e.target.value } })} className={fieldClass} />
                        </div>
                        <div>
                          <label className={labelClass}>Label RU</label>
                          <input value={child.label.ru} onChange={(e) => updateSubcategory(catIdx, childIdx, { ...child, label: { ...child.label, ru: e.target.value } })} className={fieldClass} />
                        </div>
                        <div>
                          <label className={labelClass}>Label EN</label>
                          <input value={child.label.en} onChange={(e) => updateSubcategory(catIdx, childIdx, { ...child, label: { ...child.label, en: e.target.value } })} className={fieldClass} />
                        </div>
                        <div>
                          <label className={labelClass}>Spec Key (KA)</label>
                          <input value={child.specFilter?.kaKey ?? ''} onChange={(e) => updateSubcategory(catIdx, childIdx, { ...child, specFilter: { kaKey: e.target.value, value: child.specFilter?.value ?? '' } })} className={fieldClass} />
                        </div>
                        <div>
                          <label className={labelClass}>Spec Value</label>
                          <input value={child.specFilter?.value ?? ''} onChange={(e) => updateSubcategory(catIdx, childIdx, { ...child, specFilter: { kaKey: child.specFilter?.kaKey ?? '', value: e.target.value } })} className={fieldClass} />
                        </div>
                        <div className="flex items-end">
                          <button onClick={() => removeSubcategory(catIdx, childIdx)} className={`${btnClass} hover:text-red-400`} aria-label="Delete subcategory">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" /></svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 2: Filters ── */}
      <section className="p-5 rounded-xl bg-[#001845] border border-[#33415c]">
        <h2 className="text-base font-semibold text-white mb-4">Filters</h2>

        {/* Category tabs */}
        <div className="flex gap-1 mb-4 border-b border-[#33415c] pb-2">
          {filterTabCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveFilterTab(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors cursor-pointer ${
                activeFilterTab === cat.id
                  ? 'text-white bg-[#0466c8]/10 border border-[#0466c8]/20'
                  : 'text-[#979dac] hover:text-white'
              }`}
            >
              {cat.label.en || cat.id}
            </button>
          ))}
        </div>

        {/* Filter rows for active tab */}
        <div className="space-y-2">
          {(config.filters[activeFilterTab] ?? []).map((filter, fIdx) => (
            <div key={filter.id} className="grid grid-cols-8 gap-2 items-end p-2 rounded-lg bg-[#001233] border border-[#33415c]/50">
              <div>
                <label className={labelClass}>ID</label>
                <input value={filter.id} onChange={(e) => updateFilter(activeFilterTab, fIdx, { ...filter, id: e.target.value })} className={fieldClass} />
              </div>
              <div>
                <label className={labelClass}>Spec Key (KA)</label>
                <input value={filter.specKaKey} onChange={(e) => updateFilter(activeFilterTab, fIdx, { ...filter, specKaKey: e.target.value })} className={fieldClass} />
              </div>
              <div>
                <label className={labelClass}>Label KA</label>
                <input value={filter.label.ka} onChange={(e) => updateFilter(activeFilterTab, fIdx, { ...filter, label: { ...filter.label, ka: e.target.value } })} className={fieldClass} />
              </div>
              <div>
                <label className={labelClass}>Label RU</label>
                <input value={filter.label.ru} onChange={(e) => updateFilter(activeFilterTab, fIdx, { ...filter, label: { ...filter.label, ru: e.target.value } })} className={fieldClass} />
              </div>
              <div>
                <label className={labelClass}>Label EN</label>
                <input value={filter.label.en} onChange={(e) => updateFilter(activeFilterTab, fIdx, { ...filter, label: { ...filter.label, en: e.target.value } })} className={fieldClass} />
              </div>
              <div>
                <label className={labelClass}>Priority</label>
                <input type="number" min="1" value={filter.priority} onChange={(e) => updateFilter(activeFilterTab, fIdx, { ...filter, priority: Number(e.target.value) || 1 })} className={fieldClass} />
              </div>
              <div className="flex items-center gap-2 pb-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={filter.defaultExpanded ?? false} onChange={(e) => updateFilter(activeFilterTab, fIdx, { ...filter, defaultExpanded: e.target.checked })} className="w-3.5 h-3.5 accent-[#0466c8]" />
                  <span className="text-xs text-[#979dac]">Expanded</span>
                </label>
              </div>
              <div className="flex items-end pb-1">
                <button onClick={() => removeFilter(activeFilterTab, fIdx)} className={`${btnClass} hover:text-red-400`} aria-label="Delete filter">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => addFilter(activeFilterTab)}
          className="mt-3 flex items-center gap-1 text-xs text-[#0466c8] hover:text-[#0353a4] transition-colors cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Add Filter
        </button>
      </section>

      {/* ── Save button + message ── */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-[#0466c8] hover:bg-[#0353a4] active:scale-[0.98] text-white font-semibold rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save All'}
        </button>
        {message && (
          <span className={`text-sm ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
            {message.text}
          </span>
        )}
      </div>
    </div>
  );
}
```

---

## Task 9: Build and Verify

**Step 1: Run `npm run build` in `client/`**

Expected: Build succeeds with the new route `/admin/catalog-settings` registered.

**Step 2: Verify catalog still works**

All existing catalog routes (`/[locale]/catalog`) should render correctly — categories show with labels from JSON, filters work the same.

**Step 3: Verify admin settings page**

Navigate to `/admin/catalog-settings`. Verify:
- Categories display in the tree editor
- Filters display in tabbed view
- Can add/edit/remove categories and filters
- Save writes to `content/catalog-config.json`
- After save, catalog reflects changes

---

## File Change Summary

| Action | File |
|--------|------|
| Create | `content/catalog-config.json` |
| Create | `client/src/app/admin/catalog-settings/page.tsx` |
| Create | `client/src/features/admin/components/CatalogSettingsEditor.tsx` |
| Create | `client/src/features/admin/actions/catalog.actions.ts` |
| Modify | `client/src/lib/content.ts` — add types + getCatalogConfig/writeCatalogConfig + update getCategoryCounts |
| Modify | `client/src/lib/constants/category-tree.ts` — read from JSON, label instead of labelKey |
| Modify | `client/src/lib/constants/filter-config.ts` — read from JSON, label instead of labelKey |
| Modify | `client/src/features/catalog/components/CategoryTree.tsx` — label[locale], receive tree as prop |
| Modify | `client/src/features/catalog/components/DynamicFilterSection.tsx` — label[locale] |
| Modify | `client/src/features/catalog/components/CatalogToolbar.tsx` — label[locale] |
| Modify | `client/src/features/catalog/components/CatalogSidebar.tsx` — pass categoryTree prop |
| Modify | `client/src/app/[locale]/catalog/page.tsx` — pass categoryTree to sidebar |
| Modify | `client/src/features/admin/components/AdminHeader.tsx` — add Settings tab |
