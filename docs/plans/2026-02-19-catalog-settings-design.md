# Admin Catalog Settings — Design

## Goal

Make category tree and per-category filters editable from the admin panel, replacing hardcoded TypeScript constants with a JSON config file.

## Decisions

| Decision | Choice |
|----------|--------|
| Storage | Single JSON file: `content/catalog-config.json` |
| UI level | Full visual editor at `/admin/catalog-settings` |
| Translations | Direct labels `{ ka, ru, en }` instead of `labelKey` refs |

---

## Data Model

### `content/catalog-config.json`

```json
{
  "categories": [
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
        }
      ]
    },
    {
      "id": "nvr-kits",
      "parentCategory": "nvr-kits",
      "label": { "ka": "NVR კომპლექტები", "ru": "NVR Комплекты", "en": "NVR Kits" }
    }
  ],
  "filters": {
    "cameras": [
      {
        "id": "brand",
        "specKaKey": "ბრენდი",
        "label": { "ka": "ბრენდი", "ru": "Бренд", "en": "Brand" },
        "priority": 1,
        "defaultExpanded": true
      }
    ],
    "nvr-kits": [],
    "accessories": [],
    "storage": [],
    "services": []
  }
}
```

### Key changes from current model

- `labelKey` (string ref to i18n) → `label` (object `{ ka, ru, en }`) — direct names
- `CategoryNode` and `FilterFieldConfig` shapes stay the same, only `label` replaces `labelKey`
- `category-tree.ts` and `filter-config.ts` become thin wrappers: read JSON, return typed data

---

## Reading & Writing Config

Add to `content.ts`:
- `getCatalogConfig()` — reads and parses `catalog-config.json`
- `writeCatalogConfig(config)` — writes back

`category-tree.ts` and `filter-config.ts` keep their exports (`CATEGORY_TREE`, `findCategoryNode`, `CATEGORY_FILTER_CONFIG`, `getFilterConfigForCategory`) but read from JSON. All existing catalog imports work unchanged.

---

## Admin UI — `/admin/catalog-settings`

New tab "Settings" (gear icon) in AdminHeader.

### Section 1 — Categories (tree view)

- Visual tree with main categories and nested subcategories
- Each row: label (ka/ru/en), parentCategory, specFilter (for subcategories)
- Actions: Add Category, Add Subcategory, Delete, Edit inline
- Reorder via up/down arrows (no drag-and-drop library)

### Section 2 — Filters (per category)

- Tabs by category (Cameras | NVR Kits | Accessories | Storage | Services)
- Each filter row: id, specKaKey, label (ka/ru/en), priority, defaultExpanded toggle
- Actions: Add Filter, Delete, inline edit
- Order by priority number

### Save

- Single "Save All" button at bottom
- Server Action writes entire config to `content/catalog-config.json`
- `revalidatePath('/')` refreshes catalog

---

## Backward Compatibility

Catalog components currently use `t(node.labelKey)` for labels. These change to `node.label[locale]`.

Files affected:
- `CategoryTree.tsx` — renders category names
- `DynamicFilterSection.tsx` — renders filter group titles
- `FilterCheckboxGroup.tsx` — receives label from parent
- `CatalogSidebar.tsx` — passes data
- `CatalogToolbar.tsx` — filter chip labels
- `MobileFilterDrawer.tsx` — same as sidebar

All other catalog logic (filtering, pagination, URL params) is unaffected.
